"use client";

import { useState } from "react";
import { Check, CircleDashed, Loader2, GitBranch } from "lucide-react";
import { ResourceTypeIcon } from "@/components/shared/icon";
import type { UiUnit, DbResourceType } from "@/lib/data/journeys";
import { cn } from "@/lib/utils";

type NodeState = "unset" | "familiar" | "known";

const NODE_STYLE: Record<NodeState, string> = {
  unset: "border-border bg-card",
  familiar: "border-secondary/50 bg-secondary/5",
  known: "border-emerald-500/50 bg-emerald-500/5",
};

const LEAF_STYLE: Record<DbResourceType, string> = {
  video: "bg-primary/10 text-primary",
  article: "bg-secondary/10 text-secondary",
  practice_set: "bg-emerald-500/10 text-emerald-600",
};

/**
 * Knowledge-tree view of a unit: the unit is the root, each chapter is a branch,
 * and each chapter's curated resources hang off it as leaf "subtopics". Hovering
 * a chapter node reveals non-functional "Know it" / "Familiar" controls that
 * toggle a local visual state (prototype only).
 */
export function UnitFlowchart({ unit }: { unit: UiUnit }) {
  const [states, setStates] = useState<Record<string, NodeState>>({});
  const [hovered, setHovered] = useState<string | null>(null);

  function setState(id: string, s: NodeState) {
    setStates((prev) => ({ ...prev, [id]: prev[id] === s ? "unset" : s }));
  }

  return (
    <div className="rounded-2xl border border-border bg-brand-gradient-soft p-6">
      <div className="mb-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <GitBranch className="h-3.5 w-3.5" />
        Knowledge map — what you&apos;ll learn in this unit
      </div>

      {/* Root */}
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-white shadow-brand">
          {unit.number}
        </span>
        <div>
          <p className="font-semibold leading-tight">{unit.title}</p>
          <p className="text-xs text-muted-foreground">
            {unit.chapters.length} {unit.chapters.length === 1 ? "topic" : "topics"} · hover a node to mark your mastery
          </p>
        </div>
      </div>

      {/* Branches (chapters), hanging off a vertical spine */}
      <div className="ml-6 mt-1 space-y-3 border-l-2 border-dashed border-primary/25 pl-7 pt-3">
        {unit.chapters.map((chapter) => {
          const st = states[chapter.id] ?? "unset";
          const isHovered = hovered === chapter.id;
          return (
            <div
              key={chapter.id}
              className="relative"
              onMouseEnter={() => setHovered(chapter.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* connector node on the spine */}
              <span
                className={cn(
                  "absolute -left-[35px] top-4 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-background",
                  st === "known"
                    ? "border-emerald-500 text-emerald-500"
                    : st === "familiar"
                    ? "border-secondary text-secondary"
                    : "border-primary/40"
                )}
              >
                {st === "known" ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : st === "familiar" ? (
                  <CircleDashed className="h-2.5 w-2.5" />
                ) : null}
              </span>

              {/* chapter node card */}
              <div
                className={cn(
                  "rounded-2xl border-2 p-3 shadow-card transition-colors",
                  NODE_STYLE[st]
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Topic {chapter.number}
                    </p>
                    <p className="text-sm font-semibold leading-snug">{chapter.title}</p>
                  </div>

                  {/* hover-to-mark controls (React-state driven, never clipped) */}
                  {isHovered ? (
                    <div className="flex shrink-0 gap-1.5">
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
                  ) : st !== "unset" ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium",
                        st === "known"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-secondary/10 text-secondary"
                      )}
                    >
                      {st === "known" ? "Know it" : "Familiar"}
                    </span>
                  ) : null}
                </div>

                {/* resource leaves (subtopics) */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {chapter.resources.length > 0 ? (
                    chapter.resources.map((r) => (
                      <span
                        key={r.id}
                        className={cn(
                          "inline-flex max-w-[220px] items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium",
                          LEAF_STYLE[r.type]
                        )}
                        title={r.title}
                      >
                        <ResourceTypeIcon type={r.type} className="h-3 w-3 shrink-0" />
                        <span className="truncate">{r.title}</span>
                      </span>
                    ))
                  ) : chapter.resourceStatus === "pending" ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin text-secondary" />
                      curating subtopics…
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">no resources yet</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
