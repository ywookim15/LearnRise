"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle, Compass, PlusCircle, CheckSquare, MessagesSquare, FolderClosed, Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GUIDE = [
  { icon: PlusCircle, key: "startJourney" },
  { icon: Compass, key: "followRoadmap" },
  { icon: CheckSquare, key: "trackProgress" },
  { icon: MessagesSquare, key: "askMetis" },
  { icon: Flame, key: "keepStreak" },
  { icon: FolderClosed, key: "organizeFolders" },
] as const;

export function HelpDialog({ trigger }: { trigger?: React.ReactNode }) {
  const t = useTranslations("app.help");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-card transition-colors hover:text-foreground"
            aria-label={t("help")}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
            <HelpCircle className="h-5 w-5" />
          </div>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto scrollbar-slim pr-1 sm:grid-cols-2">
          {GUIDE.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.key} className="rounded-2xl border border-border bg-muted/40 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{t(`guide.${g.key}.title`)}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`guide.${g.key}.body`)}</p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
