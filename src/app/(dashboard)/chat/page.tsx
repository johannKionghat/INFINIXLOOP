"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, BookOpen, Clapperboard, Image as ImageIcon, Mail, Sparkles, LayoutTemplate, Zap } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { ICON_MAP } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "ai";
  text: string;
  time: string;
}

const SUGGESTIONS = [
  { label: "Creer un ebook", prompt: "Cree un ebook sur l'IA pour entrepreneurs" },
  { label: "Contenu social", prompt: "Genere du contenu Instagram pour mon business IA" },
  { label: "Strategie complete", prompt: "Lance ma strategie de contenu complete" },
  { label: "Landing page", prompt: "Cree une landing page pour ma formation" },
];

const QUICK_CHIPS = [
  { id: "auto", label: "Auto" },
  { id: "redacteur", label: "Redacteur" },
  { id: "scriptwriter", label: "Video" },
  { id: "image", label: "Image" },
  { id: "email", label: "Email" },
];

const AI_REPLIES: Record<string, string> = {
  ebook:
    "L'**Agent Redacteur** est active. Voici mon plan d'execution :\n\n- Analyse du theme et de l'audience\n- Generation du plan en 8 chapitres\n- Redaction complete + export PDF\n\nTemps estime : **3-5 minutes**. Le resultat sera disponible dans Resultats.",
  reel:
    "L'**Agent Scriptwriter** est active. Je genere votre script avec :\n\n- Hook puissant (3 premieres secondes)\n- Structure Probleme / Solution / Preuve\n- CTA optimise pour votre plateforme cible",
  landing:
    "L'**Agent Landing Page** se met en route. Il va creer :\n\n- Page de vente complete en HTML/React\n- Formulaire de capture integre\n- Deployable sur Vercel en 1 clic",
  default:
    "Analyse en cours... J'identifie les agents les plus adaptes a votre projet.\n\nPour commencer efficacement, precisez :\n- Quel type de contenu creer ?\n- Quelle est votre audience cible ?\n- Quel est l'objectif final ?",
};

function getReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("ebook") || t.includes("guide") || t.includes("livre")) return AI_REPLIES.ebook;
  if (t.includes("reel") || t.includes("script") || t.includes("vid")) return AI_REPLIES.reel;
  if (t.includes("landing") || t.includes("page") || t.includes("vente")) return AI_REPLIES.landing;
  return AI_REPLIES.default;
}

function formatBold(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
}

