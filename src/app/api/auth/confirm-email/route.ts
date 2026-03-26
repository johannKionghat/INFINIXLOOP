import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: row, error: fetchError } = await supabase
      .from("email_confirmations")
      .select("*")
      .eq("email", email)
      .eq("token", code)
      .eq("used", false)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Code invalide ou deja utilise" }, { status: 400 });
    }

    if (new Date(row.expires_at) < new Date()) {
      await supabase.from("email_confirmations").update({ used: true }).eq("id", row.id);
      return NextResponse.json({ error: "Ce code a expire. Veuillez vous reinscrire." }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(row.user_id, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.json({ error: "Erreur de confirmation" }, { status: 500 });
    }

    await supabase.from("email_confirmations").update({ used: true }).eq("id", row.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
