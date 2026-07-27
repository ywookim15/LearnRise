import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <MarketingShell>
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-28 text-center lg:py-40">
          <h1 className="font-heading text-5xl font-bold leading-[1.1] tracking-tight text-secondary sm:text-6xl lg:text-7xl">
            {t.rich("hero.title", {
              gps: (chunks) => <span className="text-gradient">{chunks}</span>,
            })}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t("hero.subtitle")}
          </p>
          <Button asChild size="lg" variant="gradient" className="rounded-xl">
            <Link href="/signup">
              {t("hero.startJourney")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
