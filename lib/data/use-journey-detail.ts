"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getJourneyDetail,
  setResourceComplete,
  setResourceSaved,
  type UiJourneyDetail,
} from "@/lib/data/journeys";

interface State {
  journey: UiJourneyDetail | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads a journey's full detail and keeps it fresh while resource curation is
 * still running (chapters with resource_status='pending'), polling every 8s
 * until curation settles. Exposes an optimistic resource toggle.
 */
export function useJourneyDetail(journeyId: string | undefined) {
  const [state, setState] = useState<State>({ journey: null, loading: true, error: null });
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResumeRef = useRef<number>(0);

  // Resume curation for stalled/pending chapters. Serverless caps each curation
  // run at the function's maxDuration, so a big journey needs several runs; the
  // client re-triggers /curate (throttled) until nothing is pending.
  const resumeCuration = useCallback(async () => {
    if (!journeyId) return;
    const now = Date.now();
    if (now - lastResumeRef.current < 45_000) return; // throttle
    lastResumeRef.current = now;
    try {
      await fetch(`/api/journeys/${journeyId}/curate`, { method: "POST" });
    } catch {
      /* best-effort */
    }
  }, [journeyId]);

  const load = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!journeyId) return;
      if (!opts.silent) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const journey = await getJourneyDetail(journeyId);
        setState({ journey, loading: false, error: journey ? null : "not_found" });
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load journey",
        }));
      }
    },
    [journeyId]
  );

  useEffect(() => {
    void load();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [load]);

  // Poll while any chapter is still curating; also resume curation (throttled)
  // so a run that got cut off at the serverless time limit continues.
  useEffect(() => {
    const anyPending = state.journey?.units.some((u) =>
      u.chapters.some((c) => c.resourceStatus === "pending")
    );
    if (pollRef.current) clearTimeout(pollRef.current);
    if (anyPending) {
      pollRef.current = setTimeout(() => {
        void resumeCuration();
        void load({ silent: true });
      }, 8000);
    }
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [state.journey, load, resumeCuration]);

  /** Optimistic toggle: flip local state immediately, persist, roll back on error. */
  const toggleResource = useCallback(
    async (resourceId: string) => {
      let nextValue = false;
      setState((s) => {
        if (!s.journey) return s;
        return { ...s, journey: mutateResource(s.journey, resourceId, (r) => {
          nextValue = !r.completed;
          return { ...r, completed: nextValue };
        }) };
      });
      try {
        await setResourceComplete(resourceId, nextValue);
      } catch {
        // revert
        setState((s) => {
          if (!s.journey) return s;
          return { ...s, journey: mutateResource(s.journey, resourceId, (r) => ({
            ...r,
            completed: !nextValue,
          })) };
        });
      }
    },
    []
  );

  /** Optimistic bookmark toggle, same pattern as toggleResource. */
  const toggleSaved = useCallback(
    async (resourceId: string) => {
      let nextValue = false;
      setState((s) => {
        if (!s.journey) return s;
        return { ...s, journey: mutateResource(s.journey, resourceId, (r) => {
          nextValue = !r.saved;
          return { ...r, saved: nextValue };
        }) };
      });
      try {
        await setResourceSaved(resourceId, nextValue);
      } catch {
        setState((s) => {
          if (!s.journey) return s;
          return { ...s, journey: mutateResource(s.journey, resourceId, (r) => ({
            ...r,
            saved: !nextValue,
          })) };
        });
      }
    },
    []
  );

  return { ...state, reload: load, toggleResource, toggleSaved };
}

function mutateResource(
  journey: UiJourneyDetail,
  resourceId: string,
  fn: (r: UiJourneyDetail["units"][0]["chapters"][0]["resources"][0]) => UiJourneyDetail["units"][0]["chapters"][0]["resources"][0]
): UiJourneyDetail {
  return {
    ...journey,
    units: journey.units.map((u) => ({
      ...u,
      chapters: u.chapters.map((c) => {
        if (!c.resources.some((r) => r.id === resourceId)) return c;
        const resources = c.resources.map((r) => (r.id === resourceId ? fn(r) : r));
        return { ...c, resources, isComplete: resources.length > 0 && resources.every((r) => r.completed) };
      }),
    })),
  };
}
