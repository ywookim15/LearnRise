import {
  GoogleGenAI,
  Type,
  FunctionCallingConfigMode,
  type FunctionDeclaration,
} from "@google/genai";

export { Type, type FunctionDeclaration };

let client: GoogleGenAI | undefined;

function getGemini(): GoogleGenAI {
  if (!client) {
    // METIS_GEMINI_API_KEY first: the deploy/dev shell may export an unrelated
    // GEMINI_API_KEY (shell env overrides .env.local in Next.js), so the
    // collision-proof name wins when present.
    const apiKey = process.env.METIS_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing METIS_GEMINI_API_KEY / GEMINI_API_KEY");
    client = apiKey.startsWith("AQ.")
      ? // "AQ." keys can be Vertex express keys; this one verified working on
        // the Developer API, which the SDK targets by default with apiKey.
        new GoogleGenAI({ apiKey })
      : new GoogleGenAI({ apiKey });
  }
  return client;
}

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export class GeminiFunctionError extends Error {}
/** Thrown when a call ultimately fails because of Gemini rate limits / quota. */
export class GeminiRateLimitError extends GeminiFunctionError {}

// --- Global pacing to respect free-tier RPM limits (default ~15/min) ---
// Every Gemini call passes through this gate so concurrent/looped callers
// can't burst past the per-minute quota. Override via GEMINI_MIN_INTERVAL_MS.
const MIN_INTERVAL_MS = Number(process.env.GEMINI_MIN_INTERVAL_MS ?? 4000);
let gateChain: Promise<void> = Promise.resolve();
let lastStart = 0;

function paceGate(): Promise<void> {
  const mine = gateChain.then(async () => {
    const wait = Math.max(0, lastStart + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await sleep(wait);
    lastStart = Date.now();
  });
  // Keep the chain from rejecting the queue if one link throws.
  gateChain = mine.catch(() => {});
  return mine;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Pull the server-advised retry delay (seconds) out of a 429 error. */
function retryDelaySeconds(err: unknown): number | null {
  const msg = err instanceof Error ? err.message : String(err);
  if (!/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) return null;
  const m = msg.match(/retry in\s+([\d.]+)\s*s/i) ?? msg.match(/retryDelay"?:\s*"?([\d.]+)s/i);
  return m ? Math.ceil(parseFloat(m[1])) : 30; // sensible default for a 429
}

/**
 * Run one Gemini call that MUST return a function call (structured output —
 * never free-text parsing). Retries transient failures with backoff.
 */
export async function callGeminiFunction<T>(opts: {
  prompt: string;
  fn: FunctionDeclaration;
  model?: string;
  temperature?: number;
  maxAttempts?: number;
  /**
   * Cap on how long to honor a 429 "retry in Ns" delay. Interactive callers
   * (e.g. the journey-creation Planner) pass a small value so the whole request
   * finishes well under the serverless timeout instead of hanging for minutes.
   */
  maxRetryWaitMs?: number;
}): Promise<T> {
  const {
    prompt,
    fn,
    model = DEFAULT_GEMINI_MODEL,
    temperature = 0.3,
    maxAttempts = 4,
    maxRetryWaitMs = 60_000,
  } = opts;
  const ai = getGemini();

  let lastError: unknown;
  let lastWasRateLimit = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await paceGate(); // respect the per-minute quota before every call
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          tools: [{ functionDeclarations: [fn] }],
          toolConfig: {
            functionCallingConfig: {
              // ANY = the model is required to call a function, not chat.
              mode: FunctionCallingConfigMode.ANY,
              allowedFunctionNames: [fn.name!],
            },
          },
        },
      });

      const call = response.functionCalls?.[0];
      if (call && call.name === fn.name && call.args) {
        return call.args as T;
      }
      throw new GeminiFunctionError(
        `Gemini did not return a ${fn.name} function call`
      );
    } catch (err) {
      lastError = err;
      const retryAfter = retryDelaySeconds(err);
      lastWasRateLimit = retryAfter != null;
      if (attempt < maxAttempts) {
        // 429s carry a server-advised delay — honor it, capped by maxRetryWaitMs
        // so interactive callers don't hang. Other transient errors: short backoff.
        const waitMs =
          retryAfter != null
            ? Math.min(retryAfter * 1000, maxRetryWaitMs)
            : Math.min(1500 * attempt, maxRetryWaitMs);
        console.warn(
          `[gemini] ${fn.name} attempt ${attempt} failed (${
            retryAfter != null ? `rate-limited, retry in ${retryAfter}s` : "transient"
          }); waiting ${Math.round(waitMs / 1000)}s`
        );
        await sleep(waitMs);
      }
    }
  }
  // Surface rate-limit failures distinctly so callers can show a clear message.
  if (lastWasRateLimit) {
    throw new GeminiRateLimitError("Gemini rate limit / quota exceeded");
  }
  throw lastError instanceof Error
    ? lastError
    : new GeminiFunctionError(String(lastError));
}
