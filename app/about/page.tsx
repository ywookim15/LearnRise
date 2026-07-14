import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";

const STEPS = [
  "You give inputs: what you want to learn, where you're starting, and your constraints.",
  "METIS creates a roadmap of units and chapters, each backed by high-quality, filtered resources.",
  "You learn: check off resources, track streaks, and ask the tutor when you're stuck.",
  "METIS adapts: pacing, ordering, and recommendations shift as your progress reveals what you need.",
];

const WHY = [
  "Structure removes the tax of planning, so your energy goes into learning, not deciding what to look at next.",
  "The plan isn't fixed. Most study plans break the moment you fall behind or move faster than expected, and then you're back to guessing. METIS moves with you: struggle on a concept and it adjusts before you fall further behind; move fast and it skips ahead instead of wasting your time.",
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          About METIS
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Learning shouldn&apos;t start with getting lost.
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-foreground">
          METIS is an AI-powered learning GPS: tell it what you want to learn, and
          it builds a roadmap to get you there. Then it adjusts that roadmap every
          time you fall behind or move ahead.
        </p>

        {/* Stat callout */}
        <div className="my-12 rounded-lg border-l-4 border-primary bg-card px-7 py-8 shadow-card">
          <p className="font-heading text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
            <span className="text-4xl font-bold text-primary sm:text-5xl">87%</span>{" "}
            of all learners who pick up online learning never finish.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Jordan, K. (2015). Massive open online course completion rates
            revisited. The International Review of Research in Open and
            Distributed Learning, 16(3).
          </p>
        </div>

        <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>
            You decide to pick up a subject, open a search engine, and drown.
            Immediately, you&apos;re swarmed with forty tabs, three contradictory
            &ldquo;best resources&rdquo; lists, and no idea what order any of it
            should go in. You start wondering if you&apos;re the problem, since
            everyone else seems to just get it and you don&apos;t.
          </p>
          <p className="font-medium text-foreground">
            But the hardest part was never the material. It was the roadmap.
          </p>
          <p>
            METIS is that map. Set a destination, and it plots a precise route
            from where you are to where you want to be.
          </p>
        </div>

        {/* What it is */}
        <h2 className="mt-14 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          What it is
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          METIS is an AI-powered roadmap builder for learning anything. You
          describe your goal, your current level, your timeline, and how you like
          to learn. METIS assembles a learning journey: units, chapters, and
          curated resources. As you check things off, chat with your tutor, and
          adjust your pace, the route re-plans around you.
        </p>

        {/* How it works */}
        <h2 className="mt-14 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <ol className="mt-6 space-y-3">
          {STEPS.map((step, i) => (
            <li
              key={i}
              className="flex gap-4 rounded-lg border border-border bg-card p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/30 font-heading text-base font-bold text-primary">
                {i + 1}
              </span>
              <span className="pt-1 leading-relaxed text-foreground">{step}</span>
            </li>
          ))}
        </ol>

        {/* Why it works */}
        <h2 className="mt-14 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Why it works
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {WHY.map((point, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6">
              <div className="h-1 w-10 rounded-full bg-primary" />
              <p className="mt-4 leading-relaxed text-foreground">{point}</p>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <div className="mt-16 rounded-2xl bg-secondary px-8 py-12 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-secondary-foreground sm:text-3xl">
            Set your destination.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-secondary-foreground/80">
            METIS will handle the route. Your first journey is free.
          </p>
          <Button asChild size="lg" className="mt-7 bg-white text-secondary hover:bg-white/90">
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
