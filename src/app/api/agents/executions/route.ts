import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/agents/executions?id=xxx — get execution by ID or list pending
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("agent_executions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return NextResponse.json({ execution: data });
    }

    // List awaiting confirmation
    const { data, error } = await supabase
      .from("agent_executions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "awaiting_confirmation")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ executions: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/agents/executions — create or update execution
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    // Create new execution
    if (action === "create") {
      const { agent_id, context, generated_content, steps, confirmation_channel } = body;
      const { data, error } = await supabase
        .from("agent_executions")
        .insert({
          user_id: user.id,
          agent_id,
          status: "awaiting_confirmation",
          context: context || {},
          generated_content: generated_content || {},
          steps: steps || [],
          confirmation_channel: confirmation_channel || null,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ execution: data });
    }

    // Confirm execution
    if (action === "confirm") {
      const { id, user_modifications } = body;
      const { data, error } = await supabase
        .from("agent_executions")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          user_modifications: user_modifications || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ execution: data });
    }

    // Cancel execution
    if (action === "cancel") {
      const { id } = body;
      const { data, error } = await supabase
        .from("agent_executions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ execution: data });
    }

    // Complete execution
    if (action === "complete") {
      const { id } = body;
      const { data, error } = await supabase
        .from("agent_executions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ execution: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
