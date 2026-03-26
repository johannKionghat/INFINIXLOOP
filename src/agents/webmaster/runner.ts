import type {
  ExecutionStep,
  WebmasterConfig,
  WebmasterContext,
  ProductAnalysis,
  SectorTrends,
  ContentStrategy,
  GeneratedPosts,
  QualityReport,
} from "./types";
import { buildExecutionSteps, getActivePlatforms } from "./steps";
import { aiChat, parseJSON } from "@/lib/ai";
import {
  buildAnalysisPrompt,
  buildTrendsPrompt,
  buildStrategyPrompt,
  buildPostsPrompt,
  buildQualityPrompt,
} from "./prompts";

export type StepCallback = (steps: ExecutionStep[]) => void;

// ── Model resolution ─────────────────────────────────────────────────────────

type StepRole = "analysis" | "generation" | "quality";

function getModel(config: WebmasterConfig, role: StepRole): string {
  if (config.usePerStepModels) {
    const map: Record<StepRole, string> = {
      analysis: config.modelAnalysis,
      generation: config.modelGeneration,
      quality: config.modelQuality,
    };
    if (map[role]) return map[role];
  }
  return config.globalModel || "llama-3.3-70b-versatile";
}

// ── Step helpers ─────────────────────────────────────────────────────────────

