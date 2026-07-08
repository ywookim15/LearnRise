"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JourneyIcon } from "@/components/shared/icon";
import { SummarizeDialog } from "@/components/dashboard/summarize-dialog";
import { journeyProgress, type Journey } from "@/lib/mock-data/journeys";
import { cn } from "@/lib/utils";

const ACCENT: Record<Journey["accent"], string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-brand-tertiary/10 text-brand-tertiary",
};

export function JourneyCard({ journey }: { journey: Journey }) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const progress = journeyProgress(journey);

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", ACCENT[journey.accent])}>
          <JourneyIcon name={journey.icon} className="h-5 w-5" />
        </span>
        {journey.isNew ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            New journey
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Flame className="h-3.5 w-3.5 text-secondary" />
            {journey.streak} day streak
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug">{journey.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{journey.description}</p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">Progress</span>
          <span className="font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="mt-2" />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Last studied {journey.lastStudied}
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
