"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { RotateCcw, Trash2, Clock, CheckCircle2, Info, Loader2 } from "lucide-react";
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
  listCompletedJourneys,
  listDeletedJourneys,
  restoreJourney,
  purgeJourney,
  type UiCompletedJourney,
  type UiDeletedJourney,
} from "@/lib/data/journeys";

export default function ArchivePage() {
  const t = useTranslations("app.archive");
  const [completed, setCompleted] = useState<UiCompletedJourney[]>([]);
  const [deleted, setDeleted] = useState<UiDeletedJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [toPurge, setToPurge] = useState<UiDeletedJourney | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([listCompletedJourneys(), listDeletedJourneys()]);
      setCompleted(c);
      setDeleted(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function restore(id: string) {
    setBusyId(id);
    try {
      await restoreJourney(id);
      setDeleted((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  async function purge() {
    if (!toPurge) return;
    setBusyId(toPurge.id);
    try {
      await purgeJourney(toPurge.id);
      setDeleted((prev) => prev.filter((d) => d.id !== toPurge.id));
      setToPurge(null);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppPage>
      <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">
        {t("subtitle")}
      </p>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Completed */}
          <section className="mt-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">{t("completedHeading")}</h2>
            </div>
            {completed.length === 0 && (
              <p className="mt-4 rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
                {t("completedEmpty")}
              </p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <JourneyIcon name={j.icon} className="h-5 w-5" />
                    </span>
                    <Badge variant="success">{t("completedBadge")}</Badge>
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug">{j.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{j.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {j.completedOn} · {t("resourceCount", { count: j.resourceCount })}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href={`/journey/${j.id}`}>{t("viewJourney")}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Deleted */}
          <section className="mt-12">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{t("deletedHeading")}</h2>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0" />
              {t("deletedInfo")}
            </div>

            {deleted.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
                {t("trashEmpty")}
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
                          {j.deletedOn} · {t("purgedIn", { count: j.daysUntilPurge })}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restore(j.id)}
                        disabled={busyId === j.id}
                      >
                        <RotateCcw className="h-4 w-4" />
                        {t("restore")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setToPurge(j)}
                        disabled={busyId === j.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("deletePermanently")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Permanent-delete confirmation */}
      <Dialog open={!!toPurge} onOpenChange={(o) => !o && setToPurge(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>{t("purgeTitle")}</DialogTitle>
            <DialogDescription>
              {t("purgeDesc", { name: toPurge?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setToPurge(null)} disabled={!!busyId}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={purge} disabled={!!busyId}>
              {t("deletePermanently")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
