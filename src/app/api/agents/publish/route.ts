import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PublishRequest {
  platform: string;
  content: string;
  hashtags?: string[];
  thread?: string[];
  imageUrl?: string;
  pdfUrl?: string;        // LinkedIn document (carousel) post
  carouselTitle?: string; // Title for the LinkedIn document post
}

// ── Fetch user API keys ─────────────────────────────────────────────────────

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

// ── LinkedIn ────────────────────────────────────────────────────────────────

async function publishLinkedin(
  keys: Record<string, string>,
  content: string,
  imageUrl?: string,
  pdfUrl?: string,
  carouselTitle?: string,
): Promise<{ postId?: string }> {
  const token = keys.linkedin_access_token;
  const authorUrn = keys.linkedin_person_urn;
  if (!token) throw new Error("Cle manquante : linkedin_access_token. Configurez-la dans Parametres.");
  if (!authorUrn) throw new Error("Cle manquante : linkedin_person_urn. Configurez-la dans Parametres.");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": "202602",
    "X-Restli-Protocol-Version": "2.0.0",
  };

  const body: Record<string, unknown> = {
    author: authorUrn,
    commentary: content,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
  };

  // ── PDF carousel document post (LinkedIn document) ──
  if (pdfUrl) {
    // Step 1: Initialize document upload
    const initRes = await fetch("https://api.linkedin.com/rest/documents?action=initializeUpload", {
      method: "POST",
      headers,
      body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
    });
    if (!initRes.ok) {
      const err = await initRes.text();
      throw new Error(`LinkedIn document init failed (${initRes.status}): ${err}`);
    }
    const initData = await initRes.json();
    const uploadUrl = initData.value?.uploadUrl;
    const documentId = initData.value?.document;

    // Step 2: Download PDF
    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) throw new Error(`Impossible de telecharger le PDF: ${pdfUrl}`);
    const pdfBuffer = await pdfRes.arrayBuffer();

    // Step 3: Upload PDF binary to LinkedIn
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/pdf" },
      body: pdfBuffer,
    });
    if (!uploadRes.ok) throw new Error(`LinkedIn PDF upload failed (${uploadRes.status})`);

    // Attach document to post
    body.content = { media: { title: carouselTitle || "Carrousel", id: documentId } };

  // ── Image post ──
  } else if (imageUrl) {
    const initRes = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
      method: "POST",
      headers,
      body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
    });
    if (!initRes.ok) {
      const err = await initRes.text();
      throw new Error(`LinkedIn image init failed (${initRes.status}): ${err}`);
    }
    const initData = await initRes.json();
    const uploadUrl = initData.value?.uploadUrl;
    const imageId = initData.value?.image;

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Impossible de telecharger l'image: ${imageUrl}`);
    const imgBuffer = await imgRes.arrayBuffer();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/octet-stream" },
      body: imgBuffer,
    });
    if (!uploadRes.ok) throw new Error(`LinkedIn image upload failed (${uploadRes.status})`);

    body.content = { media: { title: "Image", id: imageId } };
  }

  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn POST failed (${res.status}): ${err}`);
  }

  const postId = res.headers.get("x-restli-id") || undefined;
  return { postId };
}

// ── Twitter / X ─────────────────────────────────────────────────────────────

async function publishTwitter(
  keys: Record<string, string>,
  content: string,
  thread?: string[],
): Promise<{ tweetId?: string }> {
  const token = keys.twitter_bearer_token;
  if (!token) throw new Error("Cle manquante : twitter_bearer_token. Configurez-la dans Parametres.");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Post first tweet
  const firstRes = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers,
    body: JSON.stringify({ text: content.slice(0, 280) }),
  });
  if (!firstRes.ok) {
    const err = await firstRes.text();
    throw new Error(`Twitter POST failed (${firstRes.status}): ${err}`);
  }
  const firstData = await firstRes.json();
  let lastTweetId = firstData.data?.id;

  // Post thread replies
  if (thread?.length && lastTweetId) {
    for (const tweet of thread) {
      const replyRes = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: tweet.slice(0, 280), reply: { in_reply_to_tweet_id: lastTweetId } }),
      });
      if (replyRes.ok) {
        const replyData = await replyRes.json();
        lastTweetId = replyData.data?.id || lastTweetId;
      }
    }
  }

  return { tweetId: firstData.data?.id };
}

// ── Facebook ────────────────────────────────────────────────────────────────

async function publishFacebook(
  keys: Record<string, string>,
  content: string,
  imageUrl?: string,
): Promise<{ postId?: string }> {
  const token = keys.facebook_page_access_token;
  const pageId = keys.facebook_page_id;
  if (!token) throw new Error("Cle manquante : facebook_page_access_token. Configurez-la dans Parametres.");
  if (!pageId) throw new Error("Cle manquante : facebook_page_id. Configurez-la dans Parametres.");

  let endpoint: string;
  let body: Record<string, string>;

  if (imageUrl) {
    endpoint = `https://graph.facebook.com/v20.0/${pageId}/photos`;
    body = { url: imageUrl, caption: content, access_token: token };
  } else {
    endpoint = `https://graph.facebook.com/v20.0/${pageId}/feed`;
    body = { message: content, access_token: token };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook POST failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  return { postId: data.id };
}

// ── Slack ────────────────────────────────────────────────────────────────────

async function publishSlack(
  keys: Record<string, string>,
  content: string,
): Promise<{ ok: boolean }> {
  const webhookUrl = keys.slack_webhook_url;
  if (!webhookUrl) throw new Error("Cle manquante : slack_webhook_url. Configurez-la dans Parametres.");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: content }),
  });
  if (!res.ok) {
    throw new Error(`Slack POST failed (${res.status})`);
  }
  return { ok: true };
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PublishRequest = await request.json();
    const { platform, content, hashtags, thread, imageUrl, pdfUrl, carouselTitle } = body;

    if (!platform || !content) {
      return NextResponse.json({ error: "platform and content required" }, { status: 400 });
    }

    const keys = await getUserKeys(user.id);
    let result: Record<string, unknown>;

    switch (platform) {
      case "linkedin": {
        const fullContent = hashtags?.length
          ? `${content}\n\n${hashtags.join(" ")}`
          : content;
        result = await publishLinkedin(keys, fullContent, imageUrl, pdfUrl, carouselTitle);
        break;
      }
      case "twitter": {
        result = await publishTwitter(keys, content, thread);
        break;
      }
      case "facebook": {
        result = await publishFacebook(keys, content, imageUrl);
        break;
      }
      case "slack": {
        result = await publishSlack(keys, content);
        break;
      }
      default:
        return NextResponse.json(
          { error: `Plateforme "${platform}" non supportee pour la publication automatique. Utilisez le contenu genere pour publier manuellement.` },
          { status: 400 },
        );
    }

    return NextResponse.json({ success: true, platform, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[agents/publish] Error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
