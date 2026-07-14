"use client";

import { useEffect, useState } from "react";
import { Loader2, Flame, BookOpen, CheckCircle2, CalendarDays, Info } from "lucide-react";
import { getOverviewAnalytics, type OverviewAnalytics } from "@/lib/data/analytics";

export function OverviewTab() {
  const [data, setData] = useState<OverviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOverviewAnalytics()
      .then((d) => !cancelled && setData(d))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!data) return null;

  const pct = data.totalResources > 0 ? Math.round((data.totalResourcesCompleted / data.totalResources) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Journeys in progress"
          value={String(data.journeysInProgress)}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Journeys completed"
          value={String(data.journeysCompleted)}
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Current streak"
          value={`${data.currentStreakDays} ${data.currentStreakDays === 1 ? "day" : "days"}`}
          sub={`Longest: ${data.longestStreakDays} ${data.longestStreakDays === 1 ? "day" : "days"}`}
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Resources completed"
          value={`${data.totalResourcesCompleted}/${data.totalResources}`}
          sub={`${pct}% overall`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Chapters completed this week"
          value={String(data.chaptersCompletedThisWeek)}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Chapters completed this month"
          value={String(data.chaptersCompletedThisMonth)}
        />
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-medium text-foreground">Not shown yet: </span>
          total study time and per-message chat history aren&apos;t tracked anywhere
          in the app today, there&apos;s no session/duration log, and the chat
          memory table stores one compressed summary per journey rather than a
          timestamped history. Everything above is computed from real
          completion data instead of estimated.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
