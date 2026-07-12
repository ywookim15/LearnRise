import "server-only";

import {
  GoogleGenAI,
  Type,
  FunctionCallingConfigMode,
  type Schema,
  type FunctionDeclaration,
} from "@google/genai";
import { LLMError, type StructuredTool } from "./types";

let client: GoogleGenAI | undefined;

function getGemini(): GoogleGenAI {
  if (!client) {
    // METIS_GEMINI_API_KEY first: a dev shell may export a conflicting
    // GEMINI_API_KEY, and shell env overrides .env.local in Next.js.
    const apiKey = process.env.METIS_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new LLMError("Missing METIS_GEMINI_API_KEY / GEMINI_API_KEY");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const TYPE_MAP: Record<string, Type> = {
  object: Type.OBJECT,
  string: Type.STRING,
  number: Type.NUMBER,
  integer: Type.INTEGER,
  boolean: Type.BOOLEAN,
  array: Type.ARRAY,
};

/** Convert a plain JSON Schema (lowercase types) to a Gemini Schema. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGeminiSchema(node: any): Schema {
  const out: Schema = {};
  if (node.type && TYPE_MAP[node.type]) out.type = TYPE_MAP[node.type];
  if (node.description) out.description = node.description;
  if (node.enum) out.enum = node.enum;
  if (node.properties) {
    out.properties = {};
    for (const [k, v] of Object.entries(node.properties)) {
      out.properties[k] = toGeminiSchema(v);
    }
  }
  if (node.required) out.required = node.required;
  if (node.items) out.items = toGeminiSchema(node.items);
  return out;
}

/** One Gemini call that must return the tool's arguments (function calling). */
export async function geminiStructuredCall<T>(
  model: string,
  prompt: string,
  tool: StructuredTool,
  temperature: number
): Promise<T> {
  const fn: FunctionDeclaration = {
    name: tool.name,
    description: tool.description,
    parameters: toGeminiSchema(tool.parameters),
  };

  const response = await getGemini().models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature,
      tools: [{ functionDeclarations: [fn] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY, // must call the function
          allowedFunctionNames: [tool.name],
        },
      },
    },
  });

  const call = response.functionCalls?.[0];
  if (call && call.name === tool.name && call.args) {
    return call.args as T;
  }
  throw new LLMError(`Gemini did not return a ${tool.name} function call`);
}
