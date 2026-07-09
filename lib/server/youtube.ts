// YouTube Data API helper — Stage 3 step 8 (video chapter markers/timestamps).
// If YOUTUBE_API_KEY is absent, everything returns null and the pipeline
// proceeds without timestamps (graceful skip, per spec).

let warnedNoKey = false;

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(?:embed|shorts|v)\/([\w-]{6,})/);
      if (m) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch a video's description and parse chapter markers ("0:00 Intro" lines)
 * into a compact "0:00 Intro | 2:14 Punnett squares" string. Returns null if
 * no key, not a YouTube URL, or no chapters found.
 */
export async function getYoutubeTimestamps(url: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    if (!warnedNoKey) {
      console.log("[youtube] YOUTUBE_API_KEY not set — skipping video timestamps");
      warnedNoKey = true;
    }
    return null;
  }

  const videoId = extractVideoId(url);
  if (!videoId) return null;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(
        videoId
      )}&key=${apiKey}`,
      { signal: AbortSignal.timeout(15_000) }
    );
    if (!res.ok) {
      console.error(`[youtube] ${res.status}: ${(await res.text()).slice(0, 150)}`);
      return null;
    }
    const json = (await res.json()) as {
      items?: Array<{ snippet?: { description?: string } }>;
    };
    const description = json.items?.[0]?.snippet?.description ?? "";

    // Chapter markers live in the description as "M:SS Label" / "H:MM:SS Label" lines.
    const chapters: string[] = [];
    for (const line of description.split("\n")) {
      const m = line.trim().match(/^\(?((?:\d{1,2}:)?\d{1,2}:\d{2})\)?\s*[-–—:]?\s*(.{2,80})/);
      if (m) chapters.push(`${m[1]} ${m[2].trim()}`);
      if (chapters.length >= 20) break;
    }
    if (chapters.length < 2) return null; // a lone "0:00" isn't a chapter list
    return chapters.join(" | ").slice(0, 1000);
  } catch (err) {
    console.error("[youtube] request failed:", err);
    return null;
  }
}
