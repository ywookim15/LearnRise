// -----------------------------------------------------------------------------
// PLANNER AGENT — Algorithm v2, Stage 2 (Roadmap Generation)
//
// Sequence per the spec:
//   1. ONE web search for a real reference syllabus/outline matching the goal
//   2. Generate the full roadmap upfront (dynamic size by goal complexity;
//      hours/week affects pacing AND depth) via Gemini FUNCTION CALLING
//   3. Attach rough pacing estimates from the start/end date window
//   4. Do NOT attach resources (Stage 3's job)
// -----------------------------------------------------------------------------

import { callStructured, LLM, type StructuredTool } from "@/lib/server/llm";
import { tavilySearch } from "@/lib/server/tavily";

export interface PlannerInputs {
  goal: string;
  currentLevel: string;
  preferences: string;
  startDate: string | null; // ISO date
  endDate: string | null;
  hoursPerWeek: number | null;
}

export interface RoadmapChapter {
  chapter_number: string;
  chapter_title: string;
  learning_objective: string;
}

export interface RoadmapUnit {
  unit_number: number;
  unit_title: string;
  estimated_weeks: number;
  chapters: RoadmapChapter[];
}

export interface RoadmapOutput {
  journey_name: string;
  estimated_total_weeks: number;
  units: RoadmapUnit[];
}

// --- Stage 2 sub-step 1: one syllabus search per journey (cheap) ---
export async function findReferenceSyllabus(goal: string): Promise<string | null> {
  const results = await tavilySearch(`${goal} syllabus course outline curriculum`, {
    maxResults: 3,
    searchDepth: "basic",
    timeoutMs: 12_000, // interactive path — don't let search eat the budget
  });
  if (!results || results.length === 0) return null;
  return results
    .map((r) => `SOURCE: ${r.title} (${r.url})\n${r.content}`)
    .join("\n\n")
    .slice(0, 6000);
}

// --- Structured tool: the ONLY way the Planner returns output (JSON Schema) ---
const SAVE_ROADMAP: StructuredTool = {
  name: "save_roadmap",
  description:
    "Persist the generated learning roadmap for the student's journey. Must be called exactly once with the complete roadmap.",
  parameters: {
    type: "object",
    properties: {
      journey_name: {
        type: "string",
        description: "Concise, motivating name for the journey (max ~6 words)",
      },
      estimated_total_weeks: {
        type: "number",
        description: "Total estimated weeks for the whole journey",
      },
      units: {
        type: "array",
        items: {
          type: "object",
          properties: {
            unit_number: { type: "integer", description: "1-based unit index" },
            unit_title: { type: "string" },
            estimated_weeks: {
              type: "number",
              description: "Estimated weeks for this unit given the student's pace",
            },
            chapters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  chapter_number: {
                    type: "string",
                    description: 'Format "<unit>-<chapter>", e.g. "1-1"',
                  },
                  chapter_title: { type: "string" },
                  learning_objective: {
                    type: "string",
                    description: "One specific, concrete objective for this chapter",
                  },
                },
                required: ["chapter_number", "chapter_title", "learning_objective"],
              },
            },
          },
          required: ["unit_number", "unit_title", "estimated_weeks", "chapters"],
        },
      },
    },
    required: ["journey_name", "estimated_total_weeks", "units"],
  },
};

function buildPlannerPrompt(inputs: PlannerInputs, syllabusRef: string | null): string {
  const timeWindow =
    inputs.startDate && inputs.endDate
      ? `from ${inputs.startDate} to ${inputs.endDate}`
      : "no fixed dates given";

  return `You are the METIS Planner, an expert curriculum designer for a learning-GPS product used by high school and college students.

Design a complete learning roadmap for this student, structured as units containing chapters. Generate the ENTIRE roadmap upfront.

STUDENT INPUTS
- Goal: ${inputs.goal}
- Current level (self-reported): ${inputs.currentLevel || "not specified"}
- Time window: ${timeWindow}
- Hours per week available: ${inputs.hoursPerWeek ?? "not specified"}
- Preferences: ${inputs.preferences || "none stated"}

${
  syllabusRef
    ? `REFERENCE SYLLABUS MATERIAL (from a web search — align your unit/chapter ordering to proven course structures like these rather than inventing an ordering from scratch):
${syllabusRef}`
    : "NO REFERENCE SYLLABUS AVAILABLE (web search returned nothing usable) — rely on established curriculum conventions for this subject."
}

RULES
1. Size the roadmap dynamically by goal complexity: a narrow goal may need 2-3 units; a broad one 6+. Each unit has 2-6 chapters.
2. Hours/week affects BOTH pacing AND depth: fewer hours means a LEANER roadmap (cut optional/nice-to-have material), not just a slower schedule.
3. Estimate weeks per unit consistent with the time window and hours/week; estimated_total_weeks should roughly equal the sum.
4. Respect the student's current level: skip what they already know, start where they actually are.
5. Each chapter gets ONE specific learning_objective (concrete and checkable, not vague).
6. chapter_number format is "<unit_number>-<chapter_index>", e.g. "2-3".
7. Do NOT include resources, links, or materials — a separate agent curates those.

Call save_roadmap exactly once with the complete roadmap.`;
}

