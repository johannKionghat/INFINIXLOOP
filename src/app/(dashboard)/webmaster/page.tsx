"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Globe, Play, RotateCcw, ChevronDown, ChevronRight, Settings, Share2, FileText, Layers, Palette, Database, ImageIcon, Brain, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionStepsView } from "@/components/execution-steps";
import {
  CONFIG_FORM_FIELDS,
  CONFIG_SECTIONS,
  getDefaultConfig,
} from "@/agents/webmaster/config";
import { runWebmasterAgent } from "@/agents/webmaster/runner";
import type { ExecutionStep, WebmasterConfig, WebmasterContext } from "@/agents/webmaster/types";
import type { ConfigFormField } from "@/agents/webmaster/config";

const SECTION_ICONS: Record<string, React.ElementType> = {
  Brain,
  Layers,
  Database,
  FileText,
  Globe,
  ImageIcon,
  Palette,
  Share2,
  Settings,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-gray-950" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

const AGENT_ID = "webmaster";

async function loadSavedConfig(): Promise<WebmasterConfig | null> {
  try {
    const res = await fetch(`/api/agents/config?agent_id=${AGENT_ID}`, { credentials: "include" });
    const data = await res.json();
    if (data.config && typeof data.config === "object") {
      return { ...getDefaultConfig(), ...data.config } as WebmasterConfig;
    }
  } catch { /* use defaults */ }
  return null;
}

async function saveConfig(config: WebmasterConfig) {
  try {
    await fetch("/api/agents/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ agent_id: AGENT_ID, config }),
    });
  } catch { /* silent */ }
}

