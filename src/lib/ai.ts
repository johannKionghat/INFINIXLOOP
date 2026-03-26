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

  // Remove bad control characters that LLMs sometimes produce (tabs/newlines inside JSON strings)
  // Replace literal control chars (0x00-0x1F except \n \r \t) that break JSON.parse
  jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Second attempt: escape unescaped newlines/tabs inside JSON string values
    const cleaned = jsonStr.replace(
      /"(?:[^"\\]|\\.)*"/g,
      (match) => match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"),
    );
    return JSON.parse(cleaned);
  }
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
