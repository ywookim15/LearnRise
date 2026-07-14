import "server-only";

// -----------------------------------------------------------------------------
// CHIEF AGENT — Algorithm v2, Stage 6 (Chat-Triggered Adaptation).
//
// One Gemini function call classifies the student's message and drafts the
// reply. Intent is one of:
//   - conversational   : answer only, no roadmap change
//   - replan           : re-plan FUTURE/INCOMPLETE chapters (Planner); completed
//                        chapters are never overwritten
//   - resource_refresh : re-curate resources for specific chapters (Curator),
//                        optionally after a resource-type preference change
//
// Adaptation is CHAT-TRIGGERED ONLY — nothing here runs on a schedule.
// -----------------------------------------------------------------------------

import { callStructured, LLM, type StructuredTool } from "@/lib/server/llm";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { replanRemaining, type PlannerInputs } from "@/lib/server/planner";
import { curateJourneyResources } from "@/lib/server/curator";
import { getLanguage } from "@/lib/i18n/languages";

export type ChatMode = "main" | "planner" | "tutor";
export type ChatIntent = "conversational" | "replan" | "resource_refresh";

export interface ChiefResult {
  intent: ChatIntent;
  reply: string;
  roadmapUpdating: boolean;
}

interface RoadmapSnapshotChapter {
  id: string;
  unitId: string;
  unitNumber: number;
  unitTitle: string;
  number: string;
  title: string;
  isComplete: boolean;
}

const CLASSIFY_FN: StructuredTool = {
  name: "respond_to_student",
  description:
    "Respond to the student and declare whether their message requires changing the roadmap.",
  parameters: {
    type: "object",
    properties: {
      intent: {
        type: "string",
        description:
          "conversational (answer only), replan (re-plan future/incomplete chapters), or resource_refresh (re-curate specific chapters' resources)",
      },
      reply: {
        type: "string",
        description:
          "The message to show the student. If replanning or refreshing resources, tell them it's happening and they'll see updates shortly.",
      },
      target_chapter_numbers: {
        type: "array",
        description:
          'For resource_refresh: the chapter numbers to re-curate, e.g. ["2-1","2-3"]. Empty for other intents.',
        items: { type: "string" },
      },
      new_preference: {
        type: "string",
        description:
          "For resource_refresh when the student asked to change resource style (e.g. 'more videos'): the new preference text. Empty otherwise.",
      },
      replan_guidance: {
        type: "string",
        description:
          "For replan: a concise instruction capturing what to change (re-pace, restructure, skip ahead, change depth). Empty otherwise.",
      },
    },
    required: ["intent", "reply"],
  },
};

function modeGuidance(mode: ChatMode): string {
  switch (mode) {
    case "planner":
      return "You are in PLANNER mode: focus on pacing, scope, and schedule. Lean toward 'replan' when the student wants to change how much/how fast, but only if it truly requires roadmap changes.";
    case "tutor":
      return "You are in TUTOR mode: teach and explain, Socratically where helpful. Almost always 'conversational' — do NOT change the roadmap unless the student explicitly asks to.";
    default:
      return "You are in MAIN mode: answer general questions about the journey and route to replan/resource_refresh only when the student clearly asks for a change.";
  }
}

/** Classify + draft the reply (one Gemini call). */
export async function classifyAndRespond(opts: {
  mode: ChatMode;
  message: string;
  journeyName: string;
  goal: string;
  memory: string;
  chapters: RoadmapSnapshotChapter[];
  language?: string;
}): Promise<{
  intent: ChatIntent;
  reply: string;
  targetChapterNumbers: string[];
  newPreference: string;
  replanGuidance: string;
}> {
  const { mode, message, journeyName, goal, memory, chapters } = opts;
  const lang = getLanguage(opts.language);
  const replyLangLine =
    lang.code === "en"
      ? ""
      : `\nIMPORTANT: Write "reply" in ${lang.englishName} (${lang.nativeName}) — the student is learning in that language. Classification fields stay as specified.`;

  const roadmap = chapters
    .map((c) => `  ${c.number} ${c.title} [${c.isComplete ? "DONE" : "todo"}]`)
    .join("\n");

  const out = await callStructured<{
    intent?: string;
    reply?: string;
    target_chapter_numbers?: unknown[];
    new_preference?: string;
    replan_guidance?: string;
  }>({
    provider: LLM.chief.provider,
    model: LLM.chief.model,
    prompt: `You are METIS, an adaptive learning tutor embedded in a student's journey "${journeyName}" (goal: ${goal}).

${modeGuidance(mode)}

WHAT YOU REMEMBER ABOUT THIS STUDENT (compressed memory):
${memory || "(no notes yet)"}

CURRENT ROADMAP (chapters; DONE chapters are completed and MUST NOT be re-planned or removed):
${roadmap || "(no chapters yet)"}

STUDENT MESSAGE:
"${message}"

Decide the intent and write a helpful, concise reply (2-4 sentences, warm but not fluffy).
- conversational: just answer / explain. Most messages are this.
- replan: only when the student wants to change the PLAN of upcoming material (pace, scope, order, depth, skip ahead). Put the instruction in replan_guidance. Never touch DONE chapters.
- resource_refresh: only when the student wants different/better resources for specific chapters, or a resource-style change. List chapter numbers in target_chapter_numbers; if it's a style change put it in new_preference.
${replyLangLine}

Call respond_to_student.`,
    tool: CLASSIFY_FN,
    temperature: 0.5,
  });

  const intent: ChatIntent =
    out.intent === "replan" || out.intent === "resource_refresh"
      ? out.intent
      : "conversational";

  return {
    intent,
    reply: (out.reply ?? "").trim() || "Got it.",
    targetChapterNumbers: (out.target_chapter_numbers ?? []).map((n) => String(n)),
    newPreference: (out.new_preference ?? "").trim(),
    replanGuidance: (out.replan_guidance ?? "").trim(),
  };
}

