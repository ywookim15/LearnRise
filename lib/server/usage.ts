// -----------------------------------------------------------------------------
// PROVIDER USAGE TRACKING (server-only)
//
// Records one row per AI provider call (LLM via callStructured, web search via
// tavilySearch) into `provider_usage`, and exposes an aggregated snapshot for
// the dashboard usage meter. Recording is best-effort and NEVER throws or
// blocks the caller — if the 0004 migration hasn't been applied yet, it simply
// no-ops and the meter hides itself.
// -----------------------------------------------------------------------------

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type UsageProvider = "gemini" | "cerebras" | "groq" | "tavily";

const ALL_PROVIDERS: UsageProvider[] = ["gemini", "cerebras", "groq", "tavily"];

// Free-tier caps are configurable estimates (providers don't publish exact
// numbers and they change). LLM providers reset per calendar day; Tavily's free
// allotment is a MONTHLY credit pool, so it's tracked over the month.
const CAP: Record<UsageProvider, number> = {
  gemini: Number(process.env.USAGE_CAP_GEMINI ?? 200),
  cerebras: Number(process.env.USAGE_CAP_CEREBRAS ?? 1000),
  groq: Number(process.env.USAGE_CAP_GROQ ?? 1000),
  tavily: Number(process.env.USAGE_CAP_TAVILY ?? 1000),
};

const WINDOW: Record<UsageProvider, "daily" | "monthly"> = {
  gemini: "daily",
  cerebras: "daily",
  groq: "daily",
  tavily: "monthly",
};

const LABEL: Record<UsageProvider, string> = {
  gemini: "Gemini · roadmap planner",
  cerebras: "Cerebras · resource curator",
  groq: "Groq · tutor & memory",
  tavily: "Tavily · web search",
};

export interface ProviderUsageStat {
  provider: UsageProvider;
  label: string;
  used: number;
  cap: number;
  pct: number; // 0..100, clamped
  window: "daily" | "monthly";
  resetsInMs: number;
  rateLimited: boolean; // within the cooldown of the most recent 429
  retryAfterSec: number | null;
  lastRateLimitedAt: string | null;
}

export interface UsageSnapshot {
  providers: ProviderUsageStat[];
  generatedAt: string;
}

/**
 * Record one provider call. Fire-and-forget: returns immediately, swallows all
 * errors (including "table/function does not exist" before the migration runs).
 */
export function recordProviderUsage(
  provider: string,
  rateLimited = false,
  retryAfterSec?: number
): void {
  try {
    const admin = getSupabaseAdmin();
    void admin
      .rpc("record_provider_usage", {
        p_provider: provider,
        p_rate_limited: rateLimited,
        p_retry_after: retryAfterSec ?? null,
      })
      .then(({ error }) => {
        if (error && !/(does not exist|schema cache)/i.test(error.message)) {
          console.warn("[usage] record skipped:", error.message);
        }
      });
  } catch {
    /* best-effort only */
  }
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Aggregate today's (and this month's, for Tavily) usage per provider. Returns
 * null if the table isn't there yet, so the caller can hide the meter.
 */
export async function getUsageSnapshot(): Promise<UsageSnapshot | null> {
  const admin = getSupabaseAdmin();
  const now = new Date();
  const monthStart = ymd(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const today = ymd(now);

  const { data, error } = await admin
    .from("provider_usage")
    .select("provider, day, call_count, last_rate_limited_at, last_retry_after_sec")
    .gte("day", monthStart);

  if (error) return null; // migration not applied yet

  const rows = data ?? [];

  const providers: ProviderUsageStat[] = ALL_PROVIDERS.map((p) => {
    const prows = rows.filter((r) => r.provider === p);
    const win = WINDOW[p];
    const inWindow = win === "monthly" ? prows : prows.filter((r) => r.day === today);
    const used = inWindow.reduce((sum, r) => sum + (r.call_count ?? 0), 0);
    const cap = CAP[p] || 1;
    const pct = Math.min(100, Math.round((used / cap) * 100));

    const resetAt =
      win === "monthly"
        ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
        : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    // Most recent rate-limit hit across this provider's rows in the window.
    const lastHit = inWindow
      .filter((r) => r.last_rate_limited_at)
      .sort((a, b) =>
        (a.last_rate_limited_at ?? "") < (b.last_rate_limited_at ?? "") ? 1 : -1
      )[0];

    let rateLimited = false;
    let retryAfterSec: number | null = null;
    let lastRateLimitedAt: string | null = null;
    if (lastHit?.last_rate_limited_at) {
      lastRateLimitedAt = lastHit.last_rate_limited_at;
      retryAfterSec = lastHit.last_retry_after_sec ?? null;
      const sinceMs = now.getTime() - new Date(lastHit.last_rate_limited_at).getTime();
      // Show the throttled state for the retry window (min 1 min, so a brief
      // burst 429 is still visible), capped so a stale hit doesn't linger.
      const cooldownMs = Math.min(Math.max((retryAfterSec ?? 300) * 1000, 60_000), 60 * 60_000);
      rateLimited = sinceMs < cooldownMs;
    }

    return {
      provider: p,
      label: LABEL[p],
      used,
      cap,
      pct,
      window: win,
      resetsInMs: resetAt.getTime() - now.getTime(),
      rateLimited,
      retryAfterSec,
      lastRateLimitedAt,
    };
  });

  return { providers, generatedAt: now.toISOString() };
}
