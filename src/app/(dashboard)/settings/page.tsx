"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings, Save, Check, Eye, EyeOff, ExternalLink, Shield,
  Sparkles, Brain, Wind, Zap, Image as ImageIcon, Briefcase,
  AtSign, ThumbsUp, MessageCircle, Phone, Hash, BookOpen, Mail,
  KeyRound, ChevronDown, ChevronRight, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  API_KEY_SECTIONS,
  fetchApiKeys,
  saveApiKeys,
  type ApiKeysStore,
  type ApiKeySection,
} from "@/lib/settings";
import type { LucideIcon } from "lucide-react";

const SECTION_ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Brain,
  Wind,
  Zap,
  ImageIcon,
  Briefcase,
  AtSign,
  ThumbsUp,
  MessageCircle,
  Phone,
  Hash,
  BookOpen,
  Mail,
  Layers,
};

const CATEGORY_GROUPS = [
  {
    label: "Modeles IA",
    icon: Sparkles,
    sectionIds: ["openai", "anthropic", "mistral", "groq", "huggingface"],
  },
  {
    label: "Reseaux sociaux",
    icon: Briefcase,
    sectionIds: ["linkedin", "twitter", "facebook"],
  },
  {
    label: "Messagerie",
    icon: MessageCircle,
    sectionIds: ["whatsapp_group", "whatsapp_business"],
  },
  {
    label: "Design & Carrousel",
    icon: Layers,
    sectionIds: ["infinixui"],
  },
  {
    label: "Notifications & Productivite",
    icon: Hash,
    sectionIds: ["slack", "notion"],
  },
  {
    label: "Email & Newsletter",
    icon: Mail,
    sectionIds: ["brevo"],
  },
];

function FieldInput({
  value,
  onChange,
  type,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type: "text" | "password";
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <input
        type={isPassword && !visible ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-all focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] font-mono"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function SectionCard({
  section,
  values,
  onChange,
}: {
  section: ApiKeySection;
  values: ApiKeysStore;
  onChange: (key: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = SECTION_ICON_MAP[section.icon] || KeyRound;

  const configuredCount = section.fields.filter((f) => (values[f.key] || "").length > 0).length;
  const totalRequired = section.fields.filter((f) => f.required).length;
  const allConfigured = configuredCount === section.fields.length && section.fields.length > 0;
  const hasRequired = totalRequired > 0;
  const requiredMet = hasRequired
    ? section.fields.filter((f) => f.required && (values[f.key] || "").length > 0).length === totalRequired
    : true;

  return (
    <div className={cn(
      "border rounded-2xl transition-all overflow-hidden",
      open ? "border-gray-300 shadow-sm" : "border-gray-200 hover:border-gray-300",
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50/50"
      >
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          allConfigured ? "bg-green-50" : configuredCount > 0 ? "bg-amber-50" : "bg-gray-50"
        )}>
          <Icon
            className={cn(
              "w-4.5 h-4.5",
              allConfigured ? "text-green-600" : configuredCount > 0 ? "text-amber-500" : "text-gray-400"
            )}
            strokeWidth={1.5}
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-950">{section.title}</span>
            {allConfigured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-600">
                <Check className="w-3 h-3" /> Configure
              </span>
            )}
            {!allConfigured && configuredCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600">
                {configuredCount}/{section.fields.length}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{section.description}</p>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100">
          <div className="flex flex-col gap-4 mt-3">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-400">*</span>}
                </label>
                <FieldInput
                  value={values[field.key] || ""}
                  onChange={(v) => onChange(field.key, v)}
                  type={field.type}
                  placeholder={field.placeholder}
                />
                {field.helpText && (
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    {field.helpText}
                    {field.helpUrl && (
                      <a
                        href={field.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 underline underline-offset-2 transition-colors"
                      >
                        {field.helpUrl.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!requiredMet && hasRequired && (
            <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs text-amber-600 font-medium">
                Les champs marques * sont requis pour l&apos;execution des agents.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [values, setValues] = useState<ApiKeysStore>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchApiKeys().then((keys) => {
      setValues(keys);
      setLoaded(true);
    });
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setSaveError("");
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const result = await saveApiKeys(values);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setSaveError(result.error || "Erreur lors de la sauvegarde");
    }
  };

  const totalFields = API_KEY_SECTIONS.reduce((acc, s) => acc + s.fields.length, 0);
  const configuredFields = API_KEY_SECTIONS.reduce(
    (acc, s) => acc + s.fields.filter((f) => (values[f.key] || "").length > 0).length,
    0
  );

  if (!loaded) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-950 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-[860px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
              Parametres
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Cles API, integrations et connexions MCP
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all",
            saved
              ? "bg-green-600 text-white"
              : saving
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gray-950 text-white hover:bg-gray-800"
          )}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Sauvegarde !" : saving ? "Sauvegarde..." : "Sauvegarder les cles"}
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 mb-6 px-5 py-3.5 bg-white border border-gray-200 rounded-2xl">
        <Shield className="w-4.5 h-4.5 text-gray-400" strokeWidth={1.5} />
        <div className="flex-1">
          <p className="text-sm text-gray-700 font-medium">
            {configuredFields}/{totalFields} cles configurees
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Les cles sont stockees dans Supabase (securise par RLS) avec fallback localStorage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                configuredFields === totalFields ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${totalFields > 0 ? Math.round((configuredFields / totalFields) * 100) : 0}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-400 tabular-nums">
            {totalFields > 0 ? Math.round((configuredFields / totalFields) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Category groups */}
      {CATEGORY_GROUPS.map((group) => {
        const GroupIcon = group.icon;
        const sections = group.sectionIds
          .map((id) => API_KEY_SECTIONS.find((s) => s.id === id))
          .filter(Boolean) as ApiKeySection[];

        return (
          <div key={group.label} className="mb-8">
            <div className="flex items-center gap-2 mb-3 px-1">
              <GroupIcon className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {group.label}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  values={values}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Error message */}
      {saveError && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 font-medium">{saveError}</p>
        </div>
      )}

      {/* Bottom save */}
      <div className="sticky bottom-4 flex justify-end mt-4 mb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all shadow-lg",
            saved
              ? "bg-green-600 text-white shadow-green-200"
              : saving
                ? "bg-gray-400 text-white cursor-not-allowed shadow-gray-200"
                : "bg-gray-950 text-white hover:bg-gray-800 shadow-gray-300"
          )}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Sauvegarde !" : saving ? "Sauvegarde..." : "Sauvegarder les cles"}
        </button>
      </div>
    </div>
  );
}
