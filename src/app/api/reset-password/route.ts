import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caracteres" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find the token
    const { data: resetRow, error: fetchError } = await supabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (fetchError || !resetRow) {
      return NextResponse.json({ error: "Lien invalide ou expire" }, { status: 400 });
    }

    // Check expiry
    if (new Date(resetRow.expires_at) < new Date()) {
      await supabase.from("password_resets").update({ used: true }).eq("id", resetRow.id);
      return NextResponse.json({ error: "Ce lien a expire. Veuillez refaire une demande." }, { status: 400 });
    }

    // Find user by email — filtered lookup instead of loading ALL users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers({
      filter: { email: resetRow.email },
    } as Parameters<typeof supabase.auth.admin.listUsers>[0]);
    if (listError) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    const user = users.users.find((u) => u.email === resetRow.email);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 400 });
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
    });

    if (updateError) {
      return NextResponse.json({ error: "Erreur lors de la mise a jour du mot de passe" }, { status: 500 });
    }

    // Mark token as used
    await supabase.from("password_resets").update({ used: true }).eq("id", resetRow.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
