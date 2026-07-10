import { geminiStructuredCall } from "./gemini-provider";
import { openAICompatStructuredCall } from "./openai-provider";
import { paceIntervalMs } from "./config";
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

  let lastError: unknown;
  let lastWasRateLimit = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await paceGate(provider);
      if (provider === "gemini") {
        return await geminiStructuredCall<T>(model, prompt, tool, temperature);
      }
      return await openAICompatStructuredCall<T>(provider, model, prompt, tool, temperature);
    } catch (err) {
      lastError = err;
      const { isRateLimit, retryAfterSec } = parseRateLimit(err);
      lastWasRateLimit = isRateLimit;
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

  if (lastWasRateLimit) throw new LLMRateLimitError(provider);
  throw lastError instanceof Error ? lastError : new LLMError(String(lastError));
}
