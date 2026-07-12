import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { getStripe, getVerifiedPriceId, getOrCreateCustomerId, type BillingInterval } from "@/lib/server/stripe";

export const runtime = "nodejs";

/**
 * POST /api/billing/checkout — create a Stripe Checkout Session (subscription
 * mode) for the Premium plan and return the hosted-checkout URL for the client
 * to redirect to.
 */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { interval?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const interval: BillingInterval = body.interval === "yearly" ? "yearly" : "monthly";

  let priceId: string;
  try {
    priceId = await getVerifiedPriceId(interval);
  } catch (err) {
    console.error("[billing] price id check failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Billing is not configured correctly for this plan. Please contact support." },
      { status: 500 }
    );
  }

  const origin = req.nextUrl.origin;

  try {
    const customerId = await getOrCreateCustomerId(user.id, user.email);
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // Belt-and-suspenders: both the session and the subscription carry the
      // user id so the webhook can always resolve the METIS user.
      client_reference_id: user.id,
      subscription_data: {
        metadata: { user_id: user.id },
        // 7-day free trial (pricing page promise). If the trial ends with no
        // payment method on file, cancel rather than silently charging later.
        trial_period_days: 7,
        trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
      },
      // Collect the card up front even though the trial defers the charge —
      // required for trial_settings.end_behavior to have anything to check,
      // and avoids a "trial ended, no way to bill" dead end.
      payment_method_collection: "always",
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/upgrade?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Never leak Stripe internals / keys to the client.
    console.error("[billing] checkout failed:", err);
    return NextResponse.json(
      { error: "Couldn't start checkout. Please try again." },
      { status: 502 }
    );
  }
}
