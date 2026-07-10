// -----------------------------------------------------------------------------
// RESOURCE CURATOR AGENT — Algorithm v2, Stage 3 (Resource Curation)
//
// Per-chapter pipeline (per the spec):
//   1. Query = chapter title + learning objective + student media preferences
//   2. Tavily search -> ~8 candidates (raw page content requested up front,
//      per the Step 4 instruction to prefer Tavily's content over a scraper)
//   3. Gemini scans snippets, shortlists ~4                (function calling)
//   4. Full text: Tavily raw_content first, simple fetch-and-parse fallback
//   5. Trusted-domain shortcut skips lateral reading; unfamiliar domains get
//      one cached reputation search each
//   6/7. Gemini reads content, judges fit/difficulty/scope, dedupes toward
//      "easier to digest", selects best 1-3 with justifications (function calling)
//   8. YouTube timestamps for videos (skipped gracefully without API key)
//   9. Rows written per chapter as it completes
//
// Fallback: broaden the search once (drop preference constraint); if still
// nothing usable, the chapter ships empty with resource_status =
// 'no_resources_found' (a flagged gap, never a silent failure).
//
// Post-pass: journey-LEVEL media-type ratio check — if the student's preferred
// type is under-represented, re-curate a handful of chapters biased toward it.
// -----------------------------------------------------------------------------

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { callStructured, LLM, type StructuredTool } from "@/lib/server/llm";
import { tavilySearch, type TavilyResult } from "@/lib/server/tavily";
import { getYoutubeTimestamps } from "@/lib/server/youtube";

export type CurationResourceType = "video" | "article" | "practice_set";

// Initial hardcoded trusted list (expand over time as quality data accrues).
const TRUSTED_DOMAINS = ["khanacademy.org", "coursera.org", "ocw.mit.edu"];

interface JourneyContext {
  journeyId: string;
  goal: string;
  currentLevel: string;
  preferences: string;
  preferredType: CurationResourceType | null;
  /** domain -> reputation notes, cached for the whole journey run */
  repCache: Map<string, string>;
}

interface ChapterRow {
  id: string;
  chapter_number: string;
  chapter_title: string;
  learning_objective: string;
  unit_title: string;
  resource_status: string;
}

interface SelectedResource {
  title: string;
  url: string;
  source_name: string;
  resource_type: CurationResourceType;
  video_timestamp: string | null;
  why_this_fits: string;
  is_trusted_domain: boolean;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isTrustedDomain(domain: string): boolean {
  if (!domain) return false;
  if (domain.endsWith(".edu")) return true;
  return TRUSTED_DOMAINS.some((t) => domain === t || domain.endsWith(`.${t}`));
}

/** Heuristic: which resource type does the student's free-text preference favor? */
export function detectPreferredType(preferences: string): CurationResourceType | null {
  const p = preferences.toLowerCase();
  const positions: Array<[CurationResourceType, number]> = [
    ["video", indexOfAny(p, ["video", "watch", "youtube", "visual"])],
    ["practice_set", indexOfAny(p, ["practice", "interactive", "exercise", "quiz", "hands-on", "lab"])],
    ["article", indexOfAny(p, ["article", "reading", "text-based", "written"])],
  ];
  const found = positions.filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1]);
  return found.length ? found[0][0] : null;
}

function indexOfAny(haystack: string, needles: string[]): number {
  const hits = needles.map((n) => haystack.indexOf(n)).filter((i) => i >= 0);
  return hits.length ? Math.min(...hits) : -1;
}

function searchTermsForType(t: CurationResourceType): string {
  return t === "video"
    ? "video tutorial"
    : t === "practice_set"
    ? "interactive practice exercises"
    : "article guide";
}

/** Simple fetch-and-parse fallback when Tavily raw content is missing/thin. */
async function fetchPageText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; METIS-Curator/1.0)" },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) return null;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&(?:nbsp|amp|lt|gt|quot|#\d+);/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.length > 200 ? text.slice(0, 8000) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Structured tool (function calling only — never free-text parsing).
// One merged "read + judge + select" call per chapter (was shortlist + select).
// ---------------------------------------------------------------------------

