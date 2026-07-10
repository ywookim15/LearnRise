"use client";

// -----------------------------------------------------------------------------
// REAL DATA LAYER (Step 5) — replaces lib/mock-data/journeys for the Dashboard,
// Journey Page, and Unit Page. Reads/writes Supabase from the browser client;
// RLS scopes everything to the signed-in user. Notifications, streak, analytics,
// archive, and the resources-hub remain mock (out of Step 5 scope).
// -----------------------------------------------------------------------------

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type DbResourceType = "video" | "article" | "practice_set";
export type ResourceStatus = "pending" | "complete" | "no_resources_found";
export type Accent = "primary" | "secondary" | "tertiary";

export interface UiResource {
  id: string;
  label: string; // chapter number, e.g. "1-1"
  title: string;
  source: string;
  type: DbResourceType;
  url: string;
  whyThisFits: string;
  videoTimestamp: string | null;
  isTrusted: boolean;
  completed: boolean;
}

export interface UiChapter {
  id: string;
  number: string;
  title: string;
  learningObjective: string;
  resourceStatus: ResourceStatus;
  isComplete: boolean;
  resources: UiResource[];
}

export interface UiUnit {
  id: string;
  number: number;
  title: string;
  estimatedWeeks: number | null;
  chapters: UiChapter[];
}

export interface UiJourneyDetail {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: Accent;
  createdAt: string;
  estimatedTotalWeeks: number | null;
  units: UiUnit[];
}

export interface UiJourneySummary {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: Accent;
  createdAt: string;
  estimatedTotalWeeks: number | null;
  isNew: boolean;
  progress: number; // 0-100
  totalResources: number;
  completedResources: number;
  curating: boolean; // any chapter still resource_status='pending'
}

// --- deterministic icon/accent from the journey id (no icon column in DB) ---
const ICON_POOL = [
  "Boxes", "Brain", "PenTool", "Terminal", "Dna", "PiggyBank",
  "Languages", "Palette", "Atom", "Calculator", "Globe", "Code",
  "Microscope", "BookOpen", "Music",
];
const ACCENTS: Accent[] = ["primary", "secondary", "tertiary"];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}
export function deriveIcon(seed: string): string {
  return ICON_POOL[hashSeed(seed) % ICON_POOL.length];
}
export function deriveAccent(seed: string): Accent {
  return ACCENTS[hashSeed(seed) % ACCENTS.length];
}

const RESOURCE_SELECT =
  "id, title, url, source_name, resource_type, video_timestamp, why_this_fits, is_trusted_domain, is_complete";
