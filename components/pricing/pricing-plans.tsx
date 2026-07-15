"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, X, BadgeCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PricingComparisonTable } from "@/components/pricing/pricing-comparison-table";
import { useApp } from "@/lib/context/app-context";
import { startCheckout, openBillingPortal } from "@/lib/data/subscription";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

// Amounts match the live Stripe prices (kept verbatim across locales).
const AMOUNT: Record<Billing, string> = { monthly: "$5.99", yearly: "$56.99" };

export function PricingPlans({ mode = "public" }: { mode?: "public" | "app" }) {
  const t = useTranslations("pricingPage");
  const [billing, setBilling] = useState<Billing>("yearly");
  const { isPremium } = useApp();
  const [pending, setPending] = useState<null | "checkout" | "portal">(null);
  const [error, setError] = useState<string | null>(null);

  const freeFeatures = [
    { label: t("freeFeat1"), included: true },
    { label: t("freeFeat2"), included: true },
    { label: t("freeFeat3"), included: true },
    { label: t("freeFeat4"), included: true },
    { label: t("freeFeat5"), included: false },
  ];
  const premiumFeatures = [t("proFeat1"), t("proFeat2"), t("proFeat3"), t("proFeat4")];

  async function handleUpgrade() {
    setError(null);
    setPending("checkout");
    try {
      await startCheckout(billing); // redirects to Stripe on success
    } catch (e) {
      setPending(null);
      setError(e instanceof Error ? e.message : t("checkoutError"));
    }
  }

  async function handleManage() {
    setError(null);
    setPending("portal");
    try {
      await openBillingPortal();
    } catch (e) {
      setPending(null);
      setError(e instanceof Error ? e.message : t("portalError"));
    }
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-secondary sm:text-5xl">
          {t.rich("title", { grad: (c) => <span className="text-gradient">{c}</span> })}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={cn(
            "text-sm font-medium transition-colors",
            billing === "monthly" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {t("monthly")}
        </button>
        <Switch
          checked={billing === "yearly"}
          onCheckedChange={(checked) => setBilling(checked ? "yearly" : "monthly")}
          aria-label={t("toggleYearlyLabel")}
        />
        <button
          type="button"
          onClick={() => setBilling("yearly")}
          className={cn(
            "text-sm font-medium transition-colors",
            billing === "yearly" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {t("yearly")}
        </button>
        <Badge variant="secondary">{t("save")}</Badge>
      </div>

      {/* Plans */}
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col rounded-3xl border border-border bg-card p-8">
          <h2 className="font-heading text-xl font-semibold">{t("freeTier")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("freeTierDesc")}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-heading text-5xl font-bold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">{t("perForever")}</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f.label} className="flex items-start gap-3 text-sm">
                {f.included ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.5} aria-hidden="true" />
                )}
                <span className={cn(!f.included && "text-muted-foreground line-through")}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {mode === "public" ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/signup">{t("startForFree")}</Link>
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                {isPremium ? t("includedWithPremium") : t("currentPlan")}
              </Button>
            )}
          </div>
        </div>

        {/* Premium */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-brand-lg">
          <div className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md">
            {t("mostPopular")}
          </div>
          <h2 className="font-heading text-xl font-bold">{t("premiumTier")}</h2>
          <p className="mt-1 text-sm text-white/70">{t("premiumTierDesc")}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-heading text-5xl font-bold tracking-tight">{AMOUNT[billing]}</span>
            <span className="text-sm text-white/70">{billing === "yearly" ? t("perYear") : t("perMonth")}</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {premiumFeatures.map((label) => (
              <li key={label} className="flex items-start gap-3 text-sm font-medium">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-3">
            {mode === "public" ? (
              <Button asChild className="w-full bg-white text-secondary hover:bg-white/90">
                <Link href="/signup">{t("upgradeNow")}</Link>
              </Button>
            ) : isPremium ? (
              <Button
                className="w-full border border-white/40 bg-white/10 text-white hover:bg-white/20"
                onClick={handleManage}
                disabled={pending !== null}
              >
                {pending === "portal" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BadgeCheck className="h-4 w-4" />
                )}
                {t("manageBilling")}
              </Button>
            ) : (
              <Button
                className="w-full bg-white text-secondary hover:bg-white/90"
                onClick={handleUpgrade}
                disabled={pending !== null}
              >
                {pending === "checkout" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("redirecting")}
                  </>
                ) : (
                  t("upgradeNow")
                )}
              </Button>
            )}
            {error && (
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
            <p className="text-center text-xs text-white/70">{t("noCommitment")}</p>
          </div>
        </div>
      </div>

      {mode === "public" && <PricingComparisonTable />}

      {mode === "public" && (
        <div className="mx-auto mt-20 max-w-5xl overflow-hidden rounded-3xl bg-secondary px-8 py-16 text-center text-white">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("readyTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/70">{t("readyBody")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-secondary hover:bg-white/90">
              <Link href="/signup">{t("createFreeAccount")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/about">{t("explorePlatform")}</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
