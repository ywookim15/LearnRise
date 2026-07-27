import "server-only";

import type { Provider } from "./types";

export interface AgentModel {
  provider: Provider;
  model: string;
  /** Optional: retry this call on a different provider if the primary rate-limits. */
  fallback?: { provider: Provider; model: string };
}

// Per-call-site provider/model. Each is independently overridable via env, so
// the allocation can be retuned in Vercel without a code change.
//
//   Planner  -> Cerebras          (TEMPORARY primary — see note below)
//   Curator  -> Cerebras          (high volume; big free daily quota)
//   Chief    -> Groq Llama 3.3 70B (chat quality)
//   Memory   -> Groq Llama 3.1 8B  (separate model = separate daily bucket)
export const LLM: Record<"planner" | "curator" | "chief" | "memory", AgentModel> = {
  planner: {
    // TEMPORARY: Gemini's API project is currently denied access (403
    // PERMISSION_DENIED on Google's side, not fixable here) — defaulting
    // straight to Cerebras so journey creation keeps working. Once the
    // Gemini project is restored, set LLM_PLANNER_PROVIDER=gemini and
    // LLM_PLANNER_MODEL=gemini-2.5-flash (or flip the defaults back here) to
    // switch back to it as the quality-preferred primary.
    provider: (process.env.LLM_PLANNER_PROVIDER as Provider) ?? "cerebras",
    model: process.env.LLM_PLANNER_MODEL ?? "gpt-oss-120b",
    fallback: {
      provider: (process.env.LLM_PLANNER_FALLBACK_PROVIDER as Provider) ?? "groq",
      model: process.env.LLM_PLANNER_FALLBACK_MODEL ?? "llama-3.3-70b-versatile",
    },
  },
  curator: {
    provider: (process.env.LLM_CURATOR_PROVIDER as Provider) ?? "cerebras",
    // gpt-oss-120b: Cerebras's flagship free model (big daily quota, strong
    // tool use). Verified forced tool-calling. Override via LLM_CURATOR_MODEL.
    model: process.env.LLM_CURATOR_MODEL ?? "gpt-oss-120b",
  },
  chief: {
    provider: (process.env.LLM_CHIEF_PROVIDER as Provider) ?? "groq",
    model: process.env.LLM_CHIEF_MODEL ?? "llama-3.3-70b-versatile",
  },
  memory: {
    provider: (process.env.LLM_MEMORY_PROVIDER as Provider) ?? "groq",
    model: process.env.LLM_MEMORY_MODEL ?? "llama-3.1-8b-instant",
  },
};

/** OpenAI-compatible base URLs + API-key env var per provider. */
export const OPENAI_COMPAT: Record<
  Exclude<Provider, "gemini">,
  { baseURL: string; apiKeyEnv: string }
> = {
  groq: { baseURL: "https://api.groq.com/openai/v1", apiKeyEnv: "GROQ_API_KEY" },
  cerebras: { baseURL: "https://api.cerebras.ai/v1", apiKeyEnv: "CEREBRAS_API_KEY" },
};

/**
 * Minimum spacing between calls to a provider (smooths within-request bursts so
 * a many-chapter curation run doesn't self-inflict 429s). Tuned under each free
 * tier's RPM: Gemini ~10-15/min, Cerebras 30/min, Groq ~30/min.
 */
export function paceIntervalMs(provider: Provider): number {
  const env = Number(process.env[`LLM_${provider.toUpperCase()}_INTERVAL_MS`]);
  if (Number.isFinite(env) && env >= 0) return env;
  switch (provider) {
    case "gemini":
      return 4000; // ~15/min
    case "cerebras":
      return 2200; // ~27/min (under Cerebras's 30 RPM)
    default:
      return 2200; // groq — ~27/min
  }
}
