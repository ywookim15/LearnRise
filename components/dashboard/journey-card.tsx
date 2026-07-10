"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CalendarRange, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JourneyIcon } from "@/components/shared/icon";
import { useApp } from "@/lib/context/app-context";
import type { UiJourneySummary, Accent } from "@/lib/data/journeys";
import { cn } from "@/lib/utils";

const ACCENT: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-brand-tertiary/10 text-brand-tertiary",
};

export function JourneyCard({ journey }: { journey: UiJourneySummary }) {
  const { deleteJourney } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteJourney(journey.id);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", ACCENT[journey.accent])}>
          <JourneyIcon name={journey.icon} className="h-5 w-5" />
        </span>
        <div className="flex items-center gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus:opacity-100"
              aria-label="Journey options"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => setConfirmDelete(true)}
                className="text-destructive focus:bg-destructive/10 [&_svg]:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete journey
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      </div>

      <Dialog open={confirmDelete} onOpenChange={(o) => !deleting && setConfirmDelete(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>Delete &ldquo;{journey.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              It moves to Archive for 30 days, so you can restore it if you change your mind.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete journey"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
