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
    title: "2 · Generate a highly personalized learning journey",
    body: "METIS creates a step-by-step path with high-quality resources. They're hand-picked from multiple types of media—video, image, graphics—so that you don't have to stare at your boring textbook for hours.",
  },
  {
    icon: BookOpenCheck,
    title: "3 · Learn and master",
    body: "Check off resources, track streaks, and chat with your personalized AI tutor. Your route re-plans as you go based on your interactions.",
  },
];

const FAQ = [
  {
    q: "What exactly is METIS?",
    a: "METIS is a learning GPS. METIS designs a personalized, step-by-step learning roadmap that adapts to your schedule and your current knowledge gaps. It's designed to create the fastest and clearest path from where you are to mastery—then continuously re-routes as you go.",
  },
  {
    q: "Where do the resources come from?",
    a: "METIS curates from across the open web and trusted providers, then structures them into a path instead of a pile of links. All resources are free and open-source for you to access.",
  },
  {
    q: "Do I need to know how to structure my learning?",
    a: "No—that's the whole point. You bring the goal; METIS brings the structure, pacing, and ordering. METIS saves you the time of looking up resources, filtering through inaccurate or low-quality information, and deciding what to study next.",
  },
  {
    q: "How much does it cost?",
    a: "There's a free tier with one learning journey and a Premium tier that unlocks unlimited journeys, AI summarizing, and the adaptive tutor.",
  },
  {
    q: "What makes METIS different?",
    a: "METIS does not simply answer questions the way a general chatbot or homework-help site does; it curates, sequences, and assesses as you learn, adapting to your learning style and your interests. Unlike traditional chatbots, METIS stores long-term memory, allowing you to pick off right where you left each day.",
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
            Learning made easy. Tell METIS your goal and current skill level,
            and it builds you the exact roadmap with tailored, personalized
            resources to get you to mastery.
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
            Free tier available · No credit card
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
