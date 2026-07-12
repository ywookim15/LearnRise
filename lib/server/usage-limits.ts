import "server-only";

// -----------------------------------------------------------------------------
// FREE-TIER USAGE LIMITS — chat messages/day, adaptive re-routes/month.
// Server-only: checked and recorded via the service-role client against
// feature_usage (migration 0006), so a free user can't bypass a limit by
// calling the API directly or tampering with client-side state. Premium users
// always pass and are never counted.
// -----------------------------------------------------------------------------

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isPremium,
  FREE_CHAT_DAILY_LIMIT,
  FREE_REPLAN_MONTHLY_LIMIT,
} from "@/lib/entitlements";

type Feature = "chat_message" | "replan";

export interface UsageCheck {
  allowed: boolean;
  premium: boolean;
  used: number;
  limit: number;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthStartUtc(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

async function peekCount(userId: string, feature: Feature, periodStart: string): Promise<number> {
  const { data } = await getSupabaseAdmin()
    .from("feature_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("period_start", periodStart)
    .maybeSingle();
  return data?.count ?? 0;
}

// Best-effort: if migration 0006 hasn't been applied yet, fail open (never
// block chat) rather than 500ing every message.
async function increment(userId: string, feature: Feature, periodStart: string): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("record_feature_usage", {
    p_user_id: userId,
    p_feature: feature,
    p_period_start: periodStart,
  });
  if (error && !/(does not exist|schema cache)/i.test(error.message)) {
    console.warn("[usage-limits] record skipped:", error.message);
  }
}

/** The user's current plan/status, for gating a request. */
export async function getPlanState(
  userId: string
): Promise<{ plan: string | null; status: string | null }> {
  const { data } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  return { plan: data?.plan ?? null, status: data?.status ?? null };
}

/** May this user send one more chat message today? Does NOT record — call
 * recordChatMessage() only after the check passes and you're proceeding. */
export async function checkChatMessageLimit(
  userId: string,
  plan: string | null,
  status: string | null
): Promise<UsageCheck> {
  if (isPremium(plan, status)) {
    return { allowed: true, premium: true, used: 0, limit: Infinity };
  }
  const used = await peekCount(userId, "chat_message", todayUtc());
  return { allowed: used < FREE_CHAT_DAILY_LIMIT, premium: false, used, limit: FREE_CHAT_DAILY_LIMIT };
}

export async function recordChatMessage(userId: string): Promise<void> {
  await increment(userId, "chat_message", todayUtc());
}

/** May this user trigger one more roadmap re-route this month? */
export async function checkReplanLimit(
  userId: string,
  plan: string | null,
  status: string | null
): Promise<UsageCheck> {
  if (isPremium(plan, status)) {
    return { allowed: true, premium: true, used: 0, limit: Infinity };
  }
  const used = await peekCount(userId, "replan", monthStartUtc());
  return { allowed: used < FREE_REPLAN_MONTHLY_LIMIT, premium: false, used, limit: FREE_REPLAN_MONTHLY_LIMIT };
}

export async function recordReplan(userId: string): Promise<void> {
  await increment(userId, "replan", monthStartUtc());
}
