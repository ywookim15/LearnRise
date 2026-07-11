import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";

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

        {/* Stat callout — large, visually emphasized */}
        <div className="my-12 rounded-3xl border border-border bg-brand-gradient-soft px-8 py-12 text-center shadow-card">
          <p className="font-serif text-4xl font-medium leading-tight tracking-tight text-primary sm:text-5xl md:text-6xl">
            87% of all learners that pick up online learning never finish.
          </p>
        </div>

        <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-muted-foreground">
          <p>
            You decide to pick up a subject, open a search engine, and drown.
            Immediately, you&apos;re swarmed with forty tabs, three contradictory
            &ldquo;best resources&rdquo; lists, and no idea what order any of it
            should go in. You&apos;re left wondering if you&apos;re the problem,
            why you can&apos;t understand it.
          </p>
          <p>But the hardest part was never the material. It was the roadmap.</p>
          <p>
            METIS is that map. It&apos;s a{" "}
            <span className="font-medium text-foreground">learning GPS</span>:
            you set a destination, and it plots a precise route from exactly
            where you are (your current skill level) to exactly where you want
            to be (mastery).
          </p>
        </div>

        <h2 className="mt-12 font-serif text-3xl tracking-tight">What it is</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          METIS is an AI-powered, adaptive roadmap builder. You describe your
          goal, your current level, your timeline, and how you like to learn.
          METIS assembles a learning journey structured by units, chapters,
          and curated resources. As you check things off, chat with your tutor,
          and adjust your pace, the route re-plans around you and your
          schedule.
        </p>

        <h2 className="mt-12 font-serif text-3xl tracking-tight">How it works</h2>
        <ol className="mt-5 space-y-4">
          {[
            "You give inputs: what you want to learn, where you're starting, and your constraints.",
            "METIS creates: a roadmap of units and chapters, each backed by high-quality, filtered resources.",
            "You learn: check off resources, track streaks, and ask the tutor when you're stuck.",
            "METIS adapts: pacing, ordering, and recommendations shift as your progress reveals what you need.",
          ].map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
                {i + 1}
              </span>
              <span className="pt-1 text-[17px] leading-relaxed text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 font-serif text-3xl tracking-tight">Why it works</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          Structure minimizes the effort into planning. That&apos;s how you
          can channel your energy into learning the material itself.
        </p>

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
