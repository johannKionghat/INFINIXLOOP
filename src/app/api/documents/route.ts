import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/documents — list user documents
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const agentId = url.searchParams.get("agent_id");

    let query = supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (type) query = query.eq("type", type);
    if (agentId) query = query.eq("agent_id", agentId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ documents: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/documents — create a document
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { agent_id, type, title, description, file_url, content, metadata, infinixui_project_id } = body;

    if (!agent_id || !type || !title) {
      return NextResponse.json({ error: "agent_id, type, and title required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        agent_id,
        type,
        title,
        description: description || null,
        file_url: file_url || null,
        content: content || {},
        metadata: metadata || {},
        infinixui_project_id: infinixui_project_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ document: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
