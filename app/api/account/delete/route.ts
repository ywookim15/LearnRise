import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRequestUser } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/account/delete — permanently delete the signed-in user's account.
 * Requires re-entering the password: we re-verify it server-side before doing
 * anything, so a stolen session alone can't nuke an account.
 * Deleting the auth user cascades their journeys + subscription (FK on delete).
 */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || !user.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const password = body.password ?? "";
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  // Re-verify the password with a throwaway (non-persisting) client.
  const verifier = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  const { error: pwErr } = await verifier.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (pwErr) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const { error: delErr } = await getSupabaseAdmin().auth.admin.deleteUser(user.id);
  if (delErr) {
    console.error("[account] delete failed:", delErr);
    return NextResponse.json({ error: "Couldn't delete your account. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
