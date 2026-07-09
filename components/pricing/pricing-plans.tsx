"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles, Zap, ShieldCheck, DownloadCloud, BadgeCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  { label: "Basic curated resources", included: true },
  { label: "Streak tracking", included: true },
  { label: "AI summarizing & synthesis", included: false },
  { label: "Adaptive tutor & planner", included: false },
];

const PREMIUM_FEATURES = [
  { icon: Sparkles, label: "Access to EVERYTHING" },
  { icon: Zap, label: "AI summarizing & synthesis" },
  { icon: ShieldCheck, label: "Priority support" },
  { icon: DownloadCloud, label: "Offline learning modes" },
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
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={cn(
            "text-sm font-medium transition-colors",
            billing === "monthly" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Monthly
        </button>
        <button
          role="switch"
          aria-checked={billing === "yearly"}
          onClick={() => setBilling((b) => (b === "yearly" ? "monthly" : "yearly"))}
          className="relative h-6 w-11 rounded-full bg-muted transition-colors data-[on=true]:bg-primary"
          data-on={billing === "yearly"}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              billing === "yearly" ? "translate-x-[22px]" : "translate-x-0.5"
            )}
          />
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={cn(
            "text-sm font-medium transition-colors",
            billing === "yearly" ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Yearly
        </button>
        <Badge variant="secondary" className="ml-1">Save over 20%</Badge>
      </div>

      {/* Plans */}
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col rounded-3xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-xl font-semibold">Free Tier</h2>
          <p className="mt-1 text-sm text-muted-foreground">Essential tools to start your journey.</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">/forever</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    f.included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {f.included ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
                </span>
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
        <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-primary bg-card p-8 shadow-card-hover">
          <div className="absolute right-6 top-6">
            <Badge variant="gradient">1-week free trial</Badge>
          </div>
          <h2 className="text-xl font-semibold text-primary">Premium Tier</h2>
          <p className="mt-1 text-sm text-muted-foreground">The full Learning GPS experience.</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight">{PRICE[billing].amount}</span>
            <span className="text-sm text-muted-foreground">{PRICE[billing].suffix}</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {PREMIUM_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="flex items-center gap-3 text-sm font-medium">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {f.label}
                </li>
              );
            })}
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
              No commitment. Cancel anytime. Test mode — use card 4242 4242 4242 4242.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
