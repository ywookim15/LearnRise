import "server-only";

import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Resolve the authenticated user for an API request.
 * Accepts either the browser session cookie (normal app flow) or an
 * `Authorization: Bearer <access_token>` header (server-to-server / testing).
 * Both paths validate the JWT against Supabase Auth.
 */
export async function getRequestUser(req: NextRequest): Promise<User | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    return error ? null : data.user;
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
