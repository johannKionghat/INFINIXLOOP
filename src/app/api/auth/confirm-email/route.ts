import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function buildRedirect(request: Request, path: string): string {
  const origin = new URL(request.url).origin;
  return `${origin}${path}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(buildRedirect(request, "/confirm-email?status=error&message=Token+manquant"));
  }

  try {
    const supabase = createAdminClient();

    // Find the token
    const { data: row, error: fetchError } = await supabase
      .from("email_confirmations")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (fetchError || !row) {
      return NextResponse.redirect(buildRedirect(request, "/confirm-email?status=error&message=Lien+invalide+ou+deja+utilise"));
    }

    // Check expiry
    if (new Date(row.expires_at) < new Date()) {
      await supabase.from("email_confirmations").update({ used: true }).eq("id", row.id);
      return NextResponse.redirect(buildRedirect(request, "/confirm-email?status=error&message=Ce+lien+a+expire"));
    }

    // Confirm user via admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(row.user_id, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.redirect(buildRedirect(request, "/confirm-email?status=error&message=Erreur+de+confirmation"));
    }

    // Mark token as used
    await supabase.from("email_confirmations").update({ used: true }).eq("id", row.id);

    return NextResponse.redirect(buildRedirect(request, "/confirm-email?status=success"));
  } catch {
    return NextResponse.redirect(buildRedirect(request, "/confirm-email?status=error&message=Erreur+serveur"));
  }
}
