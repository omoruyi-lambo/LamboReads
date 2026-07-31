import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { PenTool, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import { AuthorActionButtons } from "./AuthorActionButtons";

const PAGE_SIZE = 20;

export const metadata = { title: "Author Applications — Admin" };

export default async function AdminAuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireAdmin();

  const { q = "", status = "all", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const sb = supabaseAdmin;
  let applications: any[] = [];
  let total = 0;
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  if (sb) {
    // Summary counts
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      sb.from("author_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
      sb.from("author_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
      sb.from("author_applications").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    ]);
    pendingCount   = pendingRes.count   ?? 0;
    approvedCount  = approvedRes.count  ?? 0;
    rejectedCount  = rejectedRes.count  ?? 0;

    // Filtered list
    let query = sb
      .from("author_applications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status !== "all") query = query.eq("status", status);
    if (q.trim()) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);

    const { data, count } = await query;
    applications = data ?? [];
    total = count ?? 0;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filterTabs = [
    { value: "all",      label: "All",      count: pendingCount + approvedCount + rejectedCount },
    { value: "pending",  label: "Pending",  count: pendingCount  },
    { value: "approved", label: "Approved", count: approvedCount },
    { value: "rejected", label: "Rejected", count: rejectedCount },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Author Applications</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          Review, approve, or reject applicants
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Pending",  value: pendingCount,  icon: Clock,        bg: "bg-amber-50",  text: "text-amber-600"  },
          { label: "Approved", value: approvedCount, icon: CheckCircle,  bg: "bg-[#ECFDF5]", text: "text-[#059669]"  },
          { label: "Rejected", value: rejectedCount, icon: XCircle,      bg: "bg-red-50",    text: "text-red-500"    },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${text}`} />
            </div>
            <p className="text-2xl font-bold text-[#111827]">{value}</p>
            <p className="text-xs text-[#94A3B8]">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1 w-full sm:w-fit overflow-x-auto scrollbar-none">
          {filterTabs.map((tab) => (
            <a
              key={tab.value}
              href={`/admin/authors?status=${tab.value}&q=${encodeURIComponent(q)}`}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === tab.value
                  ? "bg-[#0B1220] text-white"
                  : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${
                  status === tab.value ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                {tab.count}
              </span>
            </a>
          ))}
        </div>

        {/* Search */}
        <form method="GET" className="flex items-center gap-2">
          <input type="hidden" name="status" value={status} />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name or email…"
              className="h-9 w-full sm:w-56 rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-sm placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 transition-all"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-lg bg-[#0B1220] px-4 text-sm font-medium text-white hover:bg-[#0B1220]/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <PenTool className="h-10 w-10 text-[#E5E7EB] mb-3" />
            <p className="text-sm font-semibold text-[#111827]">No applications found</p>
            {(q || status !== "all") && (
              <a href="/admin/authors" className="mt-2 text-xs text-[#10B981] hover:underline">
                Clear filters
              </a>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Applicant", "Email", "Status", "Applied", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {applications.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {a.profile_photo_url ? (
                          <img
                            src={a.profile_photo_url}
                            alt={a.full_name}
                            className="h-8 w-8 rounded-full object-cover border border-[#E5E7EB]"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-bold text-[#64748B] border border-[#E5E7EB]">
                            {(a.full_name ?? "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#111827]">{a.full_name ?? "—"}</p>
                          {a.pen_name && (
                            <p className="text-xs text-[#94A3B8]">aka {a.pen_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#64748B] max-w-[180px] truncate">{a.email}</td>
                    <td className="px-5 py-3">
                      <AuthorActionButtons authorId={a.id} status={a.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-[#94A3B8] whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      {a.status === "pending" && <AuthorActionButtons authorId={a.id} status={a.status} />}
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
              <a href={`/admin/authors?status=${status}&q=${encodeURIComponent(q)}&page=${currentPage - 1}`}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                Previous
              </a>
            )}
            {currentPage < totalPages && (
              <a href={`/admin/authors?status=${status}&q=${encodeURIComponent(q)}&page=${currentPage + 1}`}
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
