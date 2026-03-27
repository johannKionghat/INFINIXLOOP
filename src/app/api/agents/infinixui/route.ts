import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const body = await request.json();
    const { action, slides, project_id } = body;

    const apiKey = await getUserKey(user.id, "infinixui_api_key");
    const baseUrl = (await getUserKey(user.id, "infinixui_base_url")) || "https://infinixui.com";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Cle API InfinixUI manquante. Configurez-la dans Parametres." },
        { status: 400 },
      );
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    // ── Create a carousel via InfinixUI /api/carousel/generate ──
    if (action === "create_carousel") {
      // The runner sends raw carousel data (from LLM).
      // Map it to InfinixUI's expected format.
      const carouselInput = Array.isArray(slides) ? { slides } : (slides || {});

      const payload = {
        title: carouselInput.title || "Carrousel",
        subtitle: carouselInput.subtitle || "",
        author: carouselInput.author || "",
        slides: (carouselInput.slides || []).map((s: Record<string, unknown>, i: number) => ({
          label: s.label || `POINT #${i + 1}`,
          title: s.title || "",
          body: s.body || s.content || s.text || "",
          tip: s.tip || s.conseil || "",
        })),
        templateId: carouselInput.templateId || "carousel-minimal",
        format: carouselInput.format || "li",
        design: carouselInput.design || null,
        tag: carouselInput.tag || "",
        statTitle: carouselInput.statTitle || carouselInput.stat_title || "",
        statNumber: carouselInput.statNumber || carouselInput.stat_number || "",
        statLabel: carouselInput.statLabel || carouselInput.stat_label || "",
        statSource: carouselInput.statSource || carouselInput.stat_source || "",
        ctaTitle: carouselInput.ctaTitle || carouselInput.cta_title || "",
        ctaBody: carouselInput.ctaBody || carouselInput.cta_body || "",
        ctaBtn: carouselInput.ctaBtn || carouselInput.cta_btn || "",
        ctaUrl: carouselInput.ctaUrl || carouselInput.cta_url || "",
        highlight: carouselInput.highlight || "",
        colorPalette: carouselInput.colorPalette || undefined,
      };

      const res = await fetch(`${baseUrl}/api/carousel/generate`, {
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

      return NextResponse.json({
        project_id: data.id,
        editor_url: data.studioUrl || `${baseUrl}/editor/${data.id}`,
        pdf_url: data.pdfUrl || null,
        preview_url: data.previewUrl || null,
        slide_images: data.slideImages || [],
      });
    }

    // ── Export existing carousel as PDF via /api/carousel/export-pdf ──
    if (action === "export_pdf") {
      const res = await fetch(`${baseUrl}/api/carousel/export-pdf`, {
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
        pdf_url: data.pdfUrl,
        slide_images: data.slideImages || [],
      });
    }

    // ── Get available config (templates, formats, designs) ──
    if (action === "get_config") {
      const res = await fetch(`${baseUrl}/api/config`, { headers });
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
