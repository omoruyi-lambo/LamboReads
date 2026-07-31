"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Heart,
  Clock,
  Bookmark,
  Download,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/library", label: "Saved Books", icon: Heart },
  { href: "/dashboard/history", label: "Reading History", icon: Clock },
  { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Defer active-link highlighting to client only to prevent SSR/client mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#F8FAFC] border-r border-[#E5E7EB]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1220] text-white shadow-sm overflow-hidden">
            <img src="/images/logo.png" alt="LamboReads" className="h-4 w-4 object-contain" />
          </div>
          {!collapsed && (
            <span className="font-display text-sm font-semibold tracking-tight text-[#0B1220]">
              LamboReads
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:text-[#0B1220] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = mounted && pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-[#0B1220] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0B1220] hover:bg-[#E5E7EB]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 cursor-pointer",
            "text-red-600 hover:text-red-700 hover:bg-red-50"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1220] border border-white/10 text-white shadow-md cursor-pointer"
        aria-label="Open sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative h-full w-[260px] bg-[#F8FAFC] border-r border-[#E5E7EB] shadow-lg"
            >
              <div className="absolute right-3 top-3 z-10">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#0B1220]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "hidden lg:flex h-screen sticky top-0 flex-col border-r border-[#E5E7EB] bg-[#F8FAFC] transition-all duration-200 shrink-0",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

