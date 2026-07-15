"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Sparkles, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { JourneyCreationDialog } from "@/components/journey/journey-creation-dialog";
import { useApp } from "@/lib/context/app-context";
import { FREE_JOURNEY_LIMIT } from "@/lib/entitlements";

export function AddJourneyCard() {
  const t = useTranslations("app.addJourney");
  const { isPremium, journeys } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Free tier is capped at 1 active journey, surface the upgrade prompt instead.
  // (The server also enforces this in POST /api/journeys as the real backstop.)
  const atFreeLimit = !isPremium && journeys.length >= FREE_JOURNEY_LIMIT;

  function handleClick() {
    if (atFreeLimit) setUpgradeOpen(true);
    else setCreateOpen(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="group flex min-h-[248px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/40 p-5 text-center transition-colors hover:border-primary/50 hover:bg-brand-gradient-soft"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Plus className="h-6 w-6" />
        </span>
        <span className="text-sm font-semibold">{t("addJourney")}</span>
        <span className="text-xs text-muted-foreground">{t("addJourneyDesc")}</span>
      </button>

      <JourneyCreationDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle>{t("limitTitle")}</DialogTitle>
            <DialogDescription>
              {t("limitDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setUpgradeOpen(false)}>
              {t("notNow")}
            </Button>
            <Button asChild variant="gradient">
              <Link href="/upgrade">
                <Sparkles className="h-4 w-4" />
                {t("seePremium")}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
