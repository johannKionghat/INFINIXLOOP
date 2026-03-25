export type PublicationMode = "TEXT_ONLY" | "TEXT_MEDIA" | "CAROUSEL";
export type PostStyle = "EXPERT" | "MARKETING" | "ACADEMIC" | "TEASER" | "STORYTELLING";
export type SourceMode = "SCRAPING" | "THEMATIC";
export type ImageSource = "AI" | "UPLOAD";

export type StepStatus = "pending" | "running" | "done" | "error" | "skipped";

export interface WebmasterConfig {
  publicationMode: PublicationMode;
  postStyle: PostStyle;
  sourceMode: SourceMode;
  imageSource: ImageSource;

  // Scraping
  scrapingUrl: string;

  // Thematic
  thematicTopic: string;
  thematicSector: string;
  thematicAudience: string;
  thematicAuthorName: string;
  thematicAuthorExpertise: string;
  thematicCompanyName: string;
  thematicLandingUrl: string;

  // Image upload
  uploadedImageUrl: string;

  // Quality
  qualityThreshold: number;

  // Platforms
  publishLinkedin: boolean;
  publishTwitter: boolean;
  publishFacebook: boolean;
  publishInstagram: boolean;
  publishTiktok: boolean;
  publishWhatsappGroup: boolean;
  publishWhatsappBusiness: boolean;
  publishSlack: boolean;

  // Dry run
  dryRun: boolean;
}

export interface ExecutionStep {
  id: string;
  module: string;
  label: string;
  description: string;
  icon: string;
  status: StepStatus;
  startedAt?: number;
  completedAt?: number;
  output?: string;
  detail?: string;
  children?: ExecutionSubStep[];
}

export interface ExecutionSubStep {
  id: string;
  label: string;
  status: StepStatus;
  output?: string;
}

export interface WebmasterContext {
  config: WebmasterConfig;
  productAnalysis?: ProductAnalysis;
  sectorTrends?: SectorTrends;
  contentStrategy?: ContentStrategy;
  posts?: GeneratedPosts;
  qualityReport?: QualityReport;
  publicationResults?: PublicationResults;
  sessionReport?: SessionReport;
}

export interface ProductAnalysis {
  productName: string;
  postFormat: string;
  productBenefit: string;
  targetAudience: string;
  sector: string;
  tone: string;
  landingPageUrl: string;
  companyName: string;
  authorName: string;
  authorExpertise: string;
  resources: { name: string; url: string; description: string; highlight: string }[];
  keyArguments: string[];
  painPoints: string[];
  socialProof: string;
  uniqueSellingProposition: string;
  concreteResults: string;
  imagePromptContext: string;
  source: "SCRAPING" | "THEMATIC";
}

export interface SectorTrends {
  trends: { title: string; hookAngle: string; stat: string }[];
  topTrend: string;
  visualAngle: string;
}

export interface ContentStrategy {
  angle: string;
  openingLine: string;
  coreValue: string;
  proofElement: string;
  ctaSuggestion: string;
  tone: string;
  postType: string;
  resourceStrategy: string;
  imagePrompt: string;
  carouselTeaser: string;
}

export interface GeneratedPosts {
  linkedin?: { content: string; hashtags: string[]; wordCount: number };
  twitter?: { content: string; thread: string[]; charCount: number };
  facebook?: { content: string; wordCount: number };
  tiktok?: { fullCaption: string };
  instagram?: { fullCaption: string };
}

export interface QualityReport {
  overallScore: number;
  platforms: { name: string; score: number; issues: string[] }[];
  refinements: string[];
}

export interface PublicationResults {
  linkedin?: { success: boolean; postId?: string; error?: string };
  twitter?: { success: boolean; tweetId?: string; error?: string };
  facebook?: { success: boolean; postId?: string; error?: string };
  instagram?: { success: boolean; error?: string };
  tiktok?: { success: boolean; error?: string };
  whatsappGroup?: { success: boolean; error?: string };
  whatsappBusiness?: { success: boolean; error?: string };
  slack?: { success: boolean; error?: string };
}

export interface SessionReport {
  sessionId: string;
  date: string;
  qualityScore: number;
  publishedPlatforms: string[];
  failedPlatforms: string[];
  recommendations: string[];
}