function nowTime() {
  return new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedChip, setSelectedChip] = useState("auto");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollBottom = () => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  useEffect(() => { scrollBottom(); }, [messages, isTyping]);

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = { role: "user", text: msg, time: nowTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "";

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = { role: "ai", text: getReply(msg), time: nowTime() };
      setMessages((prev) => [...prev, reply]);
    }, 1600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resizeTA = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "";
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
  };

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
            Orchestrateur
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Decrivez votre projet — l&apos;IA coordonne les agents automatiquement.
          </p>
        </div>
      </div>

      {/* Chat layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4" style={{ minHeight: "60vh", height: "calc(100vh - 200px)" }}>
        {/* Chat card */}
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
          {/* Chat top bar */}
          <div className="px-5 py-3.5 border-b border-gray-200 flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-950">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-blink" />
              InfinixLoop Orchestrateur
            </div>
            <div className="ml-auto">
              <span className="badge-dot inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 before:bg-green-500">
                GPT-4o + Claude
              </span>
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3.5">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-gray-950 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-200 text-sm leading-relaxed text-gray-700">
                    Bonjour. Je suis l&apos;orchestrateur InfinixLoop.
                    <br /><br />
                    Decrivez votre projet et je selectionne et active les agents adaptes.
                    <div className="flex flex-wrap gap-2 mt-4">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => sendMessage(s.prompt)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600 cursor-pointer hover:border-gray-300 hover:text-gray-950 hover:shadow-sm transition-all"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1.5 px-1">Maintenant</div>
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 max-w-[80%]",
                  m.role === "user" && "self-end flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0",
                    m.role === "ai" ? "bg-gray-950 text-white" : "bg-gray-950 text-white"
                  )}
                >
                  {m.role === "ai" ? <Sparkles className="w-4 h-4" /> : "JD"}
                </div>
                <div>
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      m.role === "ai"
                        ? "bg-gray-50 border border-gray-200 rounded-tl-sm text-gray-700"
                        : "bg-gray-950 text-white rounded-tr-sm"
                    )}
                    dangerouslySetInnerHTML={{ __html: formatBold(m.text) }}
                  />
                  <div className={cn("text-xs text-gray-400 mt-1.5 px-1", m.role === "user" && "text-right")}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-950 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-[5px] h-[5px] rounded-full bg-gray-400"
                      style={{ animation: `bounce-dot 0.9s infinite ${d * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="px-5 py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-wrap gap-1.5 mb-3 items-center">
              <span className="text-xs text-gray-400 font-medium">Agent :</span>
              {QUICK_CHIPS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedChip(c.id);
                    setSelectedAgent(c.id === "auto" ? "auto" : c.id);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer",
                    selectedChip === c.id
                      ? "bg-gray-950 text-white border-gray-950"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5 items-end">
              <div className="flex-1 flex items-end bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 gap-2 transition-all focus-within:border-gray-300 focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] focus-within:bg-white">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); resizeTA(); }}
                  onKeyDown={handleKey}
                  placeholder="Decrivez votre projet business..."
                  rows={1}
                  className="flex-1 border-none bg-transparent outline-none text-sm text-gray-900 resize-none max-h-[100px] min-h-[20px] leading-relaxed placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => sendMessage()}
                className="w-9 h-9 rounded-xl bg-gray-950 border-none cursor-pointer flex items-center justify-center transition-all text-white hover:bg-gray-800 shrink-0"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 overflow-y-auto hidden lg:flex">
          {/* Agent config */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 text-sm font-semibold text-gray-950">
              Configuration agent
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 appearance-auto"
                >
                  <option value="auto">Orchestrateur (auto)</option>
                  {AGENTS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic config fields */}
              {currentAgent ? (
                currentAgent.configFields.map((f) => (
                  <div key={f.key} className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.label}</label>
                    {f.type === "select" ? (
                      <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 appearance-auto">
                        {f.options?.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea
                        placeholder={f.placeholder}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 resize-y min-h-[60px]"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300"
                      />
                    )}
                  </div>
                ))
              ) : (
                <>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Theme</label>
                    <input type="text" placeholder="Ex: IA pour entrepreneurs" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300" />
                  </div>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Audience</label>
                    <input type="text" placeholder="Ex: Freelances 25-40 ans" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300" />
                  </div>
                </>
              )}

              <button
                onClick={() => sendMessage(`Lancer ${currentAgent ? currentAgent.name : "l'orchestrateur"}`)}
                className="w-full py-2.5 rounded-xl bg-gray-950 text-white text-sm font-medium border-none cursor-pointer transition-all hover:bg-gray-800 mt-1"
              >
                Lancer l&apos;agent
              </button>
            </div>
          </div>

          {/* Agent status */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 text-sm font-semibold text-gray-950">
              Statut des agents
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { id: "informateur", name: "Informateur", status: "Actif", cls: "bg-green-50 text-green-600 before:bg-green-500", color: "#0ea5e9" },
                { id: "scriptwriter", name: "Scriptwriter", status: "En cours", cls: "bg-amber-50 text-amber-600 before:bg-amber-500", color: "#f59e0b" },
                { id: "redacteur", name: "Redacteur", status: "Inactif", cls: "bg-gray-100 text-gray-500 before:bg-gray-400", color: "#8b5cf6" },
                { id: "webmaster", name: "Webmaster", status: "Inactif", cls: "bg-gray-100 text-gray-500 before:bg-gray-400", color: "#ec4899" },
              ].map((a) => {
                const AgentIcon = ICON_MAP[AGENTS.find(ag => ag.id === a.id)?.iconName || "Radio"];
                return (
                  <div key={a.name} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${a.color}10` }}>
                      <AgentIcon className="w-4 h-4" style={{ color: a.color }} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">{a.name}</span>
                    <span className={`badge-dot inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${a.cls}`}>
                      {a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
