"use client";

import { useState } from "react";
import { RotateCcw, Trash2, Clock, CheckCircle2, Info } from "lucide-react";
import { AppPage } from "@/components/layout/app-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JourneyIcon } from "@/components/shared/icon";
import {
  mockCompletedJourneys,
  mockDeletedJourneys,
  type DeletedJourney,
} from "@/lib/mock-data/archive";

export default function ArchivePage() {
  const [deleted, setDeleted] = useState<DeletedJourney[]>(mockDeletedJourneys);
  const [toPurge, setToPurge] = useState<DeletedJourney | null>(null);

  function restore(id: string) {
    setDeleted((prev) => prev.filter((d) => d.id !== id));
  }
  function purge() {
    if (!toPurge) return;
    setDeleted((prev) => prev.filter((d) => d.id !== toPurge.id));
    setToPurge(null);
  }

  return (
    <AppPage showMemoryAgent={false}>
      <h1 className="text-4xl font-bold tracking-tight">Archive</h1>
      <p className="mt-2 text-muted-foreground">
        Journeys you&apos;ve completed or removed.
      </p>

      {/* Completed */}
      <section className="mt-8">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold">Completed Learning Journeys</h2>
        </div>
        {mockCompletedJourneys.length === 0 && (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
            No completed journeys yet. Finish a journey and it&apos;ll be archived here.
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockCompletedJourneys.map((j) => (
            <div
              key={j.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <JourneyIcon name={j.icon} className="h-5 w-5" />
                </span>
                <Badge variant="success">Completed</Badge>
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug">{j.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{j.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {j.completedOn} · {j.resourceCount} resources
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                View (read-only)
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Deleted */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Deleted Learning Journeys</h2>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          Deleted journeys are automatically permanently deleted after 30 days.
        </div>

        {deleted.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
            Nothing in the trash.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {deleted.map((j) => (
              <div
                key={j.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <JourneyIcon name={j.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{j.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{j.description}</p>
                    <p className="mt-0.5 text-xs text-destructive">
                      {j.deletedOn} · purged in {j.daysUntilPurge} days
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => restore(j.id)}>
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setToPurge(j)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Permanently
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Permanent-delete confirmation */}
      <Dialog open={!!toPurge} onOpenChange={(o) => !o && setToPurge(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>Delete permanently?</DialogTitle>
            <DialogDescription>
              &ldquo;{toPurge?.name}&rdquo; will be permanently deleted. This can&apos;t
              be undone. (Mock action — nothing is stored.)
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setToPurge(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={purge}>
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