export default function WebmasterPage() {
  const [config, setConfig] = useState<WebmasterConfig>(getDefaultConfig());
  const [configLoaded, setConfigLoaded] = useState(false);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [context, setContext] = useState<WebmasterContext | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ model: true, mode: true, source: true, style: true, platforms: true });
  const stepsRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load saved config on mount
  useEffect(() => {
    loadSavedConfig().then((saved) => {
      if (saved) setConfig(saved);
      setConfigLoaded(true);
    });
  }, []);

  // Auto-save config on change (debounced 800ms)
  useEffect(() => {
    if (!configLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(() => {
      saveConfig(config).then(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
      });
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [config, configLoaded]);

  const updateConfig = useCallback((key: keyof WebmasterConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setSteps([]);
    setContext(null);

    try {
      const result = await runWebmasterAgent(config, (updated) => {
        setSteps([...updated]);
      });
      setContext(result);
    } catch (err) {
      console.error("Webmaster agent error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setSteps([]);
    setContext(null);
    setIsRunning(false);
  };

  useEffect(() => {
    if (stepsRef.current) {
      stepsRef.current.scrollTop = stepsRef.current.scrollHeight;
    }
  }, [steps]);

  const shouldShowField = (field: ConfigFormField): boolean => {
    if (!field.showWhen) return true;
    const currentValue = config[field.showWhen.field];
    const strValue = String(currentValue);
    if (Array.isArray(field.showWhen.value)) {
      return field.showWhen.value.includes(strValue);
    }
    return strValue === field.showWhen.value;
  };

  const visibleSections = CONFIG_SECTIONS.filter((section) => {
    const fields = CONFIG_FORM_FIELDS.filter((f) => f.section === section.id);
    return fields.some(shouldShowField);
  });

  const allDone = steps.length > 0 && steps.every((s) => s.status === "done" || s.status === "skipped");

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
            <Globe className="w-5 h-5 text-pink-500" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
              Agent Webmaster
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Publication multi-reseaux : TEXT_ONLY, TEXT_MEDIA, CAROUSEL
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {steps.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:border-gray-300 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reinitialiser
            </button>
          )}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border-none cursor-pointer transition-all",
              isRunning
                ? "bg-blue-500 text-white opacity-80 cursor-not-allowed"
                : "bg-gray-950 text-white hover:bg-gray-800"
            )}
          >
            <Play className="w-3.5 h-3.5" />
            {isRunning ? "Execution..." : "Lancer l'agent"}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4" style={{ minHeight: "60vh" }}>
        {/* Left: Config form */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-y-auto">
          <div className="px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-950">Configuration</h2>
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Sauvegarde...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-[11px] text-green-500">
                  <Check className="w-3 h-3" /> Sauvegarde
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Tous les parametres du workflow</p>
          </div>
          <div className="p-4">
            {visibleSections.map((section) => {
              const SectionIcon = SECTION_ICONS[section.icon] || Settings;
              const isOpen = openSections[section.id] ?? false;
              const fields = CONFIG_FORM_FIELDS.filter(
                (f) => f.section === section.id && shouldShowField(f)
              );
              if (fields.length === 0) return null;

              return (
                <div key={section.id} className="mb-3">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <SectionIcon className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex-1 text-left">
                      {section.label}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-2 flex flex-col gap-3 mt-1">
                      {fields.map((field) => (
                        <div key={field.key}>
                          {field.type === "toggle" ? (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-sm text-gray-700">{field.label}</span>
                              <Toggle
                                checked={Boolean(config[field.key])}
                                onChange={(v) => updateConfig(field.key, v)}
                              />
                            </div>
                          ) : (
                            <>
                              <label className="text-xs font-medium text-gray-500 mb-1 block">
                                {field.label}
                              </label>
                              {field.description && (
                                <p className="text-xs text-gray-400 mb-1.5">{field.description}</p>
                              )}
                              {field.type === "select" ? (
                                <select
                                  value={String(config[field.key])}
                                  onChange={(e) => updateConfig(field.key, e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 appearance-auto"
                                >
                                  {field.options?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : field.type === "textarea" ? (
                                <textarea
                                  value={String(config[field.key] || "")}
                                  onChange={(e) => updateConfig(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 resize-y min-h-[60px]"
                                />
                              ) : field.type === "number" ? (
                                <input
                                  type="number"
                                  value={Number(config[field.key]) || 0}
                                  onChange={(e) => updateConfig(field.key, Number(e.target.value))}
                                  min={1}
                                  max={10}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={String(config[field.key] || "")}
                                  onChange={(e) => updateConfig(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-gray-300"
                                />
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Execution view */}
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3 sticky top-0 bg-white z-10">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isRunning ? "bg-blue-500 animate-blink" : allDone ? "bg-green-500" : "bg-gray-300"
            )} />
            <span className="text-sm font-semibold text-gray-950">
              {isRunning ? "Execution en cours..." : allDone ? "Execution terminee" : "En attente de lancement"}
            </span>
            {allDone && context?.sessionReport && (
              <span className="ml-auto text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                Score : {context.sessionReport.qualityScore}/10
              </span>
            )}
          </div>

          <div ref={stepsRef} className="flex-1 overflow-y-auto px-5 py-5">
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <Globe className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-gray-400 mb-1">
                  Pret a executer
                </h3>
                <p className="text-sm text-gray-300 max-w-[300px]">
                  Configurez les parametres a gauche puis cliquez sur &quot;Lancer l&apos;agent&quot; pour demarrer le workflow.
                </p>
              </div>
            ) : (
              <ExecutionStepsView steps={steps} />
            )}

            {/* Session report */}
            {allDone && context?.sessionReport && (
              <div className="mt-6 border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-950">Rapport de session</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 mb-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Score</div>
                      <div className="text-2xl font-bold text-gray-950">{context.sessionReport.qualityScore}/10</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Publiees</div>
                      <div className="text-2xl font-bold text-green-600">{context.sessionReport.publishedPlatforms.length}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Echecs</div>
                      <div className="text-2xl font-bold text-gray-300">{context.sessionReport.failedPlatforms.length}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {context.sessionReport.publishedPlatforms.map((p) => (
                      <span key={p} className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                  {context.sessionReport.recommendations.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommandations</div>
                      <ul className="flex flex-col gap-1.5">
                        {context.sessionReport.recommendations.map((r, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                            <span className="text-gray-300 mt-0.5">—</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
