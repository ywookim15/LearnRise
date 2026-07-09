"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sparkles, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HelpDialog } from "@/components/dashboard/help-dialog";
import { Roadmap } from "@/components/journey/roadmap";
import { AskMetisPanel } from "@/components/journey/ask-metis-panel";
import { useJourneyDetail } from "@/lib/data/use-journey-detail";
import { detailProgress } from "@/lib/data/journeys";

export default function JourneyPage() {
  const params = useParams<{ id: string }>();
  const { journey, loading, error, toggleResource, reload } = useJourneyDetail(params.id);
  const [askOpen, setAskOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Topbar left={<span className="text-sm text-muted-foreground">Loading…</span>} />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">
          {error === "not_found" || !journey ? "Journey not found" : "Couldn't load this journey"}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error && error !== "not_found"
            ? error
            : "This journey doesn't exist or you don't have access to it."}
        </p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const { progress } = detailProgress(journey);

  const breadcrumb = (
    <div className="flex items-center gap-1.5 text-sm">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
        Journeys
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="truncate font-medium text-primary">{journey.name}</span>
    </div>
  );

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <Topbar left={breadcrumb} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-slim">
          <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold tracking-tight">{journey.name}</h1>
                <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                  {journey.description}
                </p>
              </div>
              {!askOpen && (
                <Button variant="gradient" onClick={() => setAskOpen(true)} className="shrink-0">
                  <Sparkles className="h-4 w-4" />
                  Ask METIS
                </Button>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wide text-muted-foreground">
                  Overall progress
                </span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="mt-2" />
            </div>

            <div className="mt-6">
              <Roadmap journey={journey} onToggleResource={toggleResource} />
            </div>
          </div>
        </div>

        {askOpen && (
          <AskMetisPanel
            journeyId={journey.id}
            onCollapse={() => setAskOpen(false)}
            onRoadmapChanged={() => {
              // Give the async replan/refresh a moment to reset chapters to
              // 'pending', then reload; the hook keeps polling while pending.
              setTimeout(() => void reload({ silent: true }), 2500);
            }}
          />
        )}
      </div>

      {!askOpen && (
        <div className="fixed bottom-6 right-6 z-20">
          <HelpDialog />
        </div>
      )}
    </div>
  );
}
