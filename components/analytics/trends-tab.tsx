"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getTrendAnalytics, type TrendPoint } from "@/lib/data/analytics";

export function TrendsTab() {
  const t = useTranslations("app.analytics.trends");
  const [data, setData] = useState<TrendPoint[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTrendAnalytics(30).then((d) => !cancelled && setData(d));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeDays = data.filter((d) => d.count > 0).length;
  const totalCompletions = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-2xl font-bold tracking-tight">{activeDays}/30</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("activeDays")}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-2xl font-bold tracking-tight">{totalCompletions}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("completed30")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <p className="text-sm font-semibold">{t("consistency")}</p>
        <p className="text-xs text-muted-foreground">{t("consistencySub")}</p>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v: string) => v.slice(5)}
                interval={Math.max(0, Math.floor(data.length / 8))}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
