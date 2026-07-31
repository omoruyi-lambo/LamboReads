import Link from "next/link";
import {
  Users, Download, TrendingUp, PenTool,
  Crown, ListChecks, CreditCard, ArrowRight, AlertCircle,
  BookMarked, Headphones,
} from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  href,
  alert,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href?: string;
  alert?: boolean;
}) {
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        alert ? "border-amber-200 bg-amber-50/30" : "border-[#E5E7EB] hover:border-[#10B981]/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">{label}</p>
          <p className="mt-1.5 text-3xl font-bold text-[#111827] tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity">
          View all <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-[#F1F5F9]" />
          <div className="h-8 w-16 rounded bg-[#F1F5F9]" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-[#F1F5F9]" />
      </div>
    </div>
  );
}

// ── Quick action card ──────────────────────────────────────────────────────────
function QuickAction({
  title,
  description,
  icon: Icon,
  href,
  badge,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 transition-all hover:border-[#10B981]/40 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] group-hover:bg-[#ECFDF5] transition-colors">
        <Icon className="h-5 w-5 text-[#6B7280] group-hover:text-[#10B981] transition-colors" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#111827] truncate">{title}</p>
        <p className="text-xs text-[#94A3B8] truncate">{description}</p>
      </div>
      {badge && (
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          {badge}
        </span>
      )}
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function AdminDashboard() {
  await requireAdmin();

  // All counts in parallel — any table that doesn't exist returns null safely
  const sb = supabaseAdmin;
  const results = sb
    ? await Promise.allSettled([
        sb.from("books").select("*", { count: "exact", head: true }),
        sb.from("profiles").select("*", { count: "exact", head: true }),
        sb.from("downloads").select("*", { count: "exact", head: true }),
        sb.from("reading_history").select("*", { count: "exact", head: true }),
        sb.from("author_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        sb.from("premium_waitlist").select("*", { count: "exact", head: true }),
        sb.from("audiobook_waitlist").select("*", { count: "exact", head: true }),
        sb.from("purchases").select("*", { count: "exact", head: true }),
        sb.from("premium_books").select("*", { count: "exact", head: true }),
        sb.from("author_applications").select("*", { count: "exact", head: true }),
      ])
    : null;

  const safeCount = (i: number) =>
    results && results[i].status === "fulfilled"
      ? ((results[i] as PromiseFulfilledResult<any>).value.count ?? 0)
      : 0;

  const stats = {
    books:            safeCount(0),
    users:            safeCount(1),
    downloads:        safeCount(2),
    readingSessions:  safeCount(3),
    pendingAuthors:   safeCount(4),
    premiumWaitlist:  safeCount(5),
    audiobookWaitlist:safeCount(6),
    purchases:        safeCount(7),
    premiumBooks:     safeCount(8),
    totalAuthors:     safeCount(9),
  };

  // Recent signups (last 5)
  const recentUsers = sb
    ? (await sb.from("profiles").select("id,email,full_name,created_at").order("created_at", { ascending: false }).limit(5)).data ?? []
    : [];

  // Most downloaded books (top 5)
  const topBooks = sb
    ? (await sb.from("books").select("id,title,author,download_count").order("download_count", { ascending: false }).limit(5)).data ?? []
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">Platform overview — all numbers from Supabase</p>
      </div>

      {/* Alert banner */}
      {stats.pendingAuthors > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm font-medium text-amber-800">
              {stats.pendingAuthors} author application{stats.pendingAuthors !== 1 ? "s" : ""} waiting for review
            </p>
          </div>
          <Link
            href="/admin/authors"
            className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
          >
            Review now
          </Link>
        </div>
      )}

      {/* Stat cards — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard label="Total Books"         value={stats.books}             icon={Crown}      iconBg="bg-[#ECFDF5]"  iconColor="text-[#10B981]" href="/admin/books"         />
        <StatCard label="Registered Users"    value={stats.users}             icon={Users}      iconBg="bg-[#EFF6FF]"  iconColor="text-[#3B82F6]" href="/admin/users"         />
        <StatCard label="Total Downloads"     value={stats.downloads}         icon={Download}   iconBg="bg-[#FEF3C7]"  iconColor="text-[#F59E0B]"                             />
        <StatCard label="Reading Sessions"    value={stats.readingSessions}   icon={TrendingUp} iconBg="bg-[#FCE7F3]"  iconColor="text-[#EC4899]"                             />
        <StatCard label="Premium Books"       value={stats.premiumBooks}      icon={Crown}      iconBg="bg-amber-50"   iconColor="text-amber-500"  href="/admin/premium-books" />
        <StatCard label="Purchases"           value={stats.purchases}         icon={CreditCard} iconBg="bg-[#EFF6FF]"  iconColor="text-[#6366F1]" href="/admin/subscriptions" />
        <StatCard label="Author Apps"         value={stats.totalAuthors}      icon={PenTool}    iconBg="bg-[#FFF7ED]"  iconColor="text-orange-500" href="/admin/authors"       />
        <StatCard label="Pending Review"      value={stats.pendingAuthors}    icon={PenTool}    iconBg="bg-amber-50"   iconColor="text-amber-600"  href="/admin/authors"       alert={stats.pendingAuthors > 0} />
        <StatCard label="Premium Waitlist"    value={stats.premiumWaitlist}   icon={ListChecks} iconBg="bg-[#ECFDF5]"  iconColor="text-[#10B981]" href="/admin/waitlists"     />
        <StatCard label="Audiobook Waitlist"  value={stats.audiobookWaitlist} icon={Headphones} iconBg="bg-[#F0FDF4]"  iconColor="text-teal-500"   href="/admin/waitlists"     />
      </div>

      {/* Two-column: recent users + top books */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent signups */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#111827]">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs font-medium text-[#10B981] hover:underline">
              View all
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Users className="h-8 w-8 text-[#E5E7EB] mb-3" />
              <p className="text-sm text-[#94A3B8]">No users yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F8FAFC]">
              {recentUsers.map((u: any) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1220] text-xs font-bold text-white">
                    {(u.full_name ?? u.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#111827]">
                      {u.full_name ?? u.email ?? "Unknown"}
                    </p>
                    <p className="truncate text-xs text-[#94A3B8]">{u.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[#94A3B8]">
                    {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top books */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#111827]">Top Downloaded Books</h2>
            <Link href="/admin/books" className="text-xs font-medium text-[#10B981] hover:underline">
              Manage
            </Link>
          </div>
          {topBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1220] overflow-hidden mb-3">
                <img src="/images/logo.png" alt="LamboReads" className="h-4 w-4 object-contain" />
              </div>
              <p className="text-sm text-[#94A3B8]">No books in the database yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F8FAFC]">
              {topBooks.map((b: any, i: number) => (
                <li key={b.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-[#CBD5E1]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#111827]">{b.title}</p>
                    <p className="truncate text-xs text-[#94A3B8]">{b.author}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
                    {(b.download_count ?? 0).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-[#111827]">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <QuickAction title="Author Applications" description="Review pending applications"  icon={PenTool}    href="/admin/authors"        badge={stats.pendingAuthors > 0 ? String(stats.pendingAuthors) : undefined} />
          <QuickAction title="Premium Waitlist"    description={`${stats.premiumWaitlist} signups`}   icon={Crown}      href="/admin/waitlists"      />
          <QuickAction title="Audiobook Waitlist"  description={`${stats.audiobookWaitlist} signups`} icon={Headphones} href="/admin/waitlists"      />
          <QuickAction title="Manage Users"        description="View and edit profiles"       icon={Users}      href="/admin/users"          />
          <QuickAction title="Books Catalog"       description="Browse all books"             icon={Crown}      href="/admin/books"          />
          <QuickAction title="Premium Books"       description="Manage paid catalog"          icon={BookMarked} href="/admin/premium-books"  />
          <QuickAction title="Announcements"       description="Send platform-wide message"   icon={PenTool}    href="/admin/announcements"  />
          <QuickAction title="Analytics"           description="Charts and trends"            icon={TrendingUp} href="/admin/analytics"      />
        </div>
      </div>
    </div>
  );
}
