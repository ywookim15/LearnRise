"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { weekStreak, streakCalendar, streakStats, currentStreak } from "@/lib/mock-data/streak";
import { cn } from "@/lib/utils";

export function StreakWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-3 text-left shadow-card transition-shadow hover:shadow-card-hover"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            7-day streak
          </span>
          <div className="mt-1.5 flex items-center gap-1.5">
            {weekStreak.map((d, i) => (
              <span
                key={i}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold",
                  d.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  d.isToday && "ring-2 ring-primary ring-offset-1 ring-offset-card"
                )}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center border-l border-border pl-4">
          <span className="flex items-center gap-1 text-2xl font-bold text-foreground">
            <Flame className="h-5 w-5 text-secondary" />
            {currentStreak}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Days
          </span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <Flame className="h-5 w-5" />
            </div>
            <DialogTitle>Your streak history</DialogTitle>
            <DialogDescription>
              Consistency across all your journeys. Keep the fire going.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-3">
            <Stat label="Current" value={`${streakStats.current}`} />
            <Stat label="Longest" value={`${streakStats.longest}`} />
            <Stat label="This month" value={`${streakStats.thisMonth}`} />
            <Stat label="Total days" value={`${streakStats.totalDays}`} />
          </div>

          <div className="mt-2 grid gap-6 sm:grid-cols-2">
            {streakCalendar.map((month) => (
              <div key={month.name}>
                <p className="mb-2 text-sm font-semibold">{month.name}</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <span key={i} className="text-center text-[10px] font-medium text-muted-foreground">
                      {d}
                    </span>
                  ))}
                  {month.days.map((active, i) => (
                    <span
                      key={i}
                      className={cn(
                        "aspect-square rounded-md",
                        active === null
                          ? "bg-transparent"
                          : active
                          ? "bg-brand-gradient"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-3 text-center">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
