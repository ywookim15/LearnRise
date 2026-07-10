import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { getUsageSnapshot } from "@/lib/server/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/usage — aggregated AI provider usage for the signed-in user's
 * dashboard meter. The counters are global (per deployment), not per-user, but
 * the route stays behind auth. Returns { available:false } before the 0004
 * migration is applied, so the meter can hide itself gracefully.
 */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const snapshot = await getUsageSnapshot();
  if (!snapshot) {
    return NextResponse.json({ available: false });
  }
  return NextResponse.json({ available: true, ...snapshot });
}
