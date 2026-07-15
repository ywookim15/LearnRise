import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const t = useTranslations("about");
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];
  const why = [t("why1"), t("why2")];

  return (
    <MarketingShell>
      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {t("title")}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-foreground">{t("intro")}</p>

        {/* Stat callout */}
        <div className="my-12 rounded-lg border-l-4 border-primary bg-card px-7 py-8 shadow-card">
          <p className="font-heading text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
            <span className="text-4xl font-bold text-primary sm:text-5xl">87%</span>{" "}
            {t("statText")}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Jordan, K. (2015). Massive open online course completion rates
            revisited. The International Review of Research in Open and
            Distributed Learning, 16(3).
          </p>
        </div>

        <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>{t("para1")}</p>
          <p className="font-medium text-foreground">{t("para2")}</p>
          <p>{t("para3")}</p>
        </div>

        {/* What it is */}
        <h2 className="mt-14 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {t("whatItIsTitle")}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("whatItIsBody")}</p>

        {/* How it works */}
        <h2 className="mt-14 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {t("howItWorksTitle")}
        </h2>
        <ol className="mt-6 space-y-3">
          {steps.map((step, i) => (
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
          {t("whyItWorksTitle")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {why.map((point, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6">
              <div className="h-1 w-10 rounded-full bg-primary" />
              <p className="mt-4 leading-relaxed text-foreground">{point}</p>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <div className="mt-16 rounded-2xl bg-secondary px-8 py-12 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-secondary-foreground sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-secondary-foreground/80">{t("ctaBody")}</p>
          <Button asChild size="lg" className="mt-7 bg-white text-secondary hover:bg-white/90">
            <Link href="/signup">
              {t("getStarted")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </article>
    </MarketingShell>
  );
}
