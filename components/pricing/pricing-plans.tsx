"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, BadgeCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PricingComparisonTable } from "@/components/pricing/pricing-comparison-table";
import { useApp } from "@/lib/context/app-context";
import { startCheckout, openBillingPortal } from "@/lib/data/subscription";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

// Prices match the Business Plan and the live Stripe test prices.
const PRICE: Record<Billing, { amount: string; suffix: string }> = {
  monthly: { amount: "$5.99", suffix: "/month" },
  yearly: { amount: "$56.99", suffix: "/year" },
};

const FREE_FEATURES = [
  { label: "1 active learning journey", included: true },
  { label: "AI-generated roadmap & resources", included: true },
  { label: "10 messages/day with METIS chat", included: true },
  { label: "3 adaptive re-routes/month", included: true },
  { label: "Analytics & progress insights", included: false },
];

const PREMIUM_FEATURES = [
  "Unlimited active learning journeys",
  "Unlimited chat & adaptive re-routing",
  "Analytics & progress insights",
  "Priority support",
];

export function PricingPlans({ mode = "public" }: { mode?: "public" | "app" }) {
  const [billing, setBilling] = useState<Billing>("yearly");
  const { isPremium } = useApp();
  const [pending, setPending] = useState<null | "checkout" | "portal">(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setError(null);
    setPending("checkout");
    try {
      await startCheckout(billing); // redirects to Stripe on success
    } catch (e) {
      setPending(null);
      setError(e instanceof Error ? e.message : "Couldn't start checkout.");
    }
  }

  async function handleManage() {
    setError(null);
    setPending("portal");
    try {
      await openBillingPortal();
    } catch (e) {
      setPending(null);
      setError(e instanceof Error ? e.message : "Couldn't open billing portal.");
    }
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          GPS for your potential
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          Invest in your <span className="italic text-primary">learning journey.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          Choose the path that fits your goals. From casual exploration to
          intensive professional mastery, METIS guides every step.
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
          Monthly
        </button>
        <Switch
          checked={billing === "yearly"}
          onCheckedChange={(checked) => setBilling(checked ? "yearly" : "monthly")}
          aria-label="Toggle yearly billing"
        />
        <button
          type="button"
          onClick={() => setBilling("yearly")}
          className={cn(
            "text-sm font-medium transition-colors",
            billing === "yearly" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Yearly
        </button>
        <Badge variant="secondary">Save over 20%</Badge>
      </div>

      {/* Plans */}
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col rounded-xl border border-border bg-card p-8">
          <h2 className="font-heading text-xl font-semibold">Free Tier</h2>
          <p className="mt-1 text-sm text-muted-foreground">Essential tools to start your journey.</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-heading text-5xl font-bold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">/forever</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {FREE_FEATURES.map((f) => (
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
                <Link href="/signup">Start for free</Link>
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                {isPremium ? "Included with Premium" : "Current Plan"}
              </Button>
            )}
          </div>
        </div>

        {/* Premium */}
        <div className="relative flex flex-col overflow-hidden rounded-xl border-2 border-primary bg-card p-8">
          <div className="absolute right-6 top-6">
            <Badge variant="gradient">1-week free trial</Badge>
          </div>
          <h2 className="font-heading text-xl font-semibold text-primary">Premium Tier</h2>
          <p className="mt-1 text-sm text-muted-foreground">The full Learning GPS experience.</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-heading text-5xl font-bold tracking-tight">{PRICE[billing].amount}</span>
            <span className="text-sm text-muted-foreground">{PRICE[billing].suffix}</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {PREMIUM_FEATURES.map((label) => (
              <li key={label} className="flex items-start gap-3 text-sm font-medium">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-3">
            {mode === "public" ? (
              <Button asChild variant="gradient" className="w-full">
                <Link href="/signup">Upgrade Now</Link>
              </Button>
            ) : isPremium ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleManage}
                disabled={pending !== null}
              >
                {pending === "portal" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BadgeCheck className="h-4 w-4" />
                )}
                Current plan · Manage billing
              </Button>
            ) : (
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleUpgrade}
                disabled={pending !== null}
              >
                {pending === "checkout" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to checkout…
                  </>
                ) : (
                  "Upgrade Now"
                )}
              </Button>
            )}
            {error && (
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
            <p className="text-center text-xs text-muted-foreground">
              No commitment. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {mode === "public" && <PricingComparisonTable />}
    </div>
  );
}
