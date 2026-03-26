import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/agents/config?agent_id=webmaster
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agent_id");
    if (!agentId) {
      return NextResponse.json({ error: "agent_id required" }, { status: 400 });
    }

    const { data } = await supabase
      .from("agent_configs")
      .select("config, updated_at")
      .eq("user_id", user.id)
      .eq("agent_id", agentId)
      .single();

    if (!data) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({ config: data.config, updatedAt: data.updated_at });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[agents/config] GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/agents/config
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agent_id, config } = await request.json();
    if (!agent_id || !config) {
      return NextResponse.json({ error: "agent_id and config required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("agent_configs")
      .upsert(
        {
          user_id: user.id,
          agent_id,
          config,
          is_active: true,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,agent_id" },
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[agents/config] POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
