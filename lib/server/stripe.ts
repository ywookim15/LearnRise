import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// SERVER ONLY. Uses the test-mode secret key. Never import from client code.
let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (typeof window !== "undefined") {
    throw new Error("getStripe() must never run in the browser");
  }
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
    stripe = new Stripe(key, {
      // Pin to the SDK's expected API version so behavior doesn't shift.
      apiVersion: "2026-06-24.dahlia",
      appInfo: { name: "METIS" },
    });
  }
  return stripe;
}

export type BillingInterval = "monthly" | "yearly";

/** Price id for a given interval (from env). */
export function priceIdFor(interval: BillingInterval): string | null {
  return interval === "yearly"
    ? process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? null
    : process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? null;
}

/** Map a Stripe price id back to a METIS plan. Premium prices -> 'premium'. */
export function planForPriceId(priceId: string | undefined): "premium" | "family" | "free" {
  if (!priceId) return "free";
  if (
    priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_PREMIUM_YEARLY
  ) {
    return "premium";
  }
  return "premium"; // any other configured paid price still grants access
}

/** Stripe subscription statuses that grant paid entitlement. */
export function isEntitled(status: string | null | undefined, plan: string | null | undefined): boolean {
  if (!plan || plan === "free") return false;
  return status === "active" || status === "trialing" || status === "past_due";
}

/**
 * Return the user's existing Stripe customer id (from our subscriptions row),
 * creating a Stripe customer if they don't have one yet. Persists the customer
 * id immediately so the webhook can resolve customer -> user later.
 */
export async function getOrCreateCustomerId(userId: string, email: string): Promise<string> {
  const admin = getSupabaseAdmin();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email,
    metadata: { user_id: userId },
  });

  // Upsert the row (still plan 'free' until the webhook confirms payment).
  await admin
    .from("subscriptions")
    .upsert(
      { user_id: userId, stripe_customer_id: customer.id },
      { onConflict: "user_id" }
    );

  return customer.id;
}
