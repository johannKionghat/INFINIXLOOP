import type { ExecutionStep, WebmasterConfig, WebmasterContext } from "./types";
import { buildExecutionSteps } from "./steps";

export type StepCallback = (steps: ExecutionStep[]) => void;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowISO() {
  return new Date().toISOString().slice(0, 10);
}

function updateStep(
  steps: ExecutionStep[],
  stepId: string,
  patch: Partial<ExecutionStep>,
  onUpdate: StepCallback
) {
  const step = steps.find((s) => s.id === stepId);
  if (step) Object.assign(step, patch);
  onUpdate([...steps]);
}

function updateSubStep(
  steps: ExecutionStep[],
  stepId: string,
  subId: string,
  status: ExecutionStep["status"],
  output: string | undefined,
  onUpdate: StepCallback
) {
  const step = steps.find((s) => s.id === stepId);
  if (step?.children) {
    const sub = step.children.find((c) => c.id === subId);
    if (sub) {
      sub.status = status;
      if (output) sub.output = output;
    }
  }
  onUpdate([...steps]);
}

async function simulateStep(
  steps: ExecutionStep[],
  stepId: string,
  onUpdate: StepCallback,
  durationMs: number,
  output: string,
  detail?: string
) {
  updateStep(steps, stepId, { status: "running", startedAt: Date.now() }, onUpdate);
  await sleep(durationMs);
  updateStep(
    steps,
    stepId,
    { status: "done", completedAt: Date.now(), output, detail },
    onUpdate
  );
}

async function simulateSubSteps(
  steps: ExecutionStep[],
  stepId: string,
  onUpdate: StepCallback,
  subDuration: number
) {
  const step = steps.find((s) => s.id === stepId);
  if (!step?.children) return;
  for (const sub of step.children) {
    updateSubStep(steps, stepId, sub.id, "running", undefined, onUpdate);
    await sleep(subDuration);
    updateSubStep(steps, stepId, sub.id, "done", "OK", onUpdate);
  }
}

