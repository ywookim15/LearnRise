"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Target, GraduationCap, CalendarRange, Wand2 } from "lucide-react";
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
  const { addJourney } = useApp();
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("5");
  const [preferences, setPreferences] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mock "roadmap generation" — builds a placeholder journey and routes to it.
    const journey = addJourney({
      goal,
      currentLevel,
      startDate,
      endDate,
      hoursPerWeek,
      preferences,
    });
    onOpenChange(false);
    // reset for next time
    setGoal("");
    setCurrentLevel("");
    setStartDate("");
    setEndDate("");
    setHoursPerWeek("5");
    setPreferences("");
    router.push(`/journey/${journey.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle>Create a new learning journey</DialogTitle>
          <DialogDescription>
            Tell METIS what you want to learn. It&apos;ll generate a mapped
            roadmap — the more specific you are, the better the route.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="goal" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Goal
            </Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Ace the AP Biology genetics unit — be as specific as possible."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Current level
            </Label>
            <Textarea
              id="level"
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              placeholder="Where are you starting from? Be as specific as possible."
              className="min-h-[70px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-primary" />
              Time
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Start date</span>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Target end date</span>
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
              <span className="text-sm text-muted-foreground">hours / week you can study</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefs" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Preferences
            </Label>
            <Textarea
              id="prefs"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. prefer videos and interactive labs over long readings."
              className="min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              <Sparkles className="h-4 w-4" />
              Generate roadmap
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
