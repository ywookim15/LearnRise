"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { AppPage } from "@/components/layout/app-page";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HelpDialog } from "@/components/dashboard/help-dialog";
import { UnitFlowchart } from "@/components/journey/unit-flowchart";
import { ResourceRow } from "@/components/journey/resource-row";
import { useJourneyDetail } from "@/lib/data/use-journey-detail";
import { unitProgress, unitResourceCount } from "@/lib/data/journeys";

export default function UnitPage() {
  const params = useParams<{ id: string; unitId: string }>();
  const { journey, loading, error, toggleResource } = useJourneyDetail(params.id);
  const unit = journey?.units.find((u) => u.id === params.unitId);

  if (loading) {
    return (
      <AppPage>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppPage>
    );
  }

  if (error || !journey || !unit) {
    return (
      <AppPage>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold">Unit not found</p>
          <Button asChild>
            <Link href={journey ? `/journey/${journey.id}` : "/dashboard"}>
              {journey ? "Back to journey" : "Back to Dashboard"}
            </Link>
          </Button>
        </div>
      </AppPage>
    );
  }

  const progress = unitProgress(unit);

  const breadcrumb = (
    <div className="flex items-center gap-1.5 text-sm">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
        Journeys
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      <Link href={`/journey/${journey.id}`} className="text-muted-foreground hover:text-foreground">
        {journey.name}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="truncate font-medium text-primary">Unit {unit.number}</span>
    </div>
  );

  return (
    <AppPage topbarLeft={breadcrumb}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Unit {unit.number}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{unit.title}</h1>
        </div>
        <div className="w-full sm:w-56">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wide text-muted-foreground">
              Unit progress
            </span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="mt-2" />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {unitResourceCount(unit)} resources across {unit.chapters.length}{" "}
            {unit.chapters.length === 1 ? "chapter" : "chapters"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <UnitFlowchart unit={unit} />
      </div>

      <div className="mt-8 space-y-6">
        {unit.chapters.map((chapter) => (
          <section
            key={chapter.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold">
                {chapter.number} · {chapter.title}
              </h2>
              {chapter.learningObjective && (
                <div className="mt-3 rounded-2xl border border-primary/15 bg-brand-gradient-soft p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Learning objective
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {chapter.learningObjective}
                  </p>
                </div>
              )}
            </div>
            <div className="p-2">
              {chapter.resources.length > 0 ? (
                chapter.resources.map((resource) => (
                  <ResourceRow
                    key={resource.id}
                    resource={resource}
                    onToggle={() => toggleResource(resource.id)}
                  />
                ))
              ) : chapter.resourceStatus === "pending" ? (
                <p className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary" />
                  METIS is curating resources for this chapter…
                </p>
              ) : (
                <p className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5" />
                  No resources found yet — this chapter is flagged as a gap.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <HelpDialog />
      </div>
    </AppPage>
  );
}
