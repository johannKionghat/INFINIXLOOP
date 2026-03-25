import type { WebmasterConfig } from "./types";

export interface ConfigFormField {
  key: keyof WebmasterConfig;
  label: string;
  type: "text" | "textarea" | "select" | "toggle" | "number";
  section: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue: string | number | boolean;
  description?: string;
  showWhen?: { field: keyof WebmasterConfig; value: string | string[] };
}

export const CONFIG_SECTIONS = [
  { id: "mode", label: "Mode de publication", icon: "Layers" },
  { id: "source", label: "Source du contenu", icon: "Database" },
  { id: "thematic", label: "Configuration thematique", icon: "FileText" },
  { id: "scraping", label: "Configuration scraping", icon: "Globe" },
  { id: "image", label: "Configuration image", icon: "ImageIcon" },
  { id: "style", label: "Style & qualite", icon: "Palette" },
  { id: "platforms", label: "Plateformes de publication", icon: "Share2" },
  { id: "advanced", label: "Options avancees", icon: "Settings" },
] as const;

export const CONFIG_FORM_FIELDS: ConfigFormField[] = [
  // === MODE ===
  {
    key: "publicationMode",
    label: "Mode de publication",
    type: "select",
    section: "mode",
    options: [
      { value: "TEXT_ONLY", label: "Texte seul — LinkedIn, Twitter, Facebook, TikTok, IG" },
      { value: "TEXT_MEDIA", label: "Texte + Image — IA generee ou uploadee" },
      { value: "CAROUSEL", label: "Carrousel — InfinixUI design engine" },
    ],
    defaultValue: "TEXT_ONLY",
    description: "Definit le pipeline d'execution : texte seul, texte + media, ou carrousel visuel.",
  },

  // === SOURCE ===
  {
    key: "sourceMode",
    label: "Source du contexte",
    type: "select",
    section: "source",
    options: [
      { value: "THEMATIC", label: "Thematique — Theme libre avec recherche web" },
      { value: "SCRAPING", label: "Scraping — Analyse d'une page de vente existante" },
    ],
    defaultValue: "THEMATIC",
    description: "THEMATIC : l'IA recherche et cree du contenu original. SCRAPING : analyse une URL existante.",
  },

  // === SCRAPING ===
  {
    key: "scrapingUrl",
    label: "URL de la page a analyser",
    type: "text",
    section: "scraping",
    placeholder: "https://example.com/votre-page-de-vente",
    defaultValue: "",
    showWhen: { field: "sourceMode", value: "SCRAPING" },
  },

  // === THEMATIC ===
  {
    key: "thematicTopic",
    label: "Sujet / Theme",
    type: "text",
    section: "thematic",
    placeholder: "Ex: intelligence artificielle pour entrepreneurs",
    defaultValue: "",
    showWhen: { field: "sourceMode", value: "THEMATIC" },
    description: "Le sujet principal du contenu a generer.",
  },
  {
    key: "thematicSector",
    label: "Secteur d'activite",
    type: "text",
    section: "thematic",
    placeholder: "Ex: Tech / IA / Entrepreneuriat",
    defaultValue: "",
    showWhen: { field: "sourceMode", value: "THEMATIC" },
  },
  {
    key: "thematicAudience",
    label: "Audience cible",
    type: "text",
    section: "thematic",
    placeholder: "Ex: Entrepreneurs, freelances, dirigeants de PME",
    defaultValue: "",
    showWhen: { field: "sourceMode", value: "THEMATIC" },
  },
  {
    key: "thematicAuthorName",
    label: "Nom de l'auteur",
    type: "text",
    section: "thematic",
    placeholder: "Ex: Jean Dupont",
    defaultValue: "",
    showWhen: { field: "sourceMode", value: "THEMATIC" },
  },
  {
    key: "thematicAuthorExpertise",
    label: "Expertise de l'auteur",
    type: "text",
    section: "thematic",
    placeholder: "Ex: Expert IA & Productivite",
    defaultValue: "",
    showWhen: { field: "sourceMode", value: "THEMATIC" },
  },
  {
    key: "thematicCompanyName",
    label: "Nom de la marque",
    type: "text",
    section: "thematic",
    placeholder: "Ex: InfinixLoop",
    defaultValue: "",
    showWhen: { field: "sourceMode", value: "THEMATIC" },
  },
  {
    key: "thematicLandingUrl",
    label: "URL landing page (optionnel)",
    type: "text",
    section: "thematic",
    placeholder: "https://example.com/offre",
    defaultValue: "",
    description: "Si vide, aucun lien CTA ne sera ajoute aux posts.",
    showWhen: { field: "sourceMode", value: "THEMATIC" },
  },

  // === IMAGE ===
  {
    key: "imageSource",
    label: "Source de l'image",
    type: "select",
    section: "image",
    options: [
      { value: "AI", label: "IA — Generee automatiquement (FLUX / HuggingFace)" },
      { value: "UPLOAD", label: "Upload — Votre propre image (URL)" },
    ],
    defaultValue: "AI",
    showWhen: { field: "publicationMode", value: "TEXT_MEDIA" },
  },
  {
    key: "uploadedImageUrl",
    label: "URL de l'image",
    type: "text",
    section: "image",
    placeholder: "https://example.com/mon-image.jpg",
    defaultValue: "",
    showWhen: { field: "imageSource", value: "UPLOAD" },
  },

  // === STYLE ===
  {
    key: "postStyle",
    label: "Style de redaction",
    type: "select",
    section: "style",
    options: [
      { value: "EXPERT", label: "Expert — Technique, dense, zero emoji" },
      { value: "MARKETING", label: "Marketing — Accrocheur, emojis strategiques, CTA fort" },
      { value: "ACADEMIC", label: "Academique — Structure, references, ton neutre" },
      { value: "TEASER", label: "Teaser — Court, intrigant, mysterieux" },
      { value: "STORYTELLING", label: "Storytelling — Narratif personnel, anecdotes" },
    ],
    defaultValue: "EXPERT",
    description: "Definit le ton, le formatage et la structure de tous les posts generes.",
  },
  {
    key: "qualityThreshold",
    label: "Seuil de qualite minimum",
    type: "number",
    section: "style",
    defaultValue: 7,
    description: "Score minimum (1-10). En dessous, le contenu est raffine automatiquement.",
  },

  // === PLATFORMS ===
  { key: "publishLinkedin", label: "LinkedIn", type: "toggle", section: "platforms", defaultValue: true },
  { key: "publishTwitter", label: "Twitter / X", type: "toggle", section: "platforms", defaultValue: true },
  { key: "publishFacebook", label: "Facebook", type: "toggle", section: "platforms", defaultValue: true },
  { key: "publishInstagram", label: "Instagram", type: "toggle", section: "platforms", defaultValue: false },
  { key: "publishTiktok", label: "TikTok", type: "toggle", section: "platforms", defaultValue: false },
  { key: "publishWhatsappGroup", label: "WhatsApp Groupe", type: "toggle", section: "platforms", defaultValue: false },
  { key: "publishWhatsappBusiness", label: "WhatsApp Business", type: "toggle", section: "platforms", defaultValue: false },
  { key: "publishSlack", label: "Slack (notification)", type: "toggle", section: "platforms", defaultValue: true },

  // === ADVANCED ===
  { key: "dryRun", label: "Mode simulation (dry run)", type: "toggle", section: "advanced", defaultValue: false, description: "Genere le contenu sans publier reellement." },
];

export function getDefaultConfig(): WebmasterConfig {
  const config: Record<string, unknown> = {};
  for (const field of CONFIG_FORM_FIELDS) {
    config[field.key] = field.defaultValue;
  }
  return config as unknown as WebmasterConfig;
}
