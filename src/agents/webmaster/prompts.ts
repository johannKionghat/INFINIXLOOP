import type { WebmasterConfig, ProductAnalysis, SectorTrends, ContentStrategy } from "./types";

// ── POST_STYLES — per-platform tone/formatting/structure/rules ──────────────

interface PlatformStyle {
  tone: string;
  formatting?: string;
  structure?: string;
  rules: string;
}

interface PostStyleDef {
  label: string;
  description: string;
  linkedin: PlatformStyle;
  twitter: PlatformStyle;
  facebook: PlatformStyle;
  tiktok: PlatformStyle;
  instagram: PlatformStyle;
}

export const POST_STYLES: Record<string, PostStyleDef> = {
  EXPERT: {
    label: "Expert / Explicatif",
    description: "Style technique, dense, direct. Comme un expert qui explique a un collegue.",
    linkedin: {
      tone: "Ton expert, direct, technique. ZERO emoji. Tu parles comme un ingenieur senior a un pair.",
      formatting: `- Gras Unicode pour titres de sections et noms d'outils/concepts.
- Separateurs entre les blocs principaux.
- Fleches pour les sous-points.
- 1 ligne vide entre chaque bloc.`,
      structure: `Accroche provocante ou contre-intuitive. 1 phrase courte qui stoppe le scroll.
2-3 lignes de contexte : pourquoi maintenant.
Phrase de transition : "Voici ce que la plupart ratent :" ou equivalent.
Si postFormat=list : Numero. Nom — Description directe. Cas d'usage concret. URL officielle. (Repete pour chaque item)
Si postFormat=guide : Etapes numerotees. Explication concrete. Detail technique. Erreur courante a eviter.
Si postFormat=analysis ou news : Sous-sections. Chiffres, comparaisons, implications.
Conclusion : verite brute + implications concretes.
Derniere ligne : punchline ou question ouverte qui pousse a commenter.`,
      rules: `- ZERO emoji. Pas un seul.
- AUCUNE limite de mots. Ecris autant que necessaire.
- Integre les URLs REELLES des ressources.
- Au moins 1 stat ou chiffre concret.
- Interdit : emojis, "Revolutionnaire", "Incroyable", "Achetez maintenant", URLs fictives.`,
    },
    twitter: {
      tone: "Expert concis et tranchant. Chaque mot compte.",
      rules: "Thread 3-5 tweets. Hook percutant. 1 fait/ressource par tweet corps. Derniere : CTA.",
    },
    facebook: {
      tone: "Expert accessible. Tu expliques a quelqu'un de curieux mais pas specialiste.",
      rules: "200-300 mots. Faits concrets + URLs reelles. Question ouverte finale. 2-3 emojis max.",
    },
    tiktok: {
      tone: "Expert qui vulgarise en 60s. Direct, concret, educatif.",
      rules: "Caption max 300 chars. Script video 30-60s avec outils concrets.",
    },
    instagram: {
      tone: "Expert educatif. Contenu utile et sauvegardable.",
      rules: '150-250 mots. Mentionne outils par nom (pas d\'URL en caption IG). "Lien en bio".',
    },
  },

  MARKETING: {
    label: "Marketing / Viral",
    description: "Style accrocheur, emojis structurants, CTA fort. Pour vendre ou generer des leads.",
    linkedin: {
      tone: "Marketeur charismatique. Tu veux que le lecteur agisse MAINTENANT. Emojis strategiques.",
      formatting: `- Gras Unicode pour titres et points cles.
- Emojis structurants pour aerer et guider l'oeil.
- 1 ligne vide entre chaque bloc.`,
      structure: `Titre gras accrocheur avec emoji.
2-3 lignes de teasing : pourquoi le lecteur DOIT lire ca.
Si postFormat=list : Emoji + Numero. Nom — Ce que ca fait + pourquoi c'est game-changer. URL officielle. (Repete)
Si postFormat=guide : Etapes avec emojis. Conseil actionnable.
Si postFormat=analysis ou news : Sous-sections avec emojis + gras. Impact business.
CTA engagement OBLIGATOIRE a la fin :
- Like ce post
- Commente "[mot cle]"
- Abonne-toi`,
      rules: `- Emojis strategiques (pas excessifs). 1 emoji par bloc max.
- AUCUNE limite de mots.
- URLs reelles. Au moins 1 stat.
- CTA engagement OBLIGATOIRE a la fin.
- Interdit : "Revolutionnaire", "Achetez maintenant", URLs fictives.`,
    },
    twitter: {
      tone: "Copywriter viral. Hooks courts et percutants.",
      rules: "Thread 3-5 tweets. Emojis strategiques. Hook irresistible. CTA final.",
    },
    facebook: {
      tone: "Ami enthousiaste qui partage un bon plan. Chaleureux et engageant.",
      rules: "200-300 mots. Emojis pour aerer. URLs. Question engageante finale.",
    },
    tiktok: {
      tone: 'Energique et direct. "Tu dois absolument tester ca."',
      rules: "Caption max 300 chars. Script punchy 30-60s. Urgence et curiosite.",
    },
    instagram: {
      tone: "Inspirant et actionnable. Le lecteur sauvegarde le post.",
      rules: '150-250 mots. Emojis. Noms d\'outils. "Lien en bio". CTA engagement.',
    },
  },

  ACADEMIC: {
    label: "Academique / Recherche",
    description: "Style structure, references, ton neutre et factuel. Pour un public averti.",
    linkedin: {
      tone: "Chercheur ou analyste. Ton neutre, factuel, structure. Aucune opinion non etayee.",
      formatting: `- Gras Unicode pour les concepts cles et auteurs.
- Tirets pour les points principaux.
- Numerotation stricte.
- 1 ligne vide entre chaque section.`,
      structure: `Enonce du sujet factuel. Contextualise avec une stat ou une reference recente.
Contexte : Paragraphe de mise en contexte. Etat de l'art.
Analyse : Si list = items numerotes avec description factuelle et source. Si guide = methodologie + evidence. Si analysis = argumentation structuree pour/contre.
Implications : Ce que ca signifie concretement pour le domaine.
Conclusion : Synthese + question ouverte pour le debat.`,
      rules: `- ZERO emoji. Ton neutre et factuel.
- Chaque affirmation doit etre etayee (stat, source, reference).
- AUCUNE limite de mots.
- URLs vers les sources et outils.
- Interdit : langage marketing, hyperboles, emojis, URLs fictives.`,
    },
    twitter: {
      tone: "Analyste concis. Faits, pas opinions.",
      rules: "Thread 3-5 tweets. Chaque tweet = 1 fait source. Pas d'emojis.",
    },
    facebook: {
      tone: "Vulgarisateur rigoureux. Accessible mais precis.",
      rules: "200-300 mots. Structure claire. Sources. Question de reflexion finale.",
    },
    tiktok: {
      tone: 'Prof passionnant. "Ce que personne ne vous dit sur..."',
      rules: "Caption max 300 chars. Script educatif 30-60s. Faits surprenants.",
    },
    instagram: {
      tone: "Educatif et sauvegardable. Infographie textuelle.",
      rules: '150-250 mots. Structure numerotee. Noms de references. "Lien en bio".',
    },
  },

  TEASER: {
    label: "Teaser / Mystere",
    description: "Style court, intrigant, qui cree de la curiosite. Ideal pour des lancements.",
    linkedin: {
      tone: "Mysterieux et intrigant. Tu reveles juste assez pour creer une envie irresistible.",
      formatting: `- Gras Unicode pour les phrases cles.
- Points de suspension strategiques...
- Lignes courtes. Rythme hache.`,
      structure: `Phrase choc ou question provocante.
2-3 lignes de contexte qui augmentent la tension.
"Et si je te disais que..." ou equivalent.
Si list : Mentionne 2-3 items seulement. "Et ce n'est que le debut..."
Si guide/analysis : Revele les etapes 1-2. "Les etapes 3 a 5 changent tout..."
CTA fort : Commente "[mot]" pour recevoir la suite. Ou "Lien en bio / premier commentaire".`,
      rules: `- Court mais percutant. 150-250 mots max.
- Creer du mystere et de la curiosite.
- NE PAS tout reveler. Donner envie d'en savoir plus.
- 1-2 emojis max si necessaire, sinon zero.
- Interdit : URLs fictives, clickbait grossier.`,
    },
    twitter: {
      tone: "Teaser enigmatique. Chaque tweet augmente la curiosite.",
      rules: "Thread court 2-3 tweets. Revele progressivement. CTA final fort.",
    },
    facebook: {
      tone: 'Ami qui a un secret a partager. "J\'ai decouvert un truc..."',
      rules: "100-150 mots. Mystere. Question ouverte. CTA commentaire.",
    },
    tiktok: {
      tone: '"Attends la fin..." Tension et revelation.',
      rules: "Caption intrigante max 200 chars. Script avec build-up et reveal.",
    },
    instagram: {
      tone: 'Visuel + teaser. "Swipe pour decouvrir" ou "Lien en bio".',
      rules: "80-120 mots. Mystere. Appel a l'action pour la suite.",
    },
  },

  STORYTELLING: {
    label: "Storytelling / Narratif",
    description: "Style narratif personnel. Anecdotes, parcours, lecons apprises.",
    linkedin: {
      tone: 'Narrateur authentique. Tu racontes une experience reelle ou un parcours. "Je/On".',
      formatting: `- Gras Unicode pour les lecons cles et tournants de l'histoire.
- Lignes courtes. Paragraphes de 2-3 lignes max.
- Pas de listes a puces. Ecriture fluide.`,
      structure: `Scene d'ouverture : situation concrete, moment precis. "Il y a 6 mois, j'ai..."
Le probleme : ce qui ne marchait pas, la frustration, le blocage.
Le tournant : la decouverte, le moment ou tout change.
Si list : Integre les items comme des decouvertes successives dans le recit.
Si guide : Les etapes deviennent les chapitres de l'histoire.
Si analysis : Contexte narratif. "Quand j'ai vu [evenement], j'ai su que..."
La lecon : ce que tu as appris. 1-2 phrases en gras.
Ouverture : question personnelle au lecteur. "Et toi, tu as deja vecu ca ?"`,
      rules: `- Ton personnel, authentique. "Je" ou "On".
- ZERO emoji. L'emotion vient du recit.
- AUCUNE limite de mots.
- URLs des outils mentionnes dans le parcours.
- Interdit : invention, faux temoignages, emojis, URLs fictives.`,
    },
    twitter: {
      tone: "Micro-recit. Chaque tweet = un chapitre.",
      rules: "Thread 4-6 tweets narratif. Hook = situation initiale. Dernier = lecon.",
    },
    facebook: {
      tone: "Histoire personnelle partagee avec des amis. Emotionnel et vrai.",
      rules: "250-400 mots. Recit complet. Lecon explicite. Question personnelle finale.",
    },
    tiktok: {
      tone: '"Story time!" Personnel et direct camera.',
      rules: "Caption = teaser de l'histoire. Script = recit complet 45-60s.",
    },
    instagram: {
      tone: 'Recit authentique. "Voila ce que j\'ai appris..."',
      rules: '150-250 mots. Recit + lecon. Noms d\'outils dans le parcours. "Lien en bio".',
    },
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStyle(style: string): PostStyleDef {
  return POST_STYLES[style] || POST_STYLES.EXPERT;
}

// ── Analysis Prompts ─────────────────────────────────────────────────────────

export function buildScrapingAnalysisPrompt(
  config: WebmasterConfig,
  scraped: { url: string; title: string; textContent: string },
): string {
  return `Tu es un expert en marketing digital. Analyse cette page de vente et extrais les donnees marketing REELLES.

PAGE SCRAPEE :
URL : ${scraped.url}
Titre : ${scraped.title}
Contenu : ${scraped.textContent}

MODE : ${config.publicationMode}

Reponds UNIQUEMENT en JSON valide :
{
  "productName": "nom exact",
  "postFormat": "list|story|tips|comparison",
  "productBenefit": "benefice principal concret",
  "targetAudience": "audience cible precise",
  "sector": "secteur d'activite",
  "tone": "professionnel|decontracte|inspirant|technique",
  "landingPageUrl": "${scraped.url}",
  "companyName": "nom marque",
  "authorName": "nom auteur/createur",
  "authorExpertise": "domaine d'expertise",
  "keyArguments": ["arg1", "arg2", "arg3"],
  "painPoints": ["pb1", "pb2", "pb3"],
  "socialProof": "preuves sociales trouvees",
  "uniqueSellingProposition": "differenciateur principal",
  "concreteResults": "resultats mesurables",
  "imagePromptContext": "description visuelle pour generation IA"
}`;
}

export function buildThematicAnalysisPrompt(
  config: WebmasterConfig,
  searchResults: string,
  searchExtra: string,
): string {
  return `Tu es un curateur de contenu tech expert avec une connaissance encyclopedique des outils, plateformes et ressources du web. Ta mission : preparer un BRIEFING ULTRA-DETAILLE pour la redaction d'un post viral.

THEME : ${config.thematicTopic}
SECTEUR : ${config.thematicSector || "General"}
AUDIENCE : ${config.thematicAudience || "Professionnels"}
AUTEUR : ${config.thematicAuthorName || "Expert"} — ${config.thematicAuthorExpertise || "Specialiste"}
MARQUE : ${config.thematicCompanyName || ""}
URL (peut etre vide) : ${config.thematicLandingUrl || ""}

══════════════════════════════════════
RESULTATS DE RECHERCHE WEB (source 1) :
${searchResults}
══════════════════════════════════════
RESULTATS COMPLEMENTAIRES (source 2) :
${searchExtra}
══════════════════════════════════════

INSTRUCTIONS CRITIQUES :

1. DETECTE LE FORMAT : le sujet "${config.thematicTopic}" implique-t-il une LISTE (top X, meilleurs Y, outils Z), un GUIDE (comment faire), une ANALYSE (tendance, comparaison) ou une ACTU ?

2. EXTRAIS LES RESSOURCES des resultats de recherche. Pour chaque outil/site/ressource mentionne :
   - Nom exact
   - URL OFFICIELLE : utilise les URLs trouvees dans les resultats OU, si l'URL n'apparait pas dans les resultats mais que tu CONNAIS l'URL officielle de cet outil/site, tu peux l'utiliser.
   - Description : ce que ca fait concretement en 1-2 phrases
   - Point fort : pourquoi c'est recommande

3. COMPLETE avec tes connaissances : si les resultats de recherche ne donnent que 3-4 outils mais que le sujet merite une liste de 8-10, complete la liste avec des outils que tu connais.

4. URLs CONNUES AUTORISEES : tu PEUX utiliser les URLs officielles que tu connais pour des outils/sites connus. N'utilise PAS d'URL que tu n'es pas sur a 100%.

Reponds UNIQUEMENT en JSON valide :
{
  "productName": "${config.thematicTopic}",
  "postFormat": "list|guide|analysis|news",
  "productBenefit": "Ce que le lecteur va decouvrir et pouvoir utiliser immediatement",
  "targetAudience": "${config.thematicAudience || "Professionnels"}",
  "sector": "${config.thematicSector || "Tech"}",
  "tone": "professionnel",
  "landingPageUrl": "${config.thematicLandingUrl || ""}",
  "companyName": "${config.thematicCompanyName || ""}",
  "authorName": "${config.thematicAuthorName || "Expert"}",
  "authorExpertise": "${config.thematicAuthorExpertise || "Specialiste"}",
  "resources": [
    {"name": "Nom", "url": "https://url-officielle.com", "description": "description concrete", "highlight": "point fort"}
  ],
  "keyArguments": ["fait 1 avec chiffre (source)", "fait 2", "fait 3", "fait 4", "fait 5"],
  "painPoints": ["probleme reel 1", "probleme 2", "probleme 3"],
  "socialProof": "stat marquante avec source et annee",
  "uniqueSellingProposition": "angle editorial le plus accrocheur",
  "concreteResults": "benefices concrets et mesurables",
  "imagePromptContext": "illustration conceptuelle de ${config.thematicTopic} sans texte ni personne"
}`;
}

// ── Trends Prompt ────────────────────────────────────────────────────────────

export function buildTrendsPrompt(analysis: ProductAnalysis): string {
  return `Analyste tendances dans ${analysis.sector}.

Sujet : ${analysis.productName}
Audience : ${analysis.targetAudience}

3 tendances concretes rattachees a "${analysis.productName}" pour cette audience.

Reponds UNIQUEMENT en JSON valide :
{"trends":[{"title":"...","hookAngle":"...","stat":"chiffre"}],"topTrend":"tendance #1","visualAngle":"angle visuel"}`;
}

// ── Strategy Prompt ──────────────────────────────────────────────────────────

export function buildStrategyPrompt(
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  trends: SectorTrends,
): string {
  const style = getStyle(config.postStyle);
  return `Stratege contenu social media senior. Tu concois la strategie pour des posts LONGS, DETAILLES et UTILES.

STYLE DE POST CHOISI : ${config.postStyle} — ${style.description}
SOURCE : ${analysis.source}
MODE PUB : ${config.publicationMode}

CONTEXTE :
Sujet : ${analysis.productName}
Benefice : ${analysis.productBenefit}
Audience : ${analysis.targetAudience}
Secteur : ${analysis.sector}
Expertise : ${analysis.authorExpertise}
Douleurs : ${analysis.painPoints.join(", ")}
Resultats : ${analysis.concreteResults}
Tendance secteur : ${trends.topTrend}

RESSOURCES (outils, sites, liens) :
${analysis.resources?.map((r) => `- ${r.name} (${r.url}) : ${r.description}`).join("\n") || "(aucune)"}

DECIDE LIBREMENT :
- Le type de post : top liste, guide complet, decouverte, comparatif, tutoriel, analyse, curated list...
- La voix adaptee au style ${config.postStyle} :
  EXPERT = impersonnelle, technique
  MARKETING = directe, energique
  ACADEMIC = neutre, factuelle
  TEASER = intrigante, mysterieuse
  STORYTELLING = personnelle, narrative (je/on)

OBJECTIF : Le post final doit etre LONG, DETAILLE, avec des LIENS REELS. Pas de contenu generique.

ADAPTATION MODE :
- TEXT_ONLY : post LONG et COMPLET, AUCUNE limite de mots.
- TEXT_MEDIA : post LONG aussi, l'image accompagne mais ne remplace pas.
- CAROUSEL : teaser detaille.

JSON :
{"angle":"angle choisi","openingLine":"1ere phrase accrocheuse adaptee au style ${config.postStyle}","coreValue":"valeur apportee au lecteur","proofElement":"preuve concrete (stat ou fait)","ctaSuggestion":"CTA adapte au style ${config.postStyle}","tone":"voix choisie","postType":"type libre choisi","resourceStrategy":"comment integrer les ressources","imagePrompt":"${config.publicationMode === "TEXT_MEDIA" ? "prompt detaille pour generation image (style pro, sans texte, 1080x1080)" : ""}","carouselTeaser":"${config.publicationMode === "CAROUSEL" ? "texte teaser pour accompagner le carrousel" : ""}"}`;
}

// ── Per-Platform Generation Prompts ──────────────────────────────────────────

export function buildLinkedinPrompt(
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  strategy: ContentStrategy,
): string {
  const style = getStyle(config.postStyle);
  const ps = style.linkedin;
  return `Tu GENERES un post LinkedIn COMPLET et PUBLIABLE. Tu ne repetes PAS le prompt. Tu ecris le POST directement.

LIMITE OBLIGATOIRE : Le post dans "content" DOIT faire MOINS de 2900 caracteres (hashtags inclus). Si tu depasses, LinkedIn rejette. Compte tes caracteres.

STYLE : ${config.postStyle}
TON : ${ps.tone}
${ps.formatting ? `FORMAT :\n${ps.formatting}` : ""}
${ps.structure ? `STRUCTURE :\n${ps.structure}` : ""}
REGLES :\n${ps.rules}

AUTEUR : ${analysis.authorName}, ${analysis.authorExpertise}
SUJET : ${analysis.productName}
FORMAT : ${analysis.postFormat}
AUDIENCE : ${analysis.targetAudience}
ANGLE : ${strategy.angle}
ACCROCHE : ${strategy.openingLine}
STAT : ${analysis.socialProof}
CTA : ${strategy.ctaSuggestion}

RESSOURCES (outils, sites, liens) :
${analysis.resources?.map((r) => `- ${r.name} : ${r.description} — ${r.url}`).join("\n") || "(aucune)"}

FAITS : ${analysis.keyArguments.join(" | ")}

FORMAT OBLIGATOIRE (simple et pro) :
- Numerotation : 1. 2. 3. (chiffres normaux, point, espace). JAMAIS de caracteres Unicode bizarres pour les chiffres.
- Noms d'outils : texte simple. INTERDIT : **gras** ou asterisques. INTERDIT : caracteres Unicode gras qui s'affichent mal.
- URLs : liens bruts uniquement. https://example.com — INTERDIT : [texte](url) ou format Markdown.
- Hashtags : a la fin du content, 3-5 vrais hashtags separes par espaces.

REGLES COMMUNES :
- LIMITE : 2800 caracteres max (content + hashtags). Reserve 150 caracteres pour les hashtags.
- 1 ligne vide entre chaque bloc.
- Au moins 1 stat ou chiffre concret.
- Interdit : "Revolutionnaire", "Incroyable", asterisques **, format [url](url).
${analysis.landingPageUrl ? `- Lien landing page : ${analysis.landingPageUrl}` : ""}
- N'invente AUCUNE URL.

Reponds UNIQUEMENT en JSON valide :
{"content":"post complet LinkedIn pret a publier","hashtags":["#tag1","#tag2","#tag3"],"wordCount":0}`;
}

export function buildTwitterPrompt(
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  strategy: ContentStrategy,
): string {
  const style = getStyle(config.postStyle);
  const ps = style.twitter;
  return `GENERE un THREAD Twitter/X de 3-5 tweets. Ne repete PAS le prompt. Ecris les tweets directement.

STYLE : ${config.postStyle}
TON : ${ps.tone}
REGLES : ${ps.rules}

Sujet : ${analysis.productName}
Accroche : ${strategy.openingLine}
Preuve : ${strategy.proofElement}
Audience : ${analysis.targetAudience}

RESSOURCES : ${analysis.resources?.map((r) => `${r.name} (${r.url})`).join(", ") || "(aucune)"}
FAITS : ${analysis.keyArguments.join(" | ")}

STRUCTURE : Tweet 1 = hook. Tweets 2-4 = 1 fait/ressource avec URL. Dernier = CTA.
- Max 280 chars par tweet.
- N'invente aucune URL.
${analysis.landingPageUrl ? `- Lien landing : ${analysis.landingPageUrl}` : ""}

Reponds UNIQUEMENT en JSON valide :
{"content":"tweet 1 (hook)","thread":["tweet 2","tweet 3","tweet 4"],"charCount":0}`;
}

export function buildFacebookPrompt(
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  strategy: ContentStrategy,
): string {
  const style = getStyle(config.postStyle);
  const ps = style.facebook;
  return `GENERE un post Facebook COMPLET. Ne repete PAS le prompt. Ecris le post directement.

STYLE : ${config.postStyle}
TON : ${ps.tone}
REGLES : ${ps.rules}

Sujet : ${analysis.productName}
Audience : ${analysis.targetAudience}
Angle : ${strategy.angle}
Valeur : ${strategy.coreValue}

FAITS : ${analysis.keyArguments.join(" | ")}
STAT : ${analysis.socialProof}
RESSOURCES : ${analysis.resources?.map((r) => `${r.name} (${r.url})`).join(", ") || "(aucune)"}

200-300 mots. URLs reelles. 1 question ouverte. 2-3 emojis max. Pas de hashtags.
- N'invente aucune URL.
${analysis.landingPageUrl ? `- Lien landing : ${analysis.landingPageUrl}` : ""}

Reponds UNIQUEMENT en JSON valide :
{"content":"LE POST FACEBOOK COMPLET ICI","wordCount":0}`;
}

export function buildTiktokPrompt(
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  strategy: ContentStrategy,
): string {
  const style = getStyle(config.postStyle);
  const ps = style.tiktok;
  return `GENERE une caption TikTok + script video. Ne repete PAS le prompt.

STYLE : ${config.postStyle}
TON : ${ps.tone}
REGLES : ${ps.rules}

Sujet : ${analysis.productName}
Audience : ${analysis.targetAudience}
Accroche : ${strategy.openingLine}
FAITS : ${analysis.keyArguments.join(" | ")}
RESSOURCES (noms seulement) : ${analysis.resources?.map((r) => r.name).join(", ") || "(aucune)"}

Caption max 300 chars. Script video 30-60s. 5-8 hashtags. "Lien en bio".
Le script doit mentionner les outils par leur nom.

Reponds UNIQUEMENT en JSON valide :
{"caption":"max 300 chars percutante","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"],"videoScript":{"hook":"accroche choc 0-3s","content":"presentation des outils/faits concrets","examples":"exemples concrets d'utilisation","cta":"CTA + lien en bio"},"fullCaption":"caption + hashtags"}`;
}

export function buildInstagramPrompt(
  config: WebmasterConfig,
  analysis: ProductAnalysis,
  strategy: ContentStrategy,
): string {
  const style = getStyle(config.postStyle);
  const ps = style.instagram;
  return `GENERE une caption Instagram COMPLETE. Ne repete PAS le prompt.

STYLE : ${config.postStyle}
TON : ${ps.tone}
REGLES : ${ps.rules}

Sujet : ${analysis.productName}
Audience : ${analysis.targetAudience}
Valeur : ${strategy.coreValue}
FAITS : ${analysis.keyArguments.join(" | ")}
RESSOURCES : ${analysis.resources?.map((r) => r.name).join(", ") || "(aucune)"}

150-250 mots. Outils par NOM (pas d'URL en caption IG). CTA + "lien en bio".
5 lignes vides puis 10-15 hashtags. Interdit : inventer des outils, URLs fictives.

Reponds UNIQUEMENT en JSON valide :
{"caption":"LA CAPTION INSTAGRAM COMPLETE ICI","hashtags":["#tag1","#tag2"],"fullCaption":"caption complete + hashtags"}`;
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

Si un post est en dessous du seuil, propose une version amelioree.

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
