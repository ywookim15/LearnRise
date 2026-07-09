"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isPremium } from "@/lib/entitlements";

export interface UiSubscription {
  plan: "free" | "premium" | "family";
  status: string;
  currentPeriodEnd: string | null;
  hasCustomer: boolean;
  isPremium: boolean;
}

const FREE: UiSubscription = {
  plan: "free",
  status: "inactive",
  currentPeriodEnd: null,
  hasCustomer: false,
  isPremium: false,
};

/** Read the signed-in user's subscription row (RLS-scoped). Defaults to free. */
export async function getMySubscription(): Promise<UiSubscription> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, stripe_customer_id")
    .maybeSingle();
  if (error || !data) return FREE;
  const plan = (data.plan ?? "free") as UiSubscription["plan"];
  return {
    plan,
    status: data.status ?? "inactive",
    currentPeriodEnd: data.current_period_end ?? null,
    hasCustomer: !!data.stripe_customer_id,
    isPremium: isPremium(plan, data.status),
  };
}

/** Start Stripe Checkout for the given interval and redirect to Stripe. */
export async function startCheckout(interval: "monthly" | "yearly"): Promise<void> {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ interval }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    throw new Error(json.error || "Couldn't start checkout.");
  }
  window.location.href = json.url;
}

/** Open Stripe's Customer Portal and redirect to it. */
export async function openBillingPortal(): Promise<void> {
  const res = await fetch("/api/billing/portal", { method: "POST" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    throw new Error(json.error || "Couldn't open billing portal.");
  }
  window.location.href = json.url;
}