/** Validate + normalize whatever Gemini returned into a safe RoadmapOutput. */
function validateRoadmap(raw: unknown, goal: string): RoadmapOutput {
  const r = raw as Partial<RoadmapOutput> | null;
  if (!r || !Array.isArray(r.units) || r.units.length === 0) {
    throw new Error("Planner returned a roadmap with no units");
  }

  const units: RoadmapUnit[] = r.units
    .filter((u) => u && Array.isArray(u.chapters) && u.chapters.length > 0)
    // Renumber sequentially server-side: guarantees the DB unique constraints
    // hold even if the model numbers sloppily.
    .map((u, ui) => ({
      unit_number: ui + 1,
      unit_title: String(u.unit_title ?? `Unit ${ui + 1}`).slice(0, 200),
      estimated_weeks: clampNumber(u.estimated_weeks, 0.5, 52, 1),
      chapters: u.chapters.map((c, ci) => ({
        chapter_number: `${ui + 1}-${ci + 1}`,
        chapter_title: String(c.chapter_title ?? `Chapter ${ci + 1}`).slice(0, 200),
        learning_objective: String(c.learning_objective ?? "").slice(0, 500),
      })),
    }));

  if (units.length === 0) {
    throw new Error("Planner returned units but none had chapters");
  }

  return {
    journey_name: String(r.journey_name ?? goal).slice(0, 120),
    estimated_total_weeks: clampNumber(
      r.estimated_total_weeks,
      1,
      520,
      units.reduce((s, u) => s + u.estimated_weeks, 0)
    ),
    units,
  };
}

function clampNumber(v: unknown, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n * 10) / 10));
}

/**
 * Stage 6 re-plan: regenerate ONLY the remaining (incomplete) material, given
 * the student's chat request. Completed chapters are passed in solely so the
 * model doesn't repeat them — they are never touched by the caller.
 */
export async function replanRemaining(opts: {
  inputs: PlannerInputs;
  completedTitles: string[];
  incompleteTitles: string[];
  guidance: string;
}): Promise<RoadmapOutput> {
  const { inputs, completedTitles, incompleteTitles, guidance } = opts;

  const prompt = `You are the METIS Planner revising an EXISTING learning journey based on a student's request. Regenerate ONLY the remaining (not-yet-completed) portion of the roadmap.

STUDENT
- Goal: ${inputs.goal}
- Current level: ${inputs.currentLevel || "not specified"}
- Hours per week: ${inputs.hoursPerWeek ?? "not specified"}
- Preferences: ${inputs.preferences || "none stated"}

ALREADY COMPLETED (do NOT include these — they are done and protected):
${completedTitles.length ? completedTitles.map((t) => `- ${t}`).join("\n") : "- (nothing completed yet)"}

CURRENT REMAINING CHAPTERS (you are replacing these):
${incompleteTitles.length ? incompleteTitles.map((t) => `- ${t}`).join("\n") : "- (none)"}

STUDENT'S REQUEST (apply this — re-pace, restructure, change depth, etc.):
"${guidance}"

RULES
1. Produce units/chapters covering ONLY the remaining material — never re-teach completed topics.
2. Honor the request: if they want to go faster/slower, adjust depth and chapter count accordingly; if they want to restructure or skip ahead, do so.
3. Each chapter needs one concrete learning_objective. chapter_number format "<unit>-<chapter>".
4. Keep it coherent as a continuation of what they've already done.

Call save_roadmap once with the revised remaining roadmap.`;

  const raw = await callStructured<unknown>({
    provider: LLM.planner.provider,
    model: LLM.planner.model,
    prompt,
    tool: SAVE_ROADMAP,
    temperature: 0.4,
  });
  return validateRoadmap(raw, inputs.goal);
}

/** Stage 2 entry point: syllabus reference + Gemini function call -> roadmap. */
export async function generateRoadmap(inputs: PlannerInputs): Promise<RoadmapOutput> {
  // Sub-step 1: one reference-syllabus search. A failure here degrades
  // gracefully (the Planner falls back to curriculum conventions).
  const syllabusRef = await findReferenceSyllabus(inputs.goal);

  const raw = await callStructured<unknown>({
    provider: LLM.planner.provider,
    model: LLM.planner.model,
    prompt: buildPlannerPrompt(inputs, syllabusRef),
    tool: SAVE_ROADMAP,
    temperature: 0.4,
    // Interactive path: fail fast under rate limits so the request finishes
    // well under the serverless timeout (the user gets a clear "try again"
    // instead of a hang/timeout).
    maxAttempts: 2,
    maxRetryWaitMs: 10_000,
  });

  return validateRoadmap(raw, inputs.goal);
}
