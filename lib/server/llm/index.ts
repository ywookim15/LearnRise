import "server-only";

import { geminiStructuredCall } from "./gemini-provider";
import { openAICompatStructuredCall } from "./openai-provider";
import { paceIntervalMs } from "./config";
import { recordProviderUsage } from "@/lib/server/usage";
import {
  LLMError,
  LLMRateLimitError,
  type Provider,
  type StructuredCallOptions,
} from "./types";

export { LLMError, LLMRateLimitError };
export type { Provider, StructuredTool, StructuredCallOptions } from "./types";
export { LLM } from "./config";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- per-provider pacing (each provider has its own quota, so separate gates) ---
const gates = new Map<Provider, { chain: Promise<void>; lastStart: number }>();
function paceGate(provider: Provider): Promise<void> {
  let g = gates.get(provider);
  if (!g) {
    g = { chain: Promise.resolve(), lastStart: 0 };
    gates.set(provider, g);
  }
  const interval = paceIntervalMs(provider);
  const gate = g;
  const mine = gate.chain.then(async () => {
    const wait = Math.max(0, gate.lastStart + interval - Date.now());
    if (wait > 0) await sleep(wait);
    gate.lastStart = Date.now();
  });
  gate.chain = mine.catch(() => {});
  return mine;
}

/** Detect a rate-limit error across Gemini + OpenAI-compatible providers. */
function parseRateLimit(err: unknown): { isRateLimit: boolean; retryAfterSec: number } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;
  const status: number | undefined = e?.status ?? e?.response?.status;
  const msg = err instanceof Error ? err.message : String(err);
  const isRateLimit = status === 429 || /\b429\b|RESOURCE_EXHAUSTED|rate limit|quota/i.test(msg);
  if (!isRateLimit) return { isRateLimit: false, retryAfterSec: 0 };

  let retryAfterSec: number | null = null;
  // OpenAI SDK exposes a Headers object on the error.
  const hdr = e?.headers?.get?.("retry-after") ?? e?.headers?.["retry-after"];
  if (hdr != null) {
    const n = parseFloat(String(hdr));
    if (Number.isFinite(n)) retryAfterSec = n;
  }
  if (retryAfterSec == null) {
    const m =
      msg.match(/retry in\s+([\d.]+)\s*s/i) ??
      msg.match(/retryDelay"?:\s*"?([\d.]+)s/i) ??
      msg.match(/try again in\s+([\d.]+)s/i);
    if (m) retryAfterSec = Math.ceil(parseFloat(m[1]));
  }
  return { isRateLimit: true, retryAfterSec: retryAfterSec ?? 30 };
}

/**
 * Detect an error that retrying will never fix — a denied/suspended API
 * project (403 PERMISSION_DENIED, as thrown by @google/genai's ApiError), an
 * account with no payment method / exhausted paid quota (402 Payment
 * Required, seen from Cerebras), an invalid key, or a missing key env var.
 * Retrying these just burns the request's time budget for nothing, so
 * callStructured skips its remaining attempts and callStructuredWithFallback
 * moves to the fallback immediately.
 */
function isPermanentAuthError(err: unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;
  const status: number | undefined = e?.status ?? e?.response?.status;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    status === 403 ||
    status === 401 ||
    status === 402 ||
    /PERMISSION_DENIED|permission denied|invalid api key|unauthorized|missing.*api.?key|payment required|insufficient.*(credit|balance|quota)/i.test(
      msg
    )
  );
}

/**
 * Provider-agnostic structured call. Dispatches to the right provider, paces
 * per-provider, retries with 429-aware backoff, and throws LLMRateLimitError
 * when a call ultimately fails due to rate limits.
 */
export async function callStructured<T>(opts: StructuredCallOptions): Promise<T> {
  const {
    provider,
    model,
    prompt,
    tool,
    temperature = 0.3,
    maxAttempts = 3,
    maxRetryWaitMs = 60_000,
  } = opts;

  // Fault injection for resilience testing (OFF by default). Set
  // LLM_FORCE_RATELIMIT to a comma-list of providers (e.g. "gemini") to make
  // their calls throw LLMRateLimitError immediately.
  const forced = process.env.LLM_FORCE_RATELIMIT?.split(",").map((s) => s.trim());
  if (forced?.includes(provider)) {
    throw new LLMRateLimitError(provider, `${provider} forced via LLM_FORCE_RATELIMIT`);
  }

  let lastError: unknown;
  let lastWasRateLimit = false;
  // Track whether ANY attempt was throttled (so the usage meter can flag it even
  // if a later retry succeeds) plus the last retry-after we saw.
  let sawRateLimit = false;
  let lastRetryAfterSec: number | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await paceGate(provider);
      const result =
        provider === "gemini"
          ? await geminiStructuredCall<T>(model, prompt, tool, temperature)
          : await openAICompatStructuredCall<T>(provider, model, prompt, tool, temperature);
      recordProviderUsage(provider, sawRateLimit, lastRetryAfterSec);
      return result;
    } catch (err) {
      lastError = err;
      const { isRateLimit, retryAfterSec } = parseRateLimit(err);
      lastWasRateLimit = isRateLimit;
      if (isRateLimit) {
        sawRateLimit = true;
        lastRetryAfterSec = retryAfterSec;
      }

      // A denied/invalid key won't fix itself between attempts — stop wasting
      // the request's time budget and let callStructuredWithFallback move to
      // the fallback provider immediately.
      if (isPermanentAuthError(err)) {
        console.error(
          `[llm:${provider}] ${tool.name} permanently denied (${
            err instanceof Error ? err.message : String(err)
          }) — skipping remaining retries`
        );
        break;
      }

      if (attempt < maxAttempts) {
        const waitMs = isRateLimit
          ? Math.min(retryAfterSec * 1000, maxRetryWaitMs)
          : Math.min(1200 * attempt, maxRetryWaitMs);
        console.warn(
          `[llm:${provider}] ${tool.name} attempt ${attempt} failed (${
            isRateLimit ? `rate-limited, retry ${retryAfterSec}s` : "transient"
          }); waiting ${Math.round(waitMs / 1000)}s`
        );
        await sleep(waitMs);
      }
    }
  }

  // All attempts exhausted — still count the spent quota + the throttling.
  recordProviderUsage(provider, sawRateLimit || lastWasRateLimit, lastRetryAfterSec);
  if (lastWasRateLimit) throw new LLMRateLimitError(provider);
  throw lastError instanceof Error ? lastError : new LLMError(String(lastError));
}

/**
 * Like callStructured, but if the primary provider ultimately fails (after its
 * own retries) for ANY reason — rate limit, a suspended/denied API key/project,
 * a transient outage, whatever — retry once on a fallback provider/model.
 * Used by the Planner so a broken Gemini key doesn't fail journey creation;
 * Gemini stays primary for quality, the fallback is purely a safety net.
 */
export async function callStructuredWithFallback<T>(
  primary: StructuredCallOptions,
  fallback?: { provider: Provider; model: string }
): Promise<T> {
  try {
    return await callStructured<T>(primary);
  } catch (err) {
    if (fallback) {
      console.warn(
        `[llm] ${primary.provider} failed for ${primary.tool.name} (${
          err instanceof Error ? err.message : String(err)
        }); falling back to ${fallback.provider}/${fallback.model}`
      );
      return await callStructured<T>({
        ...primary,
        provider: fallback.provider,
        model: fallback.model,
      });
    }
    throw err;
  }
}
