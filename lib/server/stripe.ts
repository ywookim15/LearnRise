import "server-only";

import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// SERVER ONLY. Uses STRIPE_SECRET_KEY (test or live mode, per environment). Never import from client code.
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
      appInfo: { name: "LearnRise" },
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

/**
 * Resolve the price id for an interval AND verify it actually exists under
 * the currently-active Stripe key. Price ids are mode-specific just like
 * customer ids (see getOrCreateCustomerId's comment) — a price created in
 * test mode does not exist under a live secret key. Without this check, a
 * stale STRIPE_PRICE_PREMIUM_* env var (left over from a test->live key
 * migration) fails deep inside checkout.sessions.create with a generic
 * "No such price" error that's indistinguishable from any other Stripe
 * failure in the client-facing error message. Verifying here turns it into
 * a specific, greppable server log so the real cause is obvious immediately.
 */
export async function getVerifiedPriceId(interval: BillingInterval): Promise<string> {
  const envVar = interval === "yearly" ? "STRIPE_PRICE_PREMIUM_YEARLY" : "STRIPE_PRICE_PREMIUM_MONTHLY";
  const priceId = priceIdFor(interval);
  if (!priceId) {
    throw new Error(`Billing is not configured: ${envVar} is not set.`);
  }
  try {
    const price = await getStripe().prices.retrieve(priceId);
    if (!price.active) {
      throw new Error(`Billing is misconfigured: ${envVar} (${priceId}) is archived/inactive in Stripe.`);
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Billing is misconfigured")) throw err;
    throw new Error(
      `Billing is misconfigured: ${envVar} (${priceId}) does not exist for the current Stripe key's mode. ` +
        `If Stripe keys were recently switched between test and live, this env var likely still holds the ` +
        `old mode's price id — update it in Vercel to a price id from the currently-active Stripe mode.`
    );
  }
  return priceId;
}

/** Map a Stripe price id back to a LearnRise plan. Premium prices -> 'premium'. */
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

  // A stored customer id can be stale for the CURRENTLY ACTIVE Stripe key —
  // most notably right after switching from test-mode to live-mode keys (or
  // back), since customer ids are mode-specific and a test-mode id simply
  // does not exist under a live key. Never trust the stored id blindly:
  // verify it still resolves before reusing it, and if not, mint a fresh
  // customer and repair the stored id. Do NOT remove this check — without
  // it, checkout fails outright for every user whose id predates a
  // sandbox/live key migration ("No such customer: ...").
  if (existing?.stripe_customer_id) {
    try {
      const customer = await getStripe().customers.retrieve(existing.stripe_customer_id);
      if (!("deleted" in customer && customer.deleted)) {
        return existing.stripe_customer_id;
      }
    } catch (err) {
      console.warn(
        `[billing] stored stripe_customer_id ${existing.stripe_customer_id} for user ${userId} is invalid (${
          err instanceof Error ? err.message : err
        }); creating a new one`
      );
    }
  }

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