const SELECT_TOOL: StructuredTool = {
  name: "select_resources",
  description:
    "Select the best 1-3 learning resources for this chapter from the read candidates. Use an empty list if none are genuinely usable.",
  parameters: {
    type: "object",
    properties: {
      none_usable: {
        type: "boolean",
        description: "true when no candidate is a real, appropriate, working resource",
      },
      resources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            candidate_index: {
              type: "integer",
              description: "0-based index into the provided candidate list",
            },
            resource_type: {
              type: "string",
              description: "One of: video, article, practice_set",
            },
            why_this_fits: {
              type: "string",
              description: "ONE sentence justifying this pick for this student",
            },
          },
          required: ["candidate_index", "resource_type", "why_this_fits"],
        },
      },
    },
    required: ["resources"],
  },
};

// ---------------------------------------------------------------------------
// per-chapter pipeline
// ---------------------------------------------------------------------------

async function selectResources(
  ctx: JourneyContext,
  chapter: ChapterRow,
  candidates: TavilyResult[],
  biasType: CurationResourceType | null
): Promise<SelectedResource[]> {
  // ---- Rank by Tavily score, keep the top few (bounds content + reputation) ----
  const pool = [...candidates]
    .map((c, i) => ({ c, s: c.score, i }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map((x) => x.c);
  if (pool.length === 0) return [];

  // ---- Full text: Tavily raw content first, simple fetch-parse fallback ----
  const contents: string[] = [];
  for (const c of pool) {
    let text = c.rawContent && c.rawContent.length > 600 ? c.rawContent : null;
    if (!text) text = await fetchPageText(c.url);
    if (!text) text = c.content; // last resort: judge from the snippet
    contents.push(text.slice(0, 3000));
  }

  // ---- Trusted-domain shortcut + cached lateral reading for the rest ----
  const repNotes: (string | null)[] = [];
  for (const c of pool) {
    const domain = domainOf(c.url);
    if (isTrustedDomain(domain)) {
      repNotes.push(null); // pre-verified, no lateral reading spent
      continue;
    }
    if (!ctx.repCache.has(domain)) {
      const rep = await tavilySearch(`"${domain}" website review reputation education quality`, {
        maxResults: 2,
        searchDepth: "basic",
      });
      ctx.repCache.set(
        domain,
        rep?.length
          ? rep.map((r) => r.content.slice(0, 200)).join(" / ").slice(0, 450)
          : "No reputation information found."
      );
    }
    repNotes.push(ctx.repCache.get(domain)!);
  }

  // ---- ONE merged call: read the candidates' content, judge, dedupe, and
  //      select the best 1-3 with justifications (was two Gemini calls). ----
  const judgeOut = await callStructured<{
    none_usable?: boolean;
    resources?: Array<{ candidate_index?: unknown; resource_type?: unknown; why_this_fits?: unknown }>;
  }>({
    provider: LLM.curator.provider,
    model: LLM.curator.model,
    prompt: `You are the METIS Resource Curator selecting study resources for one chapter.

Journey goal: ${ctx.goal}
Student's self-reported level: ${ctx.currentLevel || "not specified"}
Stated preferences: ${ctx.preferences || "none"}
Chapter ${chapter.chapter_number} (${chapter.unit_title}): ${chapter.chapter_title}
Learning objective: ${chapter.learning_objective}
${biasType ? `IMPORTANT: the journey is currently under-serving the student's preferred media type (${biasType}) — bias this selection toward ${biasType} resources when quality permits.` : ""}

The actual page content of each candidate is below. Judge each one:
- Does it genuinely teach this chapter's learning objective (not just mention the topic)?
- Is the difficulty appropriate for the student's stated level?
- Is it a real, working, appropriately-scoped resource (not a landing page, index, forum stub, or paywall)?
- If multiple candidates cover the same content, keep the one that is EASIER TO DIGEST (simpler explanation, shorter, or a better match for the student's preferred media type).
- Trusted domains (Khan Academy, Coursera, MIT OCW, .edu) are pre-verified as reputable. For others, weigh the reputation notes provided.

Select the best 1 to 3. resource_type must be exactly one of: video, article, practice_set (map "reading"→article, "course/lesson with exercises"→practice_set).
If NOTHING is genuinely usable, return resources: [] with none_usable: true.

CANDIDATES:
${pool
  .map((c, i) => {
    const domain = domainOf(c.url);
    return `[${i}] ${c.title}
    URL: ${c.url}
    Domain: ${domain}${isTrustedDomain(domain) ? " (TRUSTED)" : ""}
    ${repNotes[i] ? `Reputation notes: ${repNotes[i]}` : ""}
    CONTENT: ${contents[i]}`;
  })
  .join("\n\n")}`,
    tool: SELECT_TOOL,
    temperature: 0.2,
  });

  if (judgeOut.none_usable || !judgeOut.resources?.length) return [];

  const seen = new Set<string>();
  const selected: SelectedResource[] = [];
  for (const r of judgeOut.resources) {
    const idx = Number(r.candidate_index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= pool.length) continue;
    const cand = pool[idx]; // URL comes from the real candidate — never from the model
    if (seen.has(cand.url)) continue;
    seen.add(cand.url);
    const domain = domainOf(cand.url);
    const rawType = String(r.resource_type ?? "article");
    const resource_type: CurationResourceType =
      rawType === "video" || rawType === "practice_set" ? rawType : "article";
    selected.push({
      title: cand.title.slice(0, 300),
      url: cand.url,
      source_name: domain || cand.url,
      resource_type,
      video_timestamp: null,
      why_this_fits: String(r.why_this_fits ?? "").slice(0, 400),
      is_trusted_domain: isTrustedDomain(domain),
    });
    if (selected.length === 3) break;
  }
  return selected;
}

async function curateChapter(
  ctx: JourneyContext,
  chapter: ChapterRow,
  opts: { biasType?: CurationResourceType } = {}
): Promise<{ resources: SelectedResource[]; status: "complete" | "no_resources_found" }> {
  const biasType = opts.biasType ?? null;
  const prefTerms = biasType
    ? searchTermsForType(biasType)
    : ctx.preferredType
    ? searchTermsForType(ctx.preferredType)
    : "";

  // ---- Steps 1-2: preference-aware search (~8 candidates, raw content on) ----
  const primaryQuery = `${chapter.chapter_title} ${chapter.learning_objective.slice(0, 180)} ${prefTerms}`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 380);
  let candidates = await tavilySearch(primaryQuery, { maxResults: 8, includeRawContent: true });
  let alreadyBroadened = false;

  // Search itself empty/failed -> broaden immediately (drop preference terms,
  // anchor to the goal for subject context).
  if (!candidates?.length) {
    alreadyBroadened = true;
    candidates = await tavilySearch(
      `${chapter.chapter_title} ${ctx.goal.split(/\s+/).slice(0, 6).join(" ")}`.slice(0, 380),
      { maxResults: 8, includeRawContent: true }
    );
  }
  if (!candidates?.length) return { resources: [], status: "no_resources_found" };

  let resources = await selectResources(ctx, chapter, candidates, biasType);

  // ---- Fallback: judge found nothing usable -> broaden once, then give up ----
  if (resources.length === 0 && !alreadyBroadened) {
    const broadened = await tavilySearch(
      `${chapter.chapter_title} ${chapter.learning_objective.slice(0, 180)}`.slice(0, 380),
      { maxResults: 8, includeRawContent: true }
    );
    if (broadened?.length) {
      resources = await selectResources(ctx, chapter, broadened, null);
    }
  }
  if (resources.length === 0) return { resources: [], status: "no_resources_found" };

  // ---- Step 8: YouTube chapter timestamps for selected videos ----
  for (const r of resources) {
    if (r.resource_type === "video") {
      r.video_timestamp = await getYoutubeTimestamps(r.url);
    }
  }

  return { resources, status: "complete" };
}

/** How many chapters in a journey are still awaiting curation. */
async function countPending(journeyId: string): Promise<number> {
  const admin = getSupabaseAdmin();
  const { data: units } = await admin.from("units").select("id").eq("journey_id", journeyId);
  const unitIds = (units ?? []).map((u) => u.id);
  if (unitIds.length === 0) return 0;
  const { count } = await admin
    .from("chapters")
    .select("id", { count: "exact", head: true })
    .in("unit_id", unitIds)
    .eq("resource_status", "pending");
  return count ?? 0;
}

async function writeChapterResources(
  chapterId: string,
  resources: SelectedResource[],
  status: "complete" | "no_resources_found"
): Promise<void> {
  const admin = getSupabaseAdmin();
  // Replace wholesale (safe for re-runs and the ratio pass).
  const { error: delErr } = await admin.from("resources").delete().eq("chapter_id", chapterId);
  if (delErr) throw delErr;
  if (resources.length > 0) {
    const { error: insErr } = await admin
      .from("resources")
      .insert(resources.map((r) => ({ chapter_id: chapterId, ...r })));
    if (insErr) throw insErr;
  }
  const { error: updErr } = await admin
    .from("chapters")
    .update({ resource_status: status })
    .eq("id", chapterId);
  if (updErr) throw updErr;
}

// ---------------------------------------------------------------------------
// journey-level media-type ratio check (post-pass; journey-level by design)
// ---------------------------------------------------------------------------

async function mediaRatioPass(ctx: JourneyContext, chapters: ChapterRow[]): Promise<void> {
  if (!ctx.preferredType) return;
  const admin = getSupabaseAdmin();

  const { data: rows, error } = await admin
    .from("resources")
    .select("resource_type, chapter_id")
    .in("chapter_id", chapters.map((c) => c.id));
  if (error || !rows || rows.length === 0) return;

  const preferredCount = rows.filter((r) => r.resource_type === ctx.preferredType).length;
  const share = preferredCount / rows.length;
  if (share >= 0.5) {
    console.log(
      `[curator] media ratio OK: ${(share * 100).toFixed(0)}% ${ctx.preferredType}`
    );
    return;
  }

  // Re-curate up to 3 chapters that currently have zero preferred-type
  // resources, hard-biased toward the preferred type.
  const byChapter = new Map<string, number>();
  for (const r of rows) {
    if (r.resource_type === ctx.preferredType) {
      byChapter.set(r.chapter_id, (byChapter.get(r.chapter_id) ?? 0) + 1);
    }
  }
  const targets = chapters
    .filter((c) => !byChapter.get(c.id))
    .slice(0, 3);

  console.log(
    `[curator] media ratio low (${(share * 100).toFixed(0)}% ${ctx.preferredType}) — re-curating ${targets.length} chapters biased toward ${ctx.preferredType}`
  );

  for (const chapter of targets) {
    try {
      const rerun = await curateChapter(ctx, chapter, { biasType: ctx.preferredType });
      // Only replace if the biased run actually surfaced preferred-type
      // resources — never downgrade a complete chapter to empty.
      if (rerun.resources.some((r) => r.resource_type === ctx.preferredType)) {
        await writeChapterResources(chapter.id, rerun.resources, "complete");
        console.log(`[curator] ratio re-run replaced resources for ${chapter.chapter_number}`);
      }
    } catch (err) {
      console.error(`[curator] ratio re-run failed for ${chapter.chapter_number}:`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// entry point
// ---------------------------------------------------------------------------

/**
 * Curate resources for a journey's chapters (default: those still 'pending').
 * Called fire-and-forget after roadmap creation, and from the re-trigger route.
 * Each chapter is written as it completes so the UI fills in progressively.
 */
export async function curateJourneyResources(
  journeyId: string,
  opts: { statuses?: string[]; chapterIds?: string[] } = {}
): Promise<void> {
  const statuses = opts.statuses ?? ["pending"];
  const chapterIdFilter = opts.chapterIds ? new Set(opts.chapterIds) : null;
  const admin = getSupabaseAdmin();

  const { data: journey, error: jErr } = await admin
    .from("journeys")
    .select("id, goal, current_level, preferences")
    .eq("id", journeyId)
    .single();
  if (jErr || !journey) {
    console.error(`[curator] journey ${journeyId} not found:`, jErr);
    return;
  }

  const { data: units, error: uErr } = await admin
    .from("units")
    .select(
      "unit_title, unit_number, chapters(id, chapter_number, chapter_title, learning_objective, resource_status)"
    )
    .eq("journey_id", journeyId)
    .order("unit_number");
  if (uErr || !units) {
    console.error(`[curator] failed to load units for ${journeyId}:`, uErr);
    return;
  }

  const allChapters: ChapterRow[] = units.flatMap((u) =>
    (u.chapters as Omit<ChapterRow, "unit_title">[]).map((c) => ({
      ...c,
      unit_title: u.unit_title as string,
    }))
  );
  allChapters.sort((a, b) =>
    a.chapter_number.localeCompare(b.chapter_number, undefined, { numeric: true })
  );

  // chapterIds filter (chat-triggered targeted refresh) takes precedence over
  // status filter; otherwise select by resource_status.
  const todo = chapterIdFilter
    ? allChapters.filter((c) => chapterIdFilter.has(c.id))
    : allChapters.filter((c) => statuses.includes(c.resource_status));
  if (todo.length === 0) {
    console.log(`[curator] nothing to curate for ${journeyId}`);
    return;
  }

  const ctx: JourneyContext = {
    journeyId,
    goal: journey.goal,
    currentLevel: journey.current_level ?? "",
    preferences: journey.preferences ?? "",
    preferredType: detectPreferredType(journey.preferences ?? ""),
    repCache: new Map(),
  };

  console.log(
    `[curator] starting: ${todo.length} chapters for "${journey.goal.slice(0, 60)}" (preferred type: ${ctx.preferredType ?? "none"})`
  );

  // Time budget: stop launching new chapters before the serverless function is
  // killed at its maxDuration, so we exit cleanly and leave the rest 'pending'.
  // The client auto-resumes /curate, giving each run a fresh budget — so a
  // 20-chapter journey finishes across a few resumptions instead of getting
  // cut off. Override with CURATOR_BUDGET_MS.
  const budgetMs = Number(process.env.CURATOR_BUDGET_MS ?? 45_000);
  const startedAt = Date.now();

  // Sequential on purpose: friendly to provider rate limits, and each chapter
  // commits independently so partial progress is never lost.
  let processed = 0;
  for (const chapter of todo) {
    if (Date.now() - startedAt > budgetMs) {
      console.log(
        `[curator] time budget reached after ${processed}/${todo.length} chapters — ${todo.length - processed} left pending (client will resume)`
      );
      break;
    }
    try {
      const { resources, status } = await curateChapter(ctx, chapter);
      await writeChapterResources(chapter.id, resources, status);
      processed++;
      console.log(
        `[curator] ${chapter.chapter_number} ${status}: ${resources.length} resources (${resources.map((r) => r.resource_type).join(", ") || "none"})`
      );
    } catch (err) {
      // Transient pipeline failure — leave 'pending' so a re-trigger can retry.
      console.error(`[curator] chapter ${chapter.chapter_number} failed (stays pending):`, err);
    }
  }

  // Ratio rebalance only when the whole journey is done curating (no pending
  // left) and it wasn't a targeted (chat) refresh.
  const stillPending =
    !chapterIdFilter && (await countPending(journeyId)) > 0;
  if (!chapterIdFilter && !stillPending) {
    try {
      await mediaRatioPass(ctx, allChapters);
    } catch (err) {
      console.error(`[curator] media-ratio pass failed:`, err);
    }
  }

  console.log(`[curator] finished journey ${journeyId}`);
}
