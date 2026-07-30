import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Crown, Headphones, Search, Download } from "lucide-react";

const PAGE_SIZE = 25;

export const metadata = { title: "Waitlists — Admin" };

export default async function AdminWaitlistsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; list?: string; page?: string }>;
}) {
  await requireAdmin();

  const { q = "", list = "premium", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const sb = supabaseAdmin;
  let entries: any[] = [];
  let total = 0;
  let premiumTotal = 0;
  let audiobookTotal = 0;

  if (sb) {
    const [premRes, audRes] = await Promise.all([
      sb.from("premium_waitlist").select("*", { count: "exact", head: true }),
      sb.from("audiobook_waitlist").select("*", { count: "exact", head: true }),
    ]);
    premiumTotal   = premRes.count   ?? 0;
    audiobookTotal = audRes.count    ?? 0;

    const table = list === "audiobook" ? "audiobook_waitlist" : "premium_waitlist";
    let query = sb
      .from(table)
      .select("*", { count: "exact" })
      .order("joined_at", { ascending: false })
      .range(from, to);

    if (q.trim()) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, count } = await query;
    entries = data ?? [];
    total = count ?? 0;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Waitlists</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Manage signups for upcoming features</p>
        </div>
        {/* CSV export — client-side via data URI */}
        <a
          href={`/admin/waitlists/export?list=${list}&q=${encodeURIComponent(q)}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </a>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/admin/waitlists?list=premium" className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${list === "premium" ? "border-amber-300 bg-amber-50" : "border-[#E5E7EB] bg-white"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
              <Crown className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{premiumTotal.toLocaleString()}</p>
              <p className="text-xs text-[#94A3B8]">Premium Waitlist</p>
            </div>
          </div>
        </a>
        <a href="/admin/waitlists?list=audiobook" className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${list === "audiobook" ? "border-teal-300 bg-teal-50" : "border-[#E5E7EB] bg-white"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
              <Headphones className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{audiobookTotal.toLocaleString()}</p>
              <p className="text-xs text-[#94A3B8]">Audiobook Waitlist</p>
            </div>
          </div>
        </a>
      </div>

      {/* Search */}
      <form method="GET" className="flex items-center gap-2">
        <input type="hidden" name="list" value={list} />
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-sm placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 transition-all"
          />
        </div>
        <button type="submit" className="h-9 rounded-lg bg-[#0B1220] px-4 text-sm font-medium text-white hover:bg-[#0B1220]/90 transition-colors">
          Search
        </button>
        {q && (
          <a href={`/admin/waitlists?list=${list}`} className="h-9 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#64748B] hover:border-red-300 hover:text-red-500 transition-colors">
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-3">
          <h2 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
            {list === "audiobook" ? (
              <><Headphones className="h-4 w-4 text-teal-500" /> Audiobook Waitlist</>
            ) : (
              <><Crown className="h-4 w-4 text-amber-500" /> Premium Waitlist</>
            )}
          </h2>
          <span className="text-xs text-[#94A3B8]">{total.toLocaleString()} entries</span>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Crown className="h-10 w-10 text-[#E5E7EB] mb-3" />
            <p className="text-sm font-semibold text-[#111827]">
              {q ? `No entries matching "${q}"` : "No signups yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  {["#", "Name", "Email", "Joined"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {entries.map((entry, i) => (
                  <tr key={entry.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-[#CBD5E1]">
                      {from + i + 1}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#111827]">{entry.name ?? "—"}</td>
                    <td className="px-5 py-3 text-[#64748B]">
                      <a href={`mailto:${entry.email}`} className="hover:text-[#10B981] transition-colors">
                        {entry.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#94A3B8] whitespace-nowrap">
                      {new Date(entry.joined_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[#94A3B8]">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a href={`/admin/waitlists?list=${list}&q=${encodeURIComponent(q)}&page=${currentPage - 1}`}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                Previous
              </a>
            )}
            {currentPage < totalPages && (
              <a href={`/admin/waitlists?list=${list}&q=${encodeURIComponent(q)}&page=${currentPage + 1}`}
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
