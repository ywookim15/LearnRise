"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { AppPage } from "@/components/layout/app-page";
import { useApp } from "@/lib/context/app-context";
import {
  analyticsSummary,
  weeklyStudyMinutes,
  subjectBreakdown,
  streakHistory,
} from "@/lib/mock-data/analytics";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const { user } = useApp();
  const maxMinutes = Math.max(...weeklyStudyMinutes.map((d) => d.minutes));
  const maxStreak = Math.max(...streakHistory);

  return (
    <AppPage>
      <h1 className="text-4xl font-bold tracking-tight">{user.firstName}&apos;s Analytics</h1>
      <p className="mt-2 text-muted-foreground">
        Your learning momentum across all journeys.{" "}
        <span className="text-xs">(Illustrative mock data.)</span>
      </p>

      {/* Summary stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsSummary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{s.value}</p>
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                s.positive ? "text-emerald-600" : "text-destructive"
              )}
            >
              {s.positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Weekly study time — bar chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <h2 className="text-lg font-semibold">Study time this week</h2>
          <p className="text-sm text-muted-foreground">Minutes per day</p>
          <div className="mt-6 flex h-52 items-end justify-between gap-3">
            {weeklyStudyMinutes.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-brand-gradient transition-all"
                    style={{ height: `${(d.minutes / maxMinutes) * 100}%` }}
                    title={`${d.minutes} min`}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Subject breakdown</h2>
          <p className="text-sm text-muted-foreground">Share of study time</p>
          <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full">
            {subjectBreakdown.map((s) => (
              <div
                key={s.subject}
                style={{ width: `${s.share}%`, backgroundColor: s.color }}
                title={`${s.subject} · ${s.share}%`}
              />
            ))}
          </div>
          <ul className="mt-5 space-y-3">
            {subjectBreakdown.map((s) => (
              <li key={s.subject} className="flex items-center gap-2.5 text-sm">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="flex-1 truncate text-muted-foreground">{s.subject}</span>
                <span className="font-semibold">{s.share}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Streak history */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold">Streak history</h2>
        <p className="text-sm text-muted-foreground">Active days per week (last 12 weeks)</p>
        <div className="mt-6 flex h-32 items-end justify-between gap-1.5">
          {streakHistory.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: `${(v / maxStreak) * 100}%` }}
                  title={`${v} active days`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </AppPage>
  );
}
