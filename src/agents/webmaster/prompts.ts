import type { WebmasterConfig, ProductAnalysis, SectorTrends, ContentStrategy } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function styleBrief(style: string): string {
  const map: Record<string, string> = {
    EXPERT: "Ton expert technique. Dense, precis, zero emoji. Vocabulaire specialise. Pas de superlatifs vides.",
    MARKETING: "Ton marketing accrocheur. Emojis strategiques (max 4). CTA fort. Formulations punchy et urgentes.",
    ACADEMIC: "Ton academique structure. References si possible. Ton neutre et objectif. Pas d'emojis.",
    TEASER: "Ton teaser : court, intrigant, mysterieux. Susciter la curiosite. Max 5 lignes. Pas de details.",
    STORYTELLING: "Ton storytelling narratif. Anecdotes personnelles. Premiere personne. Emotion et authenticite.",
  };
  return map[style] || map.EXPERT;
}

function platformSpecs(): string {
  return `Specifications par plateforme :
- LinkedIn : max 3000 caracteres, sauts de ligne pour la lisibilite, 3-5 hashtags en fin de post, pas de liens dans le corps (mettre en commentaire)
- Twitter/X : max 280 caracteres pour le tweet principal. Si thread, max 4 tweets. Chaque tweet doit etre autonome.
- Facebook : max 500 mots, ton conversationnel, question d'engagement en fin, pas de hashtags
- Instagram : max 2200 caracteres, emojis acceptes, 20-30 hashtags en fin, ton visuel/inspirant
- TikTok : max 150 caracteres, format court accrocheur, hashtags tendance`;
}

// ── Analysis Prompts ─────────────────────────────────────────────────────────

export function buildAnalysisPrompt(config: WebmasterConfig, scrapedContent?: string): string {
  if (config.sourceMode === "SCRAPING") {
    return `Tu es un expert en marketing digital et analyse de pages de vente.

Analyse le contenu scrape de cette page et extrais un briefing marketing structure.

URL source : ${config.scrapingUrl}
Contenu scrape :
---
${scrapedContent || "(contenu non disponible)"}
---

Reponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "productName": "nom du produit/service",
  "postFormat": "type de post optimal (list/story/tips/comparison)",
  "productBenefit": "benefice principal en une phrase",
  "targetAudience": "audience cible",
  "sector": "secteur d'activite",
  "tone": "ton recommande",
  "landingPageUrl": "${config.scrapingUrl}",
  "companyName": "nom de la marque detecte",
  "authorName": "auteur detecte ou vide",
  "authorExpertise": "expertise detectee",
  "keyArguments": ["argument 1", "argument 2", "argument 3"],
  "painPoints": ["probleme 1", "probleme 2"],
  "socialProof": "preuve sociale trouvee",
  "uniqueSellingProposition": "USP principale",
  "concreteResults": "resultats concrets mentionnes",
  "imagePromptContext": "description visuelle pour generation d'image"
}`;
  }

  return `Tu es un curateur de contenu expert et un stratege de contenu digital.

A partir du sujet ci-dessous, genere un briefing marketing complet pour creer des posts sociaux de haute qualite.

Sujet : ${config.thematicTopic || "(non defini)"}
Secteur : ${config.thematicSector || "General"}
Audience cible : ${config.thematicAudience || "Professionnels"}
Auteur : ${config.thematicAuthorName || "Expert"} — ${config.thematicAuthorExpertise || "Specialiste"}
Marque : ${config.thematicCompanyName || ""}
Landing page : ${config.thematicLandingUrl || "(aucune)"}

Utilise tes connaissances pour :
1. Identifier les outils, ressources et faits cles sur ce sujet
2. Trouver des statistiques et chiffres concrets
3. Proposer des angles editoriaux percutants

Reponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "productName": "${config.thematicTopic}",
  "postFormat": "type de post optimal (list/story/tips/comparison/thread)",
  "productBenefit": "valeur principale pour le lecteur",
  "targetAudience": "${config.thematicAudience || "Professionnels"}",
  "sector": "${config.thematicSector || "Tech"}",
  "tone": "ton recommande",
  "landingPageUrl": "${config.thematicLandingUrl || ""}",
  "companyName": "${config.thematicCompanyName || ""}",
  "authorName": "${config.thematicAuthorName || "Expert"}",
  "authorExpertise": "${config.thematicAuthorExpertise || "Specialiste"}",
  "resources": [
    {"name": "Nom outil/ressource", "url": "https://...", "description": "...", "highlight": "point fort"}
  ],
  "keyArguments": ["fait 1 avec chiffre", "fait 2", "fait 3", "fait 4", "fait 5"],
  "painPoints": ["probleme 1 de l'audience", "probleme 2", "probleme 3"],
  "socialProof": "statistique ou preuve sociale concrete",
  "uniqueSellingProposition": "angle unique et accrocheur",
  "concreteResults": "resultats mesurables",
  "imagePromptContext": "description visuelle pour generation d'image liee au sujet"
}`;
}

export function buildTrendsPrompt(analysis: ProductAnalysis): string {
  return `Tu es un analyste de tendances sectorielles.

A partir de ce briefing produit, identifie 3 tendances actuelles et pertinentes dans le secteur "${analysis.sector}" pour l'audience "${analysis.targetAudience}".

Sujet principal : ${analysis.productName}
Arguments cles : ${analysis.keyArguments.join(", ")}

Chaque tendance doit avoir un angle d'accroche pour les reseaux sociaux et une statistique (reelle ou estimee).

Reponds UNIQUEMENT en JSON valide :
{
  "trends": [
    {"title": "Tendance 1", "hookAngle": "Angle accrocheur pour post", "stat": "XX%"},
    {"title": "Tendance 2", "hookAngle": "...", "stat": "..."},
    {"title": "Tendance 3", "hookAngle": "...", "stat": "..."}
  ],
  "topTrend": "La tendance la plus pertinente",
  "visualAngle": "Angle visuel optimal pour illustrer ces tendances"
}`;
}

