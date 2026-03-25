"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  BookOpen, Clapperboard, LayoutTemplate, Radio,
  Video, Mail, Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS = [
  { id: "all", label: "Tout", count: 47 },
  { id: "ebook", label: "Ebooks" },
  { id: "video", label: "Videos" },
  { id: "content", label: "Contenus" },
  { id: "page", label: "Pages" },
];

const OUTPUTS: { type: string; icon: LucideIcon; color: string; name: string; detail: string; agent: string; date: string }[] = [
  {
    type: "ebook", icon: BookOpen, color: "#8b5cf6",
    name: "ChatGPT pour freelances — Guide complet",
    detail: "47 pages / 8 chapitres / PDF",
    agent: "Redacteur", date: "Aujourd'hui 14:23",
  },
  {
    type: "content", icon: Clapperboard, color: "#f59e0b",
    name: "Script Reel — 5 erreurs IA a eviter",
    detail: "60 sec / Format 9:16 / 3 CTA",
    agent: "Scriptwriter", date: "Aujourd'hui 13:45",
  },
  {
    type: "page", icon: LayoutTemplate, color: "#3b82f6",
    name: "Landing Page — Formation IA Debutants",
    detail: "HTML/React / A/B test / Deployable",
    agent: "Landing Page", date: "Hier 16:10",
  },
  {
    type: "content", icon: Radio, color: "#0ea5e9",
    name: "Rapport Veille — Tendances IA S.12",
    detail: "12 sujets / Scoring viralite",
    agent: "Informateur", date: "Hier 08:00",
  },
  {
    type: "video", icon: Video, color: "#ef4444",
    name: "Video Avatar — Prompt Engineering",
    detail: "2 min 30 / 16:9 / Sous-titres auto",
    agent: "Agent Video", date: "Lundi 11:22",
  },
  {
    type: "ebook", icon: Mail, color: "#8b5cf6",
    name: "Sequence email — Onboarding formation",
    detail: "7 emails / Personnalises / Segmentes",
    agent: "Agent Email", date: "Lundi 09:55",
  },
];

export default function OutputsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? OUTPUTS : OUTPUTS.filter((o) => o.type === activeTab);

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
            Resultats
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            47 creations generees par vos agents.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium cursor-pointer border-b-2 -mb-px transition-all bg-transparent border-transparent text-gray-400 hover:text-gray-900",
              activeTab === tab.id && "text-gray-950 border-gray-950"
            )}
          >
            {tab.label}
            {tab.count && (
              <span className="font-mono text-xs text-gray-400 ml-1.5">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-4">
        {filtered.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/80"
            >
              <div
                className="h-[100px] flex items-center justify-center border-b border-gray-100"
                style={{ background: `${item.color}08` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${item.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.5} />
                </div>
              </div>
              <div className="p-5">
                <div className="text-[15px] font-semibold text-gray-950 mb-1.5 leading-snug">
                  {item.name}
                </div>
                <div className="text-sm text-gray-500 leading-snug">
                  {item.detail}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">
                    {item.agent}
                  </span>
                  <span className="text-xs text-gray-300">{item.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
