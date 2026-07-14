import { Route, Bell, Check, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stylized, self-contained preview of the METIS app shown in the marketing
 * hero (mirrors the Stitch "Academic Precision" glass roadmap card). Pure
 * presentation, no data or interactivity, so it can sit on a public page.
 */
export function AppPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Soft blue/purple glow behind the card */}
      <div className="pointer-events-none absolute -inset-8 rounded-full bg-brand-gradient-soft blur-[100px]" />

      <div className="glass relative overflow-hidden rounded-[2rem] border border-white/50 p-7 shadow-lift">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
              <Route className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-heading text-base font-bold text-secondary">Data Science</h4>
              <p className="text-xs text-muted-foreground">64% mastery reached</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div className="h-9 w-9 rounded-full border-2 border-white bg-muted shadow-sm" />
          </div>
        </div>

        {/* Roadmap nodes */}
        <div className="relative space-y-6">
          {/* connecting line */}
          <div className="absolute bottom-8 left-[15px] top-8 w-0.5 bg-gradient-to-b from-primary to-border" />

          {/* Node 1 — completed */}
          <div className="relative flex items-start gap-5">
            <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <Check className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="glass flex-1 rounded-xl border border-white/60 p-4">
              <p className="text-[11px] font-bold tracking-wide text-primary">COMPLETED</p>
              <h5 className="mt-0.5 text-sm font-semibold text-secondary">Statistical Foundations</h5>
            </div>
          </div>

          {/* Node 2 — in progress */}
          <div className="relative flex items-start gap-5">
            <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white ring-4 ring-primary/20">
              <Play className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="glass flex-1 rounded-xl border-2 border-primary/40 p-4 shadow-brand">
              <div className="mb-2 flex items-start justify-between">
                <p className="text-[11px] font-bold tracking-wide text-primary">IN PROGRESS</p>
                <p className="text-[11px] font-bold text-primary">45%</p>
              </div>
              <h5 className="text-sm font-semibold text-secondary">Probability Theory</h5>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[45%] rounded-full bg-brand-gradient" />
              </div>
            </div>
          </div>

          {/* Node 3 — upcoming */}
          <div className="relative flex items-start gap-5 opacity-50">
            <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-border text-white">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="glass flex-1 rounded-xl border border-white/60 p-4">
              <p className="text-[11px] font-bold tracking-wide text-muted-foreground">UPCOMING</p>
              <h5 className="mt-0.5 text-sm font-semibold text-secondary">Hypothesis Testing</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