export function buildStrategyPrompt(
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  trends: SectorTrends,
): string {
  return `Tu es un directeur editorial specialise reseaux sociaux.

A partir du briefing et des tendances, definis la strategie editoriale pour cette session de publication.

Style demande : ${config.postStyle} — ${styleBrief(config.postStyle)}
Mode publication : ${config.publicationMode}
Produit/Sujet : ${analysis.productName}
Audience : ${analysis.targetAudience}
Tendance retenue : ${trends.topTrend}
Arguments cles : ${analysis.keyArguments.join(" | ")}
USP : ${analysis.uniqueSellingProposition}

Reponds UNIQUEMENT en JSON valide :
{
  "angle": "angle editorial principal",
  "openingLine": "premiere phrase d'accroche (hook) qui stoppe le scroll",
  "coreValue": "valeur actionnable centrale du post",
  "proofElement": "preuve/stat/chiffre a integrer",
  "ctaSuggestion": "call-to-action recommande",
  "tone": "${config.postStyle.toLowerCase()}",
  "postType": "type de post choisi",
  "resourceStrategy": "comment integrer les ressources/liens naturellement",
  "imagePrompt": "${config.publicationMode === "TEXT_MEDIA" ? "prompt detaille pour generation image (style pro, sans texte, 1080x1080)" : ""}",
  "carouselTeaser": "${config.publicationMode === "CAROUSEL" ? "texte teaser pour accompagner le carrousel" : ""}"
}`;
}

// ── Generation Prompts ───────────────────────────────────────────────────────

export function buildPostsPrompt(
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  strategy: ContentStrategy,
  platforms: string[],
): string {
  return `Tu es un copywriter senior specialise reseaux sociaux. Tu ecris des posts qui generent de l'engagement.

${styleBrief(config.postStyle)}

STRATEGIE EDITORIALE :
- Angle : ${strategy.angle}
- Hook : ${strategy.openingLine}
- Valeur cle : ${strategy.coreValue}
- Preuve : ${strategy.proofElement}
- CTA : ${strategy.ctaSuggestion}
- Type de post : ${strategy.postType}

CONTEXTE PRODUIT :
- Sujet : ${analysis.productName}
- Audience : ${analysis.targetAudience}
- Arguments : ${analysis.keyArguments.join(" | ")}
- USP : ${analysis.uniqueSellingProposition}
${analysis.landingPageUrl ? `- Landing page : ${analysis.landingPageUrl}` : ""}
${analysis.resources?.length ? `- Ressources a integrer naturellement : ${analysis.resources.map((r) => `${r.name} (${r.url})`).join(", ")}` : ""}

${platformSpecs()}

Genere un post pour CHAQUE plateforme demandee : ${platforms.join(", ")}

Reponds UNIQUEMENT en JSON valide :
{
  ${platforms.includes("linkedin") ? `"linkedin": {"content": "post complet LinkedIn", "hashtags": ["#tag1", "#tag2", "#tag3"], "wordCount": 0},` : ""}
  ${platforms.includes("twitter") ? `"twitter": {"content": "tweet principal", "thread": ["tweet 2", "tweet 3"], "charCount": 0},` : ""}
  ${platforms.includes("facebook") ? `"facebook": {"content": "post Facebook complet", "wordCount": 0},` : ""}
  ${platforms.includes("instagram") ? `"instagram": {"fullCaption": "caption Instagram avec emojis et hashtags"},` : ""}
  ${platforms.includes("tiktok") ? `"tiktok": {"fullCaption": "caption TikTok courte et accrocheuse"},` : ""}
}

IMPORTANT : Les posts doivent etre REELS, COMPLETS et PRETS A PUBLIER. Pas de placeholder.`;
}

// ── Quality Prompt ───────────────────────────────────────────────────────────

export function buildQualityPrompt(
  config: WebmasterConfig,
  posts: Record<string, unknown>,
): string {
  return `Tu es un editeur qualite senior pour les reseaux sociaux.

Evalue chaque post ci-dessous sur une echelle de 1 a 10 selon :
- Accroche (le hook stoppe-t-il le scroll ?)
- Valeur (le lecteur apprend-il quelque chose ?)
- CTA (l'appel a l'action est-il clair ?)
- Format (le post respecte-t-il les specs de la plateforme ?)
- Style (coherent avec le style ${config.postStyle} ?)

Posts a evaluer :
${JSON.stringify(posts, null, 2)}

Seuil minimum : ${config.qualityThreshold}/10

Si un post est en dessous du seuil, propose une version améliorée.

Reponds UNIQUEMENT en JSON valide :
{
  "overallScore": 8.5,
  "platforms": [
    {"name": "LinkedIn", "score": 9, "issues": []},
    {"name": "Twitter", "score": 7, "issues": ["hook trop long"]}
  ],
  "refinements": ["description de chaque raffinement applique"],
  "refinedPosts": null
}

Si des raffinements sont necessaires, "refinedPosts" doit contenir les posts corriges au meme format que l'input. Sinon, null.`;
}
