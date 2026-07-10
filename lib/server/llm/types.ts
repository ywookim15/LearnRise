// Provider-agnostic structured-output (function-calling) layer.
// Every call returns the arguments of a single forced tool call — never
// free-text that we then parse.

export type Provider = "gemini" | "groq" | "cerebras";

/** A JSON-Schema object describing the tool's arguments (OpenAI-style). */
export type JsonSchema = Record<string, unknown>;

export interface StructuredTool {
  name: string;
  description: string;
  /** JSON Schema (type:"object", properties, required, items, …). */
  parameters: JsonSchema;
}

export interface StructuredCallOptions {
  provider: Provider;
  model: string;
  prompt: string;
  tool: StructuredTool;
  temperature?: number;
  maxAttempts?: number;
  /** Cap on how long to honor a 429 retry delay (interactive callers pass a small value). */
  maxRetryWaitMs?: number;
}

/** Thrown when a call ultimately fails because of provider rate limits / quota. */
export class LLMRateLimitError extends Error {
  provider: Provider;
  constructor(provider: Provider, message?: string) {
    super(message ?? `${provider} rate limit / quota exceeded`);
    this.provider = provider;
    this.name = "LLMRateLimitError";
  }
}

export class LLMError extends Error {}
