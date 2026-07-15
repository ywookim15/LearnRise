"use client";

import { useTranslations } from "next-intl";
import { Gauge, AlertTriangle } from "lucide-react";
import { useUsage, formatResetIn, type UsageProviderStat } from "@/lib/data/use-usage";
import { cn } from "@/lib/utils";

/**
 * Compact "AI capacity" panel for the dashboard: how much of each provider's
 * daily/monthly free-tier limit has been used today and when it resets, plus a
 * live "rate-limited" flag. Renders nothing until the 0004 migration is applied
 * (the API reports available:false), so it's safe to mount unconditionally.
 */
export function UsageMeter() {
  const t = useTranslations("app.usage");
  const { available, providers } = useUsage();

  if (!available || !providers || providers.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Gauge className="h-3.5 w-3.5" />
          {t("capacity")}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {t("approxLimits")}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {providers.map((p) => (
          <ProviderBar key={p.provider} stat={p} />
        ))}
      </div>
    </div>
  );
}

function ProviderBar({ stat }: { stat: UsageProviderStat }) {
  const t = useTranslations("app.usage");
  const danger = stat.rateLimited || stat.pct >= 90;
  const warn = !danger && stat.pct >= 70;
  const barColor = danger ? "bg-destructive" : warn ? "bg-amber-500" : "bg-primary";

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate font-medium">{stat.label}</span>
        <span className={cn("shrink-0 font-semibold", danger ? "text-destructive" : "text-muted-foreground")}>
          {stat.pct}%
        </span>
      </div>

      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.max(2, stat.pct)}%` }}
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {stat.used}/{stat.cap} {stat.window === "monthly" ? t("thisMonth") : t("today")}
        </span>
        {stat.rateLimited ? (
          <span className="flex items-center gap-1 font-medium text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {t("rateLimited")}
            {stat.retryAfterSec ? ` · ~${formatResetIn(stat.retryAfterSec * 1000)}` : ""}
          </span>
        ) : (
          <span>{t("resetsIn", { time: formatResetIn(stat.resetsInMs) })}</span>
        )}
      </div>
    </div>
  );
}
