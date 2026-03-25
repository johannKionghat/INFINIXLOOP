export type AgentIconName =
  | "Radio" | "BookOpen" | "Clapperboard" | "Globe" | "Video" | "ImageIcon"
  | "LayoutTemplate" | "Scissors" | "Mail" | "MessageCircle" | "Bot" | "ClipboardList";

export interface Agent {
  id: string;
  name: string;
  iconName: AgentIconName;
  description: string;
  role: string;
  category: string;
  color: string;
  apis: string[];
  configFields: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

export const AGENTS: Agent[] = [
  {
    id: "informateur",
    name: "Informateur",
    iconName: "Radio",
    description: "Veille IA & tendances",
    role: "Analyse & Veille",
    category: "research",
    color: "#0ea5e9",
    apis: ["Google Trends", "Twitter API", "NewsAPI", "Reddit API"],
    configFields: [
      { key: "topic", label: "Sujet de veille", type: "text", placeholder: "Ex: IA generative, SaaS, crypto" },
      { key: "sources", label: "Sources", type: "select", options: ["Toutes", "Twitter/X", "Reddit", "HackerNews", "Google Trends"] },
      { key: "frequency", label: "Frequence", type: "select", options: ["Temps reel", "Quotidien", "Hebdomadaire"] },
    ],
  },
  {
    id: "redacteur",
    name: "Redacteur",
    iconName: "BookOpen",
    description: "Ebooks & contenus longs",
    role: "Creation contenu",
    category: "content",
    color: "#8b5cf6",
    apis: ["OpenAI GPT-4o", "Anthropic Claude"],
    configFields: [
      { key: "theme", label: "Theme de l'ebook", type: "text", placeholder: "Ex: Automatisation IA pour PME" },
      { key: "chapters", label: "Nombre de chapitres", type: "select", options: ["5", "8", "12", "15"] },
      { key: "tone", label: "Ton", type: "select", options: ["Expert", "Accessible", "Inspirant", "Technique"] },
      { key: "audience", label: "Audience cible", type: "text", placeholder: "Ex: Freelances 25-40 ans" },
    ],
  },
  {
    id: "scriptwriter",
    name: "Scriptwriter",
    iconName: "Clapperboard",
    description: "Scripts video & Reels",
    role: "Video & Social",
    category: "video",
    color: "#f59e0b",
    apis: ["OpenAI GPT-4o"],
    configFields: [
      { key: "theme", label: "Theme du script", type: "text", placeholder: "Ex: 5 facons d'utiliser l'IA" },
      { key: "format", label: "Format", type: "select", options: ["Reel 30s", "Reel 60s", "Long format", "Story"] },
      { key: "platform", label: "Plateforme", type: "select", options: ["Instagram", "TikTok", "YouTube", "LinkedIn"] },
      { key: "tone", label: "Ton", type: "select", options: ["Dynamique", "Educatif", "Inspirant", "Humoristique"] },
    ],
  },
  {
    id: "webmaster",
    name: "Webmaster",
    iconName: "Globe",
    description: "Publication multi-reseaux",
    role: "Distribution",
    category: "distribution",
    color: "#ec4899",
    apis: ["Meta Graph API", "LinkedIn API", "TikTok API", "YouTube Data API"],
    configFields: [
      { key: "platforms", label: "Plateformes", type: "select", options: ["Toutes", "LinkedIn", "Instagram", "TikTok", "YouTube", "Twitter/X"] },
      { key: "schedule", label: "Planification", type: "select", options: ["Immediat", "Demain 9h", "Cette semaine", "Personnalise"] },
      { key: "content", label: "Contenu a publier", type: "textarea", placeholder: "Collez ou decrivez le contenu..." },
    ],
  },
  {
    id: "video",
    name: "Agent Video",
    iconName: "Video",
    description: "Generation video IA",
    role: "Creation video",
    category: "video",
    color: "#ef4444",
    apis: ["Runway ML", "HeyGen", "D-ID", "Replicate"],
    configFields: [
      { key: "script", label: "Script / Description", type: "textarea", placeholder: "Decrivez la video souhaitee..." },
      { key: "format", label: "Format", type: "select", options: ["9:16 (Reel)", "16:9 (YouTube)", "1:1 (Carre)"] },
      { key: "style", label: "Style", type: "select", options: ["Avatar IA", "Text-to-Video", "Animation", "Stock + Voix"] },
      { key: "duration", label: "Duree", type: "select", options: ["30s", "60s", "2 min", "5 min"] },
    ],
  },
  {
    id: "image",
    name: "Agent Image",
    iconName: "ImageIcon",
    description: "Generation visuelle IA",
    role: "Design & Visuels",
    category: "design",
    color: "#10b981",
    apis: ["DALL-E 3", "Midjourney API", "Stable Diffusion"],
    configFields: [
      { key: "prompt", label: "Description visuelle", type: "textarea", placeholder: "Ex: Entrepreneur tech, style moderne..." },
      { key: "format", label: "Format", type: "select", options: ["Post 1080x1080", "Story 1080x1920", "Banner LinkedIn", "Thumbnail YouTube"] },
      { key: "style", label: "Style", type: "select", options: ["Photorealiste", "Illustration", "Minimaliste", "3D"] },
      { key: "quantity", label: "Quantite", type: "select", options: ["1", "3", "5", "10"] },
    ],
  },
  {
    id: "landing",
    name: "Landing Page",
    iconName: "LayoutTemplate",
    description: "Pages de vente & capture",
    role: "Conversion",
    category: "web",
    color: "#3b82f6",
    apis: ["OpenAI (code gen)", "Vercel (deploy)"],
    configFields: [
      { key: "type", label: "Type de page", type: "select", options: ["Page de vente", "Page de capture", "Page remerciement", "Webinaire"] },
      { key: "product", label: "Produit / Service", type: "text", placeholder: "Ex: Formation IA Debutants" },
      { key: "audience", label: "Audience cible", type: "text", placeholder: "Ex: Entrepreneurs debutants" },
      { key: "tone", label: "Style", type: "select", options: ["Professionnel", "Startup", "Luxe", "Minimaliste"] },
    ],
  },
  {
    id: "montage",
    name: "Montage Video",
    iconName: "Scissors",
    description: "Montage automatise",
    role: "Post-production",
    category: "video",
    color: "#f97316",
    apis: ["FFmpeg", "Remotion", "Replicate"],
    configFields: [
      { key: "style", label: "Style de montage", type: "select", options: ["Dynamique", "Cinematique", "Corporate", "Fun"] },
      { key: "subtitles", label: "Sous-titres", type: "select", options: ["Oui - Animes", "Oui - Simples", "Non"] },
      { key: "music", label: "Musique", type: "select", options: ["Auto (IA)", "Energique", "Calme", "Aucune"] },
      { key: "description", label: "Instructions", type: "textarea", placeholder: "Ex: Coupe les silences, ajoute des transitions..." },
    ],
  },
  {
    id: "email",
    name: "Email",
    iconName: "Mail",
    description: "Newsletters & sequences",
    role: "Email marketing",
    category: "marketing",
    color: "#8b5cf6",
    apis: ["SendGrid", "Mailgun", "Resend"],
    configFields: [
      { key: "type", label: "Type", type: "select", options: ["Welcome", "Nurturing", "Promotion", "Relance", "Abandon panier"] },
      { key: "subject", label: "Sujet", type: "text", placeholder: "Ex: Decouvrez comment l'IA peut..." },
      { key: "tone", label: "Ton", type: "select", options: ["Professionnel", "Amical", "Urgent", "Educatif"] },
      { key: "audience", label: "Segment", type: "text", placeholder: "Ex: Nouveaux inscrits" },
    ],
  },
  {
    id: "cm",
    name: "Community Manager",
    iconName: "MessageCircle",
    description: "Telegram & WhatsApp VIP",
    role: "Communaute",
    category: "community",
    color: "#ec4899",
    apis: ["Telegram Bot API", "WhatsApp Business API"],
    configFields: [
      { key: "platform", label: "Plateforme", type: "select", options: ["Telegram", "WhatsApp", "Les deux"] },
      { key: "service", label: "Type de service", type: "select", options: ["Conseil", "Accompagnement", "Formation", "Coaching"] },
      { key: "rules", label: "Regles du groupe", type: "textarea", placeholder: "Ex: Repondre aux questions IA, rappels hebdo..." },
    ],
  },
  {
    id: "chatbot",
    name: "Createur Chatbot",
    iconName: "Bot",
    description: "Chatbots personnalises",
    role: "Automatisation",
    category: "automation",
    color: "#10b981",
    apis: ["OpenAI Assistants API", "RAG pipeline"],
    configFields: [
      { key: "name", label: "Nom du chatbot", type: "text", placeholder: "Ex: Assistant MonBusiness" },
      { key: "personality", label: "Personnalite", type: "select", options: ["Professionnel", "Amical", "Expert", "Decontracte"] },
      { key: "knowledge", label: "Source de connaissances", type: "textarea", placeholder: "URL du site ou description du contenu..." },
      { key: "style", label: "Style widget", type: "select", options: ["Bulle flottante", "Sidebar", "Plein ecran", "Inline"] },
    ],
  },
  {
    id: "projet",
    name: "Gestion de Projet",
    iconName: "ClipboardList",
    description: "Workspace Notion",
    role: "Organisation",
    category: "project",
    color: "#ef4444",
    apis: ["Notion API"],
    configFields: [
      { key: "type", label: "Type de projet", type: "select", options: ["Business complet", "Lancement produit", "Campagne marketing", "Formation en ligne"] },
      { key: "name", label: "Nom du projet", type: "text", placeholder: "Ex: Lancement IA SaaS" },
      { key: "deadline", label: "Echeance", type: "select", options: ["1 semaine", "2 semaines", "1 mois", "3 mois"] },
      { key: "details", label: "Details", type: "textarea", placeholder: "Decrivez votre projet..." },
    ],
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
