"use client";

import { cn } from "@/lib/utils";
import type { ExecutionStep, ExecutionSubStep } from "@/agents/webmaster/types";
import { getStepIcon } from "@/agents/webmaster/step-icons";
import { Check, Loader2, AlertCircle, SkipForward, ChevronDown, ChevronRight, Eye, Copy, Download, X } from "lucide-react";
import { useState, useCallback } from "react";

// ── JSON Inspector Modal ────────────────────────────────────────────────────

interface InspectorData {
  label: string;
  status: string;
  input?: string;
  output?: string;
  detail?: string;
  rawInput?: unknown;
  rawOutput?: unknown;
}

function JsonInspector({ data, onClose }: { data: InspectorData; onClose: () => void }) {
  const [tab, setTab] = useState<"input" | "output">(data.rawOutput ? "output" : "input");
  const [copied, setCopied] = useState(false);

  const jsonContent = tab === "input"
    ? (data.rawInput ?? data.input ?? null)
    : (data.rawOutput ?? data.output ?? null);

  const jsonStr = jsonContent !== null
    ? (typeof jsonContent === "string" ? jsonContent : JSON.stringify(jsonContent, null, 2))
    : "(aucune donnee)";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [jsonStr]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.label.replace(/[^a-zA-Z0-9]/g, "_")}_${tab}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonStr, data.label, tab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "w-2 h-2 rounded-full shrink-0",
              data.status === "done" && "bg-green-500",
              data.status === "error" && "bg-red-500",
              data.status === "running" && "bg-blue-500",
              data.status === "pending" && "bg-gray-300",
            )} />
            <h3 className="text-sm font-semibold text-gray-950 truncate">{data.label}</h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copie" : "Copier"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <Download className="w-3 h-3" />
              JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200">
          <button
            onClick={() => setTab("input")}
            className={cn(
              "flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer",
              tab === "input" ? "text-gray-950 border-b-2 border-gray-950" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Input
          </button>
          <button
            onClick={() => setTab("output")}
            className={cn(
              "flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer",
              tab === "output" ? "text-gray-950 border-b-2 border-gray-950" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Output
          </button>
        </div>

        {/* Summary */}
        {(data.input || data.output) && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            {tab === "input" && data.input && (
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">Resume :</span> {data.input}</p>
            )}
            {tab === "output" && data.output && (
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">Resume :</span> {data.output}</p>
            )}
            {tab === "output" && data.detail && (
              <p className="text-xs text-gray-400 mt-0.5">{data.detail}</p>
            )}
          </div>
        )}

        {/* JSON content */}
        <div className="flex-1 overflow-auto p-5">
          <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap wrap-break-word leading-relaxed">
            {jsonStr}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── Inspect button ──────────────────────────────────────────────────────────

function InspectButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="p-1 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
      title="Inspecter les donnees"
    >
      <Eye className="w-3 h-3" />
    </button>
  );
}

// ── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ExecutionStep["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
    case "done":
      return <Check className="w-3.5 h-3.5 text-green-500" />;
    case "error":
      return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    case "skipped":
      return <SkipForward className="w-3.5 h-3.5 text-gray-400" />;
    default:
      return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200" />;
  }
}

function StepDuration({ step }: { step: ExecutionStep }) {
  if (!step.startedAt) return null;
  const end = step.completedAt || Date.now();
  const ms = end - step.startedAt;
  if (ms < 1000) return <span className="text-xs text-gray-400 font-mono">{ms}ms</span>;
  return <span className="text-xs text-gray-400 font-mono">{(ms / 1000).toFixed(1)}s</span>;
}

// ── Step card ───────────────────────────────────────────────────────────────

