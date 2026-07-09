"use client";

import { useState } from "react";
import { ChevronRight, Flag, Trophy, Check, CircleDashed } from "lucide-react";
import type { UiUnit } from "@/lib/data/journeys";
import { cn } from "@/lib/utils";

type NodeState = "unset" | "familiar" | "known";

const STATE_STYLE: Record<NodeState, string> = {
  unset: "border-border bg-card text-foreground",
  familiar: "border-secondary bg-secondary/10 text-secondary",
  known: "border-emerald-500 bg-emerald-500/10 text-emerald-600",
};

/**
 * Mock static flowchart for a unit: each chapter is a node in the path from
 * "Start" to "Mastery". Hovering a node reveals non-functional
 * "Know it" / "Familiar" controls that toggle a local visual state.
 */
export function UnitFlowchart({ unit }: { unit: UiUnit }) {
  const [states, setStates] = useState<Record<string, NodeState>>({});

  function setState(id: string, s: NodeState) {
    setStates((prev) => ({ ...prev, [id]: prev[id] === s ? "unset" : s }));
  }

  return (
    <div className="rounded-2xl border border-border bg-brand-gradient-soft p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        What you&apos;ll learn in this unit
      </p>
      <div className="flex items-stretch gap-2 overflow-x-auto scrollbar-slim pb-2">
        {/* Start node */}
        <FixedNode icon={<Flag className="h-4 w-4" />} label="Start" tone="start" />
        <Connector />

        {unit.chapters.map((chapter, i) => {
          const state = states[chapter.id] ?? "unset";
          return (
            <div key={chapter.id} className="flex items-stretch gap-2">
              <div className="group/node relative flex items-center">
                <div
                  className={cn(
                    "flex h-full w-44 flex-col justify-center rounded-2xl border-2 px-4 py-3 shadow-card transition-colors",
                    STATE_STYLE[state]
                  )}
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    {state === "known" ? (
                      <Check className="h-3 w-3" />
                    ) : state === "familiar" ? (
                      <CircleDashed className="h-3 w-3" />
                    ) : null}
                    Node {i + 1}
                  </span>
                  <span className="mt-1 text-sm font-semibold leading-snug">{chapter.title}</span>
                </div>

                {/* Hover controls */}
                <div className="pointer-events-none absolute -top-11 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-xl border border-border bg-popover p-1.5 opacity-0 shadow-popover transition-opacity group-hover/node:pointer-events-auto group-hover/node:opacity-100">
                  <button
                    onClick={() => setState(chapter.id, "known")}
                    className="whitespace-nowrap rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20"
                  >
                    Know it
                  </button>
                  <button
                    onClick={() => setState(chapter.id, "familiar")}
                    className="whitespace-nowrap rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary hover:bg-secondary/20"
                  >
                    Familiar
                  </button>
                </div>
              </div>
              <Connector />
            </div>
          );
        })}

        {/* Mastery node */}
        <FixedNode icon={<Trophy className="h-4 w-4" />} label="Mastery" tone="end" />
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Hover a node to mark how well you know it (visual only in this prototype).
      </p>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center px-0.5 text-muted-foreground">
      <ChevronRight className="h-5 w-5" />
    </div>
  );
}

function FixedNode({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "start" | "end";
}) {
  return (
    <div
      className={cn(
        "flex w-24 flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-center shadow-card",
        tone === "start"
          ? "bg-brand-tertiary text-white"
          : "bg-brand-gradient text-white"
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
        {icon}
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}
