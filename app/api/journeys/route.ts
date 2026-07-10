import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateRoadmap, type PlannerInputs } from "@/lib/server/planner";
import { LLMRateLimitError } from "@/lib/server/llm";
import { curateJourneyResources } from "@/lib/server/curator";
import { runInBackground } from "@/lib/server/background";
import { canCreateJourney } from "@/lib/entitlements";

export const runtime = "nodejs";
// Roadmap generation = 1 Tavily search + 1 Gemini call; usually well under this.
export const maxDuration = 300; // Pro plan; capped to plan max on Hobby

interface CreateJourneyBody {
  goal?: string;
  currentLevel?: string;
  preferences?: string;
  startDate?: string;
  endDate?: string;
  hoursPerWeek?: number | string;
}

/**
 * POST /api/journeys — Journey creation (Algorithm Stage 1 -> 2 -> storage).
 * Writes the roadmap skeleton synchronously, then kicks off Stage 3 resource
 * curation asynchronously so the student sees structure immediately.
 */
export async function POST(req: NextRequest) {
  // ---- auth ----
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ---- validate input (Stage 1: free text, no validation loop) ----
  let body: CreateJourneyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const goal = (body.goal ?? "").trim();
  if (!goal) {
    return NextResponse.json({ error: "A goal is required" }, { status: 400 });
  }

  // ---- Free-tier cap: enforce BEFORE spending a Gemini call ----
  const [{ data: subRow }, { count: journeyCount }] = await Promise.all([
    getSupabaseAdmin().from("subscriptions").select("plan, status").eq("user_id", user.id).maybeSingle(),
    getSupabaseAdmin().from("journeys").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  if (!canCreateJourney(subRow?.plan, subRow?.status, journeyCount ?? 0)) {
    return NextResponse.json(
      {
        error: "The free plan is limited to 1 active journey. Upgrade to Premium for unlimited journeys.",
        code: "free_limit",
      },
      { status: 402 }
    );
  }

  const hoursRaw = Number(body.hoursPerWeek);
  const inputs: PlannerInputs = {
    goal,
    currentLevel: (body.currentLevel ?? "").trim(),
    preferences: (body.preferences ?? "").trim(),
    startDate: isIsoDate(body.startDate) ? body.startDate! : null,
    endDate: isIsoDate(body.endDate) ? body.endDate! : null,
    hoursPerWeek:
      Number.isFinite(hoursRaw) && hoursRaw >= 1 && hoursRaw <= 168
        ? Math.round(hoursRaw)
        : null,
  };

  // ---- Stage 2: Planner (syllabus search + Gemini function call) ----
  let roadmap;
  try {
    roadmap = await generateRoadmap(inputs);
  } catch (err) {
    console.error("[planner] roadmap generation failed:", err);
    if (err instanceof LLMRateLimitError) {
      return NextResponse.json(
        {
          error:
            "METIS is at capacity right now (high demand on the AI). Please wait about a minute and try again.",
          code: "rate_limited",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "METIS couldn't generate your roadmap right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  // ---- Stage 4: storage (skeleton first, so the UI can render immediately) ----
  const admin = getSupabaseAdmin();

  const { data: journeyRow, error: journeyErr } = await admin
    .from("journeys")
    .insert({
      user_id: user.id,
      goal: inputs.goal,
      current_level: inputs.currentLevel || null,
      preferences: inputs.preferences || null,
      start_date: inputs.startDate,
      end_date: inputs.endDate,
      hours_per_week: inputs.hoursPerWeek,
      journey_name: roadmap.journey_name,
      estimated_total_weeks: roadmap.estimated_total_weeks,
    })
    .select("id")
    .single();

  if (journeyErr || !journeyRow) {
    console.error("[journeys] insert failed:", journeyErr);
    return NextResponse.json({ error: "Failed to save journey" }, { status: 500 });
  }

  const journeyId = journeyRow.id as string;

  try {
    // Units (bulk insert, get ids back to attach chapters)
    const { data: unitRows, error: unitsErr } = await admin
      .from("units")
      .insert(
        roadmap.units.map((u) => ({
          journey_id: journeyId,
          unit_number: u.unit_number,
          unit_title: u.unit_title,
          estimated_weeks: u.estimated_weeks,
        }))
      )
      .select("id, unit_number");
    if (unitsErr || !unitRows) throw unitsErr ?? new Error("no unit rows returned");

    const unitIdByNumber = new Map<number, string>(
      unitRows.map((r) => [r.unit_number as number, r.id as string])
    );

    // Chapters (bulk insert; resource_status defaults to 'pending')
    const chapterInserts = roadmap.units.flatMap((u) =>
      u.chapters.map((c) => ({
        unit_id: unitIdByNumber.get(u.unit_number)!,
        chapter_number: c.chapter_number,
        chapter_title: c.chapter_title,
        learning_objective: c.learning_objective,
      }))
    );
    const { error: chaptersErr } = await admin.from("chapters").insert(chapterInserts);
    if (chaptersErr) throw chaptersErr;

    // Stage 5 storage: initialize the journey's compressed-memory row
    const { error: memErr } = await admin
      .from("journey_chat_memory")
      .insert({ journey_id: journeyId, compressed_notes: "" });
    if (memErr) throw memErr;
  } catch (err) {
    // Roll back the whole journey (FK cascade removes children) — never leave
    // a half-written roadmap behind.
    console.error("[journeys] skeleton write failed, rolling back:", err);
    await admin.from("journeys").delete().eq("id", journeyId);
    return NextResponse.json({ error: "Failed to save roadmap" }, { status: 500 });
  }

  // ---- Stage 3 kick-off: background (survives past the response on Vercel) ----
  runInBackground(curateJourneyResources(journeyId), `curate ${journeyId}`);

  return NextResponse.json(
    {
      journeyId,
      journeyName: roadmap.journey_name,
      estimatedTotalWeeks: roadmap.estimated_total_weeks,
      unitCount: roadmap.units.length,
      chapterCount: roadmap.units.reduce((s, u) => s + u.chapters.length, 0),
      curation: "queued",
    },
    { status: 201 }
  );
}

function isIsoDate(v: unknown): boolean {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}