function StepCard({ step, isLast, onInspect }: { step: ExecutionStep; isLast: boolean; onInspect: (data: InspectorData) => void }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getStepIcon(step.icon);
  const hasChildren = step.children && step.children.length > 0;
  const isActive = step.status === "running";
  const isDone = step.status === "done";
  const isError = step.status === "error";
  const hasData = step.rawInput || step.rawOutput || step.output;

  const handleInspectStep = () => {
    onInspect({
      label: step.label,
      status: step.status,
      input: step.description,
      output: step.output,
      detail: step.detail,
      rawInput: step.rawInput,
      rawOutput: step.rawOutput,
    });
  };

  const handleInspectSub = (sub: ExecutionSubStep) => {
    onInspect({
      label: `${step.label} > ${sub.label}`,
      status: sub.status,
      input: sub.input,
      output: sub.output,
      detail: sub.detail,
      rawInput: sub.rawInput,
      rawOutput: sub.rawOutput,
    });
  };

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-[19px] top-[40px] w-[2px] bottom-0",
            isDone ? "bg-green-200" : isActive ? "bg-blue-200" : isError ? "bg-red-200" : "bg-gray-100"
          )}
        />
      )}

      {/* Icon circle */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
          isActive && "bg-blue-50 ring-2 ring-blue-200 ring-offset-1",
          isDone && "bg-green-50",
          isError && "bg-red-50 ring-2 ring-red-200 ring-offset-1",
          step.status === "pending" && "bg-gray-50 border border-gray-200",
          step.status === "skipped" && "bg-gray-50 opacity-50",
        )}
      >
        <Icon
          className={cn(
            "w-4.5 h-4.5",
            isActive && "text-blue-600",
            isDone && "text-green-600",
            isError && "text-red-500",
            step.status === "pending" && "text-gray-400",
            step.status === "skipped" && "text-gray-300",
          )}
          strokeWidth={1.5}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {step.module}
          </span>
          <StepDuration step={step} />
        </div>

        <div className="flex items-center gap-2">
          <h4
            className={cn(
              "text-sm font-semibold tracking-tight",
              isActive && "text-blue-700",
              isDone && "text-gray-950",
              step.status === "pending" && "text-gray-400",
              isError && "text-red-600",
              step.status === "skipped" && "text-gray-300",
            )}
          >
            {step.label}
          </h4>
          <StatusBadge status={step.status} />
          {hasData && (isDone || isError) && <InspectButton onClick={handleInspectStep} />}
        </div>

        <p
          className={cn(
            "text-xs mt-0.5",
            isDone || isActive ? "text-gray-500" : isError ? "text-red-400" : "text-gray-300"
          )}
        >
          {step.description}
        </p>

        {/* Output */}
        {step.output && (
          <div className={cn(
            "mt-2 px-3 py-2 rounded-xl",
            isError ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"
          )}>
            <p className={cn("text-xs font-medium", isError ? "text-red-600" : "text-gray-700")}>{step.output}</p>
            {step.detail && (
              <p className="text-xs text-gray-400 mt-1">{step.detail}</p>
            )}
          </div>
        )}

        {/* Children (sub-steps) */}
        {hasChildren && (isDone || isActive || isError) && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {step.children!.length} sous-etapes
              {step.children!.some((s) => s.status === "error") && (
                <span className="text-red-500 font-medium ml-1">
                  ({step.children!.filter((s) => s.status === "error").length} erreur{step.children!.filter((s) => s.status === "error").length > 1 ? "s" : ""})
                </span>
              )}
            </button>
            {expanded && (
              <div className="mt-1.5 pl-3 border-l-2 border-gray-100 flex flex-col gap-2">
                {step.children!.map((sub) => {
                  const subHasData = sub.rawInput || sub.rawOutput || sub.output;
                  return (
                    <div key={sub.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sub.status} />
                        <span
                          className={cn(
                            "text-xs flex-1",
                            sub.status === "done" ? "text-gray-600" :
                            sub.status === "running" ? "text-blue-600 font-medium" :
                            sub.status === "error" ? "text-red-500 font-medium" :
                            "text-gray-300"
                          )}
                        >
                          {sub.label}
                        </span>
                        {subHasData && (sub.status === "done" || sub.status === "error") && (
                          <InspectButton onClick={() => handleInspectSub(sub)} />
                        )}
                      </div>
                      {(sub.input || sub.output || sub.detail) && (
                        <div className="ml-5.5 pl-2 border-l border-gray-100">
                          {sub.input && (
                            <div className="flex items-start gap-1 text-[11px]">
                              <span className="text-gray-400 font-medium shrink-0">IN</span>
                              <span className="text-gray-400">{sub.input}</span>
                            </div>
                          )}
                          {sub.output && (
                            <div className="flex items-start gap-1 text-[11px]">
                              <span className={cn("font-medium shrink-0", sub.status === "error" ? "text-red-500" : "text-green-500")}>OUT</span>
                              <span className={cn(sub.status === "error" ? "text-red-400" : "text-gray-500")}>{sub.output}</span>
                            </div>
                          )}
                          {sub.detail && (
                            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{sub.detail}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Running animation */}
        {isActive && !step.output && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-1 h-1 rounded-full bg-blue-400"
                  style={{ animation: `bounce-dot 0.9s infinite ${d * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-blue-500 font-medium">En cours...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main view ───────────────────────────────────────────────────────────────

export function ExecutionStepsView({ steps }: { steps: ExecutionStep[] }) {
  const [inspecting, setInspecting] = useState<InspectorData | null>(null);
  const doneCount = steps.filter((s) => s.status === "done" || s.status === "error").length;
  const errorCount = steps.filter((s) => s.status === "error").length;
  const totalCount = steps.length;
  const isRunning = steps.some((s) => s.status === "running");
  const allDone = doneCount === totalCount && totalCount > 0;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div>
      {/* Progress header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              errorCount > 0 ? "bg-orange-500" : allDone ? "bg-green-500" : "bg-blue-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 tabular-nums">
          {doneCount}/{totalCount}
        </span>
        {errorCount > 0 && (
          <span className="text-xs font-medium text-red-500">
            {errorCount} erreur{errorCount > 1 ? "s" : ""}
          </span>
        )}
        {isRunning && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
        {allDone && errorCount === 0 && <Check className="w-3.5 h-3.5 text-green-500" />}
      </div>

      {/* Steps list */}
      <div className="flex flex-col">
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            isLast={i === steps.length - 1}
            onInspect={setInspecting}
          />
        ))}
      </div>

      {/* Inspector modal */}
      {inspecting && <JsonInspector data={inspecting} onClose={() => setInspecting(null)} />}
    </div>
  );
}
