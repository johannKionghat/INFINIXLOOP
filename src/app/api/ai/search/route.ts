import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY || "";
const SEARXNG_URL = process.env.SEARXNG_URL || "https://search.ononoki.org";

// Strategy 1: DuckDuckGo HTML — exact same approach as nauticeai
async function searchDDG(query: string): Promise<string> {
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`DuckDuckGo HTTP ${res.status}`);
  const html = await res.text();

  // Strip HTML tags and decode entities — same as nauticeai
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, 15000);
}

// Strategy 2: Brave Search API (free tier: 2000 req/month)
async function searchBrave(query: string): Promise<string> {
  if (!BRAVE_API_KEY) return "";
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
      },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!res.ok) return "";
  const data = await res.json();
  const results = data.web?.results || [];
  return results
    .map((r: { title: string; description: string; url: string }, i: number) =>
      `${i + 1}. ${r.title} (${r.url})\n${r.description}`,
    )
    .join("\n\n")
    .slice(0, 15000);
}

// Strategy 3: SearXNG — try configured URL then fallback instances
const SEARXNG_INSTANCES = [
  SEARXNG_URL,
  "https://search.sapti.me",
  "https://searxng.site",
  "https://search.bus-hit.me",
].filter(Boolean);

async function searchSearXNG(query: string): Promise<string> {
  for (const instanceUrl of SEARXNG_INSTANCES) {
    try {
      const res = await fetch(
        `${instanceUrl}/search?q=${encodeURIComponent(query)}&format=json&engines=google,bing,duckduckgo&language=fr`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!res.ok) continue;
      const data = await res.json();
      const results = (data.results || []).slice(0, 10);
      if (results.length === 0) continue;
      return results
        .map((r: { title: string; content: string; url: string }, i: number) =>
          `${i + 1}. ${r.title} (${r.url})\n${r.content}`,
        )
        .join("\n\n")
        .slice(0, 15000);
    } catch {
      continue; // try next instance
    }
  }
  return "";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }

    // Try search strategies in order: DuckDuckGo HTML > Brave > SearXNG
    let textContent = "";
    let source = "";

    // 1. DuckDuckGo HTML (same as nauticeai — primary)
    try {
      textContent = await searchDDG(query);
      if (textContent.length > 200) source = "duckduckgo";
      else console.warn(`[ai/search] DDG returned only ${textContent.length} chars`);
    } catch (e) {
      console.warn("[ai/search] DDG failed:", e instanceof Error ? e.message : e);
    }

    // 2. Brave Search (requires API key) — fallback if DDG returned too little
    if (textContent.length <= 200 && BRAVE_API_KEY) {
      try {
        const braveResult = await searchBrave(query);
        if (braveResult.length > textContent.length) {
          textContent = braveResult;
          source = "brave";
        }
      } catch (e) {
        console.warn("[ai/search] Brave failed:", e instanceof Error ? e.message : e);
      }
    }

    // 3. SearXNG (no key needed) — fallback if still too little
    if (textContent.length <= 200) {
      try {
        const searxResult = await searchSearXNG(query);
        if (searxResult.length > textContent.length) {
          textContent = searxResult;
          source = "searxng";
        }
      } catch (e) {
        console.warn("[ai/search] SearXNG failed:", e instanceof Error ? e.message : e);
      }
    }

    return NextResponse.json({
      textContent: textContent || "",
      resultCount: textContent ? textContent.split("\n").filter((l) => l.trim()).length : 0,
      charCount: textContent.length,
      query,
      source,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai/search] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
