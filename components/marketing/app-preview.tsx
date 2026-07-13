import { Check, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stylized, self-contained preview of the METIS app shown in the marketing
 * hero (mirrors the Stitch reference's floating product card). Pure
 * presentation — no data, no interactivity — so it can sit on a public page.
 */
export function AppPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Browser chrome frame */}
      <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-lift">
        <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <div className="ml-3 flex h-6 flex-1 items-center rounded-lg bg-background/70 px-3 text-[10px] font-medium text-muted-foreground">
            metis6.com/journey
          </div>
        </div>

        {/* Roadmap surface */}
        <div className="relative bg-line-grid p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="font-serif text-lg font-medium tracking-tight">
              <span className="text-gradient">METIS</span> Learning Roadmap
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Unit 2
            </span>
          </div>

          <div className="space-y-3">
            <StageCard
              title="Foundations"
              pct={100}
              tone="done"
              items={["Intro to AI", "Data Science Basics", "Python Programming"]}
            />
            <div className="ml-6 h-4 w-px bg-gradient-to-b from-primary/50 to-secondary/50" />
            <StageCard
              title="Core Skills"
              pct={45}
              tone="active"
              items={["Machine Learning", "Deep Learning", "Natural Language Processing"]}
            />
            <div className="ml-6 h-4 w-px bg-border" />
            <StageCard
              title="Advanced Specialization"
              pct={0}
              tone="locked"
              items={["Computer Vision", "Reinforcement Learning", "Capstone Project"]}
            />
          </div>
        </div>
      </div>

      {/* Floating AI-tutor chip */}
      <div className="absolute -bottom-5 -left-5 hidden w-52 rotate-[-2deg] rounded-2xl border border-border/70 bg-card p-3 shadow-lift sm:block">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-brand">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs font-semibold">METIS AI Tutor</p>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          &ldquo;Let&apos;s break down backpropagation — want an example?&rdquo;
        </p>
      </div>
    </div>
  );
}

function StageCard({
  title,
  pct,
  tone,
  items,
}: {
  title: string;
  pct: number;
  tone: "done" | "active" | "locked";
  items: string[];
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 transition-shadow",
        tone === "active"
          ? "border-primary/40 shadow-brand"
          : tone === "locked"
          ? "border-border/70 opacity-80"
          : "border-border/70"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
              tone === "done"
                ? "bg-primary text-white"
                : tone === "locked"
                ? "bg-muted text-muted-foreground"
                : "bg-brand-gradient text-white"
            )}
          >
            {tone === "done" ? <Check className="h-3 w-3" /> : tone === "locked" ? <Lock className="h-2.5 w-2.5" /> : ""}
          </span>
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", tone === "locked" ? "bg-border" : "bg-brand-gradient")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-3 space-y-1">
        {items.map((it) => (
          <li key={it} className="text-[11px] text-muted-foreground">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
