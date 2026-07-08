import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Route,
  Sparkles,
  Target,
  BookOpenCheck,
  MessagesSquare,
} from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { LogoMark } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    icon: Target,
    title: "1 · Tell METIS your goal",
    body: "Share what you want to learn, your current level, your timeline, and how you like to study. Be as specific as you want.",
  },
  {
    icon: Route,
    title: "2 · Get a mapped roadmap",
    body: "METIS assembles a unit-by-unit path with hand-picked resources, ordered so each step builds on the last.",
  },
  {
    icon: BookOpenCheck,
    title: "3 · Learn, adapt, arrive",
    body: "Check off resources, track streaks, and lean on your AI tutor. Your route re-plans as you go.",
  },
];

const FAQ = [
  {
    q: "What exactly is METIS?",
    a: "METIS is a learning GPS. You give it a destination — a skill, a subject, an exam — and it builds a precise, resourced route to get you there, adapting as you progress.",
  },
  {
    q: "Where do the resources come from?",
    a: "METIS curates from across the open web and trusted providers, then sequences them into a coherent path instead of a pile of links. (In this prototype, resources are illustrative mock data.)",
  },
  {
    q: "Do I need to know how to structure my learning?",
    a: "No — that's the whole point. You bring the goal; METIS brings the structure, pacing, and ordering.",
  },
  {
    q: "How much does it cost?",
    a: "There's a free tier with one active journey, and a Premium tier that unlocks unlimited journeys, AI summarizing, and the adaptive tutor.",
  },
];

export default function LandingPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-brand-gradient-soft" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-20 pt-20 text-center">
          <Badge variant="default" className="gap-1.5">
            <Compass className="h-3.5 w-3.5" />
            AI-guided learning roadmaps
          </Badge>
          <LogoMark className="mt-8 h-24 w-auto sm:h-28" />
          <h1 className="mt-4 font-serif text-6xl font-medium tracking-[0.06em] text-foreground sm:text-7xl md:text-8xl">
            METIS
          </h1>
          <p className="mt-2 font-serif text-2xl italic text-gradient sm:text-3xl">
            Your Learning GPS
          </p>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Learning shouldn&apos;t start with getting lost. Tell METIS where you
            want to go and it builds the route — resourced, ordered, and adaptive
            — so every study session moves you forward.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gradient">
              <Link href="/signup">
                Start your first journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">See how it works</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free tier available · No credit card · Prototype with mock data
          </p>
        </div>
      </section>

      {/* How METIS works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl tracking-tight">How METIS works</h2>
          <p className="mt-3 text-muted-foreground">
            Three steps from &ldquo;I want to learn this&rdquo; to a route you can
            actually follow.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="rounded-3xl border border-border bg-card p-7 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            );
          })}
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
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
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
            icon={<Sparkles className="h-5 w-5" />}
            title="Adapts as you go"
            body="Check things off and your roadmap, pacing, and recommendations adjust to match."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20">
        <h2 className="text-center font-serif text-4xl tracking-tight">
          Frequently asked
        </h2>
        <div className="mt-10 space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-card p-5 shadow-card [&_summary]:cursor-pointer"
            >
              <summary className="flex list-none items-center justify-between text-base font-medium">
                {item.q}
                <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-16 text-center shadow-brand">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-serif text-4xl text-white">Ready to stop getting lost?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            Set your destination. METIS handles the route.
          </p>
          <Button asChild size="lg" variant="inverted" className="mt-8 bg-white text-primary hover:bg-white/90">
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
    <div>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
