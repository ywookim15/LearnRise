import OpenAI from "openai";
import { OPENAI_COMPAT } from "./config";
import { LLMError, type Provider, type StructuredTool } from "./types";

const clients = new Map<string, OpenAI>();

function getClient(provider: Exclude<Provider, "gemini">): OpenAI {
  const cached = clients.get(provider);
  if (cached) return cached;
  const { baseURL, apiKeyEnv } = OPENAI_COMPAT[provider];
  const apiKey = process.env[apiKeyEnv];
  if (!apiKey) throw new LLMError(`Missing ${apiKeyEnv}`);
  const c = new OpenAI({ apiKey, baseURL, maxRetries: 0 /* we handle retries */ });
  clients.set(provider, c);
  return c;
}

/**
 * One call to an OpenAI-compatible provider (Groq / Cerebras) that MUST return
 * the tool's arguments (forced function calling — no free-text parsing).
 */
export async function openAICompatStructuredCall<T>(
  provider: Exclude<Provider, "gemini">,
  model: string,
  prompt: string,
  tool: StructuredTool,
  temperature: number
): Promise<T> {
  const client = getClient(provider);

  const res = await client.chat.completions.create({
    model,
    temperature,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      },
    ],
    // Force the model to call exactly this tool.
    tool_choice: { type: "function", function: { name: tool.name } },
  });

  const call = res.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== "function" || call.function.name !== tool.name) {
    throw new LLMError(`${provider} did not return a ${tool.name} tool call`);
  }
  try {
    return JSON.parse(call.function.arguments) as T;
  } catch {
    throw new LLMError(`${provider} returned unparseable arguments for ${tool.name}`);
  }
}