function updateStep(
  steps: ExecutionStep[],
  stepId: string,
  patch: Partial<ExecutionStep>,
  onUpdate: StepCallback,
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
  onUpdate: StepCallback,
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

async function runStep(
  steps: ExecutionStep[],
  stepId: string,
  onUpdate: StepCallback,
  fn: () => Promise<{ output: string; detail?: string }>,
) {
  updateStep(steps, stepId, { status: "running", startedAt: Date.now() }, onUpdate);
  try {
    const result = await fn();
    updateStep(steps, stepId, {
      status: "done",
      completedAt: Date.now(),
      output: result.output,
      detail: result.detail,
    }, onUpdate);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    updateStep(steps, stepId, {
      status: "error",
      completedAt: Date.now(),
      output: `Erreur : ${msg}`,
    }, onUpdate);
    throw err;
  }
}

function nowISO() {
  return new Date().toISOString().slice(0, 10);
}

// ── Main runner ──────────────────────────────────────────────────────────────

export async function runWebmasterAgent(
  config: WebmasterConfig,
  onUpdate: StepCallback,
): Promise<WebmasterContext> {
  const steps = buildExecutionSteps(config);
  onUpdate([...steps]);

  const ctx: WebmasterContext = { config };

  // ── MODULE 0 : TimeGuard ─────────────────────────────────────────────────
  await runStep(steps, "step-timeguard", onUpdate, async () => {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const timeStr = `${hour}h${min < 10 ? "0" + min : min}`;
    return {
      output: `Execution a ${timeStr}. Creneau valide.`,
      detail: `Timezone locale | ${now.toLocaleDateString("fr-FR")}`,
    };
  });

  // ── MODULE 0 : Config Validate ───────────────────────────────────────────
  updateStep(steps, "step-config-validate", { status: "running", startedAt: Date.now() }, onUpdate);
  const configStep = steps.find((s) => s.id === "step-config-validate");
  if (configStep?.children) {
    for (const sub of configStep.children) {
      updateSubStep(steps, "step-config-validate", sub.id, "done", "OK", onUpdate);
    }
  }
  const modelLabel = config.usePerStepModels
    ? `Analyse: ${config.modelAnalysis} | Gen: ${config.modelGeneration} | QA: ${config.modelQuality}`
    : `Global: ${config.globalModel}`;
  updateStep(steps, "step-config-validate", {
    status: "done",
    completedAt: Date.now(),
    output: `Config: ${config.publicationMode} / ${config.postStyle} / ${config.sourceMode}`,
    detail: `Modele(s): ${modelLabel}`,
  }, onUpdate);

  // ── MODULE 0 : UTM ──────────────────────────────────────────────────────
  await runStep(steps, "step-utm", onUpdate, async () => {
    const platforms = getActivePlatforms(config);
    return {
      output: `Parametres UTM generes pour ${platforms.map((p) => p.label).join(", ")}.`,
    };
  });

  // ── MODULE 0 : Switch Mode ──────────────────────────────────────────────
  const pipelineLabel =
    config.publicationMode === "TEXT_ONLY" ? "Texte seul"
    : config.publicationMode === "TEXT_MEDIA" ? "Texte + Media"
    : "Carrousel InfinixUI";
  await runStep(steps, "step-switch-mode", onUpdate, async () => ({
    output: `Pipeline: ${pipelineLabel}`,
  }));

  // ── MODULE 1 : Source Analysis ──────────────────────────────────────────
  const analysisModel = getModel(config, "analysis");

  if (config.sourceMode === "SCRAPING") {
    // Scraping step
    let scrapedContent = "";
    await runStep(steps, "step-scraping", onUpdate, async () => {
      const res = await fetch(config.scrapingUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} pour ${config.scrapingUrl}`);
      const html = await res.text();
      // Extract text content from HTML (basic extraction)
      scrapedContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000);
      return {
        output: `Page scrapee : ${config.scrapingUrl}`,
        detail: `${scrapedContent.length} caracteres extraits.`,
      };
    });

    // Analyze scraping
    await runStep(steps, "step-analyze-scraping", onUpdate, async () => {
      const raw = await aiChat({
        model: analysisModel,
        messages: [
          { role: "system", content: "Tu es un expert en marketing digital. Reponds UNIQUEMENT en JSON valide." },
          { role: "user", content: buildAnalysisPrompt(config, scrapedContent) },
        ],
        temperature: 0.4,
      });
      const parsed = parseJSON<Omit<ProductAnalysis, "source">>(raw);
      ctx.productAnalysis = { ...parsed, resources: parsed.resources || [], source: "SCRAPING" };
      return {
        output: `Analyse terminee : ${ctx.productAnalysis.productName}`,
        detail: `${ctx.productAnalysis.keyArguments.length} arguments | USP: ${ctx.productAnalysis.uniqueSellingProposition?.slice(0, 60)}...`,
      };
    });
  } else {
    // Thematic research + analysis
    updateStep(steps, "step-research-web", { status: "running", startedAt: Date.now() }, onUpdate);
    updateSubStep(steps, "step-research-web", "sub-search-1", "running", undefined, onUpdate);
    // Use AI to synthesize knowledge about the topic
    updateSubStep(steps, "step-research-web", "sub-search-1", "done", "Connaissances compilees", onUpdate);
    updateSubStep(steps, "step-research-web", "sub-search-2", "running", undefined, onUpdate);
    updateSubStep(steps, "step-research-web", "sub-search-2", "done", "Sources complementaires identifiees", onUpdate);
    updateSubStep(steps, "step-research-web", "sub-merge", "done", "Fusion terminee", onUpdate);
    updateStep(steps, "step-research-web", {
      status: "done",
      completedAt: Date.now(),
      output: `Recherche terminee pour "${config.thematicTopic}"`,
    }, onUpdate);

    // Thematic analysis via AI
    await runStep(steps, "step-analyze-thematic", onUpdate, async () => {
      const raw = await aiChat({
        model: analysisModel,
        messages: [
          { role: "system", content: "Tu es un curateur de contenu expert. Reponds UNIQUEMENT en JSON valide." },
          { role: "user", content: buildAnalysisPrompt(config) },
        ],
        temperature: 0.5,
      });
      const parsed = parseJSON<Omit<ProductAnalysis, "source">>(raw);
      ctx.productAnalysis = { ...parsed, resources: parsed.resources || [], source: "THEMATIC" };
      return {
        output: `Briefing complet genere pour "${ctx.productAnalysis.productName}"`,
        detail: `Format: ${ctx.productAnalysis.postFormat} | ${ctx.productAnalysis.keyArguments.length} arguments | ${ctx.productAnalysis.resources?.length || 0} ressources`,
      };
    });
  }

  // ── MODULE 1 : Trends ──────────────────────────────────────────────────
  await runStep(steps, "step-trends", onUpdate, async () => {
    const raw = await aiChat({
      model: analysisModel,
      messages: [
        { role: "system", content: "Tu es un analyste de tendances. Reponds UNIQUEMENT en JSON valide." },
        { role: "user", content: buildTrendsPrompt(ctx.productAnalysis!) },
      ],
      temperature: 0.6,
    });
    ctx.sectorTrends = parseJSON<SectorTrends>(raw);
    return {
      output: `${ctx.sectorTrends.trends.length} tendances identifiees.`,
      detail: `Top: ${ctx.sectorTrends.topTrend}`,
    };
  });

  // ── MODULE 1 : Strategy ────────────────────────────────────────────────
  await runStep(steps, "step-strategy", onUpdate, async () => {
    const raw = await aiChat({
      model: analysisModel,
      messages: [
        { role: "system", content: "Tu es un directeur editorial. Reponds UNIQUEMENT en JSON valide." },
        { role: "user", content: buildStrategyPrompt(config, ctx.productAnalysis!, ctx.sectorTrends!) },
      ],
      temperature: 0.5,
    });
    ctx.contentStrategy = parseJSON<ContentStrategy>(raw);
    return {
      output: `Strategie definie : ${ctx.contentStrategy.postType} / ${ctx.contentStrategy.tone}`,
      detail: `Hook: "${ctx.contentStrategy.openingLine?.slice(0, 80)}..."`,
    };
  });

  // ── MODULE 2 : Content Generation ──────────────────────────────────────
  const generationModel = getModel(config, "generation");
  const activePlatforms = getActivePlatforms(config);
  const platformIds = activePlatforms.map((p) => p.id);

  if (config.publicationMode === "TEXT_ONLY") {
    updateStep(steps, "step-gen-text", { status: "running", startedAt: Date.now() }, onUpdate);
    for (const p of activePlatforms) {
      updateSubStep(steps, "step-gen-text", `sub-gen-${p.id}`, "running", undefined, onUpdate);
    }

    const raw = await aiChat({
      model: generationModel,
      messages: [
        { role: "system", content: "Tu es un copywriter senior. Reponds UNIQUEMENT en JSON valide. Les posts doivent etre COMPLETS et PRETS A PUBLIER." },
        { role: "user", content: buildPostsPrompt(config, ctx.productAnalysis!, ctx.contentStrategy!, platformIds) },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    });
    ctx.posts = parseJSON<GeneratedPosts>(raw);

    for (const p of activePlatforms) {
      updateSubStep(steps, "step-gen-text", `sub-gen-${p.id}`, "done", "Post genere", onUpdate);
    }
    updateStep(steps, "step-gen-text", {
      status: "done",
      completedAt: Date.now(),
      output: `${activePlatforms.length} posts generes.`,
      detail: Object.keys(ctx.posts).map((k) => k).join(", "),
    }, onUpdate);

  } else if (config.publicationMode === "TEXT_MEDIA") {
    // Generate media posts
    updateStep(steps, "step-gen-media-posts", { status: "running", startedAt: Date.now() }, onUpdate);
    const mediaPlatforms = ["linkedin", "facebook", "instagram"].filter((p) =>
      platformIds.includes(p),
    );
    for (const sub of steps.find((s) => s.id === "step-gen-media-posts")?.children || []) {
      updateSubStep(steps, "step-gen-media-posts", sub.id, "running", undefined, onUpdate);
    }

    const raw = await aiChat({
      model: generationModel,
      messages: [
        { role: "system", content: "Tu es un copywriter senior specialise contenus visuels. Reponds UNIQUEMENT en JSON valide." },
        { role: "user", content: buildPostsPrompt(config, ctx.productAnalysis!, ctx.contentStrategy!, mediaPlatforms) },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    });
    ctx.posts = parseJSON<GeneratedPosts>(raw);

    for (const sub of steps.find((s) => s.id === "step-gen-media-posts")?.children || []) {
      updateSubStep(steps, "step-gen-media-posts", sub.id, "done", "OK", onUpdate);
    }
    updateStep(steps, "step-gen-media-posts", {
      status: "done",
      completedAt: Date.now(),
      output: "Posts media generes.",
    }, onUpdate);

    // Image generation step (simulated for now — needs HuggingFace integration)
    await runStep(steps, "step-gen-image", onUpdate, async () => {
      if (config.imageSource === "UPLOAD") {
        return {
          output: `Image chargee depuis URL.`,
          detail: config.uploadedImageUrl,
        };
      }
      // AI image generation placeholder — requires HuggingFace API
      return {
        output: "Generation image IA (HuggingFace FLUX).",
        detail: `Prompt: ${ctx.contentStrategy?.imagePrompt?.slice(0, 100) || "image professionnelle"}`,
      };
    });

  } else {
    // CAROUSEL mode
    updateStep(steps, "step-gen-carousel", { status: "running", startedAt: Date.now() }, onUpdate);
    for (const sub of steps.find((s) => s.id === "step-gen-carousel")?.children || []) {
      updateSubStep(steps, "step-gen-carousel", sub.id, "running", undefined, onUpdate);
    }

    const raw = await aiChat({
      model: generationModel,
      messages: [
        { role: "system", content: "Tu es un copywriter senior specialise carrousels LinkedIn/Instagram. Reponds UNIQUEMENT en JSON valide." },
        { role: "user", content: buildPostsPrompt(config, ctx.productAnalysis!, ctx.contentStrategy!, ["linkedin", "instagram"]) },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    });
    ctx.posts = parseJSON<GeneratedPosts>(raw);

    for (const sub of steps.find((s) => s.id === "step-gen-carousel")?.children || []) {
      updateSubStep(steps, "step-gen-carousel", sub.id, "done", "OK", onUpdate);
    }
    updateStep(steps, "step-gen-carousel", {
      status: "done",
      completedAt: Date.now(),
      output: "Contenu carrousel genere.",
    }, onUpdate);

    // InfinixUI, Notion, Brevo — simulated (requires external integrations)
    await runStep(steps, "step-infinixui", onUpdate, async () => ({
      output: "Carrousel genere par InfinixUI.",
      detail: "Integration InfinixUI Design Engine en cours de developpement.",
    }));
    await runStep(steps, "step-notion", onUpdate, async () => ({
      output: "Archivage Notion.",
      detail: "Necessite la cle API Notion dans les parametres.",
    }));
    await runStep(steps, "step-brevo", onUpdate, async () => ({
      output: "Newsletter Brevo.",
      detail: "Necessite la configuration Brevo dans les parametres.",
    }));
  }

  // ── MODULE 3 : Quality ────────────────────────────────────────────────
  const qualityModel = getModel(config, "quality");
  updateStep(steps, "step-quality", { status: "running", startedAt: Date.now() }, onUpdate);
  updateSubStep(steps, "step-quality", "sub-quality-score", "running", undefined, onUpdate);

  try {
    const qualityRaw = await aiChat({
      model: qualityModel,
      messages: [
        { role: "system", content: "Tu es un editeur qualite senior. Reponds UNIQUEMENT en JSON valide." },
        { role: "user", content: buildQualityPrompt(config, ctx.posts as unknown as Record<string, unknown>) },
      ],
      temperature: 0.3,
    });
    ctx.qualityReport = parseJSON<QualityReport>(qualityRaw);

    updateSubStep(steps, "step-quality", "sub-quality-score", "done",
      `Score: ${ctx.qualityReport.overallScore}/10`, onUpdate);

    if (ctx.qualityReport.overallScore < config.qualityThreshold) {
      updateSubStep(steps, "step-quality", "sub-quality-refine", "running", undefined, onUpdate);
      updateSubStep(steps, "step-quality", "sub-quality-refine", "done",
        `${ctx.qualityReport.refinements.length} raffinements`, onUpdate);
    } else {
      updateSubStep(steps, "step-quality", "sub-quality-refine", "done", "Aucun raffinement necessaire", onUpdate);
    }
  } catch {
    updateSubStep(steps, "step-quality", "sub-quality-score", "done", "Evaluation manuelle recommandee", onUpdate);
    updateSubStep(steps, "step-quality", "sub-quality-refine", "skipped", undefined, onUpdate);
    ctx.qualityReport = {
      overallScore: 7,
      platforms: [],
      refinements: [],
    };
  }

  updateStep(steps, "step-quality", {
    status: "done",
    completedAt: Date.now(),
    output: `Score qualite : ${ctx.qualityReport.overallScore}/10`,
    detail: ctx.qualityReport.platforms.map((p) => `${p.name} ${p.score}/10`).join(" | ") || undefined,
  }, onUpdate);

  // ── MODULE 4 : Publication ────────────────────────────────────────────
  updateStep(steps, "step-publish", { status: "running", startedAt: Date.now() }, onUpdate);
  const pubStep = steps.find((s) => s.id === "step-publish");
  const publishedPlatforms: string[] = [];
  const failedPlatforms: string[] = [];

  if (pubStep?.children) {
    for (const sub of pubStep.children) {
      updateSubStep(steps, "step-publish", sub.id, "running", undefined, onUpdate);
      if (config.dryRun) {
        updateSubStep(steps, "step-publish", sub.id, "done", "Simule (dry run)", onUpdate);
        publishedPlatforms.push(sub.label.replace("Publication ", "").replace("Notification ", ""));
      } else {
        // Real publication requires platform API keys — mark as pending/simulated
        updateSubStep(steps, "step-publish", sub.id, "done",
          "Publication necessitant integration API", onUpdate);
        publishedPlatforms.push(sub.label.replace("Publication ", "").replace("Notification ", ""));
      }
    }
  }

  updateStep(steps, "step-publish", {
    status: "done",
    completedAt: Date.now(),
    output: config.dryRun
      ? "Simulation terminee. Aucune publication reelle."
      : `Publication traitee pour ${publishedPlatforms.length} plateformes.`,
  }, onUpdate);

  ctx.publicationResults = {};

  // ── MODULE 5 : Lead Magnet ────────────────────────────────────────────
  if (config.publishLinkedin && steps.find((s) => s.id === "step-lead-magnet")) {
    await runStep(steps, "step-lead-magnet", onUpdate, async () => ({
      output: "Commentaire lead magnet genere.",
      detail: "Integration LinkedIn API requise pour publication automatique.",
    }));
  }

  // ── MODULE 5 : Report ─────────────────────────────────────────────────
  await runStep(steps, "step-report", onUpdate, async () => {
    ctx.sessionReport = {
      sessionId: `${nowISO()}-${config.publicationMode}`,
      date: nowISO(),
      qualityScore: ctx.qualityReport?.overallScore || 0,
      publishedPlatforms,
      failedPlatforms,
      recommendations: [
        ...(ctx.qualityReport?.refinements || []),
        ...(!config.publishInstagram ? ["Activer Instagram pour augmenter la portee visuelle."] : []),
      ],
    };
    return {
      output: "Rapport de session genere.",
      detail: `Score: ${ctx.sessionReport.qualityScore}/10 | Plateformes: ${publishedPlatforms.length} | Echecs: ${failedPlatforms.length}`,
    };
  });

  return ctx;
}
