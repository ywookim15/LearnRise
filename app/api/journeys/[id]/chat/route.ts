import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  classifyAndRespond,
  runReplan,
  runResourceRefresh,
  type ChatMode,
} from "@/lib/server/chief";
import { compressMemory, loadMemory } from "@/lib/server/memory";
import type { PlannerInputs } from "@/lib/server/planner";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/journeys/[id]/chat — Ask METIS (Stage 5 & 6).
 * Classifies intent + replies (sync), then fires roadmap changes + memory
 * compression asynchronously so the reply returns fast.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { message?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const message = (body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  const mode: ChatMode =
    body.mode === "planner" || body.mode === "tutor" ? body.mode : "main";

  const admin = getSupabaseAdmin();

  // Ownership + journey inputs
  const { data: journey } = await admin
    .from("journeys")
    .select("id, user_id, journey_name, goal, current_level, preferences, start_date, end_date, hours_per_week")
    .eq("id", params.id)
    .single();
  if (!journey) return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  if (journey.user_id !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Roadmap snapshot (chapters + completion) via units
  const { data: units } = await admin
    .from("units")
    .select("id, unit_number, unit_title, chapters(id, chapter_number, chapter_title, is_complete)")
    .eq("journey_id", params.id);

  const chapters = (units ?? [])
    .flatMap((u) =>
      (u.chapters ?? []).map((c) => ({
        id: c.id as string,
        unitId: u.id as string,
        unitNumber: u.unit_number as number,
        unitTitle: u.unit_title as string,
        number: c.chapter_number as string,
        title: c.chapter_title as string,
        isComplete: !!c.is_complete,
      }))
    )
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

  const memory = await loadMemory(params.id);

  // --- Chief Agent: classify + reply (one Gemini call) ---
  let result;
  try {
    result = await classifyAndRespond({
      mode,
      message,
      journeyName: journey.journey_name,
      goal: journey.goal,
      memory,
      chapters,
    });
  } catch (err) {
    console.error("[chat] classify failed:", err);
    return NextResponse.json(
      { error: "METIS is having trouble responding right now. Please try again." },
      { status: 502 }
    );
  }

  const inputs: PlannerInputs = {
    goal: journey.goal,
    currentLevel: journey.current_level ?? "",
    preferences: journey.preferences ?? "",
    startDate: journey.start_date ?? null,
    endDate: journey.end_date ?? null,
    hoursPerWeek: journey.hours_per_week ?? null,
  };

  let roadmapUpdating = false;
  let actionNote = "none";

  // --- fire-and-forget the roadmap-changing work (reply returns immediately) ---
  if (result.intent === "replan" && chapters.some((c) => !c.isComplete)) {
    roadmapUpdating = true;
    actionNote = `re-planned incomplete chapters: ${result.replanGuidance}`;
    void runReplan({
      journeyId: params.id,
      inputs,
      chapters,
      guidance: result.replanGuidance || message,
    }).catch((e) => console.error(`[chat] replan failed for ${params.id}:`, e));
  } else if (result.intent === "resource_refresh") {
    roadmapUpdating = true;
    actionNote = `refreshed resources${result.newPreference ? ` (new preference: ${result.newPreference})` : ""}`;
    void runResourceRefresh({
      journeyId: params.id,
      chapters,
      targetChapterNumbers: result.targetChapterNumbers,
      newPreference: result.newPreference,
    }).catch((e) => console.error(`[chat] resource refresh failed for ${params.id}:`, e));
  }

  // --- Stage 5 memory compression (fire-and-forget) ---
  void compressMemory({
    journeyId: params.id,
    priorNotes: memory,
    userMessage: message,
    assistantReply: result.reply,
    actionNote,
  }).catch((e) => console.error(`[chat] memory compression failed for ${params.id}:`, e));

  return NextResponse.json({
    reply: result.reply,
    intent: result.intent,
    roadmapUpdating,
  });
}
