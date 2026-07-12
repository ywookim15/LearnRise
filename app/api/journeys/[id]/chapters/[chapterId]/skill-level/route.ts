import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { adjustChapterForSkillLevel } from "@/lib/server/planner";
import { curateJourneyResources } from "@/lib/server/curator";
import { runInBackground } from "@/lib/server/background";
import { getPlanState, checkSkillAdjustLimit, recordSkillAdjust } from "@/lib/server/usage-limits";
import { FREE_SKILL_ADJUST_MONTHLY_LIMIT } from "@/lib/entitlements";

export const runtime = "nodejs";
export const maxDuration = 60;

type SkillLevel = "unset" | "familiar" | "known";
const VALID_LEVELS = new Set<SkillLevel>(["unset", "familiar", "known"]);

/**
 * POST /api/journeys/[id]/chapters/[chapterId]/skill-level — the knowledge
 * map's "Know it" / "Familiar" mark. Persists the mark, then (for a real
 * "familiar"/"known" signal) narrowly adjusts JUST this chapter: one Planner
 * call revises its learning objective, then the Curator re-fetches resources
 * against that revised objective. Sibling chapters, the unit, and the journey
 * are never touched — this never regenerates anything beyond the one chapter.
 *
 * Responds as soon as the mark + objective are persisted; re-curation runs in
 * the background and the client picks it up via its existing poll-while-
 * pending mechanism (same as any other curation run) — no full reload needed.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { skillLevel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const skillLevel = body.skillLevel as SkillLevel;
  if (!VALID_LEVELS.has(skillLevel)) {
    return NextResponse.json({ error: "Invalid skill level" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  // Ownership chain: chapter -> unit -> journey -> user.
  const { data: chapter } = await admin
    .from("chapters")
    .select("id, chapter_title, learning_objective, unit_id, units(id, unit_title, journey_id, journeys(id, user_id, goal, current_level))")
    .eq("id", params.chapterId)
    .single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unit = chapter?.units as any;
  const journey = unit?.journeys;
  if (!chapter || !unit || !journey || unit.journey_id !== params.id) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }
  if (journey.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: updErr } = await admin
    .from("chapters")
    .update({ skill_level: skillLevel })
    .eq("id", params.chapterId);
  if (updErr) {
    console.error("[skill-level] update failed:", updErr);
    return NextResponse.json({ error: "Couldn't save that mark. Please try again." }, { status: 500 });
  }

  // Only a real mastery signal triggers the Planner/Curator adjustment —
  // clearing back to "unset" just persists the mark with no API cost.
  if (skillLevel === "unset") {
    return NextResponse.json({ skillLevel, adjusted: false });
  }

  // ---- Free-tier cap: enforce BEFORE spending a Planner call. Without this,
  // calling this route directly (bypassing the UI) in a loop gives unlimited
  // free Gemini/Curator calls — same cost-abuse class as chat/replan. ----
  const { plan, status } = await getPlanState(user.id);
  const adjustCheck = await checkSkillAdjustLimit(user.id, plan, status);
  if (!adjustCheck.allowed) {
    return NextResponse.json(
      {
        error: `You've used all ${FREE_SKILL_ADJUST_MONTHLY_LIMIT} of your free skill-level adjustments this month. Upgrade to Pro for unlimited adjustments.`,
        code: "skill_adjust_limit",
        skillLevel,
        adjusted: false,
      },
      { status: 402 }
    );
  }
  if (!adjustCheck.premium) await recordSkillAdjust(user.id);

  let newObjective = chapter.learning_objective as string;
  try {
    const adjusted = await adjustChapterForSkillLevel({
      goal: journey.goal,
      currentLevel: journey.current_level ?? "",
      unitTitle: unit.unit_title,
      chapterTitle: chapter.chapter_title,
      currentObjective: chapter.learning_objective ?? "",
      skillLevel,
    });
    newObjective = adjusted.learningObjective;
  } catch (err) {
    // Mark is already saved; degrade gracefully if the Planner call fails —
    // don't fail the whole request over a best-effort refinement.
    console.error("[skill-level] planner adjustment failed:", err);
    return NextResponse.json({ skillLevel, adjusted: false });
  }

  // Re-curation prep: new objective + reset to pending so the UI shows
  // "curating…" immediately (ResourceSummary already renders that state).
  await admin
    .from("chapters")
    .update({ learning_objective: newObjective, resource_status: "pending" })
    .eq("id", params.chapterId);
  await admin.from("resources").delete().eq("chapter_id", params.chapterId);

  runInBackground(
    curateJourneyResources(params.id, { chapterIds: [params.chapterId] }),
    `skill-level re-curate ${params.chapterId}`
  );

  return NextResponse.json({ skillLevel, adjusted: true, learningObjective: newObjective });
}
