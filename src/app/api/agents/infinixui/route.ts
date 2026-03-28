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

    // Read user's preferred InfinixUI AI model from their saved keys
    const aiProvider = await getUserKey(user.id, "infinixui_ai_provider");
    const aiModel = await getUserKey(user.id, "infinixui_ai_model");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // ── Create a carousel via InfinixUI ──
    if (action === "create_carousel") {
      if (!prompt || typeof prompt !== "string") {
        return NextResponse.json(
          { error: "Un prompt est requis pour generer le carrousel." },
          { status: 400 },
        );
      }

      const fmt = format || "li";

      // Send prompt for new InfinixUI (LLM-based) + structured fallback for old InfinixUI
      // Old InfinixUI ignores "prompt" and uses the structured fields as CarouselData
      const payload = {
        // New InfinixUI: prompt-based generation
        prompt,
        format: fmt,
        userId: user.id,
        // Pass user's preferred AI model so InfinixUI uses it instead of its default
        ...(aiProvider && { provider: aiProvider }),
        ...(aiModel && { modelId: aiModel }),
        // Structured fallback for old InfinixUI (legacy NoticeAI format with slides[].num)
        title: prompt.slice(0, 80),
        subtitle: "Genere par InfinixLoop",
        author: "",
        tag: "InfinixLoop",
        design: body.suggestedDesign || "tech",
        slides: [
          { num: "01", title: "Introduction", body: prompt.slice(0, 150), tip: "" },
          { num: "02", title: "Point cle", body: prompt.slice(150, 300) || "Contenu a editer dans le studio", tip: "" },
          { num: "03", title: "A retenir", body: "Ouvrez le studio InfinixUI pour personnaliser ce carrousel", tip: "" },
        ],
        stat_number: "100%",
        stat_label: "Personnalisable dans le studio InfinixUI",
        stat_source: "InfinixUI — " + new Date().getFullYear(),
        cta_title: "Decouvrir plus",
        cta_body: "Modifiez ce carrousel dans le studio InfinixUI",
        cta_btn: "Ouvrir le studio",
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
      const studioParams = new URLSearchParams({ session: sessionId, format: fmt });
      const designId = data.designId || body.suggestedDesign || "tech";
      studioParams.set("design", designId);
      const studioUrl = `${INFINIXUI_BASE_URL}/carousel/studio?${studioParams}`;

      return NextResponse.json({
        project_id: data.id,
        editor_url: studioUrl,
        pdf_url: normalizeUrl(data.pdfUrl),
        preview_url: normalizeUrl(data.previewUrl),
        slide_images: (data.slideImages || []).map((u: string) => normalizeUrl(u) || u),
        design_id: designId,
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

    // ── Get available AI providers + models from InfinixUI ──
    if (action === "get_ai_models") {
      const res = await fetch(`${INFINIXUI_BASE_URL}/api/ai/models`, { headers });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`InfinixUI models error (${res.status}): ${err}`);
      }
      const data = await res.json();
      return NextResponse.json(data);
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

    // ── Get a short-lived login token to auto-connect the user to InfinixUI ──
    if (action === "get_login_token") {
      const studioUrl: string = body.studio_url;
      if (!studioUrl) return NextResponse.json({ error: "studio_url requis" }, { status: 400 });

      try {
        const res = await fetch(`${INFINIXUI_BASE_URL}/api/auth/cross-app-token`, {
          method: "POST",
          headers,
        });

        if (!res.ok) {
          // Non-blocking: return URL as-is if token generation fails
          return NextResponse.json({ studio_url: studioUrl });
        }

        const data = await res.json();
        const url = new URL(studioUrl);
        url.searchParams.set("xat", data.token);
        return NextResponse.json({ studio_url: url.toString() });
      } catch {
        return NextResponse.json({ studio_url: studioUrl });
      }
    }

    return NextResponse.json({ error: "Action non supportee" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[agents/infinixui] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
