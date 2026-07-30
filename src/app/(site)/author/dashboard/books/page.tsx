import Link from "next/link";
import Image from "next/image";
import { Plus, BookOpen, Eye, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { requireAuthor } from "@/lib/supabase/author";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "My Books — Author Studio" };

const PAGE_SIZE = 20;

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  published: { label: "Published",      icon: CheckCircle2, bg: "bg-[#ECFDF5]", text: "text-[#059669]", border: "border-emerald-200" },
  pending:   { label: "Pending Review", icon: Clock,        bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-200"   },
  draft:     { label: "Draft",          icon: FileText,     bg: "bg-[#F8FAFC]", text: "text-[#64748B]", border: "border-[#E5E7EB]"   },
  rejected:  { label: "Rejected",       icon: XCircle,      bg: "bg-red-50",    text: "text-red-600",   border: "border-red-200"     },
};

export default async function AuthorBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { user } = await requireAuthor();
  const { status = "all", page = "1" } = await searchParams;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();

  // Summary counts (own books only — RLS enforces this)
  const countQueries = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }).eq("created_by", user.id).is("deleted_at", null),
    supabase.from("books").select("*", { count: "exact", head: true }).eq("created_by", user.id).eq("status", "published").is("deleted_at", null),
    supabase.from("books").select("*", { count: "exact", head: true }).eq("created_by", user.id).eq("status", "pending").is("deleted_at", null),
    supabase.from("books").select("*", { count: "exact", head: true }).eq("created_by", user.id).eq("status", "draft").is("deleted_at", null),
    supabase.from("books").select("*", { count: "exact", head: true }).eq("created_by", user.id).eq("status", "rejected").is("deleted_at", null),
  ]);

  const [total, published, pending, draft, rejected] = countQueries.map((r) => r.count ?? 0);

  // Paginated list
  let query = supabase
    .from("books")
    .select("id,title,author,genre,status,book_type,cover_url,download_count,view_count,bookmark_count,created_at", { count: "exact" })
    .eq("created_by", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") query = query.eq("status", status);

  const { data: books = [], count: filteredTotal = 0 } = await query;
  const totalPages = Math.ceil((filteredTotal ?? 0) / PAGE_SIZE);

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams({ status, page, ...overrides });
    return `/author/dashboard/books?${p}`;
  };

  const TABS = [
    { value: "all",       label: "All",      count: total     },
    { value: "published", label: "Published", count: published },
    { value: "pending",   label: "Pending",   count: pending   },
    { value: "draft",     label: "Drafts",    count: draft     },
    { value: "rejected",  label: "Rejected",  count: rejected  },
  ];  return (
    <div className="space-y-5 p-5 sm:p-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">My Books</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            {total} book{total !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <Link
          href="/author/dashboard/upload"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1220] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B1220]/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Upload Book
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Published", value: published, color: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
          { label: "Pending",   value: pending,   color: "text-amber-600", bg: "bg-amber-50"  },
          { label: "Drafts",    value: draft,     color: "text-[#64748B]", bg: "bg-[#F8FAFC]" },
          { label: "Rejected",  value: rejected,  color: "text-red-500",   bg: "bg-red-50"    },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1 w-fit flex-wrap">
        {TABS.map((tab) => (
          <a
            key={tab.value}
            href={buildUrl({ status: tab.value, page: "1" })}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              status === tab.value
                ? "bg-[#0B1220] text-white"
                : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${
              status === tab.value ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#64748B]"
            }`}>
              {tab.count}
            </span>
          </a>
        ))}
      </div>

      {/* Books table / cards */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        {!books || books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <BookOpen className="h-10 w-10 text-[#E5E7EB] mb-3" />
            <p className="text-sm font-semibold text-[#111827]">
              {status === "all" ? "No books yet" : `No ${status} books`}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1 mb-4">
              {status === "all"
                ? "Upload your first book to get started."
                : "Books with this status will appear here."}
            </p>
            {status === "all" && (
              <Link
                href="/author/dashboard/upload"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1220] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B1220]/90 transition-colors"
              >
                <Plus className="h-4 w-4" /> Upload First Book
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Book", "Genre", "Type", "Status", "Downloads", "Views", "Uploaded", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {(books as { id: string; title: string; author: string; genre: string; status: string; book_type: string; cover_url: string | null; download_count: number; view_count: number; bookmark_count: number; created_at: string }[]).map((book) => {
                  const cfg = STATUS_CONFIG[book.status] ?? STATUS_CONFIG.draft;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={book.id} className="hover:bg-[#FAFAFA] transition-colors">
                      {/* Cover + title */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-md bg-[#F1F5F9] border border-[#E5E7EB]">
                            {book.cover_url ? (
                              <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="32px" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BookOpen className="h-3.5 w-3.5 text-[#94A3B8]" />
                              </div>
                            )}
                          </div>
                          <p className="font-medium text-[#111827] truncate max-w-[180px]">{book.title}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">{book.genre ?? "—"}</td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          book.book_type === "premium"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-[#F1F5F9] text-[#64748B] border-[#E5E7EB]"
                        }`}>
                          {book.book_type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[#64748B] tabular-nums">{(book.download_count ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#64748B] tabular-nums">{(book.view_count ?? 0).toLocaleString()}</td>

                      <td className="px-4 py-3 text-xs text-[#94A3B8] whitespace-nowrap">
                        {new Date(book.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {book.status === "published" && (
                            <Link
                              href={`/book/${book.id}`}
                              target="_blank"
                              className="rounded-md p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#111827] transition-colors"
                              title="View live"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[#94A3B8]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a href={buildUrl({ page: String(currentPage - 1) })}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                Previous
              </a>
            )}
            {currentPage < totalPages && (
              <a href={buildUrl({ page: String(currentPage + 1) })}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
