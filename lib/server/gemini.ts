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
}): Promise<T> {
  const {
    prompt,
    fn,
    model = DEFAULT_GEMINI_MODEL,
    temperature = 0.3,
    maxAttempts = 4,
  } = opts;
  const ai = getGemini();

  let lastError: unknown;
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
      if (attempt < maxAttempts) {
        // 429s carry a server-advised delay (often 30-50s) — honor it, capped
        // at 60s. Other transient errors use short exponential backoff.
        const retryAfter = retryDelaySeconds(err);
        const waitMs = retryAfter != null ? Math.min(retryAfter, 60) * 1000 : 1500 * attempt;
        console.warn(
          `[gemini] ${fn.name} attempt ${attempt} failed (${
            retryAfter != null ? `rate-limited, retry in ${retryAfter}s` : "transient"
          }); waiting ${Math.round(waitMs / 1000)}s`
        );
        await sleep(waitMs);
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new GeminiFunctionError(String(lastError));
}
