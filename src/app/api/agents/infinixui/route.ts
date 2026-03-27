import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const INFINIXUI_BASE_URL = process.env.INFINIXUI_BASE_URL || "https://infinixui.com";

/** Replace any localhost/127.0.0.1 origin in a URL with INFINIXUI_BASE_URL */
function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, INFINIXUI_BASE_URL);
  } catch {
    return url;
  }
}

async function getUserKey(userId: string, keyName: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_api_keys")
    .select("key_value")
    .eq("user_id", userId)
    .eq("key_name", keyName)
    .single();
  return data?.key_value || null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const apiKey = await getUserKey(user.id, "infinixui_api_key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "Cle API InfinixUI manquante. Ajoutez-la dans Parametres > Design & Carrousel." },
        { status: 400 },
      );
    }

    const token = apiKey;

    const body = await request.json();
    const { action, prompt, format, project_id } = body;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // ── Create a carousel via InfinixUI (prompt-based — LLM generates the design) ──
    if (action === "create_carousel") {
      if (!prompt || typeof prompt !== "string") {
        return NextResponse.json(
          { error: "Un prompt est requis pour generer le carrousel." },
          { status: 400 },
        );
      }

      const payload = {
        prompt,
        format: format || "li",
        userId: user.id,
      };

      const res = await fetch(`${INFINIXUI_BASE_URL}/api/carousel/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`InfinixUI API error (${res.status}): ${err}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "InfinixUI: echec de la generation");
      }

      // Build the correct studio URL ourselves
      const sessionId = data.id;
      const studioParams = new URLSearchParams({ session: sessionId, format: payload.format });
      if (data.designId) studioParams.set("design", data.designId);
      const studioUrl = `${INFINIXUI_BASE_URL}/carousel/studio?${studioParams}`;

      return NextResponse.json({
        project_id: data.id,
        editor_url: studioUrl,
        pdf_url: normalizeUrl(data.pdfUrl),
        preview_url: normalizeUrl(data.previewUrl),
        slide_images: (data.slideImages || []).map((u: string) => normalizeUrl(u) || u),
        design_id: data.designId,
        explanation: data.explanation,
      });
    }

    // ── Export existing carousel as PDF ──
    if (action === "export_pdf") {
      const res = await fetch(`${INFINIXUI_BASE_URL}/api/carousel/export-pdf`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId: project_id }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`InfinixUI export error (${res.status}): ${err}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "InfinixUI: echec de l'export PDF");
      }

      return NextResponse.json({
        pdf_url: normalizeUrl(data.pdfUrl),
        slide_images: (data.slideImages || []).map((u: string) => normalizeUrl(u) || u),
      });
    }

    // ── Get available designs, formats, templates from InfinixUI ──
    if (action === "get_config" || action === "get_designs") {
      const res = await fetch(`${INFINIXUI_BASE_URL}/api/config`, { headers });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`InfinixUI config error (${res.status}): ${err}`);
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Action non supportee" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[agents/infinixui] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
