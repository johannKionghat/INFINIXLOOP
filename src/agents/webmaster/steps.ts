import type { ExecutionStep, WebmasterConfig } from "./types";

export function buildExecutionSteps(config: WebmasterConfig): ExecutionStep[] {
  const steps: ExecutionStep[] = [];

  // ── MODULE 0 : TimeGuard + Config ──────────────────────────────────────────
  steps.push({
    id: "step-timeguard",
    module: "Module 0",
    label: "Garde Temporelle",
    description: "Verification du creneau horaire autorise (8h, 13h, 18h30 Europe/Paris).",
    icon: "Clock",
    status: "pending",
  });

  steps.push({
    id: "step-config-validate",
    module: "Module 0",
    label: "Validation Configuration",
    description: `Mode: ${config.publicationMode} | Style: ${config.postStyle} | Source: ${config.sourceMode}`,
    icon: "Settings",
    status: "pending",
    children: [
      { id: "sub-mode", label: `Mode de publication: ${config.publicationMode}`, status: "pending" },
      { id: "sub-style", label: `Style: ${config.postStyle}`, status: "pending" },
      { id: "sub-source", label: `Source: ${config.sourceMode}`, status: "pending" },
      ...(config.publicationMode === "TEXT_MEDIA"
        ? [{ id: "sub-image", label: `Image: ${config.imageSource}`, status: "pending" as const }]
        : []),
    ],
  });

  steps.push({
    id: "step-utm",
    module: "Module 0",
    label: "Generation parametres UTM",
    description: "Centralisation des parametres de tracking pour chaque plateforme.",
    icon: "Link",
    status: "pending",
  });

  steps.push({
    id: "step-switch-mode",
    module: "Module 0",
    label: "Aiguillage Pipeline",
    description: `Pipeline selectionne: ${
      config.publicationMode === "TEXT_ONLY" ? "Texte seul" :
      config.publicationMode === "TEXT_MEDIA" ? "Texte + Media" : "Carrousel InfinixUI"
    }`,
    icon: "GitFork",
    status: "pending",
  });

  // ── MODULE 1 : Contexte commun ────────────────────────────────────────────
  if (config.sourceMode === "SCRAPING") {
    steps.push({
      id: "step-scraping",
      module: "Module 1 — Contexte",
      label: "Scraping page de vente",
      description: `Analyse de ${config.scrapingUrl || "(URL non definie)"}`,
      icon: "Globe",
      status: "pending",
    });
    steps.push({
      id: "step-analyze-scraping",
      module: "Module 1 — Contexte",
      label: "Analyse produit (Scraping)",
      description: "Extraction des donnees marketing : produit, audience, arguments, preuves sociales.",
      icon: "Sparkles",
      status: "pending",
    });
  } else {
    steps.push({
      id: "step-research-web",
      module: "Module 1 — Contexte",
      label: "Recherche web",
      description: `Recherche DuckDuckGo sur "${config.thematicTopic || "(sujet non defini)"}"`,
      icon: "Search",
      status: "pending",
      children: [
        { id: "sub-search-1", label: "Recherche principale (outils, ressources, guides)", status: "pending" },
        { id: "sub-search-2", label: "Recherche complementaire (actualites, comparatifs)", status: "pending" },
        { id: "sub-merge", label: "Fusion des resultats", status: "pending" },
      ],
    });
    steps.push({
      id: "step-analyze-thematic",
      module: "Module 1 — Contexte",
      label: "Analyse thematique",
      description: "Curateur de contenu : briefing detaille avec ressources, URLs, faits et format optimal.",
      icon: "Lightbulb",
      status: "pending",
    });
  }

  steps.push({
    id: "step-trends",
    module: "Module 1 — Contexte",
    label: "Tendances secteur",
    description: "3 tendances concretes rattachees au sujet pour cette audience.",
    icon: "TrendingUp",
    status: "pending",
  });

  steps.push({
    id: "step-strategy",
    module: "Module 1 — Contexte",
    label: "Angle & Strategie editoriale",
    description: "Choix de l'angle, de la voix, du type de post et de la strategie d'integration des ressources.",
    icon: "Compass",
    status: "pending",
  });

  // ── MODULE 2 : Generation de contenu ──────────────────────────────────────
  const activePlatforms = getActivePlatforms(config);

  if (config.publicationMode === "TEXT_ONLY") {
    steps.push({
      id: "step-gen-text",
      module: "Module 2A — Texte seul",
      label: "Generation des posts",
      description: `${activePlatforms.length} posts en parallele pour les plateformes actives.`,
      icon: "PenTool",
      status: "pending",
      children: activePlatforms.map((p) => ({
        id: `sub-gen-${p.id}`,
        label: `Post ${p.label}`,
        status: "pending" as const,
      })),
    });
  } else if (config.publicationMode === "TEXT_MEDIA") {
    steps.push({
      id: "step-gen-media-posts",
      module: "Module 2B — Texte + Media",
      label: "Generation des posts avec media",
      description: "Posts optimises pour accompagner un visuel.",
      icon: "PenTool",
      status: "pending",
      children: [
        { id: "sub-gen-media-li", label: "Post LinkedIn (avec media)", status: "pending" },
        { id: "sub-gen-media-fb", label: "Post Facebook (avec media)", status: "pending" },
        { id: "sub-gen-media-ig", label: "Post Instagram (avec media)", status: "pending" },
      ],
    });
    steps.push({
      id: "step-gen-image",
      module: "Module 2B — Texte + Media",
      label: config.imageSource === "AI" ? "Generation image IA" : "Chargement image uploadee",
      description: config.imageSource === "AI"
        ? "Generation via HuggingFace FLUX (1080x1080, pro design, sans texte)."
        : `Image depuis URL: ${config.uploadedImageUrl || "(non definie)"}`,
      icon: config.imageSource === "AI" ? "Wand2" : "ImagePlus",
      status: "pending",
    });
  } else {
    steps.push({
      id: "step-gen-carousel",
      module: "Module 2C — Carrousel",
      label: "Generation carrousel complet",
      description: "Contenu 7 slides + design InfinixUI + export PDF + archivage.",
      icon: "Layout",
      status: "pending",
      children: [
        { id: "sub-carousel-content", label: "Contenu des 7 slides", status: "pending" },
        { id: "sub-carousel-teasers", label: "Teasers LinkedIn + Instagram", status: "pending" },
        { id: "sub-carousel-infinixui", label: "Design InfinixUI + export PDF", status: "pending" },
        { id: "sub-carousel-document", label: "Sauvegarde dans Mes Documents", status: "pending" },
        { id: "sub-carousel-notion", label: "Archivage Notion", status: "pending" },
        { id: "sub-carousel-brevo", label: "Newsletter Brevo", status: "pending" },
      ],
    });
  }

  // ── MODULE 3 : Qualite ────────────────────────────────────────────────────
  steps.push({
    id: "step-quality",
    module: "Module 3 — Qualite",
    label: "Controle qualite",
    description: `Evaluation des posts. Seuil minimum: ${config.qualityThreshold}/10. Raffinement automatique si necessaire.`,
    icon: "Shield",
    status: "pending",
    children: [
      { id: "sub-quality-score", label: "Scoring global", status: "pending" },
      { id: "sub-quality-refine", label: "Raffinement (si score < seuil)", status: "pending" },
    ],
  });

  // ── MODULE 3B : Confirmation ──────────────────────────────────────────────
  if (config.requireConfirmation) {
    steps.push({
      id: "step-confirmation",
      module: "Module 3B — Validation",
      label: "Validation utilisateur",
      description: `Notification envoyee via ${config.confirmationChannel}. En attente de votre validation avant publication.`,
      icon: "CheckCircle",
      status: "pending",
      children: [
        { id: "sub-confirm-notify", label: `Envoi notification (${config.confirmationChannel})`, status: "pending" },
        { id: "sub-confirm-wait", label: "En attente de validation", status: "pending" },
      ],
    });
  }

  // ── MODULE 4 : Publication ────────────────────────────────────────────────
  const pubChildren = activePlatforms.map((p) => ({
    id: `sub-pub-${p.id}`,
    label: `Publication ${p.label}`,
    status: "pending" as const,
  }));
  if (config.publishSlack) {
    pubChildren.push({ id: "sub-pub-slack", label: "Notification Slack", status: "pending" as const });
  }

  steps.push({
    id: "step-publish",
    module: "Module 4 — Publication",
    label: config.dryRun ? "Simulation de publication (dry run)" : "Publication multi-plateformes",
    description: config.dryRun
      ? "Mode simulation active — aucun appel API reel."
      : `Publication sur ${activePlatforms.map((p) => p.label).join(", ")}.`,
    icon: "Send",
    status: "pending",
    children: pubChildren,
  });

  // ── MODULE 5 : Lead Magnet + Rapport ──────────────────────────────────────
  if (config.publishLinkedin) {
    steps.push({
      id: "step-lead-magnet",
      module: "Module 5 — Rapport",
      label: "Lead Magnet",
      description: "Commentaire LinkedIn epingle : offre gratuite (checklist, template, guide).",
      icon: "Magnet",
      status: "pending",
    });
  }

  steps.push({
    id: "step-report",
    module: "Module 5 — Rapport",
    label: "Rapport de session",
    description: "KPIs, trace des publications, recommandations.",
    icon: "BarChart2",
    status: "pending",
  });

  return steps;
}

interface PlatformInfo {
  id: string;
  label: string;
}

function getActivePlatforms(config: WebmasterConfig): PlatformInfo[] {
  const platforms: PlatformInfo[] = [];
  if (config.publishLinkedin) platforms.push({ id: "linkedin", label: "LinkedIn" });
  if (config.publishTwitter) platforms.push({ id: "twitter", label: "Twitter/X" });
  if (config.publishFacebook) platforms.push({ id: "facebook", label: "Facebook" });
  if (config.publishInstagram) platforms.push({ id: "instagram", label: "Instagram" });
  if (config.publishTiktok) platforms.push({ id: "tiktok", label: "TikTok" });
  if (config.publishWhatsappGroup) platforms.push({ id: "wa-group", label: "WhatsApp Groupe" });
  if (config.publishWhatsappBusiness) platforms.push({ id: "wa-business", label: "WhatsApp Business" });
  return platforms;
}

export { getActivePlatforms };
