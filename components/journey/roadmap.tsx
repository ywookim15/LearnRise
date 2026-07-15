"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Minus, Plus, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ResourceRow } from "@/components/journey/resource-row";
import { unitProgress, unitResourceCount, type UiJourneyDetail, type UiUnit } from "@/lib/data/journeys";
import { cn } from "@/lib/utils";

export function Roadmap({
  journey,
  onToggleResource,
  onToggleSave,
}: {
  journey: UiJourneyDetail;
  onToggleResource: (resourceId: string) => void;
  onToggleSave: (resourceId: string) => void;
}) {
  const t = useTranslations("app.roadmap");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(journey.units[0] ? [journey.units[0].id] : [])
  );

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
            <div className="flex items-center gap-4 p-4">
              <Link
                href={`/journey/${journey.id}/unit/${unit.id}`}
                className="group flex min-w-0 flex-1 items-center gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 text-sm font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {unit.number}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-primary">{unit.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t("resourceCount", { count })}
                    {unit.estimatedWeeks ? ` · ${t("weeks", { count: unit.estimatedWeeks })}` : ""}
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
                aria-label={isOpen ? t("collapseUnit") : t("expandUnit")}
                aria-expanded={isOpen}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>

            {isOpen && (
              <div className="border-t border-border bg-muted/20 px-2 py-2">
                {unit.chapters.map((chapter, ci) => (
                  <div key={chapter.id} className={cn(ci > 0 && "mt-2 border-t border-border/60 pt-2")}>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {chapter.number} · {chapter.title}
                    </p>
                    <ChapterResources
                      chapter={chapter}
                      onToggleResource={onToggleResource}
                      onToggleSave={onToggleSave}
                    />
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

function ChapterResources({
  chapter,
  onToggleResource,
  onToggleSave,
}: {
  chapter: UiUnit["chapters"][number];
  onToggleResource: (resourceId: string) => void;
  onToggleSave: (resourceId: string) => void;
}) {
  const t = useTranslations("app.chapterStatus");
  if (chapter.resources.length > 0) {
    return (
      <>
        {chapter.resources.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            onToggle={() => onToggleResource(resource.id)}
            onToggleSave={() => onToggleSave(resource.id)}
          />
        ))}
      </>
    );
  }
  if (chapter.resourceStatus === "pending") {
    return (
      <p className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary" />
        {t("curating")}
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground">
      <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
      {t("gap")}
    </p>
  );
}
