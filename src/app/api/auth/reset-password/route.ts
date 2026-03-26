import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caracteres" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: resetRow, error: fetchError } = await supabase
      .from("password_resets")
      .select("*")
      .eq("email", email)
      .eq("token", code)
      .eq("used", false)
      .single();

    if (fetchError || !resetRow) {
      return NextResponse.json({ error: "Code invalide ou expire" }, { status: 400 });
    }

    if (new Date(resetRow.expires_at) < new Date()) {
      await supabase.from("password_resets").update({ used: true }).eq("id", resetRow.id);
      return NextResponse.json({ error: "Ce code a expire. Veuillez refaire une demande." }, { status: 400 });
    }

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers({
      filter: { email },
    } as Parameters<typeof supabase.auth.admin.listUsers>[0]);
    if (listError) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    const user = users.users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
    });

    if (updateError) {
      return NextResponse.json({ error: "Erreur lors de la mise a jour du mot de passe" }, { status: 500 });
    }

    await supabase.from("password_resets").update({ used: true }).eq("id", resetRow.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
