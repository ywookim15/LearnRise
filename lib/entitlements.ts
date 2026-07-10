// Pure entitlement logic shared by client and server (no imports with secrets).

export const FREE_JOURNEY_LIMIT = 1;
export const FREE_CHAT_DAILY_LIMIT = 10;
export const FREE_REPLAN_MONTHLY_LIMIT = 3;

const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

/** True when the plan + Stripe status grant paid (unlimited) access. */
export function isPremium(
  plan: string | null | undefined,
  status: string | null | undefined
): boolean {
  if (!plan || plan === "free") return false;
  return ENTITLED_STATUSES.has(status ?? "");
}

/** Can this user create another journey given how many they already have? */
export function canCreateJourney(
  plan: string | null | undefined,
  status: string | null | undefined,
  existingJourneyCount: number
): boolean {
  if (isPremium(plan, status)) return true;
  return existingJourneyCount < FREE_JOURNEY_LIMIT;
}
