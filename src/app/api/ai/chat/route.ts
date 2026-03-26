import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
}

function getProvider(model: string): string {
  if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3")) return "openai";
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("mistral-")) return "mistral";
  // Groq models: llama, mixtral, gemma, etc.
  return "groq";
}

const PROVIDER_CONFIG: Record<string, { url: string; keyName: string }> = {
  openai: { url: "https://api.openai.com/v1/chat/completions", keyName: "openai_api_key" },
  anthropic: { url: "https://api.anthropic.com/v1/messages", keyName: "anthropic_api_key" },
  mistral: { url: "https://api.mistral.ai/v1/chat/completions", keyName: "mistral_api_key" },
  groq: { url: "https://api.groq.com/openai/v1/chat/completions", keyName: "groq_api_key" },
};

async function callOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  responseFormat?: { type: string },
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (responseFormat) {
    body.response_format = responseFormat;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${model} API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const userMessages = messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
  };
  if (systemMsg) {
    body.system = systemMsg.content;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
  return textBlock?.text || "";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { model, messages, temperature = 0.7, max_tokens = 4096, response_format } = body;

    if (!model || !messages?.length) {
      return NextResponse.json({ error: "model and messages required" }, { status: 400 });
    }

    const provider = getProvider(model);
    const providerConf = PROVIDER_CONFIG[provider];
    if (!providerConf) {
      return NextResponse.json({ error: `Unknown provider for model: ${model}` }, { status: 400 });
    }

    // Fetch API key from user settings
    const { data: keyRow } = await supabase
      .from("user_api_keys")
      .select("key_value")
      .eq("user_id", user.id)
      .eq("key_name", providerConf.keyName)
      .single();

    const apiKey = keyRow?.key_value;
    if (!apiKey) {
      return NextResponse.json(
        { error: `Cle API manquante pour ${provider}. Configurez-la dans Parametres.` },
        { status: 400 },
      );
    }

    let content: string;
    if (provider === "anthropic") {
      content = await callAnthropic(apiKey, model, messages, temperature, max_tokens);
    } else {
      content = await callOpenAICompatible(providerConf.url, apiKey, model, messages, temperature, max_tokens, response_format);
    }

    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ai/chat] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