const DETAIL_SELECT = `id, journey_name, goal, preferences, created_at, estimated_total_weeks,
  units ( id, unit_number, unit_title, estimated_weeks,
    chapters ( id, chapter_number, chapter_title, learning_objective, is_complete, resource_status,
      resources ( ${RESOURCE_SELECT} ) ) )`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapResource(r: any, chapterNumber: string): UiResource {
  return {
    id: r.id,
    label: chapterNumber,
    title: r.title ?? "",
    source: r.source_name ?? hostnameOf(r.url),
    type: (r.resource_type ?? "article") as DbResourceType,
    url: r.url ?? "",
    whyThisFits: r.why_this_fits ?? "",
    videoTimestamp: r.video_timestamp ?? null,
    isTrusted: !!r.is_trusted_domain,
    completed: !!r.is_complete,
  };
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function chapterNumberSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDetail(row: any): UiJourneyDetail {
  const units: UiUnit[] = (row.units ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((u: any): UiUnit => ({
      id: u.id,
      number: u.unit_number,
      title: u.unit_title ?? "",
      estimatedWeeks: u.estimated_weeks ?? null,
      chapters: (u.chapters ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any): UiChapter => ({
          id: c.id,
          number: c.chapter_number,
          title: c.chapter_title ?? "",
          learningObjective: c.learning_objective ?? "",
          resourceStatus: (c.resource_status ?? "pending") as ResourceStatus,
          isComplete: !!c.is_complete,
          resources: (c.resources ?? [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((r: any) => mapResource(r, c.chapter_number))
            .sort((a: UiResource, b: UiResource) => a.title.localeCompare(b.title)),
        }))
        .sort((a: UiChapter, b: UiChapter) => chapterNumberSort(a.number, b.number)),
    }))
    .sort((a: UiUnit, b: UiUnit) => a.number - b.number);

  return {
    id: row.id,
    name: row.journey_name ?? "Untitled journey",
    description: row.goal || "",
    icon: deriveIcon(row.id),
    accent: deriveAccent(row.id),
    createdAt: row.created_at,
    estimatedTotalWeeks: row.estimated_total_weeks ?? null,
    units,
  };
}

// --- progress helpers (exported for reuse in components) ---
export function detailProgress(journey: UiJourneyDetail): {
  progress: number;
  total: number;
  completed: number;
} {
  const all = journey.units.flatMap((u) => u.chapters.flatMap((c) => c.resources));
  const completed = all.filter((r) => r.completed).length;
  return {
    total: all.length,
    completed,
    progress: all.length ? Math.round((completed / all.length) * 100) : 0,
  };
}

export function unitProgress(unit: UiUnit): number {
  const all = unit.chapters.flatMap((c) => c.resources);
  if (!all.length) return 0;
  return Math.round((all.filter((r) => r.completed).length / all.length) * 100);
}

export function unitResourceCount(unit: UiUnit): number {
  return unit.chapters.reduce((n, c) => n + c.resources.length, 0);
}

// --- reads ---

/** Dashboard list: journeys + computed progress + curation status. */
export async function listJourneySummaries(): Promise<UiJourneySummary[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("journeys")
    .select(
      `id, journey_name, goal, preferences, created_at, estimated_total_weeks,
       units ( id, chapters ( id, resource_status, resources ( is_complete ) ) )`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any): UiJourneySummary => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chapters = (row.units ?? []).flatMap((u: any) => u.chapters ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resources = chapters.flatMap((c: any) => c.resources ?? []);
    const completed = resources.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => r.is_complete
    ).length;
    const total = resources.length;
    const curating = chapters.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.resource_status === "pending"
    );
    return {
      id: row.id,
      name: row.journey_name ?? "Untitled journey",
      description: row.goal || "",
      icon: deriveIcon(row.id),
      accent: deriveAccent(row.id),
      createdAt: row.created_at,
      estimatedTotalWeeks: row.estimated_total_weeks ?? null,
      isNew: completed === 0,
      progress: total ? Math.round((completed / total) * 100) : 0,
      totalResources: total,
      completedResources: completed,
      curating,
    };
  });
}

/** Full journey detail for the Journey Page + Unit Page. Null if not found. */
export async function getJourneyDetail(id: string): Promise<UiJourneyDetail | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("journeys")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapDetail(data);
}

// --- writes ---

/**
 * Toggle a resource's completion, then roll the chapter's is_complete up
 * (true only when every resource in the chapter is complete). Both writes go
 * through RLS as the signed-in user.
 */
export async function setResourceComplete(
  resourceId: string,
  next: boolean
): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  const { data: updated, error: updErr } = await supabase
    .from("resources")
    .update({ is_complete: next })
    .eq("id", resourceId)
    .select("chapter_id")
    .single();
  if (updErr) throw updErr;

  const chapterId = updated.chapter_id as string;
  const { data: siblings, error: sibErr } = await supabase
    .from("resources")
    .select("is_complete")
    .eq("chapter_id", chapterId);
  if (sibErr) throw sibErr;

  const allDone = siblings.length > 0 && siblings.every((r) => r.is_complete);
  const { error: chapErr } = await supabase
    .from("chapters")
    .update({ is_complete: allDone })
    .eq("id", chapterId);
  if (chapErr) throw chapErr;
}

export interface CreateJourneyInput {
  goal: string;
  currentLevel: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: string;
  preferences: string;
}

/** POST the journey-creation route (Planner). Returns the new journey id. */
export async function createJourney(input: CreateJourneyInput): Promise<string> {
  const res = await fetch("/api/journeys", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      goal: input.goal,
      currentLevel: input.currentLevel,
      preferences: input.preferences,
      startDate: input.startDate || undefined,
      endDate: input.endDate || undefined,
      hoursPerWeek: input.hoursPerWeek ? Number(input.hoursPerWeek) : undefined,
    }),
  });
  // A serverless timeout returns a non-JSON body, so .json() can throw.
  const json = await res.json().catch(() => ({} as { error?: string; journeyId?: string }));
  if (!res.ok) {
    const fallback =
      res.status === 504 || res.status === 408 || res.status === 502
        ? "This is taking longer than expected — METIS may be busy. Please wait a minute and try again."
        : "Couldn't create your journey. Please try again.";
    throw new Error(json.error || fallback);
  }
  return json.journeyId as string;
}
