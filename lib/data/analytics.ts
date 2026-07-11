"use client";

// -----------------------------------------------------------------------------
// ANALYTICS DATA LAYER — every number here is computed from real rows
// (journeys/units/chapters/resources), never fabricated. See the data-gaps
// note in components/analytics/* for what genuinely isn't trackable yet:
// there is no session/duration log anywhere in the schema, so "study time"
// is NOT shown — only resource/chapter completion counts, which migration
// 0008 (resources.completed_at) makes possible to bucket by date.
// -----------------------------------------------------------------------------

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DbResourceType } from "@/lib/data/journeys";

interface RawResource {
  is_complete: boolean;
  completed_at: string | null;
  resource_type: DbResourceType;
}
interface RawChapter {
  is_complete: boolean;
  resources: RawResource[];
}
interface RawUnit {
  chapters: RawChapter[];
}
interface RawJourney {
  id: string;
  journey_name: string;
  completed_at: string | null;
  units: RawUnit[];
}

const TREE_SELECT = `id, journey_name, completed_at,
  units ( chapters ( is_complete, resources ( is_complete, completed_at, resource_type ) ) )`;

async function fetchJourneyTree(journeyId?: string): Promise<RawJourney[]> {
  const supabase = getSupabaseBrowserClient();
  let query = supabase.from("journeys").select(TREE_SELECT).is("deleted_at", null);
  if (journeyId) query = query.eq("id", journeyId);
  const { data, error } = await query;
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as any as RawJourney[];
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

// --- Overview ---

export interface OverviewAnalytics {
  journeysInProgress: number;
  journeysCompleted: number;
  totalResources: number;
  totalResourcesCompleted: number;
  chaptersCompletedThisWeek: number;
  chaptersCompletedThisMonth: number;
  currentStreakDays: number;
  longestStreakDays: number;
}

export async function getOverviewAnalytics(): Promise<OverviewAnalytics> {
  const journeys = await fetchJourneyTree();

  const journeysInProgress = journeys.filter((j) => !j.completed_at).length;
  const journeysCompleted = journeys.filter((j) => !!j.completed_at).length;

  const allChapters = journeys.flatMap((j) => j.units.flatMap((u) => u.chapters));
  const allResources = allChapters.flatMap((c) => c.resources);
  const totalResources = allResources.length;
  const totalResourcesCompleted = allResources.filter((r) => r.is_complete).length;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);

  // A chapter's "completion moment" is the latest completed_at among its
  // resources (the last one finished is what flips is_complete to true).
  let chaptersCompletedThisWeek = 0;
  let chaptersCompletedThisMonth = 0;
  for (const c of allChapters) {
    if (!c.is_complete) continue;
    const stamps = c.resources.map((r) => r.completed_at).filter((s): s is string => !!s);
    if (stamps.length === 0) continue;
    const latest = new Date(Math.max(...stamps.map((s) => new Date(s).getTime())));
    if (latest >= weekAgo) chaptersCompletedThisWeek++;
    if (latest >= monthAgo) chaptersCompletedThisMonth++;
  }

  // Streaks: distinct calendar days (UTC) with >=1 resource completed.
  const activeDays = new Set(
    allResources.map((r) => r.completed_at).filter((s): s is string => !!s).map(dayKey)
  );
  const { current, longest } = computeStreaks(activeDays);

  return {
    journeysInProgress,
    journeysCompleted,
    totalResources,
    totalResourcesCompleted,
    chaptersCompletedThisWeek,
    chaptersCompletedThisMonth,
    currentStreakDays: current,
    longestStreakDays: longest,
  };
}

function computeStreaks(activeDays: Set<string>): { current: number; longest: number } {
  if (activeDays.size === 0) return { current: 0, longest: 0 };

  // Current streak: walk back from today while each day is active.
  let current = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  // Allow "today" to be not-yet-active without breaking the streak (the
  // student may not have studied yet today); start from yesterday if so.
  if (!activeDays.has(dayKey(cursor.toISOString()))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (activeDays.has(dayKey(cursor.toISOString()))) {
    current++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // Longest streak: scan all active days sorted.
  const sorted = Array.from(activeDays).sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00Z");
    const cur = new Date(sorted[i] + "T00:00:00Z");
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    run = diffDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  return { current, longest: Math.max(longest, current) };
}

// --- Per-journey ---

export interface JourneyOption {
  id: string;
  name: string;
}

export async function listAnalyticsJourneys(): Promise<JourneyOption[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("journeys")
    .select("id, journey_name")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((j) => ({ id: j.id, name: j.journey_name ?? "Untitled journey" }));
}

export interface ProgressPoint {
  date: string;
  cumulativeCompleted: number;
}
export interface WeekPoint {
  weekStart: string;
  count: number;
}
export interface PerJourneyAnalytics {
  journeyName: string;
  totalResources: number;
  completedResources: number;
  progressHistory: ProgressPoint[];
  resourcesPerWeek: WeekPoint[];
  resourceTypeBreakdown: { type: DbResourceType; count: number }[];
}

function isoWeekStart(d: Date): string {
  const date = new Date(d);
  const day = (date.getUTCDay() + 6) % 7; // Monday = 0
  date.setUTCDate(date.getUTCDate() - day);
  date.setUTCHours(0, 0, 0, 0);
  return dayKey(date.toISOString());
}

export async function getPerJourneyAnalytics(journeyId: string): Promise<PerJourneyAnalytics | null> {
  const [journey] = await fetchJourneyTree(journeyId);
  if (!journey) return null;

  const resources = journey.units.flatMap((u) => u.chapters.flatMap((c) => c.resources));
  const completed = resources.filter((r) => r.is_complete && r.completed_at);
  const sorted = [...completed].sort(
    (a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime()
  );

  const progressHistory: ProgressPoint[] = [];
  const seenDays = new Map<string, number>();
  sorted.forEach((r, i) => seenDays.set(dayKey(r.completed_at!), i + 1));
  for (const [date, cumulativeCompleted] of Array.from(seenDays)) progressHistory.push({ date, cumulativeCompleted });

  const weekCounts = new Map<string, number>();
  for (const r of sorted) {
    const wk = isoWeekStart(new Date(r.completed_at!));
    weekCounts.set(wk, (weekCounts.get(wk) ?? 0) + 1);
  }
  const resourcesPerWeek = Array.from(weekCounts.entries())
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  const typeCounts = new Map<DbResourceType, number>();
  for (const r of completed) typeCounts.set(r.resource_type, (typeCounts.get(r.resource_type) ?? 0) + 1);
  const resourceTypeBreakdown = Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count }));

  return {
    journeyName: journey.journey_name ?? "Untitled journey",
    totalResources: resources.length,
    completedResources: completed.length,
    progressHistory,
    resourcesPerWeek,
    resourceTypeBreakdown,
  };
}

// --- Trends (last N days) ---

export interface TrendPoint {
  date: string;
  count: number;
}

export async function getTrendAnalytics(days = 30): Promise<TrendPoint[]> {
  const journeys = await fetchJourneyTree();
  const resources = journeys.flatMap((j) => j.units.flatMap((u) => u.chapters.flatMap((c) => c.resources)));

  const counts = new Map<string, number>();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    counts.set(dayKey(d.toISOString()), 0);
  }

  for (const r of resources) {
    if (!r.completed_at) continue;
    const key = dayKey(r.completed_at);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}
