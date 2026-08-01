"use client";

import { useState } from "react";
import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  DollarSign,
  TrendingUp,
  Users,
  ChevronRight,
  PenTool,
  Menu,
  X,
  PlusCircle,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Stats {
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  totalReaders: number;
  totalSales: number;
  royalties: number;
}

interface Props {
  stats: Stats;
  recentBooks: Record<string, unknown>[];
}

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/author/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Books",
    items: [
      { href: "/author/dashboard/books", label: "All Books", icon: BookOpen },
      { href: "/author/dashboard/upload", label: "Upload Book", icon: Upload },
    ],
  },
];

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const inner = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <Image src="/images/logo.png" alt="LamboReads" width={36} height={36} className="object-contain" />
          <div>
            <p className="font-display font-bold text-[#111827] text-sm">LamboReads</p>
            <p className="text-[10px] text-[#64748B]">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#0B1220] text-white"
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827]"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3">
          <p className="text-xs font-semibold text-[#111827] mb-0.5">Status</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            Pending Approval
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-0 bottom-0 border-r border-[#E5E7EB] bg-white z-30">
        {inner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
              <span className="font-semibold text-[#111827]">Author Menu</span>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F8FAFC]">
                <X className="h-5 w-5 text-[#64748B]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{inner}</div>
          </aside>
        </div>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-[#111827]">{value}</p>
      <p className="text-sm text-[#64748B] mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function AuthorDashboardClient({ stats, recentBooks }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const statCards = [
    {
      label: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "bg-[#ECFDF5] text-[#10B981]",
      subtitle: `${stats.publishedBooks} published · ${stats.draftBooks} drafts`,
    },
    {
      label: "Total Readers",
      value: stats.totalReaders.toLocaleString(),
      icon: Users,
      color: "bg-[#EFF6FF] text-[#3B82F6]",
    },
    {
      label: "Total Sales",
      value: stats.totalSales.toLocaleString(),
      icon: DollarSign,
      color: "bg-[#FEF3C7] text-[#F59E0B]",
    },
    {
      label: "Royalties Earned",
      value: `$${stats.royalties.toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-[#FCE7F3] text-[#EC4899]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-[#F8FAFC] text-[#64748B]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-[#111827] text-base">Author Dashboard</h1>
          </div>
          <Link href="/author/dashboard/upload">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              Upload Book
            </Button>
          </Link>
        </header>

        <main className="p-5 sm:p-7 space-y-7">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-[#0B1220] to-[#1E2D40] p-6 sm:p-8 text-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold mb-1">Welcome to your Dashboard</h2>
                <p className="text-[#94A3B8] text-sm max-w-sm">
                  Manage your books, track readers, and grow your audience.
                </p>
              </div>
              <PenTool className="h-8 w-8 text-[#10B981] flex-shrink-0 hidden sm:block" />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
              Under review — we&apos;ll be in touch shortly.
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <StatCard {...s} />
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Books */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-[#111827]">Your Books</h3>
                <Link href="/author/dashboard/upload">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <PlusCircle className="h-3 w-3" /> Upload
                  </Button>
                </Link>
              </div>
              {recentBooks.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <BookOpen className="h-10 w-10 text-[#CBD5E1] mb-3" />
                  <p className="text-sm font-semibold text-[#111827]">No books yet</p>
                  <p className="text-xs text-[#64748B] mt-1 mb-4">Upload your first book to get started.</p>
                  <Link href="/author/dashboard/upload">
                    <Button variant="primary" size="sm">Upload Your First Book</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBooks.map((book) => {
                    const b = book as { id: string; title: string; status: string };
                    return (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="h-10 w-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                        <BookMarked className="h-4 w-4 text-[#94A3B8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111827] truncate">{b.title}</p>
                        <p className="text-xs text-[#64748B]">{b.status}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#CBD5E1]" />
                    </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            >
              <h3 className="font-semibold text-[#111827] mb-5">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Upload a new book", icon: Upload, href: "/author/dashboard/upload", color: "text-[#10B981]" },
                  { label: "Manage your books", icon: BookOpen, href: "/author/dashboard/books", color: "text-[#3B82F6]" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8FAFC] group-hover:bg-white border border-[#E5E7EB]">
                        <Icon className={cn("h-4 w-4", action.color)} />
                      </div>
                      <span className="text-sm font-medium text-[#475569] group-hover:text-[#111827] transition-colors flex-1">
                        {action.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#CBD5E1] group-hover:text-[#94A3B8]" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
