"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sparkles, Target, GraduationCap, CalendarRange, Wand2, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/context/app-context";

export function JourneyCreationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("app.createJourney");
  const { createJourney } = useApp();
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("5");
  const [preferences, setPreferences] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setGoal("");
    setCurrentLevel("");
    setStartDate("");
    setEndDate("");
    setHoursPerWeek("5");
    setPreferences("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGenerating(true);
    try {
      // Real Planner call (Tavily syllabus search + Gemini). Resources then
      // curate asynchronously; the Journey Page shows them populating.
      const journeyId = await createJourney({
        goal,
        currentLevel,
        startDate,
        endDate,
        hoursPerWeek,
        preferences,
      });
      onOpenChange(false);
      reset();
      router.push(`/journey/${journeyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
      setGenerating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (generating) return; // don't allow close mid-generation
        onOpenChange(o);
      }}
    >
      <DialogContent className="flex max-h-[90dvh] max-w-xl flex-col overflow-hidden">
        {generating ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <p className="text-lg font-semibold">{t("generatingTitle")}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {t("generatingBody")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
                <Sparkles className="h-5 w-5" />
              </div>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>
                {t("subtitle")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-1 pb-1">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="goal" className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  {t("goal")}
                </Label>
                <Textarea
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={t("goalPlaceholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {t("currentLevel")}
                </Label>
                <Textarea
                  id="level"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  placeholder={t("currentLevelPlaceholder")}
                  className="min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-primary" />
                  {t("time")}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{t("startDate")}</span>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{t("endDate")}</span>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Input
                    type="number"
                    min={1}
                    max={80}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t("hoursPerWeek")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefs" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  {t("preferences")}
                </Label>
                <Textarea
                  id="prefs"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder={t("preferencesPlaceholder")}
                  className="min-h-[70px]"
                />
              </div>

              </div>

              <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" variant="gradient">
                  <Sparkles className="h-4 w-4" />
                  {t("generate")}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
