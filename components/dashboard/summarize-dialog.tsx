"use client";

import { Play, Sparkles, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Journey } from "@/lib/mock-data/journeys";

/** Placeholder "AI video summary" popup for a journey card. Static mock only. */
export function SummarizeDialog({
  journey,
  open,
  onOpenChange,
}: {
  journey: Journey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <Badge variant="gradient" className="w-fit gap-1">
            <Sparkles className="h-3 w-3" />
            AI summary
          </Badge>
          <DialogTitle className="mt-2">{journey.name}</DialogTitle>
          <DialogDescription>
            A generated recap of where you are and what&apos;s next.
          </DialogDescription>
        </DialogHeader>

        {/* Mock video player */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-brand-tertiary">
          <div className="absolute inset-0 bg-brand-gradient opacity-30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-brand transition-transform hover:scale-105">
              <Play className="h-6 w-6 translate-x-0.5 fill-current" />
            </button>
            <p className="text-sm font-medium text-white/90">Play your 2-minute recap</p>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div className="h-full w-1/4 rounded-full bg-white" />
            </div>
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Clock className="h-3 w-3" />
              0:28 / 2:04
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Placeholder transcript</p>
          <p className="mt-1">
            &ldquo;You&apos;re making strong progress on {journey.name}. You&apos;ve
            wrapped the foundational units — next, focus on the deeper material
            where the concepts really connect. Keep your {journey.streak}-day
            streak alive.&rdquo; (No real video or AI in this prototype.)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
