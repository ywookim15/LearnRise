"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Inbox } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { ResourceTypeIcon } from "@/components/shared/icon";
import {
  listAnalyticsJourneys,
  getPerJourneyAnalytics,
  type JourneyOption,
  type PerJourneyAnalytics,
} from "@/lib/data/analytics";

export function JourneyTab() {
  const t = useTranslations("app.analytics.journey");
  const tr = useTranslations("app.resource");
  const [journeys, setJourneys] = useState<JourneyOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [data, setData] = useState<PerJourneyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAnalyticsJourneys().then((list) => {
      setJourneys(list);
      if (list.length > 0) setSelectedId(list[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    getPerJourneyAnalytics(selectedId)
      .then((d) => !cancelled && setData(d))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (loading && journeys.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t("noJourneys")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full max-w-sm rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto"
      >
        {journeys.map((j) => (
          <option key={j.id} value={j.id}>
            {j.name}
          </option>
        ))}
      </select>

      {loading || !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{data.journeyName}</span>
              <span className="font-bold text-primary">
                {t("resources", { done: data.completedResources, total: data.totalResources })}
              </span>
            </div>
            <Progress
              value={data.totalResources ? (data.completedResources / data.totalResources) * 100 : 0}
              className="mt-2"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm font-semibold">{t("progressOverTime")}</p>
            <p className="text-xs text-muted-foreground">{t("cumulative")}</p>
            {data.progressHistory.length === 0 ? (
              <EmptyChart label={t("noCompletions")} />
            ) : (
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.progressHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="cumulativeCompleted"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm font-semibold">{t("perWeek")}</p>
              {data.resourcesPerWeek.length === 0 ? (
                <EmptyChart label={t("noWeekly")} />
              ) : (
                <div className="mt-4 h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.resourcesPerWeek}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="weekStart" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm font-semibold">{t("typesConsumed")}</p>
              {data.resourceTypeBreakdown.length === 0 ? (
                <EmptyChart label={t("noTypes")} />
              ) : (
                <div className="mt-4 space-y-3">
                  {data.resourceTypeBreakdown.map((rt) => (
                    <div key={rt.type} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ResourceTypeIcon type={rt.type} className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm">{tr(`type.${rt.type}`)}</span>
                      <span className="text-sm font-semibold">{rt.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return <p className="mt-6 text-center text-xs text-muted-foreground">{label}</p>;
}
