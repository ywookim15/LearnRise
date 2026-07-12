import "server-only";

import { recordProviderUsage } from "@/lib/server/usage";

export interface TavilyResult {
  title: string;
  url: string;
  /** Tavily's relevance-ranked snippet */
  content: string;
  /** Full page content when include_raw_content was requested */
  rawContent: string | null;
  score: number;
}

/**
 * Tavily web search. Returns null on ANY failure (missing key, network, 4xx/5xx)
 * so callers degrade gracefully instead of crashing the pipeline.
 */
export async function tavilySearch(
  query: string,
  opts: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeRawContent?: boolean;
    timeoutMs?: number;
  } = {}
): Promise<TavilyResult[] | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.error("[tavily] TAVILY_API_KEY missing");
    return null;
  }

  const { maxResults = 8, searchDepth = "basic", includeRawContent = false, timeoutMs = 30_000 } = opts;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: searchDepth,
        include_raw_content: includeRawContent,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      if (res.status === 429) {
        const retry = Number(res.headers.get("retry-after"));
        recordProviderUsage("tavily", true, Number.isFinite(retry) ? retry : undefined);
      }
      console.error(`[tavily] ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return null;
    }
    recordProviderUsage("tavily");

    const json = (await res.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        content?: string;
        raw_content?: string | null;
        score?: number;
      }>;
    };

    return (json.results ?? []).map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: r.content ?? "",
      rawContent: r.raw_content ?? null,
      score: r.score ?? 0,
    }));
  } catch (err) {
    console.error("[tavily] request failed:", err);
    return null;
  }
}
