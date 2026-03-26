interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIChatOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  responseFormat?: "json" | "text";
}

export async function aiChat(options: AIChatOptions): Promise<string> {
  const { responseFormat, ...rest } = options;
  const payload: Record<string, unknown> = { ...rest };
  if (responseFormat === "json") {
    payload.response_format = { type: "json_object" };
  }
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `AI error (${res.status})`);
  }
  return data.content;
}

/**
 * Call aiChat and parse the JSON response. If parsing fails, auto-retry once
 * by sending the raw response back to the LLM with a "fix your JSON" prompt.
 */
export async function aiChatJSON<T>(options: AIChatOptions): Promise<T> {
  const raw = await aiChat({ ...options, responseFormat: "json" });

  // First try: parse directly
  try {
    return parseJSON<T>(raw);
  } catch (firstError) {
    // Auto-retry: ask the LLM to fix its own JSON
    console.warn("[aiChatJSON] Parse failed, retrying with fix prompt. Error:", firstError);
    try {
      const fixRaw = await aiChat({
        model: options.model,
        messages: [
          {
            role: "system",
            content: "Tu es un correcteur JSON. L'utilisateur te donne une reponse JSON invalide. Corrige-la et renvoie UNIQUEMENT le JSON valide corrige. Aucun texte avant ou apres. Aucun bloc markdown. Juste le JSON brut.",
          },
          {
            role: "user",
            content: `Cette reponse JSON est invalide. Corrige-la et renvoie UNIQUEMENT le JSON valide :\n\n${raw}`,
          },
        ],
        temperature: 0,
        max_tokens: options.max_tokens || 4096,
      });
      return parseJSON<T>(fixRaw);
    } catch {
      // Both attempts failed — throw with full raw response for debugging
      const preview = raw.length > 800 ? raw.slice(0, 800) + `\n\n... [TRONQUE — ${raw.length} chars total]` : raw;
      throw new Error(`JSON invalide apres retry. Reponse LLM complete :\n${preview}`);
    }
  }
}

// ── JSON Parser (multi-attempt) ─────────────────────────────────────────────

export function parseJSON<T>(raw: string): T {
  // Extract JSON from markdown code blocks if present
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonStr = match ? match[1].trim() : raw.trim();

  // If the string doesn't start with { or [, try to find the first JSON object
  if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[")) {
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    }
  }

  // Remove bad control characters (0x00-0x1F except \n \r \t)
  jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  // Attempt 1: direct parse
  try {
    return JSON.parse(jsonStr);
  } catch { /* continue */ }

  // Attempt 2: fix unescaped chars inside string values (char-by-char walk)
  try {
    let fixed = fixJsonStrings(jsonStr);
    fixed = fixed.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(fixed);
  } catch { /* continue */ }

  // Attempt 3: extract between first { and last }, then fix
  try {
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start !== -1 && end > start) {
      let sub = jsonStr.slice(start, end + 1);
      sub = fixJsonStrings(sub);
      sub = sub.replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(sub);
    }
  } catch { /* continue */ }

  // All attempts failed
  throw new Error(`JSON parse error. Raw (${jsonStr.length} chars): ${jsonStr.slice(0, 500)}`);
}

/**
 * Walk through a JSON string char-by-char and escape unescaped special chars
 * inside string values. Handles literal newlines, tabs, carriage returns,
 * and other common LLM JSON issues.
 */
function fixJsonStrings(json: string): string {
  const result: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (escaped) {
      result.push(ch);
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      result.push(ch);
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result.push(ch);
      continue;
    }

    if (inString) {
      if (ch === "\n") { result.push("\\n"); continue; }
      if (ch === "\r") { result.push("\\r"); continue; }
      if (ch === "\t") { result.push("\\t"); continue; }
    }

    result.push(ch);
  }

  return result.join("");
}

// ── Model registry ──────────────────────────────────────────────────────────

export interface AIModel {
  id: string;
  label: string;
  provider: "openai" | "anthropic" | "mistral" | "groq";
  tier: "premium" | "standard" | "free";
}

export const AI_MODELS: AIModel[] = [
  // OpenAI
  { id: "gpt-4.1", label: "GPT-4.1", provider: "openai", tier: "premium" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 Mini", provider: "openai", tier: "standard" },
  { id: "gpt-4.1-nano", label: "GPT-4.1 Nano", provider: "openai", tier: "standard" },
  { id: "gpt-4o", label: "GPT-4o", provider: "openai", tier: "premium" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai", tier: "standard" },
  // Anthropic
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "anthropic", tier: "premium" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", provider: "anthropic", tier: "standard" },
  // Mistral
  { id: "mistral-large-latest", label: "Mistral Large", provider: "mistral", tier: "premium" },
  { id: "mistral-small-latest", label: "Mistral Small", provider: "mistral", tier: "standard" },
  // Groq (free)
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)", provider: "groq", tier: "free" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Groq)", provider: "groq", tier: "free" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B (Groq)", provider: "groq", tier: "free" },
];

export function getModelLabel(id: string): string {
  return AI_MODELS.find((m) => m.id === id)?.label || id;
}
