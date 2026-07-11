"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Check, CircleDashed, Loader2, GitBranch, AlertCircle } from "lucide-react";
import { ResourceTypeIcon } from "@/components/shared/icon";
import type { UiUnit, UiChapter, DbResourceType, SkillLevel } from "@/lib/data/journeys";
import { cn } from "@/lib/utils";

type NodeState = SkillLevel;

const NODE_STYLE: Record<NodeState, string> = {
  unset: "border-border bg-card",
  familiar: "border-secondary/50 bg-secondary/5",
  known: "border-emerald-500/50 bg-emerald-500/5",
};

const BRANCH_STROKE: Record<NodeState, string> = {
  unset: "stroke-primary/25",
  familiar: "stroke-secondary/70",
  known: "stroke-emerald-500/70",
};

const BADGE_STYLE: Record<DbResourceType, string> = {
  video: "bg-primary/10 text-primary",
  article: "bg-secondary/10 text-secondary",
  practice_set: "bg-emerald-500/10 text-emerald-600",
};

interface BranchPath {
  id: string;
  d: string;
}

/**
 * Knowledge-tree view of a unit: the unit is the root and each chapter branches
 * off it along a curved SVG connector (measured against real DOM positions, so
 * it stays correct at any card height/width). Chapters show a compact
 * type+count summary rather than every resource title — this is a map of the
 * unit's shape, not another resource list. Hover a chapter node to mark mastery
 * (Know it / Familiar) — the mark is persisted server-side and triggers a
 * narrow Planner+Curator re-fetch of just that chapter's resources.
 */
export function UnitFlowchart({
  unit,
  onMarkSkill,
}: {
  unit: UiUnit;
  onMarkSkill: (chapterId: string, level: SkillLevel) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootIconRef = useRef<HTMLSpanElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [paths, setPaths] = useState<BranchPath[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  function handleMark(chapter: UiChapter, level: NodeState) {
    onMarkSkill(chapter.id, chapter.skillLevel === level ? "unset" : level);
  }

  const skillById = new Map(unit.chapters.map((c) => [c.id, c.skillLevel]));

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const icon = rootIconRef.current;
      if (!container || !icon) return;
      const cRect = container.getBoundingClientRect();
      const iRect = icon.getBoundingClientRect();
      const anchorX = iRect.left - cRect.left + iRect.width / 2;
      const anchorY = iRect.bottom - cRect.top;

      const next: BranchPath[] = [];
      for (const chapter of unit.chapters) {
        const el = nodeRefs.current.get(chapter.id);
        if (!el) continue;
        const eRect = el.getBoundingClientRect();
        const x = eRect.left - cRect.left;
        const y = eRect.top - cRect.top + eRect.height / 2;
        const midY = (anchorY + y) / 2;
        next.push({
          id: chapter.id,
          d: `M ${anchorX} ${anchorY} C ${anchorX} ${midY}, ${x} ${midY}, ${x} ${y}`,
        });
      }
      setPaths(next);
      setSvgSize({ w: cRect.width, h: cRect.height });
    }

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [unit.chapters]);

  return (
    <div className="rounded-2xl border border-border bg-brand-gradient-soft p-6">
      <div className="mb-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <GitBranch className="h-3.5 w-3.5" />
        Knowledge map — what you&apos;ll learn in this unit
      </div>

      <div ref={containerRef} className="relative">
        <svg
          data-testid="knowledge-tree-branches"
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={svgSize.w}
          height={svgSize.h}
        >
          {paths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              className={cn("transition-colors", BRANCH_STROKE[skillById.get(p.id) ?? "unset"])}
            />
          ))}
        </svg>

        {/* Root */}
        <div className="relative z-10 flex w-fit items-center gap-3">
          <span
            ref={rootIconRef}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-white shadow-brand"
          >
            {unit.number}
          </span>
          <div>
            <p className="font-semibold leading-tight">{unit.title}</p>
            <p className="text-xs text-muted-foreground">
              {unit.chapters.length} {unit.chapters.length === 1 ? "topic" : "topics"} · hover a
              node to mark your mastery
            </p>
          </div>
        </div>

        {/* Chapter branch nodes */}
        <div className="relative z-10 ml-14 mt-4 space-y-3">
          {unit.chapters.map((chapter) => {
            const st = chapter.skillLevel;
            const isHovered = hovered === chapter.id;
            return (
              <div
                key={chapter.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(chapter.id, el);
                  else nodeRefs.current.delete(chapter.id);
                }}
                onMouseEnter={() => setHovered(chapter.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl border-2 p-3 shadow-card transition-colors",
                  NODE_STYLE[st]
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                      st === "known"
                        ? "border-emerald-500 text-emerald-600"
                        : st === "familiar"
                        ? "border-secondary text-secondary"
                        : "border-primary/40 text-primary/70"
                    )}
                  >
                    {st === "known" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : st === "familiar" ? (
                      <CircleDashed className="h-3.5 w-3.5" />
                    ) : (
                      chapter.number.split("-").pop()
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Topic {chapter.number}
                    </p>
                    <p className="truncate text-sm font-semibold leading-snug">{chapter.title}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {isHovered ? (
                    <>
                      <button
                        onClick={() => handleMark(chapter, "known")}
                        className="whitespace-nowrap rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20"
                      >
                        Know it
                      </button>
                      <button
                        onClick={() => handleMark(chapter, "familiar")}
                        className="whitespace-nowrap rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary hover:bg-secondary/20"
                      >
                        Familiar
                      </button>
                    </>
                  ) : (
                    <ResourceSummary chapter={chapter} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Compact "1 video · 2 articles" style summary — never names individual resources. */
function ResourceSummary({ chapter }: { chapter: UiChapter }) {
  if (chapter.resources.length === 0) {
    if (chapter.resourceStatus === "pending") {
      return (
        <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-secondary" />
          curating…
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 whitespace-nowrap text-[11px] text-muted-foreground">
        <AlertCircle className="h-3 w-3" />
        gap
      </span>
    );
  }

  const counts = new Map<DbResourceType, number>();
  for (const r of chapter.resources) counts.set(r.type, (counts.get(r.type) ?? 0) + 1);

  return (
    <div className="flex items-center gap-1.5">
      {Array.from(counts.entries()).map(([type, n]) => (
        <span
          key={type}
          className={cn(
            "flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-semibold",
            BADGE_STYLE[type]
          )}
        >
          <ResourceTypeIcon type={type} className="h-3 w-3" />
          {n}
        </span>
      ))}
    </div>
  );
}
