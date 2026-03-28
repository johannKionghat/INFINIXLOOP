"use client";

import { useState, useEffect, useCallback } from "react";
import { FolderOpen, FileText, Layers, Image, BarChart2, ExternalLink, Download, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  agent_id: string;
  type: "carousel" | "pdf" | "image" | "report";
  title: string;
  description?: string;
  file_url?: string;
  content?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  infinixui_project_id?: string;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  carousel: { label: "Carrousel", icon: Layers, color: "bg-purple-50 text-purple-600" },
  pdf: { label: "PDF", icon: FileText, color: "bg-red-50 text-red-600" },
  image: { label: "Image", icon: Image, color: "bg-blue-50 text-blue-600" },
  report: { label: "Rapport", icon: BarChart2, color: "bg-green-50 text-green-600" },
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [openingStudio, setOpeningStudio] = useState<string | null>(null);

  /** Get a cross-app login token from InfinixUI, then open the studio URL */
  const openStudio = useCallback(async (docId: string, baseUrl: string) => {
    setOpeningStudio(docId);
    try {
      const res = await fetch("/api/agents/infinixui", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_login_token", studio_url: baseUrl }),
      });
      const data = await res.json();
      window.open(data.studio_url || baseUrl, "_blank", "noopener,noreferrer");
    } catch {
      window.open(baseUrl, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningStudio(null);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents", { credentials: "include" });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all" ? documents : documents.filter((d) => d.type === filter);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-950">Mes Documents</h1>
            <p className="text-sm text-gray-500">Carrousels, PDFs, images et rapports generes par vos agents</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: "Tous" },
          { value: "carousel", label: "Carrousels" },
          { value: "pdf", label: "PDFs" },
          { value: "image", label: "Images" },
          { value: "report", label: "Rapports" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer",
              filter === f.value
                ? "bg-gray-950 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aucun document pour le moment</p>
          <p className="text-gray-400 text-xs mt-1">Les documents generes par vos agents apparaitront ici</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const tc = TYPE_CONFIG[doc.type] || TYPE_CONFIG.pdf;
            const Icon = tc.icon;
            return (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                {/* Preview image for carousels */}
                {doc.type === "carousel" && (doc.metadata as Record<string, string>)?.preview_image && (
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-3 bg-gray-100">
                    <img
                      src={(doc.metadata as Record<string, string>).preview_image}
                      alt={doc.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", tc.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{doc.description}</p>
                    )}
                  </div>
                </div>

                {doc.infinixui_project_id && (() => {
                  const studioBase = (doc.metadata as Record<string, string>)?.infinixui_editor_url || `https://infinixui.com/carousel/studio?session=${doc.infinixui_project_id}`;
                  return (
                    <button
                      onClick={() => openStudio(doc.id, studioBase)}
                      disabled={openingStudio === doc.id}
                      className="flex items-center gap-2 px-3 py-2 mb-3 w-full bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700 font-medium hover:bg-purple-100 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {openingStudio === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                      Ouvrir et modifier sur InfinixUI
                    </button>
                  );
                })()}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDate(doc.created_at)}</span>
                  <div className="flex gap-1">
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Telecharger"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Apercu"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">x</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {previewDoc.file_url && previewDoc.type === "pdf" && (
                <iframe src={previewDoc.file_url} className="w-full h-125 rounded-lg border" />
              )}
              {previewDoc.file_url && previewDoc.type === "image" && (
                <img src={previewDoc.file_url} className="w-full rounded-lg" alt={previewDoc.title} />
              )}
              {previewDoc.content && (
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(previewDoc.content, null, 2)}
                </pre>
              )}
              {!previewDoc.file_url && !previewDoc.content && (
                <p className="text-gray-500 text-sm text-center py-8">Aucun apercu disponible</p>
              )}
            </div>
            <div className="flex gap-2 p-4 border-t border-gray-200">
              {previewDoc.file_url && (
                <a
                  href={previewDoc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-950 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-4 h-4" /> Telecharger
                </a>
              )}
              {previewDoc.infinixui_project_id && (() => {
                const studioBase = (previewDoc.metadata as Record<string, string>)?.infinixui_editor_url || `https://infinixui.com/carousel/studio?session=${previewDoc.infinixui_project_id}`;
                return (
                  <button
                    onClick={() => openStudio(previewDoc.id, studioBase)}
                    disabled={openingStudio === previewDoc.id}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {openingStudio === previewDoc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                    Editer sur InfinixUI
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
