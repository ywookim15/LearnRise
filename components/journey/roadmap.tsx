"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ResourceRow } from "@/components/journey/resource-row";
import {
  unitProgress,
  unitResourceCount,
  type Journey,
} from "@/lib/mock-data/journeys";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

export function Roadmap({ journey }: { journey: Journey }) {
  const { toggleResource } = useApp();
  // First unit expanded by default, matching the Stitch journey view.
  const [expanded, setExpanded] = useState<Set<string>>(new Set([journey.units[0]?.id]));

  function toggle(unitId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {journey.units.map((unit) => {
        const isOpen = expanded.has(unit.id);
        const progress = unitProgress(unit);
        const count = unitResourceCount(unit);
        return (
          <div
            key={unit.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            {/* Unit header */}
            <div className="flex items-center gap-4 p-4">
              {/* Clicking the unit (not the toggle) drills into the unit page */}
              <Link
                href={`/journey/${journey.id}/unit/${unit.id}`}
                className="group flex min-w-0 flex-1 items-center gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 text-sm font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {unit.index}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-primary">{unit.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {count} resources · {unit.estimate}
                  </p>
                </div>
              </Link>

              <div className="hidden w-40 items-center gap-2 sm:flex">
                <Progress value={progress} className="h-1.5" />
                <span className="w-9 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                  {progress}%
                </span>
              </div>

              <button
                onClick={() => toggle(unit.id)}
                aria-label={isOpen ? "Collapse unit" : "Expand unit"}
                aria-expanded={isOpen}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>

            {/* Expanded chapters + resources */}
            {isOpen && (
              <div className="border-t border-border bg-muted/20 px-2 py-2">
                {unit.chapters.map((chapter, ci) => (
                  <div key={chapter.id} className={cn(ci > 0 && "mt-2 border-t border-border/60 pt-2")}>
                    {unit.chapters.length > 1 && (
                      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {chapter.title}
                      </p>
                    )}
                    {chapter.resources.map((resource) => (
                      <ResourceRow
                        key={resource.id}
                        resource={resource}
                        onToggle={() => toggleResource(journey.id, resource.id)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
