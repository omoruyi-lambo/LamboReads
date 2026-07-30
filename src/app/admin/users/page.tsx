import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Users, Search } from "lucide-react";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();

  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const sb = supabaseAdmin;
  let users: any[] = [];
  let total = 0;

  if (sb) {
    let query = sb
      .from("profiles")
      .select("id, email, full_name, role, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (q.trim()) {
      query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
    }

    const { data, count } = await query;
    users = data ?? [];
    total = count ?? 0;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin:     "bg-[#ECFDF5] text-[#059669] border-emerald-200",
      moderator: "bg-[#EFF6FF] text-[#3B82F6] border-blue-200",
      author:    "bg-[#FFF7ED] text-orange-600 border-orange-200",
      user:      "bg-[#F8FAFC] text-[#64748B] border-[#E5E7EB]",
    };
    return map[role] ?? map.user;
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Users</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            {total.toLocaleString()} registered user{total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <form method="GET" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search email or name…"
              className="h-9 w-64 rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 transition-all"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-lg bg-[#0B1220] px-4 text-sm font-medium text-white hover:bg-[#0B1220]/90 transition-colors"
          >
            Search
          </button>
          {q && (
            <a
              href="/admin/users"
              className="h-9 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#475569] hover:border-red-300 hover:text-red-500 transition-colors"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-10 w-10 text-[#E5E7EB] mb-3" />
            <p className="text-sm font-semibold text-[#111827]">
              {q ? `No users matching "${q}"` : "No users yet"}
            </p>
            {q && (
              <a href="/admin/users" className="mt-2 text-xs text-[#10B981] hover:underline">
                Clear search
              </a>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors">
                    {/* Avatar + name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1220] text-xs font-bold text-white">
                          {(u.full_name ?? u.email ?? "?")[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-[#111827] truncate max-w-[150px]">
                          {u.full_name ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3 text-[#64748B] max-w-[200px] truncate">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadge(u.role ?? "user")}`}
                      >
                        {u.role ?? "user"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3 text-xs text-[#94A3B8] whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/users/${u.id}`}
                          className="rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
                        >
                          View
                        </a>
                      </div>
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
          <p className="text-[#94A3B8]">
            Page {currentPage} of {totalPages} &middot; {total.toLocaleString()} total
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <a
                href={`/admin/users?q=${encodeURIComponent(q)}&page=${currentPage - 1}`}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
              >
                Previous
              </a>
            )}
            {currentPage < totalPages && (
              <a
                href={`/admin/users?q=${encodeURIComponent(q)}&page=${currentPage + 1}`}
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
