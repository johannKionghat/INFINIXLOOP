import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_api_keys")
    .select("key_name, key_value")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const keys: Record<string, string> = {};
  for (const row of data || []) {
    keys[row.key_name] = row.key_value;
  }

  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const keys: Record<string, string> = body.keys || {};

  const upserts = Object.entries(keys).map(([key_name, key_value]) => ({
    user_id: user.id,
    key_name,
    key_value: key_value as string,
    updated_at: new Date().toISOString(),
  }));

  if (upserts.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from("user_api_keys")
    .upsert(upserts, { onConflict: "user_id,key_name" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