// --- orchestration of the two roadmap-changing intents (run async) ---

/** Re-curate specific incomplete chapters (targeted). Completed chapters skipped. */
export async function runResourceRefresh(opts: {
  journeyId: string;
  chapters: RoadmapSnapshotChapter[];
  targetChapterNumbers: string[];
  newPreference: string;
}): Promise<void> {
  const { journeyId, chapters, targetChapterNumbers, newPreference } = opts;
  const admin = getSupabaseAdmin();

  // Optional resource-style change -> update the journey's preferences first.
  if (newPreference) {
    await admin.from("journeys").update({ preferences: newPreference }).eq("id", journeyId);
  }

  // Resolve targets to INCOMPLETE chapters only (protect completed work).
  let targets = chapters.filter(
    (c) => !c.isComplete && targetChapterNumbers.includes(c.number)
  );
  // If the model named none (or only completed ones), refresh all incomplete.
  if (targets.length === 0) targets = chapters.filter((c) => !c.isComplete);
  if (targets.length === 0) return;

  const ids = targets.map((c) => c.id);
  // Reset to pending + clear old resources so the UI shows "curating".
  await admin.from("resources").delete().in("chapter_id", ids);
  await admin.from("chapters").update({ resource_status: "pending" }).in("id", ids);

  await curateJourneyResources(journeyId, { chapterIds: ids });
}

/** Re-plan future/incomplete chapters. Completed chapters are preserved as-is. */
export async function runReplan(opts: {
  journeyId: string;
  inputs: PlannerInputs;
  chapters: RoadmapSnapshotChapter[];
  guidance: string;
}): Promise<void> {
  const { journeyId, inputs, chapters, guidance } = opts;
  const admin = getSupabaseAdmin();

  const completed = chapters.filter((c) => c.isComplete);
  const incomplete = chapters.filter((c) => !c.isComplete);

  // Generate replacement units/chapters for the remaining material.
  const revised = await replanRemaining({
    inputs,
    completedTitles: completed.map((c) => c.title),
    incompleteTitles: incomplete.map((c) => c.title),
    guidance,
  });

  // Delete incomplete chapters (cascades their resources)…
  if (incomplete.length) {
    await admin.from("chapters").delete().in("id", incomplete.map((c) => c.id));
  }
  // …then remove any unit left with zero chapters.
  const { data: unitsAfter } = await admin
    .from("units")
    .select("id, unit_number, chapters(id)")
    .eq("journey_id", journeyId);
  const emptyUnitIds = (unitsAfter ?? [])
    .filter((u) => !u.chapters || u.chapters.length === 0)
    .map((u) => u.id);
  if (emptyUnitIds.length) {
    await admin.from("units").delete().in("id", emptyUnitIds);
  }

  // Append the revised units AFTER the highest remaining unit_number, so the
  // preserved (completed) units/chapters keep their numbers — no collisions.
  const remainingUnits = (unitsAfter ?? []).filter((u) => !emptyUnitIds.includes(u.id));
  let nextUnitNumber =
    remainingUnits.reduce((max, u) => Math.max(max, u.unit_number), 0) + 1;

  for (const unit of revised.units) {
    const thisUnitNumber = nextUnitNumber++;
    const { data: unitRow, error: unitErr } = await admin
      .from("units")
      .insert({
        journey_id: journeyId,
        unit_number: thisUnitNumber,
        unit_title: unit.unit_title,
        estimated_weeks: unit.estimated_weeks,
      })
      .select("id")
      .single();
    if (unitErr || !unitRow) {
      console.error("[replan] unit insert failed:", unitErr);
      continue;
    }
    const chapterRows = unit.chapters.map((c, ci) => ({
      unit_id: unitRow.id,
      chapter_number: `${thisUnitNumber}-${ci + 1}`,
      chapter_title: c.chapter_title,
      learning_objective: c.learning_objective,
    }));
    const { error: chErr } = await admin.from("chapters").insert(chapterRows);
    if (chErr) console.error("[replan] chapter insert failed:", chErr);
  }

  // Curate resources for the freshly-planned (pending) chapters.
  await curateJourneyResources(journeyId, { statuses: ["pending"] });
}
