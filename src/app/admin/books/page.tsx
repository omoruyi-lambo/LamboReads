import Link from "next/link";
import { Plus, Search, Download } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { BooksTableClient } from "./BooksTableClient";

const PAGE_SIZE = 20;

const STATUSES = ["all", "published", "pending", "draft", "rejected"];
const GENRES = [
  "all","Gospel & Christian","Romance","Fiction","Non-Fiction","Mystery & Thriller",
  "Fantasy","Science Fiction","Adventure","Business","Self-Help","Technology",
  "Education","Biography","History","Poetry","African Literature","Science",
];

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; genre?: string; type?: string; page?: string }>;
}) {
  await requireAdmin();

  const { q = "", status = "all", genre = "all", type = "all", page = "1" } =
    await searchParams;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const sb = supabaseAdmin;
  let books: any[] = [];
  let total = 0;

  if (sb) {
    let query = sb
      .from("books")
      .select("id,title,author,genre,status,book_type,cover_url,download_count,view_count,bookmark_count,featured,trending,created_at,updated_at", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (q.trim())       query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
    if (status !== "all") query = query.eq("status", status);
    if (genre !== "all")  query = query.eq("genre", genre);
    if (type !== "all")   query = query.eq("book_type", type);

    const { data, count } = await query;
    books = data ?? [];
    total = count ?? 0;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({ q, status, genre, type, page, ...overrides });
    return `/admin/books?${params}`;
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Books</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">{total.toLocaleString()} book{total !== 1 ? "s" : ""} in catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/books/export?q=${encodeURIComponent(q)}&status=${status}&genre=${genre}&type=${type}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Link>
          <Link
            href="/admin/books/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1220] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B1220]/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Book
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search title or author…"
            className="h-9 w-64 rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-sm placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 transition-all"
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1">
          {STATUSES.map((s) => (
            <a
              key={s}
              href={buildUrl({ status: s, page: "1" })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                status === s
                  ? "bg-[#0B1220] text-white"
                  : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
              }`}
            >
              {s}
            </a>
          ))}
        </div>

        {/* Genre filter */}
        <select
          name="genre"
          defaultValue={genre}
          onChange={(e) => { (e.target.form as HTMLFormElement)?.submit(); }}
          className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-[#10B981] focus:outline-none transition-all"
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>{g === "all" ? "All genres" : g}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          name="type"
          defaultValue={type}
          onChange={(e) => { (e.target.form as HTMLFormElement)?.submit(); }}
          className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-[#10B981] focus:outline-none transition-all"
        >
          <option value="all">All types</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>

        <button
          type="submit"
          className="h-9 rounded-lg bg-[#0B1220] px-4 text-sm font-medium text-white hover:bg-[#0B1220]/90 transition-colors"
        >
          Search
        </button>
        {(q || status !== "all" || genre !== "all" || type !== "all") && (
          <a
            href="/admin/books"
            className="h-9 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#64748B] hover:border-red-300 hover:text-red-500 transition-colors"
          >
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <BooksTableClient books={books} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[#94A3B8]">
            Showing {from + 1}–{Math.min(to + 1, total)} of {total.toLocaleString()}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a
                href={buildUrl({ page: String(currentPage - 1) })}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
              >
                Previous
              </a>
            )}
            {currentPage < totalPages && (
              <a
                href={buildUrl({ page: String(currentPage + 1) })}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
