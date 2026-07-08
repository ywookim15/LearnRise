import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "3.4×", label: "faster to a first milestone vs. self-directed study" },
  { value: "87%", label: "of learners stay on their roadmap past week two" },
  { value: "12k+", label: "resources sequenced across active journeys" },
];

const USEFULNESS = [
  { pct: 92, label: "Feel less overwhelmed choosing what to study next" },
  { pct: 78, label: "Report a more consistent study habit" },
  { pct: 84, label: "Say the ordering made hard topics click sooner" },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          The METIS full guide
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          Learning shouldn&apos;t start with getting lost.
        </h1>

        <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-muted-foreground">
          <p>
            Most learning fails before it begins. You decide to pick up a
            subject, open a search engine, and drown — forty tabs, three
            contradictory &ldquo;best resources&rdquo; lists, and no idea what
            order any of it should go in. The hardest part was never the
            material. It was the map.
          </p>
          <p>
            METIS is that map. It&apos;s a <span className="font-medium text-foreground">learning GPS</span>:
            you set a destination, and it plots a precise route from exactly
            where you are to exactly where you want to be — turn by turn,
            resource by resource.
          </p>
        </div>

        <blockquote className="my-10 flex gap-4 rounded-3xl border border-border bg-card p-7 shadow-card">
          <Quote className="h-8 w-8 shrink-0 text-primary/40" />
          <p className="font-serif text-xl italic leading-relaxed text-foreground">
            A goal without a route is just a wish. METIS turns the wish into a
            path you can actually walk.
          </p>
        </blockquote>

        <h2 className="mt-12 font-serif text-3xl tracking-tight">What it is</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          METIS is an AI-guided, adaptive roadmap builder. You describe your
          goal, your current level, your timeline, and how you like to learn.
          METIS assembles a structured journey — units, chapters, and curated
          resources — sequenced so each step earns the next. As you check things
          off, chat with your tutor, and adjust your pace, the route re-plans
          around you.
        </p>

        <h2 className="mt-12 font-serif text-3xl tracking-tight">How it works</h2>
        <ol className="mt-5 space-y-4">
          {[
            "You give inputs: what you want to learn, where you're starting, and your constraints.",
            "METIS generates a roadmap of units and chapters, each backed by real, ordered resources.",
            "You learn — checking off resources, tracking streaks, and asking the tutor when you're stuck.",
            "The path adapts: pacing, ordering, and recommendations shift as your progress reveals what you need.",
          ].map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
                {i + 1}
              </span>
              <span className="pt-1 text-[17px] leading-relaxed text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        {/* Usefulness — placeholder stats/charts */}
        <h2 className="mt-14 font-serif text-3xl tracking-tight">Why it works</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          Structure lowers the activation energy of learning. When the next step
          is obvious, you take it. <span className="text-xs">(Figures below are illustrative mock data.)</span>
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
              <div className="font-serif text-4xl text-primary">{s.value}</div>
              <p className="mt-2 text-xs leading-snug text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-7 shadow-card">
          {USEFULNESS.map((u) => (
            <div key={u.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{u.label}</span>
                <span className="font-semibold text-foreground">{u.pct}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${u.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl bg-brand-gradient-soft p-10 text-center">
          <h2 className="font-serif text-3xl tracking-tight">Set your destination.</h2>
          <p className="max-w-md text-muted-foreground">
            METIS will handle the route. Your first journey is free.
          </p>
          <Button asChild size="lg" variant="gradient">
            <Link href="/signup">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </article>
    </MarketingShell>
  );
}
