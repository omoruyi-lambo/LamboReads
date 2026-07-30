"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Plus, ExternalLink, UserCircle, LogOut } from "lucide-react";
import {
  AdminSidebarDesktop,
  AdminSidebarMobile,
  MobileMenuButton,
} from "./AdminSidebar";
import { signOut } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

interface Props {
  displayName: string;
  email: string;
  children: React.ReactNode;
}

export default function AdminShell({ displayName, email, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <AdminSidebarDesktop collapsed={collapsed} onCollapse={setCollapsed} />

      {/* Mobile drawer */}
      <AdminSidebarMobile open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main area */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-200",
          collapsed ? "lg:pl-16" : "lg:pl-60"
        )}
      >
        {/* ── Sticky header ──────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E5E7EB] bg-white/90 backdrop-blur-sm px-4">
          {/* Mobile hamburger */}
          <MobileMenuButton onClick={() => setMobileOpen(true)} />

          {/* Global search */}
          <div className="flex flex-1 items-center max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="search"
                placeholder="Search…"
                className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] pl-8 pr-3 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Quick create */}
            <Link
              href="/admin/books/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#0B1220] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0B1220]/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Link>

            {/* View site */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Site
            </Link>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B1220] text-xs font-bold text-white shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-semibold text-[#111827] truncate max-w-[120px]">
                    {displayName}
                  </span>
                  <span className="mt-0.5 inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-px text-[10px] font-semibold text-emerald-700">
                    Admin
                  </span>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                    <div className="px-3 py-2 border-b border-[#F1F5F9]">
                      <p className="text-xs font-semibold text-[#111827] truncate">{displayName}</p>
                      <p className="text-xs text-[#94A3B8] truncate mt-0.5">{email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="border-t border-[#F1F5F9] mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ───────────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
