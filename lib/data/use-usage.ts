"use client";

import { useEffect, useRef, useState } from "react";

export interface UsageProviderStat {
  provider: "gemini" | "cerebras" | "groq" | "tavily";
  label: string;
  used: number;
  cap: number;
  pct: number;
  window: "daily" | "monthly";
  resetsInMs: number;
  rateLimited: boolean;
  retryAfterSec: number | null;
  lastRateLimitedAt: string | null;
}

export interface UsageSnapshot {
  available: boolean;
  providers?: UsageProviderStat[];
  generatedAt?: string;
}

/**
 * Polls GET /api/usage. `available` is false before the 0004 migration is
 * applied (or when not signed in), which lets consumers hide themselves.
 */
export function useUsage(pollMs = 30_000): UsageSnapshot & { loading: boolean } {
  const [snapshot, setSnapshot] = useState<UsageSnapshot>({ available: false });
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/usage", { cache: "no-store" });
        const json = res.ok ? ((await res.json()) as UsageSnapshot) : { available: false };
        if (!cancelled) setSnapshot(json);
      } catch {
        if (!cancelled) setSnapshot({ available: false });
      } finally {
        if (!cancelled) {
          setLoading(false);
          timer.current = setTimeout(tick, pollMs);
        }
      }
    }

    void tick();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pollMs]);

  return { ...snapshot, loading };
}

/** "6h", "45m", "2d" — compact "resets in" label from a ms duration. */
export function formatResetIn(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60_000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}
