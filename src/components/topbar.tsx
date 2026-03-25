"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Plus, ChevronRight, Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Vue d'ensemble",
  "/chat": "Orchestrateur",
  "/agents": "Agents",
  "/webmaster": "Agent Webmaster",
  "/outputs": "Resultats",
  "/analytics": "Analytics",
  "/settings": "Parametres",
};

export function Topbar({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Workspace";

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-3 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-transparent border border-gray-200 cursor-pointer text-gray-500 hover:bg-gray-50 transition-all shrink-0"
      >
        <Menu className="w-4.5 h-4.5" />
      </button>

      <div className="flex items-center gap-1.5 text-sm text-gray-400 min-w-0">
        <span className="text-gray-500 hidden sm:inline">Workspace</span>
        <ChevronRight className="w-3.5 h-3.5 hidden sm:block" />
        <span className="text-gray-950 font-medium truncate">{title}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-transparent border border-gray-200 cursor-pointer transition-all text-gray-400 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 relative shrink-0">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all bg-gray-950 text-white hover:bg-gray-800 no-underline shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau projet</span>
        </Link>
      </div>
    </header>
  );
}
