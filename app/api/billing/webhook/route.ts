import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, planForPriceId } from "@/lib/server/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Must run on Node (needs the raw body + crypto for signature verification).
export const runtime = "nodejs";

/**
 * POST /api/billing/webhook — Stripe events.
 *
 * SECURITY: the raw request body is verified against the Stripe signature with
 * STRIPE_WEBHOOK_SECRET. Anything that fails verification is rejected with 400
 * and never processed — this is the only thing standing between us and forged
 * "you're now premium" requests, so it is not optional.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.startsWith("whsec_placeholder")) {
    console.error("[billing] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  // Raw body — do NOT JSON.parse before verifying.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    // Signature mismatch / tampering / wrong secret -> reject, process nothing.
    console.error("[billing] signature verification FAILED:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id
          );
          await syncSubscription(sub, session.client_reference_id ?? undefined);
        }
        break;
      }
      case "customer.subscription.updated": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        await downgradeSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        // Ignore other event types.
        break;
    }
  } catch (err) {
    console.error(`[billing] handler error for ${event.type}:`, err);
    // 500 tells Stripe to retry later.
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// --- helpers ---

function periodEnd(sub: Stripe.Subscription): string | null {
  // current_period_end lives on the subscription (older API) or its items
  // (newer API). Read defensively across versions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anySub = sub as any;
  const raw = anySub.current_period_end ?? anySub.items?.data?.[0]?.current_period_end ?? null;
  return typeof raw === "number" ? new Date(raw * 1000).toISOString() : null;
}

/** Resolve the LearnRise user for a subscription (metadata first, then our table). */
async function resolveUserId(
  sub: Stripe.Subscription,
  fallbackUserId?: string
): Promise<string | null> {
  if (sub.metadata?.user_id) return sub.metadata.user_id;
  if (fallbackUserId) return fallbackUserId;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const { data } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function syncSubscription(sub: Stripe.Subscription, fallbackUserId?: string) {
  const userId = await resolveUserId(sub, fallbackUserId);
  if (!userId) {
    console.error("[billing] could not resolve user for subscription", sub.id);
    return;
  }
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items?.data?.[0]?.price?.id;
  const plan = planForPriceId(priceId);

  await getSupabaseAdmin().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan,
      status: sub.status,
      current_period_end: periodEnd(sub),
    },
    { onConflict: "user_id" }
  );
  console.log(`[billing] synced ${userId} -> plan=${plan} status=${sub.status}`);
}

async function downgradeSubscription(sub: Stripe.Subscription) {
  const userId = await resolveUserId(sub);
  if (!userId) return;
  await getSupabaseAdmin()
    .from("subscriptions")
    .update({ plan: "free", status: "canceled", stripe_subscription_id: sub.id })
    .eq("user_id", userId);
  console.log(`[billing] downgraded ${userId} -> free (subscription deleted)`);
}
