"use client";

import { useState } from "react";

import { ArrowUpRight } from "lucide-react";

const STATS = [
  { label: "Outputs total", value: "47", delta: "+23%", up: true },
  { label: "Agents utilises", value: "8", delta: "Sur 12 disponibles", up: false },
  { label: "Heures economisees", value: "68h", delta: "+12h", up: true },
  { label: "Automation", value: "94%", delta: "Optimal", up: true },
];

const CHART_BARS = [
  { label: "Lun", value: 40, count: 3 },
  { label: "Mar", value: 65, count: 5 },
  { label: "Mer", value: 50, count: 4 },
  { label: "Jeu", value: 100, count: 8 },
  { label: "Ven", value: 75, count: 6 },
  { label: "Sam", value: 25, count: 2 },
  { label: "Dim", value: 55, count: 4 },
  { label: "Lun", value: 45, count: 3 },
  { label: "Mar", value: 80, count: 6 },
  { label: "Mer", value: 60, count: 5 },
  { label: "Jeu", value: 90, count: 7 },
  { label: "Ven", value: 70, count: 6 },
  { label: "Sam", value: 35, count: 3 },
  { label: "Dim", value: 50, count: 4 },
];

const AGENT_USAGE = [
  { name: "Informateur", pct: 38, color: "#0ea5e9" },
  { name: "Redacteur", pct: 26, color: "#8b5cf6" },
  { name: "Scriptwriter", pct: 18, color: "#f59e0b" },
  { name: "Webmaster", pct: 10, color: "#ec4899" },
  { name: "Email", pct: 8, color: "#e11d48" },
];

const PERIODS = ["7 derniers jours", "30 derniers jours", "Ce mois"];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30 derniers jours");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Performance de vos agents sur les 30 derniers jours.
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] text-gray-900 outline-none transition-all focus:border-gray-400 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20d=%27M2%204l4%204%204-4%27%20stroke=%27%2371717a%27%20stroke-width=%271.5%27%20fill=%27none%27%20stroke-linecap=%27round%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_8px_center] pr-7"
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {s.label}
            </div>
            <div className="text-3xl font-bold text-gray-950 tracking-tight leading-none">
              {s.value}
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${s.up ? "text-green-600" : "text-gray-400"}`}>
              {s.up && <ArrowUpRight className="w-3.5 h-3.5" />}
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
        {/* Bar chart */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <span className="text-[15px] font-semibold text-gray-950">Outputs par jour</span>
            <span className="text-xs text-gray-400 font-mono">Mars 2025</span>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-[3px] h-[80px]">
              {CHART_BARS.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-[3px] transition-colors cursor-pointer relative group"
                  style={{
                    height: `${bar.value}%`,
                    background: hoveredBar === i || bar.value >= 80 ? "#18181b" : "#e4e4e7",
                  }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === i && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-mono">
                      {bar.label} · {bar.count}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-mono">
              <span>Lun</span><span>Mer</span><span>Ven</span><span>Dim</span>
              <span>Mar</span><span>Jeu</span><span>Ven</span>
            </div>
          </div>
        </div>

        {/* Usage by agent */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <span className="text-[15px] font-semibold text-gray-950">Utilisation par agent</span>
          </div>
          <div className="p-5">
            {AGENT_USAGE.map((a, i) => (
              <div key={a.name} className={i < AGENT_USAGE.length - 1 ? "mb-3.5" : ""}>
                <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                  <span>{a.name}</span>
                  <span className="font-semibold text-gray-900">{a.pct}%</span>
                </div>
                <div className="h-[5px] bg-gray-100 rounded-[3px] overflow-hidden">
                  <div
                    className="h-full rounded-[3px] transition-all duration-500"
                    style={{ width: `${a.pct}%`, background: a.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
