import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { getStripe } from "@/lib/server/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/billing/portal — open Stripe's hosted Customer Portal so the user
 * can update payment methods or cancel, without us building billing UI.
 */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: sub } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account yet. Subscribe first to manage billing." },
      { status: 400 }
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing] portal failed:", err);
    return NextResponse.json({ error: "Couldn't open billing portal." }, { status: 502 });
  }
}
