import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import { ICON_MAP } from "@/lib/icon-map";
import { ArrowRight, ChevronRight } from "lucide-react";

const AGENT_STATUS: Record<string, { label: string; cls: string }> = {
  informateur: { label: "Actif", cls: "bg-green-50 text-green-600 before:bg-green-500" },
  scriptwriter: { label: "En cours", cls: "bg-amber-50 text-amber-600 before:bg-amber-500" },
  projet: { label: "Actif", cls: "bg-green-50 text-green-600 before:bg-green-500" },
};

const AGENT_OUTPUTS: Record<string, number> = {
  informateur: 18, redacteur: 12, scriptwriter: 9, webmaster: 8,
  video: 5, image: 11, landing: 3, montage: 4, email: 6, cm: 2, chatbot: 1, projet: 7,
};

const AGENT_LAST: Record<string, string> = {
  informateur: "Il y a 2h", redacteur: "Aujourd'hui", scriptwriter: "Il y a 28 min",
  webmaster: "Hier", video: "Lundi", image: "Hier", landing: "Lundi",
  montage: "Mercredi", email: "Hier", cm: "Semaine passee", chatbot: "Semaine passee", projet: "Aujourd'hui",
};

export default function AgentsPage() {
  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
            12 Agents business
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selectionnez un agent pour le configurer et le lancer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-4">
        {AGENTS.map((agent) => {
          const Icon = ICON_MAP[agent.iconName];
          const status = AGENT_STATUS[agent.id] || { label: "Inactif", cls: "bg-gray-100 text-gray-500 before:bg-gray-400" };
          const outputs = AGENT_OUTPUTS[agent.id] || 0;
          const lastUsed = AGENT_LAST[agent.id] || "—";

          return (
            <Link
              key={agent.id}
              href={`/chat?agent=${agent.id}`}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/80 transition-all no-underline"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${agent.color}10` }}
                >
                  <Icon className="w-5 h-5" style={{ color: agent.color }} strokeWidth={1.5} />
                </div>
                <span className={`badge-dot inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                  {status.label}
                </span>
              </div>

              <h3 className="text-[15px] font-semibold text-gray-950 mb-1">{agent.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{agent.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    <span className="font-mono font-medium text-gray-600">{outputs}</span> outputs
                  </span>
                  <span className="text-xs text-gray-400">{lastUsed}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
