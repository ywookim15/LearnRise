"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JourneyIcon } from "@/components/shared/icon";
import { SummarizeDialog } from "@/components/dashboard/summarize-dialog";
import type { UiJourneySummary, Accent } from "@/lib/data/journeys";
import { cn } from "@/lib/utils";

const ACCENT: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-brand-tertiary/10 text-brand-tertiary",
};

export function JourneyCard({ journey }: { journey: UiJourneySummary }) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", ACCENT[journey.accent])}>
          <JourneyIcon name={journey.icon} className="h-5 w-5" />
        </span>
        {journey.curating ? (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Curating
          </span>
        ) : journey.isNew ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            New journey
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug">{journey.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{journey.description}</p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">Progress</span>
          <span className="font-bold text-primary">{journey.progress}%</span>
        </div>
        <Progress value={journey.progress} className="mt-2" />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarRange className="h-3.5 w-3.5" />
        {journey.completedResources}/{journey.totalResources} resources
        {journey.estimatedTotalWeeks ? ` · ~${journey.estimatedTotalWeeks} weeks` : ""}
      </p>

      <div className="mt-4 flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/journey/${journey.id}`}>Resume</Link>
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setSummaryOpen(true)}>
          <Sparkles className="h-4 w-4" />
          Summarize
        </Button>
      </div>

      <SummarizeDialog journey={journey} open={summaryOpen} onOpenChange={setSummaryOpen} />
    </div>
  );
}