export async function runWebmasterAgent(
  config: WebmasterConfig,
  onUpdate: StepCallback
): Promise<WebmasterContext> {
  const steps = buildExecutionSteps(config);
  onUpdate([...steps]);

  const ctx: WebmasterContext = { config };

  // ── MODULE 0 : TimeGuard ─────────────────────────────────────────────────
  await simulateStep(steps, "step-timeguard", onUpdate, 800,
    "Creneau autorise. Execution validee.",
    "Verification : 8h-8h30 / 13h-13h30 / 18h30-19h (Europe/Paris)"
  );

  // ── MODULE 0 : Config Validate ───────────────────────────────────────────
  updateStep(steps, "step-config-validate", { status: "running", startedAt: Date.now() }, onUpdate);
  await simulateSubSteps(steps, "step-config-validate", onUpdate, 300);
  updateStep(steps, "step-config-validate", {
    status: "done",
    completedAt: Date.now(),
    output: `Configuration validee : ${config.publicationMode} / ${config.postStyle} / ${config.sourceMode}`,
  }, onUpdate);

  // ── MODULE 0 : UTM ──────────────────────────────────────────────────────
  await simulateStep(steps, "step-utm", onUpdate, 400,
    "Parametres UTM generes pour LinkedIn, Twitter, Facebook, Instagram, TikTok, WhatsApp."
  );

  // ── MODULE 0 : Switch Mode ──────────────────────────────────────────────
  const pipelineLabel = config.publicationMode === "TEXT_ONLY" ? "Texte seul"
    : config.publicationMode === "TEXT_MEDIA" ? "Texte + Media" : "Carrousel InfinixUI";
  await simulateStep(steps, "step-switch-mode", onUpdate, 300,
    `Pipeline selectionne : ${pipelineLabel}`
  );

  // ── MODULE 1 : Source Analysis ──────────────────────────────────────────
  if (config.sourceMode === "SCRAPING") {
    await simulateStep(steps, "step-scraping", onUpdate, 2000,
      `Page scrapee : ${config.scrapingUrl}`,
      "15000 caracteres extraits, titre et contenu principal isoles."
    );
    await simulateStep(steps, "step-analyze-scraping", onUpdate, 3000,
      "Analyse produit terminee.",
      "Produit, audience, arguments cles, preuves sociales et USP extraits."
    );
    ctx.productAnalysis = {
      productName: "Produit analyse depuis " + config.scrapingUrl,
      postFormat: "analysis",
      productBenefit: "Benefice extrait de la page de vente",
      targetAudience: "Audience identifiee par l'analyse",
      sector: "Secteur detecte",
      tone: "professionnel",
      landingPageUrl: config.scrapingUrl,
      companyName: "Marque detectee",
      authorName: "Auteur detecte",
      authorExpertise: "Expertise detectee",
      resources: [],
      keyArguments: ["Argument 1", "Argument 2", "Argument 3"],
      painPoints: ["Douleur 1", "Douleur 2"],
      socialProof: "+500 clients satisfaits",
      uniqueSellingProposition: "USP detecte",
      concreteResults: "Resultats concrets identifies",
      imagePromptContext: "Professional marketing visual",
      source: "SCRAPING",
    };
  } else {
    updateStep(steps, "step-research-web", { status: "running", startedAt: Date.now() }, onUpdate);
    await simulateSubSteps(steps, "step-research-web", onUpdate, 1500);
    updateStep(steps, "step-research-web", {
      status: "done",
      completedAt: Date.now(),
      output: `Recherche web terminee pour "${config.thematicTopic}"`,
      detail: "2 sources fusionnees : resultats principaux + complementaires.",
    }, onUpdate);

    await simulateStep(steps, "step-analyze-thematic", onUpdate, 3500,
      "Briefing thematique complet genere.",
      `Format detecte : liste | Ressources : 8 outils avec URLs | Faits : 5 arguments cles`
    );
    ctx.productAnalysis = {
      productName: config.thematicTopic || "Sujet thematique",
      postFormat: "list",
      productBenefit: "Decouvrir les meilleurs outils et ressources",
      targetAudience: config.thematicAudience || "Professionnels",
      sector: config.thematicSector || "Tech",
      tone: "professionnel",
      landingPageUrl: config.thematicLandingUrl || "",
      companyName: config.thematicCompanyName || "",
      authorName: config.thematicAuthorName || "Auteur",
      authorExpertise: config.thematicAuthorExpertise || "Expert",
      resources: [
        { name: "Outil 1", url: "https://example.com/outil1", description: "Description", highlight: "Point fort" },
        { name: "Outil 2", url: "https://example.com/outil2", description: "Description", highlight: "Point fort" },
      ],
      keyArguments: ["Fait 1 avec chiffre", "Fait 2", "Fait 3", "Fait 4", "Fait 5"],
      painPoints: ["Probleme 1", "Probleme 2", "Probleme 3"],
      socialProof: "85% des professionnels utilisent des outils IA (McKinsey 2025)",
      uniqueSellingProposition: "Angle editorial accrocheur",
      concreteResults: "Gains de productivite mesurables",
      imagePromptContext: `illustration conceptuelle de ${config.thematicTopic}`,
      source: "THEMATIC",
    };
  }

  // ── MODULE 1 : Trends ──────────────────────────────────────────────────
  await simulateStep(steps, "step-trends", onUpdate, 2000,
    "3 tendances identifiees.",
    "Tendance #1 retenue comme angle principal."
  );
  ctx.sectorTrends = {
    trends: [
      { title: "Tendance 1", hookAngle: "Angle accrocheur", stat: "72%" },
      { title: "Tendance 2", hookAngle: "Second angle", stat: "45%" },
      { title: "Tendance 3", hookAngle: "Troisieme angle", stat: "+200%" },
    ],
    topTrend: "Tendance 1",
    visualAngle: "Angle visuel optimal",
  };

  // ── MODULE 1 : Strategy ────────────────────────────────────────────────
  await simulateStep(steps, "step-strategy", onUpdate, 2500,
    `Strategie definie : style ${config.postStyle}, angle editorial choisi.`,
    "Type de post : curated list | Voix : experte | CTA : engagement"
  );
  ctx.contentStrategy = {
    angle: "Angle editorial optimal",
    openingLine: "Accroche percutante pour stopper le scroll",
    coreValue: "Valeur actionnable pour le lecteur",
    proofElement: "Stat concrete comme preuve",
    ctaSuggestion: "CTA adapte au style " + config.postStyle,
    tone: config.postStyle.toLowerCase(),
    postType: "curated list",
    resourceStrategy: "Integration naturelle des URLs",
    imagePrompt: config.publicationMode === "TEXT_MEDIA" ? "Professional visual, modern design, no text" : "",
    carouselTeaser: config.publicationMode === "CAROUSEL" ? "Teaser engageant pour le carrousel" : "",
  };

  // ── MODULE 2 : Content Generation ──────────────────────────────────────
  if (config.publicationMode === "TEXT_ONLY") {
    updateStep(steps, "step-gen-text", { status: "running", startedAt: Date.now() }, onUpdate);
    await simulateSubSteps(steps, "step-gen-text", onUpdate, 2000);
    updateStep(steps, "step-gen-text", {
      status: "done",
      completedAt: Date.now(),
      output: `Posts generes pour toutes les plateformes actives.`,
      detail: "LinkedIn (2800 chars) | Twitter (thread 4 tweets) | Facebook (280 mots)",
    }, onUpdate);
  } else if (config.publicationMode === "TEXT_MEDIA") {
    updateStep(steps, "step-gen-media-posts", { status: "running", startedAt: Date.now() }, onUpdate);
    await simulateSubSteps(steps, "step-gen-media-posts", onUpdate, 2000);
    updateStep(steps, "step-gen-media-posts", {
      status: "done",
      completedAt: Date.now(),
      output: "Posts media generes (LinkedIn, Facebook, Instagram).",
    }, onUpdate);

    await simulateStep(steps, "step-gen-image", onUpdate, 3000,
      config.imageSource === "AI"
        ? "Image generee via FLUX (1080x1080)."
        : "Image chargee depuis URL.",
      config.imageSource === "AI" ? "HuggingFace FLUX.1-schnell | 4 etapes | 1024x1024" : config.uploadedImageUrl
    );
  } else {
    updateStep(steps, "step-gen-carousel", { status: "running", startedAt: Date.now() }, onUpdate);
    await simulateSubSteps(steps, "step-gen-carousel", onUpdate, 2500);
    updateStep(steps, "step-gen-carousel", {
      status: "done",
      completedAt: Date.now(),
      output: "Contenu carrousel genere : 7 slides + 2 teasers.",
      detail: "Design : editorial | Couleurs generees | Stat choc integree",
    }, onUpdate);

    await simulateStep(steps, "step-infinixui", onUpdate, 2000,
      "Carrousel genere par InfinixUI.",
      "Studio URL + Preview URL + PDF URL disponibles."
    );
    await simulateStep(steps, "step-notion", onUpdate, 1500,
      "Page Notion creee avec carrousel et posts."
    );
    await simulateStep(steps, "step-brevo", onUpdate, 1000,
      "Newsletter envoyee via Brevo."
    );
  }

  ctx.posts = {
    linkedin: { content: "Post LinkedIn genere...", hashtags: ["#IA", "#Business"], wordCount: 450 },
    twitter: { content: "Hook tweet...", thread: ["Tweet 2", "Tweet 3", "Tweet 4"], charCount: 240 },
    facebook: { content: "Post Facebook genere...", wordCount: 280 },
  };

  // ── MODULE 3 : Quality ────────────────────────────────────────────────
  updateStep(steps, "step-quality", { status: "running", startedAt: Date.now() }, onUpdate);
  await simulateSubSteps(steps, "step-quality", onUpdate, 1500);
  updateStep(steps, "step-quality", {
    status: "done",
    completedAt: Date.now(),
    output: "Score qualite global : 8.5/10. Aucun raffinement necessaire.",
    detail: "LinkedIn 9/10 | Twitter 8/10 | Facebook 8.5/10",
  }, onUpdate);
  ctx.qualityReport = {
    overallScore: 8.5,
    platforms: [
      { name: "LinkedIn", score: 9, issues: [] },
      { name: "Twitter", score: 8, issues: [] },
      { name: "Facebook", score: 8.5, issues: [] },
    ],
    refinements: [],
  };

  // ── MODULE 4 : Publication ────────────────────────────────────────────
  updateStep(steps, "step-publish", { status: "running", startedAt: Date.now() }, onUpdate);
  if (steps.find((s) => s.id === "step-publish")?.children) {
    for (const sub of steps.find((s) => s.id === "step-publish")!.children!) {
      updateSubStep(steps, "step-publish", sub.id, "running", undefined, onUpdate);
      await sleep(config.dryRun ? 300 : 1000);
      updateSubStep(steps, "step-publish", sub.id, "done",
        config.dryRun ? "Simule (dry run)" : "Publie avec succes",
        onUpdate
      );
    }
  }
  updateStep(steps, "step-publish", {
    status: "done",
    completedAt: Date.now(),
    output: config.dryRun
      ? "Simulation terminee. Aucune publication reelle."
      : "Publication terminee sur toutes les plateformes actives.",
  }, onUpdate);

  ctx.publicationResults = {
    linkedin: { success: true, postId: "urn:li:share:123456" },
    twitter: { success: true, tweetId: "1234567890" },
    facebook: { success: true, postId: "fb_123456" },
    slack: { success: true },
  };

  // ── MODULE 5 : Lead Magnet ────────────────────────────────────────────
  if (config.publishLinkedin) {
    await simulateStep(steps, "step-lead-magnet", onUpdate, 1500,
      "Commentaire lead magnet genere et poste.",
      "Offre : checklist gratuite | CTA : commentaire + lien"
    );
  }

  // ── MODULE 5 : Report ─────────────────────────────────────────────────
  await simulateStep(steps, "step-report", onUpdate, 1000,
    "Rapport de session genere.",
    `Score : 8.5/10 | Plateformes : ${Object.keys(ctx.publicationResults).length} | Echecs : 0`
  );
  ctx.sessionReport = {
    sessionId: `${nowISO()}-${config.publicationMode}`,
    date: nowISO(),
    qualityScore: 8.5,
    publishedPlatforms: ["LinkedIn", "Twitter", "Facebook", "Slack"],
    failedPlatforms: [],
    recommendations: [
      "Ajouter Instagram pour augmenter la portee visuelle.",
      "Tester le style STORYTELLING pour un engagement plus eleve.",
    ],
  };

  return ctx;
}
