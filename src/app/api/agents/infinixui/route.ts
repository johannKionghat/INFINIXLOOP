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
    const baseUrl = (await getUserKey(user.id, "infinixui_base_url")) || "https://api.infinixui.com";

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

    // Create a carousel project
    if (action === "create_carousel") {
      const res = await fetch(`${baseUrl}/v1/carousels`, {
        method: "POST",
        headers,
        body: JSON.stringify({ slides, format: "linkedin", export_pdf: true }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`InfinixUI API error (${res.status}): ${err}`);
      }
      const data = await res.json();
      return NextResponse.json({
        project_id: data.project_id || data.id,
        editor_url: data.editor_url || `${baseUrl.replace("api.", "")}/editor/${data.project_id || data.id}`,
        pdf_url: data.pdf_url,
        preview_url: data.preview_url,
      });
    }

    // Export existing project as PDF
    if (action === "export_pdf") {
      const res = await fetch(`${baseUrl}/v1/carousels/${project_id}/export`, {
        method: "POST",
        headers,
        body: JSON.stringify({ format: "pdf" }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`InfinixUI export error (${res.status}): ${err}`);
      }
      const data = await res.json();
      return NextResponse.json({ pdf_url: data.pdf_url });
    }

    // Get project details
    if (action === "get_project") {
      const res = await fetch(`${baseUrl}/v1/carousels/${project_id}`, { headers });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`InfinixUI error (${res.status}): ${err}`);
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
