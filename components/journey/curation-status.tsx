"use client";

import { useTranslations } from "next-intl";
import { Loader2, AlertTriangle } from "lucide-react";
import type { UiJourneyDetail } from "@/lib/data/journeys";
import { useUsage, formatResetIn } from "@/lib/data/use-usage";
import { cn } from "@/lib/utils";

/**
 * Live curation progress for a journey: "Curating resources, 8 of 12 topics
 * done", shown only while chapters are still pending. If the usage meter reports
 * the curator's providers (Cerebras / Tavily) are currently rate-limited, it
 * explains the pause. Self-hides once everything has settled.
 */
export function CurationStatus({ journey }: { journey: UiJourneyDetail }) {
  const t = useTranslations("app.curation");
  const { available, providers } = useUsage();

  const chapters = journey.units.flatMap((u) => u.chapters);
  const total = chapters.length;
  const pending = chapters.filter((c) => c.resourceStatus === "pending").length;
  if (total === 0 || pending === 0) return null;

  const done = total - pending;
  const pct = Math.round((done / total) * 100);

  // Curation is powered by Cerebras (LLM) + Tavily (search), surface either.
  const throttled = (providers ?? []).find(
    (p) => (p.provider === "cerebras" || p.provider === "tavily") && p.rateLimited
  );

  return (
    <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-secondary" />
          <span className="truncate">
            {t("curating", { done, total })}
          </span>
        </div>
        <span className="shrink-0 text-sm font-bold text-primary">{pct}%</span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/70">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all"
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>

      {available && throttled ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          {t("paused", {
            what: throttled.provider === "tavily" ? t("webSearch") : t("curator"),
            retry: throttled.retryAfterSec
              ? t("autoRetry", { time: formatResetIn(throttled.retryAfterSec * 1000) })
              : "",
          })}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("fillInfo")}
        </p>
      )}
    </div>
  );
}
