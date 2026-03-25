"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex overflow-hidden min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={toggleMobile} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
