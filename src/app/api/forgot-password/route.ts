import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    const user = users.users.find((u) => u.email === email);
    if (!user) {
      // Don't reveal that user doesn't exist — return success anyway
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Invalidate previous tokens for this email
    await supabase
      .from("password_resets")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Store token
    const { error: insertError } = await supabase
      .from("password_resets")
      .insert({ email, token, expires_at: expiresAt });

    if (insertError) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Build reset link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetLink = `${siteUrl}/reset-password?token=${token}`;

    // Send email via Brevo
    const brevoKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@infinixloop.com";
    const senderName = process.env.BREVO_SENDER_NAME || "InfinixLoop";

    if (!brevoKey) {
      return NextResponse.json({ error: "Configuration email manquante" }, { status: 500 });
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": brevoKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        subject: "Reinitialisation de votre mot de passe - InfinixLoop",
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: #0a0a0a; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold; font-size: 18px;">∞</span>
              </div>
            </div>
            <h1 style="font-size: 20px; font-weight: 700; color: #0a0a0a; text-align: center; margin-bottom: 12px;">
              Reinitialisation du mot de passe
            </h1>
            <p style="font-size: 14px; color: #6b7280; text-align: center; line-height: 1.6; margin-bottom: 32px;">
              Vous avez demande a reinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: #0a0a0a; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 600;">
                Reinitialiser mon mot de passe
              </a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5;">
              Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
            </p>
            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 32px 0 16px;" />
            <p style="font-size: 11px; color: #d1d5db; text-align: center;">
              InfinixLoop &mdash; Plateforme d'agents IA
            </p>
          </div>
        `,
      }),
    });

    if (!brevoRes.ok) {
      return NextResponse.json({ error: "Erreur d'envoi de l'email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
