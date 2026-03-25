import Link from "next/link";
import {
  Radio, BookOpen, Clapperboard, Globe, Video, Image, LayoutTemplate,
  Scissors, Mail, MessageCircle, Bot, ClipboardList, ArrowRight,
  Zap, Shield, BarChart3, Sparkles, ChevronRight, Play, Check,
} from "lucide-react";
import { InfinixLoopLogo } from "@/components/logo";

const AGENTS = [
  { name: "Informateur", role: "Veille IA & Tendances", icon: Radio, color: "#0ea5e9" },
  { name: "Redacteur", role: "Ebooks & Contenus longs", icon: BookOpen, color: "#8b5cf6" },
  { name: "Scriptwriter", role: "Scripts Video & Reels", icon: Clapperboard, color: "#f59e0b" },
  { name: "Webmaster", role: "Publication multi-reseaux", icon: Globe, color: "#ec4899" },
  { name: "Agent Video", role: "Generation video IA", icon: Video, color: "#ef4444" },
  { name: "Agent Image", role: "Generation visuelle IA", icon: Image, color: "#10b981" },
  { name: "Landing Page", role: "Pages de vente & capture", icon: LayoutTemplate, color: "#3b82f6" },
  { name: "Montage", role: "Montage automatise", icon: Scissors, color: "#f97316" },
  { name: "Email", role: "Newsletters & sequences", icon: Mail, color: "#8b5cf6" },
  { name: "Community", role: "Telegram & WhatsApp", icon: MessageCircle, color: "#ec4899" },
  { name: "Chatbot", role: "Chatbots personnalises", icon: Bot, color: "#10b981" },
  { name: "Projet", role: "Workspace & Gestion", icon: ClipboardList, color: "#ef4444" },
];

const STEPS = [
  {
    num: "01",
    title: "Decrivez votre projet",
    desc: "Expliquez votre objectif en langage naturel. L'orchestrateur analyse et selectionne les agents adaptes.",
  },
  {
    num: "02",
    title: "Les agents s'executent",
    desc: "Chaque agent travaille en parallele : redaction, creation visuelle, publication, analyse. Tout est automatise.",
  },
  {
    num: "03",
    title: "Recuperez vos resultats",
    desc: "Ebooks, videos, landing pages, emails — tout est genere et pret a deployer en quelques minutes.",
  },
];

const FEATURES = [
  { icon: Zap, title: "Execution instantanee", desc: "12 agents IA travaillent en parallele pour livrer vos contenus en minutes, pas en jours." },
  { icon: Shield, title: "Securite enterprise", desc: "Vos donnees restent privees. Chiffrement de bout en bout et conformite RGPD." },
  { icon: BarChart3, title: "Analytics temps reel", desc: "Suivez la performance de chaque agent, mesurez le ROI et optimisez vos workflows." },
  { icon: Sparkles, title: "IA de pointe", desc: "GPT-4o, Claude 3.5, Runway, DALL-E 3 — les meilleurs modeles au service de votre business." },
];

