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
import { AppPreview } from "@/components/marketing/app-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    icon: Target,
    title: "Tell METIS your goal",
    body: "Share what you want to learn, your current level, your timeline, and how you like to study. Be as specific as you want.",
  },
  {
    icon: Route,
    title: "Generate a personalized journey",
    body: "METIS creates a step-by-step path with high-quality resources. They're hand-picked from multiple types of media—video, image, graphics—so that you don't have to stare at your boring textbook for hours.",
  },
  {
    icon: BookOpenCheck,
    title: "Learn and master",
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
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-60" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-28 lg:pt-24">
          {/* Left column */}
          <div className="animate-fade-in-up text-center lg:text-left">
            <Badge variant="default" className="gap-1.5">
              <Compass className="h-3.5 w-3.5" />
              AI-guided learning roadmaps
            </Badge>
            <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
              <LogoMark className="h-14 w-auto sm:h-16" />
              <span className="font-serif text-5xl font-medium tracking-[0.05em] text-foreground sm:text-6xl">
                METIS
              </span>
            </div>
            <p className="mt-3 font-serif text-2xl italic text-gradient sm:text-3xl">
              Your Learning GPS
            </p>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
              Learning made easy. Tell METIS your goal and current skill level,
              and it builds you the exact roadmap with tailored, personalized
              resources to get you to mastery.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
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

          {/* Right column — floating product preview */}
          <div className="animate-fade-in-up [animation-delay:120ms]">
            <AppPreview className="mx-auto max-w-md lg:mr-0" />
          </div>
        </div>
      </section>

      {/* How METIS works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            How METIS works
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            From &ldquo;I want to learn this&rdquo; to a route you can follow
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three steps. No more staring at a blank syllabus or a pile of tabs.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card to-accent/40 p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="pointer-events-none absolute -right-6 -top-4 font-serif text-8xl font-medium text-primary/[0.07]">
                  {i + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
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
      <section className="mx-auto w-full max-w-3xl px-6 py-24">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Questions
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            Frequently asked
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-colors open:border-primary/30 [&_summary]:cursor-pointer"
            >
              <summary className="flex list-none items-center justify-between gap-4 text-base font-medium">
                {item.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-open:rotate-45 group-open:bg-brand-gradient group-open:text-white">
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
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient-vivid px-8 py-20 text-center shadow-brand-lg">
          <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="font-serif text-4xl text-white sm:text-5xl">Ready to stop getting lost?</h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/85">
              Set your destination. METIS handles the route.
            </p>
            <Button asChild size="lg" variant="inverted" className="mt-8 bg-white text-primary hover:bg-white/90">
              <Link href="/signup">
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
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
