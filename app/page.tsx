import Link from "next/link";
import { ArrowRight, Route, MessagesSquare, RefreshCw } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { LogoMark } from "@/components/shared/logo";
import { AppPreview } from "@/components/marketing/app-preview";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Tell METIS your goal",
    body: "Share what you want to learn, your current level, your timeline, and how you like to study. Be as specific as you want.",
  },
  {
    title: "Get a personalized journey",
    body: "METIS builds a step-by-step path of high-quality resources, hand-picked across video, articles, and practice so you are not stuck staring at one textbook for hours.",
  },
  {
    title: "Learn and master",
    body: "Check off resources, track streaks, and ask your AI tutor when you are stuck. Your route re-plans as you go, based on how you are actually doing.",
  },
];

const FAQ = [
  {
    q: "What exactly is METIS?",
    a: "METIS is a learning GPS. It designs a personalized, step-by-step roadmap that adapts to your schedule and your current knowledge gaps, building the fastest, clearest path from where you are to mastery and re-routing as you go.",
  },
  {
    q: "Where do the resources come from?",
    a: "METIS curates from across the open web and trusted providers, then structures them into a path instead of a pile of links. All resources are free and open for you to access.",
  },
  {
    q: "Do I need to know how to structure my learning?",
    a: "No. That is the whole point. You bring the goal, and METIS brings the structure, pacing, and ordering. It saves you the time of hunting for resources, filtering out low-quality information, and deciding what to study next.",
  },
  {
    q: "How much does it cost?",
    a: "There is a free tier with one learning journey, and a Premium tier that unlocks unlimited journeys, analytics, and the adaptive tutor. See the pricing page for details.",
  },
  {
    q: "What makes METIS different?",
    a: "METIS does not just answer questions the way a general chatbot does. It curates, sequences, and assesses as you learn, adapting to your style and interests. It also keeps long-term memory, so you pick up right where you left off each day.",
  },
];

export default function LandingPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28 lg:pt-20">
          {/* Left column */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center gap-2.5 lg:justify-start">
              <LogoMark className="h-9 w-auto" />
              <span className="font-heading text-xl font-bold tracking-[0.12em] text-foreground">
                METIS
              </span>
            </div>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Learn anything, one clear step at a time.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
              METIS is an AI-powered learning GPS for students and self-learners.
              Tell it what you want to learn, and it builds an adaptive roadmap of
              curated resources that re-plans around you as you go.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start your first journey
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free tier available. No credit card required.
            </p>
          </div>

          {/* Right column, real product preview */}
          <div>
            <AppPreview className="mx-auto max-w-md lg:mr-0" />
          </div>
        </div>
      </section>

      {/* How METIS works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            How METIS works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            From &ldquo;I want to learn this&rdquo; to a route you can follow
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three steps. No more staring at a blank syllabus or a pile of tabs.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 font-heading text-base font-bold text-primary">
                {i + 1}
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="ghost">
            <Link href="/about">
              More about the METIS method
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          <Feature
            icon={<Route className="h-5 w-5" />}
            title="Ordered, not overwhelming"
            body="Resources sequenced into units and chapters, so you always know the next right step."
          />
          <Feature
            icon={<MessagesSquare className="h-5 w-5" />}
            title="An AI tutor that knows your path"
            body="Ask METIS anything, re-plan your schedule, or work through a concept with the tutor."
          />
          <Feature
            icon={<RefreshCw className="h-5 w-5" />}
            title="Adapts as you go"
            body="Check things off and your roadmap, pacing, and recommendations adjust to match."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-6 py-24">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Questions
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-border bg-card p-5 transition-colors open:border-primary/40 [&_summary]:cursor-pointer"
            >
              <summary className="flex list-none items-center justify-between gap-4 text-base font-semibold">
                {item.q}
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-all group-open:rotate-45 group-open:border-primary group-open:text-primary"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-28">
        <div className="rounded-2xl bg-secondary px-8 py-16 text-center">
          <h2 className="font-heading text-3xl font-bold text-secondary-foreground sm:text-4xl">
            Ready to stop getting lost?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-secondary-foreground/80">
            Set your destination. METIS handles the route.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-white text-secondary hover:bg-white/90"
          >
            <Link href="/signup">
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="border-l-2 border-primary/60 pl-4">
      <span className="text-primary">{icon}</span>
      <h3 className="mt-3 font-heading font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
