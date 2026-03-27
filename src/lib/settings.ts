const STORAGE_KEY = "infinixloop_api_keys";

export interface ApiKeyField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "password";
  required?: boolean;
  helpText?: string;
  helpUrl?: string;
}

export interface ApiKeySection {
  id: string;
  title: string;
  icon: string;
  description: string;
  fields: ApiKeyField[];
}

export const API_KEY_SECTIONS: ApiKeySection[] = [
  // ── AI Models ─────────────────────────────────────────────────────────────
  {
    id: "openai",
    title: "OpenAI API Key",
    icon: "Sparkles",
    description: "Requise pour l'execution des agents IA",
    fields: [
      {
        key: "openai_api_key",
        label: "API Key",
        placeholder: "sk-...",
        type: "password",
        required: true,
        helpText: "Obtenez votre cle sur",
        helpUrl: "https://platform.openai.com",
      },
    ],
  },
  {
    id: "anthropic",
    title: "Anthropic API Key (Claude)",
    icon: "Brain",
    description: "Pour utiliser les modeles Claude dans vos workflows",
    fields: [
      {
        key: "anthropic_api_key",
        label: "API Key",
        placeholder: "sk-ant-...",
        type: "password",
        helpText: "Obtenez votre cle sur",
        helpUrl: "https://console.anthropic.com",
      },
    ],
  },
  {
    id: "mistral",
    title: "Mistral API Key",
    icon: "Wind",
    description: "Pour utiliser les modeles Mistral (gratuit pour tester)",
    fields: [
      {
        key: "mistral_api_key",
        label: "API Key",
        placeholder: "...",
        type: "password",
        helpText: "Obtenez votre cle gratuite sur",
        helpUrl: "https://console.mistral.ai",
      },
    ],
  },
  {
    id: "groq",
    title: "Groq API Key",
    icon: "Zap",
    description: "Gratuit ! Llama 3.1 8B (30k tok/min), Llama 3.3 70B (6k tok/min), Mixtral 8x7B (5k tok/min)",
    fields: [
      {
        key: "groq_api_key",
        label: "API Key",
        placeholder: "gsk_...",
        type: "password",
        helpText: "Obtenez votre cle gratuite sur",
        helpUrl: "https://console.groq.com",
      },
    ],
  },
  {
    id: "huggingface",
    title: "Hugging Face API Key",
    icon: "ImageIcon",
    description: "Generation d'images IA gratuite (FLUX.1-schnell, Stable Diffusion XL)",
    fields: [
      {
        key: "huggingface_api_key",
        label: "API Key",
        placeholder: "hf_...",
        type: "password",
        helpText: "Optionnel — Obtenez votre cle gratuite sur",
        helpUrl: "https://huggingface.co",
      },
    ],
  },

  // ── Social Media ──────────────────────────────────────────────────────────
  {
    id: "linkedin",
    title: "LinkedIn",
    icon: "Briefcase",
    description: "Publication automatique sur LinkedIn",
    fields: [
      {
        key: "linkedin_access_token",
        label: "Access Token (w_member_social scope)",
        placeholder: "AQV...",
        type: "password",
        helpText: "Obtenez votre token sur",
        helpUrl: "https://linkedin.com/developers",
      },
      {
        key: "linkedin_person_urn",
        label: "Person URN (urn:li:person:XXXX)",
        placeholder: "urn:li:person:...",
        type: "text",
      },
    ],
  },
  {
    id: "twitter",
    title: "Twitter / X",
    icon: "AtSign",
    description: "Publication automatique sur Twitter/X",
    fields: [
      {
        key: "twitter_bearer_token",
        label: "Bearer Token",
        placeholder: "AAAA...",
        type: "password",
        helpText: "Creez votre app sur",
        helpUrl: "https://developer.twitter.com",
      },
    ],
  },
  {
    id: "facebook",
    title: "Facebook",
    icon: "ThumbsUp",
    description: "Publication automatique sur les Pages Facebook",
    fields: [
      {
        key: "facebook_page_access_token",
        label: "Page Access Token",
        placeholder: "EAAxx...",
        type: "password",
      },
      {
        key: "facebook_page_id",
        label: "Page ID",
        placeholder: "123456789",
        type: "text",
      },
    ],
  },

  // ── Messaging ─────────────────────────────────────────────────────────────
  {
    id: "whatsapp_group",
    title: "WhatsApp Groupe (WAHA / Evolution API)",
    icon: "MessageCircle",
    description: "Compatible WAHA (waha.devlike.pro) et Evolution API. Le Group ID se configure dans le noeud Config du workflow.",
    fields: [
      {
        key: "whatsapp_group_url",
        label: "URL Passerelle (ex: http://localhost:3000)",
        placeholder: "http://your-waha-server:3000",
        type: "text",
      },
      {
        key: "whatsapp_group_token",
        label: "API Token (optionnel)",
        placeholder: "votre-token-waha",
        type: "password",
      },
    ],
  },
  {
    id: "whatsapp_business",
    title: "WhatsApp Business (Meta Cloud API)",
    icon: "Phone",
    description: "API officielle Meta Cloud pour WhatsApp Business",
    fields: [
      {
        key: "whatsapp_business_token",
        label: "Business Token (META)",
        placeholder: "EAAxx...",
        type: "password",
        helpText: "Creez votre app sur",
        helpUrl: "https://developers.facebook.com",
      },
      {
        key: "whatsapp_business_phone_id",
        label: "Phone Number ID",
        placeholder: "123456789",
        type: "text",
      },
    ],
  },

  // ── Design ──────────────────────────────────────────────────────────────────
  {
    id: "infinixui",
    title: "InfinixUI (Design Engine)",
    icon: "Layers",
    description: "Connexion a InfinixUI pour la generation de carrousels visuels et l'export PDF",
    fields: [
      {
        key: "infinixui_api_key",
        label: "Token JWT ou Cle API InfinixUI",
        placeholder: "eyJ... ou sk_...",
        type: "password",
        helpText: "Token JWT obtenu via /api/auth/login ou cle API InfinixUI",
      },
      {
        key: "infinixui_base_url",
        label: "URL de l'instance InfinixUI (optionnel)",
        placeholder: "https://infinixui.com",
        helpText: "Laissez vide pour utiliser https://infinixui.com par defaut",
        type: "text",
      },
    ],
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  {
    id: "slack",
    title: "Slack Webhook",
    icon: "Hash",
    description: "Notifications dans votre channel Slack",
    fields: [
      {
        key: "slack_webhook_url",
        label: "Webhook URL",
        placeholder: "https://hooks.slack.com/services/...",
        type: "password",
        helpText: "Creez un Incoming Webhook sur",
        helpUrl: "https://api.slack.com/apps",
      },
    ],
  },

  // ── Productivity ──────────────────────────────────────────────────────────
  {
    id: "notion",
    title: "Notion",
    icon: "BookOpen",
    description: "Archivage automatique dans Notion",
    fields: [
      {
        key: "notion_integration_token",
        label: "Integration Token",
        placeholder: "ntn_...",
        type: "password",
      },
      {
        key: "notion_database_id",
        label: "Database ID (Webmaster)",
        placeholder: "31304525e94980ca...",
        type: "text",
      },
    ],
  },

  // ── Email ─────────────────────────────────────────────────────────────────
  {
    id: "brevo",
    title: "Brevo (Email & Notifications)",
    icon: "Mail",
    description: "Envoi de newsletters et notifications de validation via Brevo (ex-Sendinblue)",
    fields: [
      {
        key: "brevo_api_key",
        label: "Cle API Brevo",
        placeholder: "xkeysib-...",
        type: "password",
      },
      {
        key: "brevo_smtp_login",
        label: "Login SMTP Brevo",
        placeholder: "7c1113001@smtp-brevo.com",
        type: "text",
      },
      {
        key: "brevo_sender_email",
        label: "Email expediteur",
        placeholder: "you@example.com",
        type: "text",
      },
      {
        key: "brevo_recipients",
        label: "Destinataires newsletter (separes par virgule)",
        placeholder: "email1@example.com, email2@example.com",
        type: "text",
      },
    ],
  },
];

export type ApiKeysStore = Record<string, string>;

// ── localStorage (offline fallback) ─────────────────────────────────────────

export function loadApiKeysLocal(): ApiKeysStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ApiKeysStore;
  } catch {
    return {};
  }
}

export function saveApiKeysLocal(keys: ApiKeysStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

// ── Supabase (primary) ──────────────────────────────────────────────────────

export async function fetchApiKeys(): Promise<ApiKeysStore> {
  try {
    const res = await fetch("/api/settings", { credentials: "include" });
    if (!res.ok) {
      return loadApiKeysLocal();
    }
    const data = await res.json();
    const keys = (data.keys || {}) as ApiKeysStore;
    saveApiKeysLocal(keys);
    return keys;
  } catch {
    return loadApiKeysLocal();
  }
}

export async function saveApiKeys(keys: ApiKeysStore): Promise<{ ok: boolean; error?: string }> {
  saveApiKeysLocal(keys);
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ keys }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.error || "Erreur serveur" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Erreur reseau — cles sauvegardees localement" };
  }
}

export function getApiKeyLocal(key: string): string {
  const keys = loadApiKeysLocal();
  return keys[key] || "";
}

export function maskKey(value: string): string {
  if (!value || value.length < 8) return value ? "••••••••" : "";
  return value.slice(0, 4) + "•".repeat(Math.min(value.length - 4, 40));
}
