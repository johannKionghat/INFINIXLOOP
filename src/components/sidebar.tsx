"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { InfinixLoopLogo } from "./logo";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  BarChart3,
  Search,
  ChevronDown,
  Settings,
  ExternalLink,
  LogOut,
  Globe,
} from "lucide-react";

const NAV_ITEMS = [
  {
    section: "Workspace",
    items: [
      { href: "/overview", label: "Vue d'ensemble", icon: LayoutDashboard },
      { href: "/chat", label: "Orchestrateur", icon: MessageSquare },
      { href: "/agents", label: "Agents", icon: Users },
      { href: "/webmaster", label: "Webmaster", icon: Globe },
      { href: "/outputs", label: "Resultats", icon: FileText },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/settings", label: "Parametres", icon: Settings },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <aside className="w-[260px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center shrink-0">
            <InfinixLoopLogo size={18} />
          </div>
          <span className="text-[15px] font-semibold text-gray-950 tracking-tight">
            InfinixLoop
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="mx-4 mb-4">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 cursor-text hover:border-gray-300 transition-colors">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="border-none bg-transparent outline-none text-sm text-gray-900 w-full placeholder:text-gray-400"
          />
          <kbd className="font-mono text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded-md border border-gray-200 hidden sm:inline">
            /
          </kbd>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
              {section.section}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 no-underline",
                      isActive && "bg-gray-100 text-gray-950 font-medium"
                    )}
                    onClick={onNavigate}
                  >
                    <item.icon
                      className={cn(
                        "w-[18px] h-[18px] shrink-0",
                        isActive ? "text-gray-950" : "text-gray-400"
                      )}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all no-underline"
        >
          <ExternalLink className="w-[18px] h-[18px] text-gray-400 shrink-0" strokeWidth={1.5} />
          <span>Site public</span>
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-gray-950 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "Utilisateur"}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {user?.role === "admin" ? "Administrateur" : "Membre"}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
            title="Deconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
