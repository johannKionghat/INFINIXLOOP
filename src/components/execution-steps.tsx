"use client";

import { cn } from "@/lib/utils";
import type { ExecutionStep } from "@/agents/webmaster/types";
import { getStepIcon } from "@/agents/webmaster/step-icons";
import { Check, Loader2, AlertCircle, SkipForward, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

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

function StepCard({ step, isLast }: { step: ExecutionStep; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getStepIcon(step.icon);
  const hasChildren = step.children && step.children.length > 0;
  const isActive = step.status === "running";
  const isDone = step.status === "done";

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-[19px] top-[40px] w-[2px] bottom-0",
            isDone ? "bg-green-200" : isActive ? "bg-blue-200" : "bg-gray-100"
          )}
        />
      )}

      {/* Icon circle */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
          isActive && "bg-blue-50 ring-2 ring-blue-200 ring-offset-1",
          isDone && "bg-green-50",
          step.status === "error" && "bg-red-50",
          step.status === "pending" && "bg-gray-50 border border-gray-200",
          step.status === "skipped" && "bg-gray-50 opacity-50",
        )}
      >
        <Icon
          className={cn(
            "w-4.5 h-4.5",
            isActive && "text-blue-600",
            isDone && "text-green-600",
            step.status === "error" && "text-red-500",
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
              step.status === "error" && "text-red-600",
              step.status === "skipped" && "text-gray-300",
            )}
          >
            {step.label}
          </h4>
          <StatusBadge status={step.status} />
        </div>

        <p
          className={cn(
            "text-xs mt-0.5",
            isDone || isActive ? "text-gray-500" : "text-gray-300"
          )}
        >
          {step.description}
        </p>

        {/* Output */}
        {step.output && (
          <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-700 font-medium">{step.output}</p>
            {step.detail && (
              <p className="text-xs text-gray-400 mt-1">{step.detail}</p>
            )}
          </div>
        )}

        {/* Children (sub-steps) */}
        {hasChildren && (isDone || isActive) && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {step.children!.length} sous-etapes
            </button>
            {expanded && (
              <div className="mt-1.5 pl-3 border-l-2 border-gray-100 flex flex-col gap-2">
                {step.children!.map((sub) => (
                  <div key={sub.id} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={sub.status} />
                      <span
                        className={cn(
                          "text-xs",
                          sub.status === "done" ? "text-gray-600" :
                          sub.status === "running" ? "text-blue-600 font-medium" :
                          sub.status === "error" ? "text-red-500" :
                          "text-gray-300"
                        )}
                      >
                        {sub.label}
                      </span>
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
                            <span className="text-green-500 font-medium shrink-0">OUT</span>
                            <span className="text-gray-500">{sub.output}</span>
                          </div>
                        )}
                        {sub.detail && (
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{sub.detail}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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

export function ExecutionStepsView({ steps }: { steps: ExecutionStep[] }) {
  const doneCount = steps.filter((s) => s.status === "done").length;
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
              allDone ? "bg-green-500" : "bg-blue-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 tabular-nums">
          {doneCount}/{totalCount}
        </span>
        {isRunning && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
        {allDone && <Check className="w-3.5 h-3.5 text-green-500" />}
      </div>

      {/* Steps list */}
      <div className="flex flex-col">
        {steps.map((step, i) => (
          <StepCard key={step.id} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </div>
  );
}
