"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Tags, Users, BarChart3,
  BookOpenCheck, CreditCard, ListChecks, Headphones,
  PenTool, Mail, Megaphone, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Menu, X, Music2,
  ShieldCheck, FileText, Image, Globe, UserCircle, MessageCircle, MessagesSquare,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/admin",            label: "Dashboard",           icon: LayoutDashboard },
      { href: "/admin/analytics",  label: "Analytics",           icon: BarChart3       },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/books",        label: "Books",           icon: BookOpen      },
      { href: "/admin/reviews",      label: "Reviews",         icon: MessageCircle },
      { href: "/admin/comments",     label: "Comments",        icon: MessagesSquare },
      { href: "/admin/categories",   label: "Categories",      icon: Tags          },
      { href: "/admin/audiobooks",   label: "Audiobooks",      icon: Headphones    },
      { href: "/admin/premium-books",label: "Premium Books",   icon: BookOpenCheck },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users",        label: "Users",                icon: Users        },
      { href: "/admin/authors",      label: "Author Applications",  icon: PenTool      },
      { href: "/admin/subscriptions",label: "Subscriptions",        icon: CreditCard   },
    ],
  },
  {
    label: "Waitlists",
    items: [
      { href: "/admin/waitlists",    label: "All Waitlists",        icon: ListChecks   },
    ],
  },
  {
    label: "Communications",
    items: [
      { href: "/admin/newsletter",      label: "Newsletter",     icon: Mail      },
      { href: "/admin/announcements",   label: "Announcements",  icon: Megaphone },
      { href: "/admin/notifications",   label: "Notifications",  icon: Bell      },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings",   label: "Settings",         icon: Settings    },
      { href: "/admin/roles",      label: "Roles",            icon: ShieldCheck },
      { href: "/admin/audit",      label: "Audit Logs",       icon: FileText    },
      { href: "/admin/media",      label: "Media Library",    icon: Image       },
      { href: "/admin/seo",        label: "SEO Settings",     icon: Globe       },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}

function NavItem({
  href,
  label,
  icon: Icon,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]",
        isActive
          ? "bg-[#ECFDF5] text-[#059669]"
          : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-[#10B981]" : "text-[#94A3B8] group-hover:text-[#6B7280]"
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

// ── Desktop sidebar ────────────────────────────────────────────────────────────
export function AdminSidebarDesktop({
  collapsed,
  onCollapse,
}: Props) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-[#E5E7EB] bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-[#E5E7EB] shrink-0",
          collapsed ? "justify-center px-2" : "gap-3 px-4"
        )}
      >
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1220]">
            <BookMarked className="h-4 w-4 text-[#10B981]" />
          </div>
          {!collapsed && (
            <span className="font-bold text-[#111827] truncate text-sm">
              LamboReads
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => onCollapse(true)}
            className="ml-auto rounded-md p-1 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#6B7280] transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center pt-2 pb-1">
          <button
            onClick={() => onCollapse(false)}
            className="rounded-md p-1.5 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#6B7280] transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#CBD5E1]">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.href}
                  collapsed={collapsed}
                  {...item}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-[#E5E7EB] p-2", collapsed && "flex justify-center")}>
        {collapsed ? (
          <button
            onClick={handleSignOut}
            className="rounded-lg p-2 text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}

// ── Mobile drawer ──────────────────────────────────────────────────────────────
export function AdminSidebarMobile({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col bg-white border-r border-[#E5E7EB] lg:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-[#E5E7EB] px-4 shrink-0">
              <Link href="/admin" onClick={onClose} className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1220]">
                  <BookMarked className="h-4 w-4 text-[#10B981]" />
                </div>
                <span className="font-bold text-[#111827] text-sm">LamboReads</span>
              </Link>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-[#94A3B8] hover:bg-[#F8FAFC] transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
              {NAV.map((section) => (
                <div key={section.label}>
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#CBD5E1]">
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.href}
                        collapsed={false}
                        onClick={onClose}
                        {...item}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-[#E5E7EB] p-2">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Hamburger toggle (used in header on mobile) ────────────────────────────────
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden rounded-lg p-2 text-[#6B7280] hover:bg-[#F8FAFC] transition-colors"
      aria-label="Open navigation"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
