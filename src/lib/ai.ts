interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIChatOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export async function aiChat(options: AIChatOptions): Promise<string> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(options),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `AI error (${res.status})`);
  }
  return data.content;
}

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

  // Attempt 2: escape unescaped newlines/tabs/returns inside JSON string values
  try {
    const cleaned = jsonStr.replace(
      /"(?:[^"\\]|\\.)*"/g,
      (m) => m
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t"),
    );
    return JSON.parse(cleaned);
  } catch { /* continue */ }

  // Attempt 3: aggressive cleanup — fix common LLM JSON errors
  try {
    let fixed = jsonStr;
    // Remove trailing commas before } or ]
    fixed = fixed.replace(/,\s*([}\]])/g, "$1");
    // Fix unescaped newlines inside strings (process char by char)
    fixed = fixJsonStrings(fixed);
    return JSON.parse(fixed);
  } catch { /* continue */ }

  // Attempt 4: extract just the JSON object between first { and last }
  try {
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start !== -1 && end > start) {
      let sub = jsonStr.slice(start, end + 1);
      sub = sub.replace(/,\s*([}\]])/g, "$1");
      sub = fixJsonStrings(sub);
      return JSON.parse(sub);
    }
  } catch { /* continue */ }

  // All attempts failed — throw with context
  throw new Error(
    `Impossible de parser le JSON du LLM. Debut de la reponse: "${jsonStr.slice(0, 200)}..."`,
  );
}

/**
 * Walk through a JSON string and escape unescaped special chars inside string values.
 * Handles the common LLM issue of putting literal newlines, tabs, or unescaped quotes
 * inside JSON string values.
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
      // Escape chars that are invalid inside JSON strings
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
