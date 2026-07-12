import "server-only";

// -----------------------------------------------------------------------------
// MEMORY (Stage 5) — compresses each chat exchange into the journey's
// compressed_notes (misconceptions, stated preferences, pacing signals, what's
// been covered). Raw conversation is NOT stored long-term.
//
// NOTE: the algorithm doc names `headroom` for compression. We use a Gemini
// summarization call instead (no separate compression tool set up) — flagged
// in the Step 6 summary. Swapping in headroom later only touches this file.
// -----------------------------------------------------------------------------

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { callStructured, LLM, type StructuredTool } from "@/lib/server/llm";

const SAVE_NOTES: StructuredTool = {
  name: "save_memory_notes",
  description: "Persist the updated compressed memory notes for this journey.",
  parameters: {
    type: "object",
    properties: {
      compressed_notes: {
        type: "string",
        description:
          "The full updated notes (<= ~1200 chars): the student's misconceptions, stated preferences, pacing signals, and what's been covered. Terse bullet-style prose, not a transcript.",
      },
    },
    required: ["compressed_notes"],
  },
};

/**
 * Fold one exchange into the journey's compressed memory. Best-effort: callers
 * fire-and-forget this so chat latency isn't blocked on it.
 */
export async function compressMemory(opts: {
  journeyId: string;
  priorNotes: string;
  userMessage: string;
  assistantReply: string;
  actionNote?: string;
}): Promise<void> {
  const { journeyId, priorNotes, userMessage, assistantReply, actionNote } = opts;
  const admin = getSupabaseAdmin();

  let compressed_notes: string;
  try {
    const out = await callStructured<{ compressed_notes?: string }>({
      provider: LLM.memory.provider,
      model: LLM.memory.model,
      prompt: `You maintain a compact memory of a student's learning journey. Update the notes below to fold in the latest exchange. Keep only durable, useful signals: misconceptions revealed, stated preferences, pacing signals, and what's been covered or requested. Drop chit-chat. Stay under ~1200 characters, terse bullet-style prose.

EXISTING NOTES:
${priorNotes || "(none yet)"}

LATEST EXCHANGE:
Student: ${userMessage}
METIS: ${assistantReply}
${actionNote ? `Action taken: ${actionNote}` : ""}

Call save_memory_notes with the full updated notes.`,
      tool: SAVE_NOTES,
      temperature: 0.2,
    });
    compressed_notes = (out.compressed_notes ?? "").slice(0, 4000);
  } catch (err) {
    console.error(`[memory] compression failed for ${journeyId}:`, err);
    return; // leave prior notes intact
  }

  const { error } = await admin
    .from("journey_chat_memory")
    .upsert({ journey_id: journeyId, compressed_notes }, { onConflict: "journey_id" });
  if (error) console.error(`[memory] upsert failed for ${journeyId}:`, error);
}

export async function loadMemory(journeyId: string): Promise<string> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("journey_chat_memory")
    .select("compressed_notes")
    .eq("journey_id", journeyId)
    .maybeSingle();
  return data?.compressed_notes ?? "";
}