const STATS = [
  { value: "12", label: "Agents IA specialises" },
  { value: "94%", label: "Taux d'automatisation" },
  { value: "68h", label: "Economisees par mois" },
  { value: "3min", label: "Pour un ebook complet" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center">
              <InfinixLoopLogo size={20} />
            </div>
            <span className="text-[17px] font-semibold text-gray-950 tracking-tight">
              InfinixLoop
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#agents" className="text-sm text-gray-500 hover:text-gray-950 transition-colors no-underline">Agents</a>
            <a href="#how" className="text-sm text-gray-500 hover:text-gray-950 transition-colors no-underline">Fonctionnement</a>
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-950 transition-colors no-underline">Avantages</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-950 transition-colors no-underline">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gray-950 text-white hover:bg-gray-800 transition-all no-underline"
            >
              Essai gratuit
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />

        <div className="max-w-[1200px] mx-auto relative">
          <div className="max-w-[720px] mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              <span className="text-sm text-gray-600">12 agents IA autonomes a votre service</span>
            </div>

            {/* Headline */}
            <h1 className="text-[32px] sm:text-[42px] md:text-[56px] leading-[1.12] font-bold text-gray-950 tracking-tight mb-6">
              Automatisez votre business avec des
              <span className="gradient-text"> agents IA autonomes</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-8 sm:mb-10 max-w-[560px] mx-auto">
              Ebooks, videos, landing pages, emails, visuels — 12 agents specialises
              executent vos projets en quelques minutes. Concentrez-vous sur l&apos;essentiel.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4 max-sm:flex-col max-sm:gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold bg-gray-950 text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-950/10 no-underline"
              >
                Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/overview"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all no-underline"
              >
                <Play className="w-4 h-4" />
                Voir la demo
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-12 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white px-8 py-7 text-center">
                <div className="text-3xl font-bold text-gray-950 tracking-tight">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AGENTS ─── */}
      <section id="agents" className="section-padding px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Nos agents</p>
            <h2 className="text-[40px] font-bold text-gray-950 tracking-tight mb-4 max-md:text-3xl">
              12 agents specialises pour chaque besoin
            </h2>
            <p className="text-lg text-gray-500 max-w-[520px] mx-auto">
              Chaque agent maitrise un domaine precis et utilise les meilleures APIs du marche.
            </p>
          </div>

          <div className="grid grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4">
            {AGENTS.map((agent) => (
              <div
                key={agent.name}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/80 transition-all cursor-pointer"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${agent.color}10` }}
                >
                  <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-950 mb-1">{agent.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{agent.role}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium text-gray-400 group-hover:text-accent transition-colors">
                  Decouvrir <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="section-padding px-4 sm:px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Comment ca marche</p>
            <h2 className="text-[40px] font-bold text-gray-950 tracking-tight mb-4 max-md:text-3xl">
              Lancez votre projet en 3 etapes
            </h2>
            <p className="text-lg text-gray-500 max-w-[520px] mx-auto">
              Pas de configuration complexe. Decrivez, lancez, recuperez.
            </p>
          </div>

          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="text-[64px] font-bold text-gray-100 leading-none mb-4">{step.num}</div>
                <h3 className="text-xl font-semibold text-gray-950 mb-3">{step.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="section-padding px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Avantages</p>
            <h2 className="text-[40px] font-bold text-gray-950 tracking-tight mb-4 max-md:text-3xl">
              Concu pour les entrepreneurs ambitieux
            </h2>
          </div>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-5 p-7 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/60 transition-all">
                <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center shrink-0">
                  <f.icon className="w-5.5 h-5.5 text-accent" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-gray-950 mb-1.5">{f.title}</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-padding px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto text-center bg-gray-950 rounded-3xl px-6 py-10 sm:px-12 sm:py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-accent/5 rounded-full blur-[60px]" />

          <div className="relative">
            <h2 className="text-[24px] sm:text-[32px] md:text-[36px] font-bold text-white tracking-tight mb-4">
              Pret a automatiser votre business ?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-[440px] mx-auto">
              Rejoignez les entreprises qui utilisent InfinixLoop pour gagner du temps et scaler plus vite.
            </p>
            <div className="flex items-center justify-center gap-4 max-sm:flex-col">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold bg-white text-gray-950 hover:bg-gray-100 transition-all no-underline"
              >
                Essai gratuit — 7 jours
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/overview"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all no-underline"
              >
                Voir la demo
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Pas de carte requise</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> 7 jours gratuits</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Annulation libre</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-200 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between max-md:flex-col max-md:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gray-950 flex items-center justify-center">
              <InfinixLoopLogo size={16} />
            </div>
            <span className="text-sm font-semibold text-gray-950">InfinixLoop</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; 2025 InfinixLoop. Tous droits reserves.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors no-underline">CGU</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors no-underline">Confidentialite</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors no-underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
