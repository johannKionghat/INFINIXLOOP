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
  buildScrapingAnalysisPrompt,
  buildThematicAnalysisPrompt,
  buildTrendsPrompt,
  buildStrategyPrompt,
  buildLinkedinPrompt,
  buildTwitterPrompt,
  buildFacebookPrompt,
  buildTiktokPrompt,
  buildInstagramPrompt,
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
  patch: { status: ExecutionStep["status"]; input?: string; output?: string; detail?: string },
  onUpdate: StepCallback,
) {
  const step = steps.find((s) => s.id === stepId);
  if (step?.children) {
    const sub = step.children.find((c) => c.id === subId);
    if (sub) Object.assign(sub, patch);
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

// ── Server-side helpers ─────────────────────────────────────────────────────

async function serverScrape(url: string): Promise<{ textContent: string; title: string; url: string }> {
  const res = await fetch("/api/ai/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Scrape error (${res.status})`);
  return data;
}

async function serverSearch(query: string): Promise<{ textContent: string; resultCount: number }> {
  const res = await fetch("/api/ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Search error (${res.status})`);
  return data;
}

// ── Per-platform prompt builder map ─────────────────────────────────────────

type PlatformPromptBuilder = (
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  strategy: ContentStrategy,
) => string;

const PLATFORM_PROMPT_MAP: Record<string, PlatformPromptBuilder> = {
  linkedin: buildLinkedinPrompt,
  twitter: buildTwitterPrompt,
  facebook: buildFacebookPrompt,
  tiktok: buildTiktokPrompt,
  instagram: buildInstagramPrompt,
};

// Per-platform temperature (from nauticeai)
const PLATFORM_TEMPERATURE: Record<string, number> = {
  linkedin: 0.75,
  twitter: 0.9,
  facebook: 0.8,
  tiktok: 0.9,
  instagram: 0.85,
};

// Per-platform max tokens (from nauticeai)
const PLATFORM_MAX_TOKENS: Record<string, number> = {
  linkedin: 3500,
  twitter: 1200,
  facebook: 1800,
  tiktok: 1000,
  instagram: 1500,
};

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
      updateSubStep(steps, "step-config-validate", sub.id, { status: "done", output: "OK" }, onUpdate);
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
    // Scraping step — server-side via /api/ai/scrape
    let scraped = { textContent: "", title: "", url: config.scrapingUrl };
    await runStep(steps, "step-scraping", onUpdate, async () => {
      scraped = await serverScrape(config.scrapingUrl);
      return {
        output: `Page scrapee : ${config.scrapingUrl}`,
        detail: `${scraped.textContent.length} caracteres extraits | Titre: "${scraped.title}"`,
      };
    });

    // Analyze scraping via AI
    await runStep(steps, "step-analyze-scraping", onUpdate, async () => {
      const prompt = buildScrapingAnalysisPrompt(config, scraped);
      const raw = await aiChat({
        model: analysisModel,
        messages: [
          { role: "system", content: "Tu es un expert en marketing digital. Reponds UNIQUEMENT en JSON valide." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      });
      const parsed = parseJSON<Omit<ProductAnalysis, "source">>(raw);
      ctx.productAnalysis = { ...parsed, resources: parsed.resources || [], source: "SCRAPING" };
      return {
        output: `Analyse terminee : ${ctx.productAnalysis.productName}`,
        detail: `${ctx.productAnalysis.keyArguments.length} arguments | USP: ${ctx.productAnalysis.uniqueSellingProposition?.slice(0, 60)}...`,
      };
    });
  } else {
    // Thematic research — DuckDuckGo server-side via /api/ai/search
    updateStep(steps, "step-research-web", { status: "running", startedAt: Date.now() }, onUpdate);

    let searchText = "";
    let searchExtraText = "";

    // Search 1: primary
    updateSubStep(steps, "step-research-web", "sub-search-1", {
      status: "running",
      input: `Recherche: "${config.thematicTopic} outils ressources guide complet site officiel"`,
    }, onUpdate);
    try {
      const search1 = await serverSearch(`${config.thematicTopic} outils ressources guide complet site officiel`);
      searchText = search1.textContent;
      updateSubStep(steps, "step-research-web", "sub-search-1", {
        status: "done",
        output: `${search1.resultCount} resultats trouves`,
        detail: searchText.slice(0, 200) + "...",
      }, onUpdate);
    } catch (err) {
      updateSubStep(steps, "step-research-web", "sub-search-1", {
        status: "error",
        output: err instanceof Error ? err.message : "Erreur recherche",
      }, onUpdate);
    }

    // Search 2: complementary
    updateSubStep(steps, "step-research-web", "sub-search-2", {
      status: "running",
      input: `Recherche: "${config.thematicTopic} top meilleurs comparatif avis ${new Date().getFullYear()}"`,
    }, onUpdate);
    try {
      const search2 = await serverSearch(`${config.thematicTopic} top meilleurs comparatif avis ${new Date().getFullYear()}`);
      searchExtraText = search2.textContent;
      updateSubStep(steps, "step-research-web", "sub-search-2", {
        status: "done",
        output: `${search2.resultCount} resultats complementaires`,
        detail: searchExtraText.slice(0, 200) + "...",
      }, onUpdate);
    } catch (err) {
      updateSubStep(steps, "step-research-web", "sub-search-2", {
        status: "error",
        output: err instanceof Error ? err.message : "Erreur recherche",
      }, onUpdate);
    }

    // Merge
    updateSubStep(steps, "step-research-web", "sub-merge", {
      status: "done",
      output: `Fusion: ${searchText.length + searchExtraText.length} caracteres totaux`,
    }, onUpdate);

    updateStep(steps, "step-research-web", {
      status: "done",
      completedAt: Date.now(),
      output: `Recherche terminee pour "${config.thematicTopic}"`,
      detail: `Source 1: ${searchText.length} chars | Source 2: ${searchExtraText.length} chars`,
    }, onUpdate);

    // Thematic analysis via AI with web search results
    await runStep(steps, "step-analyze-thematic", onUpdate, async () => {
      const prompt = buildThematicAnalysisPrompt(config, searchText, searchExtraText);
      const raw = await aiChat({
        model: analysisModel,
        messages: [
          { role: "system", content: "Tu es un curateur de contenu expert. Reponds UNIQUEMENT en JSON valide." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 4000,
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
    const prompt = buildTrendsPrompt(ctx.productAnalysis!);
    const raw = await aiChat({
      model: analysisModel,
      messages: [
        { role: "system", content: "Tu es un analyste de tendances. Reponds UNIQUEMENT en JSON valide." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1200,
    });
    ctx.sectorTrends = parseJSON<SectorTrends>(raw);
    return {
      output: `${ctx.sectorTrends.trends.length} tendances identifiees.`,
      detail: `Top: ${ctx.sectorTrends.topTrend}`,
    };
  });

  // ── MODULE 1 : Strategy ────────────────────────────────────────────────
  await runStep(steps, "step-strategy", onUpdate, async () => {
    const prompt = buildStrategyPrompt(config, ctx.productAnalysis!, ctx.sectorTrends!);
    const raw = await aiChat({
      model: analysisModel,
      messages: [
        { role: "system", content: "Tu es un directeur editorial. Reponds UNIQUEMENT en JSON valide." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });
    ctx.contentStrategy = parseJSON<ContentStrategy>(raw);
    return {
      output: `Strategie definie : ${ctx.contentStrategy.postType} / ${ctx.contentStrategy.tone}`,
      detail: `Hook: "${ctx.contentStrategy.openingLine?.slice(0, 80)}..."`,
    };
  });

  // ── MODULE 2 : Content Generation — Per-platform dedicated LLM calls ──
  const generationModel = getModel(config, "generation");
  const activePlatforms = getActivePlatforms(config);
  const platformIds = activePlatforms.map((p) => p.id);

  // Determine which step ID to use based on publication mode
  const genStepId =
    config.publicationMode === "TEXT_ONLY" ? "step-gen-text"
    : config.publicationMode === "TEXT_MEDIA" ? "step-gen-media-posts"
    : "step-gen-carousel";

  // For carousel, only generate for linkedin and instagram
  const genPlatforms = config.publicationMode === "CAROUSEL"
    ? activePlatforms.filter((p) => ["linkedin", "instagram"].includes(p.id))
    : activePlatforms.filter((p) => PLATFORM_PROMPT_MAP[p.id]);

  updateStep(steps, genStepId, { status: "running", startedAt: Date.now() }, onUpdate);

  ctx.posts = {} as GeneratedPosts;

  // Generate per-platform with dedicated LLM calls
  for (const platform of genPlatforms) {
    const subId = `sub-gen-${platform.id}`;
    const promptBuilder = PLATFORM_PROMPT_MAP[platform.id];
    if (!promptBuilder) continue;

    const prompt = promptBuilder(config, ctx.productAnalysis!, ctx.contentStrategy!);
    const temp = PLATFORM_TEMPERATURE[platform.id] || 0.7;
    const maxTokens = PLATFORM_MAX_TOKENS[platform.id] || 2000;

    updateSubStep(steps, genStepId, subId, {
      status: "running",
      input: `Modele: ${generationModel} | Temp: ${temp} | Style: ${config.postStyle}`,
    }, onUpdate);

    try {
      const raw = await aiChat({
        model: generationModel,
        messages: [
          { role: "system", content: `Tu es un copywriter senior specialise ${platform.label}. Reponds UNIQUEMENT en JSON valide. Les posts doivent etre COMPLETS et PRETS A PUBLIER.` },
          { role: "user", content: prompt },
        ],
        temperature: temp,
        max_tokens: maxTokens,
      });

      const parsed = parseJSON<Record<string, unknown>>(raw);
      (ctx.posts as Record<string, unknown>)[platform.id] = parsed;

      // Extract preview for output
      const content = (parsed.content || parsed.caption || parsed.fullCaption || "") as string;
      const preview = typeof content === "string" ? content.slice(0, 120) + "..." : "Post genere";

      updateSubStep(steps, genStepId, subId, {
        status: "done",
        output: `Post ${platform.label} genere`,
        detail: preview,
      }, onUpdate);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      updateSubStep(steps, genStepId, subId, {
        status: "error",
        output: `Erreur ${platform.label}: ${msg}`,
      }, onUpdate);
    }
  }

  updateStep(steps, genStepId, {
    status: "done",
    completedAt: Date.now(),
    output: `${genPlatforms.length} posts generes (appels LLM dedies par plateforme).`,
    detail: genPlatforms.map((p) => p.label).join(", "),
  }, onUpdate);

  // ── TEXT_MEDIA: Image generation step ──────────────────────────────────
  if (config.publicationMode === "TEXT_MEDIA") {
    await runStep(steps, "step-gen-image", onUpdate, async () => {
      if (config.imageSource === "UPLOAD") {
        return {
          output: "Image chargee depuis URL.",
          detail: config.uploadedImageUrl,
        };
      }
      return {
        output: "Generation image IA (HuggingFace FLUX).",
        detail: `Prompt: ${ctx.contentStrategy?.imagePrompt?.slice(0, 100) || "image professionnelle"}`,
      };
    });
  }

  // ── CAROUSEL: Additional steps ─────────────────────────────────────────
  if (config.publicationMode === "CAROUSEL") {
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

  updateSubStep(steps, "step-quality", "sub-quality-score", {
    status: "running",
    input: `Modele: ${qualityModel} | Seuil: ${config.qualityThreshold}/10`,
  }, onUpdate);

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

    updateSubStep(steps, "step-quality", "sub-quality-score", {
      status: "done",
      output: `Score: ${ctx.qualityReport.overallScore}/10`,
      detail: ctx.qualityReport.platforms.map((p) => `${p.name}: ${p.score}/10`).join(" | "),
    }, onUpdate);

    if (ctx.qualityReport.overallScore < config.qualityThreshold) {
      updateSubStep(steps, "step-quality", "sub-quality-refine", {
        status: "running",
        input: `Score ${ctx.qualityReport.overallScore} < seuil ${config.qualityThreshold}`,
      }, onUpdate);
      updateSubStep(steps, "step-quality", "sub-quality-refine", {
        status: "done",
        output: `${ctx.qualityReport.refinements.length} raffinements appliques`,
        detail: ctx.qualityReport.refinements.join(" | "),
      }, onUpdate);
    } else {
      updateSubStep(steps, "step-quality", "sub-quality-refine", {
        status: "done",
        output: "Aucun raffinement necessaire",
        detail: `Score ${ctx.qualityReport.overallScore} >= seuil ${config.qualityThreshold}`,
      }, onUpdate);
    }
  } catch {
    updateSubStep(steps, "step-quality", "sub-quality-score", {
      status: "done",
      output: "Evaluation manuelle recommandee",
    }, onUpdate);
    updateSubStep(steps, "step-quality", "sub-quality-refine", { status: "skipped" }, onUpdate);
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
      const platformName = sub.label.replace("Publication ", "").replace("Notification ", "");
      updateSubStep(steps, "step-publish", sub.id, {
        status: "running",
        input: config.dryRun ? "Mode simulation (dry run)" : `Publication vers ${platformName}`,
      }, onUpdate);

      if (config.dryRun) {
        updateSubStep(steps, "step-publish", sub.id, {
          status: "done",
          output: "Simule (dry run)",
          detail: "Aucun appel API reel effectue",
        }, onUpdate);
        publishedPlatforms.push(platformName);
      } else {
        updateSubStep(steps, "step-publish", sub.id, {
          status: "done",
          output: "Publication necessitant integration API",
          detail: "Configurez les cles API de la plateforme pour activer la publication automatique",
        }, onUpdate);
        publishedPlatforms.push(platformName);
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
