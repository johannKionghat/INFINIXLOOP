import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const encoded = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encoded}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; InfinixLoop/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `DuckDuckGo HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const html = await res.text();

    // Extract search result snippets from DuckDuckGo HTML
    const results: { title: string; snippet: string; url: string }[] = [];
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = resultRegex.exec(html)) !== null) {
      results.push({
        url: match[1].replace(/&amp;/g, "&"),
        title: match[2].replace(/<[^>]+>/g, "").trim(),
        snippet: match[3].replace(/<[^>]+>/g, "").trim(),
      });
    }

    // Also extract with simpler pattern as fallback
    if (results.length === 0) {
      const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
      let snippetMatch;
      while ((snippetMatch = snippetRegex.exec(html)) !== null) {
        results.push({
          url: "",
          title: "",
          snippet: snippetMatch[1].replace(/<[^>]+>/g, "").trim(),
        });
      }
    }

    // Build text content from results
    const textContent = results
      .map((r, i) => `${i + 1}. ${r.title}${r.url ? ` (${r.url})` : ""}\n${r.snippet}`)
      .join("\n\n")
      .slice(0, 20000);

    return NextResponse.json({
      textContent,
      resultCount: results.length,
      query,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai/search] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
