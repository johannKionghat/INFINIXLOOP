import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface NotifyRequest {
  channel: "email" | "slack" | "notion";
  execution_id: string;
  subject: string;
  content: string;
  preview_url?: string;
  carousel_url?: string;
  image_url?: string;
}

async function getUserKeys(userId: string): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_api_keys")
    .select("key_name, key_value")
    .eq("user_id", userId);
  const keys: Record<string, string> = {};
  for (const row of data || []) {
    keys[row.key_name] = row.key_value;
  }
  return keys;
}

// ── Email via Brevo ─────────────────────────────────────────────────────────

async function sendEmailNotification(
  keys: Record<string, string>,
  subject: string,
  htmlContent: string,
): Promise<void> {
  const apiKey = keys.brevo_api_key;
  const senderEmail = keys.brevo_sender_email;
  const recipients = keys.brevo_recipients;
  if (!apiKey) throw new Error("Cle manquante : brevo_api_key");
  if (!senderEmail) throw new Error("Cle manquante : brevo_sender_email");
  if (!recipients) throw new Error("Cle manquante : brevo_recipients");

  const to = recipients.split(",").map((e: string) => ({ email: e.trim() }));

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: "InfinixLoop Agent" },
      to,
      subject,
      htmlContent,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API error (${res.status}): ${err}`);
  }
}

// ── Slack ────────────────────────────────────────────────────────────────────

async function sendSlackNotification(
  keys: Record<string, string>,
  subject: string,
  content: string,
  previewUrl?: string,
): Promise<void> {
  const webhookUrl = keys.slack_webhook_url;
  if (!webhookUrl) throw new Error("Cle manquante : slack_webhook_url");

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: subject },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: content.slice(0, 3000) },
    },
  ];

  if (previewUrl) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `<${previewUrl}|Voir et valider le contenu>` },
    });
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });
  if (!res.ok) throw new Error(`Slack POST failed (${res.status})`);
}

// ── Notion ──────────────────────────────────────────────────────────────────

async function sendNotionNotification(
  keys: Record<string, string>,
  subject: string,
  content: string,
  metadata?: Record<string, string>,
): Promise<string> {
  const token = keys.notion_integration_token;
  const dbId = keys.notion_database_id;
  if (!token) throw new Error("Cle manquante : notion_integration_token");
  if (!dbId) throw new Error("Cle manquante : notion_database_id");

  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: subject } }] },
    Status: { select: { name: "En attente de validation" } },
  };
  if (metadata?.executionId) {
    properties["Execution ID"] = { rich_text: [{ text: { content: metadata.executionId } }] };
  }

  const children = [
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ text: { content: "Contenu genere" } }] },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: [{ text: { content: content.slice(0, 2000) } }] },
    },
  ];

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties,
      children,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.id;
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: NotifyRequest = await request.json();
    const { channel, execution_id, subject, content, preview_url, carousel_url, image_url } = body;

    if (!channel || !execution_id || !subject) {
      return NextResponse.json({ error: "channel, execution_id, and subject required" }, { status: 400 });
    }

    const keys = await getUserKeys(user.id);

    // Build app URL for validation
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const validationUrl = `${appBaseUrl}/webmaster?confirm=${execution_id}`;

    switch (channel) {
      case "email": {
        const htmlContent = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#1a1a1a;">${subject}</h2>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
              <pre style="white-space:pre-wrap;font-size:14px;line-height:1.6;">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
            </div>
            ${image_url ? `<img src="${image_url}" style="max-width:100%;border-radius:8px;margin:16px 0;" />` : ""}
            ${carousel_url ? `<p><a href="${carousel_url}" style="color:#2563eb;">Voir le carrousel sur InfinixUI</a></p>` : ""}
            <div style="margin:24px 0;">
              <a href="${validationUrl}" style="display:inline-block;background:#1a1a1a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
                Valider ou modifier le contenu
              </a>
            </div>
            <p style="color:#6b7280;font-size:12px;">InfinixLoop Agent Webmaster</p>
          </div>`;
        await sendEmailNotification(keys, subject, htmlContent);
        break;
      }
      case "slack": {
        const slackContent = `${content.slice(0, 2500)}\n\n${carousel_url ? `Carrousel: ${carousel_url}\n` : ""}${image_url ? `Image: ${image_url}\n` : ""}`;
        await sendSlackNotification(keys, subject, slackContent, validationUrl);
        break;
      }
      case "notion": {
        const fullContent = `${content}\n\n${carousel_url ? `Carrousel InfinixUI: ${carousel_url}\n` : ""}${image_url ? `Image: ${image_url}` : ""}`;
        await sendNotionNotification(keys, subject, fullContent, { executionId: execution_id });
        break;
      }
      default:
        return NextResponse.json({ error: `Canal non supporte: ${channel}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, channel });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[agents/notify] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
