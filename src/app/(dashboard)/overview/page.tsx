import Link from "next/link";
import {
  Radio, BookOpen, Clapperboard, Globe,
  TrendingUp, ArrowUpRight, ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STATS = [
  { label: "Outputs generes", value: "47", delta: "+23% ce mois", up: true },
  { label: "Agents actifs", value: "8", suffix: "/12", delta: "2 inactifs", up: false },
  { label: "Heures economisees", value: "68h", delta: "+12h vs semaine", up: true },
  { label: "Taux d'automation", value: "94", suffix: "%", delta: "Optimal", up: true },
];

const RECENT_AGENTS: { icon: LucideIcon; color: string; name: string; status: string; statusLabel: string; outputs: number }[] = [
  { icon: Radio, color: "#0ea5e9", name: "Informateur", status: "active", statusLabel: "Actif", outputs: 18 },
  { icon: BookOpen, color: "#8b5cf6", name: "Redacteur", status: "idle", statusLabel: "Inactif", outputs: 12 },
  { icon: Clapperboard, color: "#f59e0b", name: "Scriptwriter", status: "running", statusLabel: "En cours", outputs: 9 },
  { icon: Globe, color: "#ec4899", name: "Webmaster", status: "idle", statusLabel: "Inactif", outputs: 8 },
];

const ACTIVITY: { icon: LucideIcon; color: string; agent: string; text: string; time: string; ts: string }[] = [
  { icon: BookOpen, color: "#8b5cf6", agent: "Redacteur", text: "a genere un ebook de 47 pages", time: "Il y a 12 min", ts: "14:23" },
  { icon: Clapperboard, color: "#f59e0b", agent: "Scriptwriter", text: "Script Reel en cours", time: "Il y a 28 min", ts: "14:07" },
  { icon: Globe, color: "#ec4899", agent: "Webmaster", text: "a planifie 6 publications", time: "Il y a 1h", ts: "13:28" },
  { icon: Radio, color: "#0ea5e9", agent: "Informateur", text: "3 tendances virales detectees", time: "Il y a 2h", ts: "12:15" },
];

const statusClasses: Record<string, string> = {
  active: "bg-green-50 text-green-600 before:bg-green-500",
  idle: "bg-gray-100 text-gray-500 before:bg-gray-400",
  running: "bg-amber-50 text-amber-600 before:bg-amber-500",
};

export default function DashboardPage() {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
            Vue d&apos;ensemble
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Performance de votre workspace cette semaine.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {s.label}
            </div>
            <div className="text-3xl font-bold text-gray-950 tracking-tight leading-none">
              {s.value}
              {s.suffix && (
                <span className="text-lg text-gray-300 font-medium">{s.suffix}</span>
              )}
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${s.up ? "text-green-600" : "text-gray-400"}`}>
              {s.up && <ArrowUpRight className="w-3.5 h-3.5" />}
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 items-start">
        {/* Recent agents */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <span className="text-[15px] font-semibold text-gray-950">
              Agents recents
            </span>
            <Link
              href="/agents"
              className="flex items-center gap-1 text-xs text-gray-500 font-medium hover:text-gray-900 transition-colors no-underline"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {RECENT_AGENTS.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.name}
                  className="flex items-center gap-3.5 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${a.color}10` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: a.color }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-950">{a.name}</div>
                  </div>
                  <span
                    className={`badge-dot inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses[a.status]}`}
                  >
                    {a.statusLabel}
                  </span>
                  <span className="text-sm font-mono text-gray-400 w-8 text-right">{a.outputs}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <span className="text-[15px] font-semibold text-gray-950">
              Activite recente
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="flex gap-3.5 px-6 py-4"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${a.color}10` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: a.color }} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-600 leading-snug">
                      <strong className="text-gray-950 font-medium">
                        {a.agent}
                      </strong>{" "}
                      {a.text}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {a.time}
                    </div>
                  </div>
                  <div className="text-xs text-gray-300 shrink-0 pt-0.5 font-mono">
                    {a.ts}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
