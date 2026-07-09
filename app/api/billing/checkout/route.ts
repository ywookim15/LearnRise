import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { getStripe, priceIdFor, getOrCreateCustomerId, type BillingInterval } from "@/lib/server/stripe";

export const runtime = "nodejs";

/**
 * POST /api/billing/checkout — create a Stripe Checkout Session (subscription
 * mode) for the Premium plan and return the hosted-checkout URL for the client
 * to redirect to. Test mode only.
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
  const priceId = priceIdFor(interval);
  if (!priceId) {
    return NextResponse.json(
      { error: "Billing is not configured (missing price id)." },
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
      subscription_data: { metadata: { user_id: user.id } },
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
