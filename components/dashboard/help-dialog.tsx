"use client";

import { useState } from "react";
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
  {
    icon: PlusCircle,
    title: "Start a journey",
    body: "Tap the dashed “Add Journey” card, describe your goal, level, timeline, and preferences. METIS generates a mapped roadmap.",
  },
  {
    icon: Compass,
    title: "Follow the roadmap",
    body: "Each journey is split into units and chapters. Expand a unit to see its resources, or click into a unit for the full flowchart view.",
  },
  {
    icon: CheckSquare,
    title: "Track progress",
    body: "Check off resources as you complete them. Progress bars update per unit and for the whole journey.",
  },
  {
    icon: MessagesSquare,
    title: "Ask METIS",
    body: "Open the Ask METIS panel on any journey to ask questions, re-plan your schedule with the Planner, or work through a concept with the Tutor.",
  },
  {
    icon: Flame,
    title: "Keep your streak",
    body: "Study a little every day. Your streak counter and calendar track consistency across all journeys.",
  },
  {
    icon: FolderClosed,
    title: "Organize with folders",
    body: "Group related journeys or saved resources into folders to keep your dashboard tidy.",
  },
];

export function HelpDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-card transition-colors hover:text-foreground"
            aria-label="Help"
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
          <DialogTitle>How to use METIS</DialogTitle>
          <DialogDescription>
            A quick in-depth guide to getting the most out of your learning GPS.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-4 overflow-y-auto scrollbar-slim pr-1 sm:grid-cols-2">
          {GUIDE.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="rounded-2xl border border-border bg-muted/40 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{g.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.body}</p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
