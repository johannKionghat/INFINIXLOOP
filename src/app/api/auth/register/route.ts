import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN!,
    pass: process.env.BREVO_SMTP_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caracteres" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const exists = existingUsers?.users.find((u) => u.email === email);
    if (exists) {
      return NextResponse.json({ error: "Un compte existe deja avec cet email" }, { status: 400 });
    }

    // Create user via admin API (email_confirm: false — we handle confirmation ourselves)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: name },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Generate confirmation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const { error: insertError } = await supabase
      .from("email_confirmations")
      .insert({ user_id: newUser.user.id, email, token, expires_at: expiresAt });

    if (insertError) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Build confirmation link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const confirmLink = `${siteUrl}/api/auth/confirm-email?token=${token}`;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@infinixloop.com";
    const senderName = process.env.BREVO_SENDER_NAME || "InfinixLoop";

    // Send confirmation email via Brevo SMTP
    await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: email,
      subject: "Confirmez votre compte InfinixLoop",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #0a0a0a; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: bold; font-size: 18px;">&infin;</span>
            </div>
          </div>
          <h1 style="font-size: 20px; font-weight: 700; color: #0a0a0a; text-align: center; margin-bottom: 12px;">
            Bienvenue ${name} !
          </h1>
          <p style="font-size: 14px; color: #6b7280; text-align: center; line-height: 1.6; margin-bottom: 32px;">
            Merci de vous etre inscrit sur InfinixLoop. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${confirmLink}" style="display: inline-block; padding: 12px 32px; background: #0a0a0a; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 600;">
              Confirmer mon email
            </a>
          </div>
          <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5;">
            Ce lien expire dans 24 heures. Si vous n'avez pas cree de compte, ignorez cet email.
          </p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 32px 0 16px;" />
          <p style="font-size: 11px; color: #d1d5db; text-align: center;">
            InfinixLoop &mdash; Plateforme d'agents IA
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, needsConfirmation: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[register] Error:", message);
    return NextResponse.json({ error: "Erreur serveur: " + message }, { status: 500 });
  }
}
