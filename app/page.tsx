import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Flag,
  Navigation,
  Shuffle,
  Network,
  Library,
  BadgeCheck,
  Brain,
  Check,
} from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { AppPreview } from "@/components/marketing/app-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const t = useTranslations("landing");

  const steps = [
    { icon: Flag, title: t("works.step1Title"), body: t("works.step1Body"), highlight: false },
    { icon: Navigation, title: t("works.step2Title"), body: t("works.step2Body"), highlight: true },
    { icon: Shuffle, title: t("works.step3Title"), body: t("works.step3Body"), highlight: false },
  ];

  const values = [
    { icon: Network, title: t("values.mappingTitle"), body: t("values.mappingBody") },
    { icon: Library, title: t("values.vettedTitle"), body: t("values.vettedBody") },
    { icon: BadgeCheck, title: t("values.masteryTitle"), body: t("values.masteryBody") },
    { icon: Brain, title: t("values.tutorTitle"), body: t("values.tutorBody") },
  ];

  const freeFeatures = [t("pricing.freeFeat1"), t("pricing.freeFeat2"), t("pricing.freeFeat3")];
  const proFeatures = [
    t("pricing.proFeat1"),
    t("pricing.proFeat2"),
    t("pricing.proFeat3"),
    t("pricing.proFeat4"),
  ];
  const faq = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-2 lg:gap-12 lg:pb-28 lg:pt-24">
          <div className="text-center lg:text-left">
            <h1 className="font-heading text-5xl font-bold leading-[1.1] tracking-tight text-secondary sm:text-6xl lg:text-7xl">
              {t.rich("hero.title", {
                gps: (chunks) => <span className="text-gradient">{chunks}</span>,
              })}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
              {t("hero.subtitle")}
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" variant="gradient" className="rounded-xl">
                <Link href="/signup">
                  {t("hero.startJourney")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/about">{t("hero.seeHow")}</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("hero.freeTier")}</p>
          </div>

          <div>
            <AppPreview className="mx-auto max-w-md lg:mr-0" />
          </div>
        </div>
      </section>

      {/* How METIS works */}
      <section className="diagonal-accent py-28">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
              {t("works.title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{t("works.subtitle")}</p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "flex h-24 w-24 items-center justify-center rounded-3xl border transition-transform duration-300 hover:-translate-y-2",
                      s.highlight
                        ? "border-white/20 bg-brand-gradient text-white shadow-brand-lg"
                        : "border-border bg-card text-secondary shadow-card"
                    )}
                  >
                    <Icon className="h-9 w-9" aria-hidden="true" />
                  </div>
                  <h3 className="mt-8 font-heading text-xl font-bold text-secondary">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value propositions */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="group rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <Icon className="h-8 w-8 text-secondary transition-transform group-hover:scale-110" aria-hidden="true" />
                <h4 className="mt-6 font-heading text-lg font-bold text-secondary">{v.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="relative overflow-hidden bg-secondary py-28 text-white">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 -translate-x-1/4 skew-x-[-20deg] bg-brand-gradient opacity-10" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{t("pricing.title")}</h2>
            <p className="mt-4 text-lg text-white/60">{t("pricing.subtitle")}</p>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-md">
              <h3 className="font-heading text-xl font-bold text-white/90">{t("pricing.free")}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-heading text-5xl font-bold">$0</span>
                <span className="font-medium text-white/40">{t("pricing.forever")}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-4">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white/80">
                    <Check className="h-5 w-5 shrink-0 text-white/90" strokeWidth={2.5} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-10 w-full rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/signup">{t("pricing.startFree")}</Link>
              </Button>
            </div>

            {/* Pro */}
            <div className="relative flex flex-col overflow-hidden rounded-3xl bg-brand-gradient p-10 shadow-brand-lg">
              <div className="absolute right-8 top-8 rounded-full bg-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md">
                {t("pricing.recommended")}
              </div>
              <h3 className="font-heading text-xl font-bold">{t("pricing.premium")}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-heading text-5xl font-bold">$5.99</span>
                <span className="font-medium text-white/70">{t("pricing.perMonth")}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-4">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 font-medium">
                    <Check className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-10 w-full rounded-xl bg-white text-secondary hover:bg-white/90">
                <Link href="/signup">{t("pricing.startTrial")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-6 py-28">
        <h2 className="text-center font-heading text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
          {t("faq.title")}
        </h2>
        <div className="mt-14 space-y-4">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors open:border-primary/40 [&_summary]:cursor-pointer"
            >
              <summary className="flex list-none items-center justify-between gap-4 text-lg font-bold text-secondary">
                {item.q}
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-2xl font-light leading-none text-muted-foreground transition-all group-open:rotate-45 group-open:border-primary group-open:text-primary"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
