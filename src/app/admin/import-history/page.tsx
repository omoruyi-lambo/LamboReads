import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Import History — Admin" };

export default async function ImportHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const { page: pageParam } = await searchParams;
  const page  = Math.max(1, Number(pageParam ?? 1));
  const limit = 20;
  const from  = (page - 1) * limit;

  let logs: any[]    = [];
  let total          = 0;

  if (supabaseAdmin) {
    const { data, count } = await supabaseAdmin
      .from("import_logs")
      .select("*", { count: "exact" })
      .order("started_at", { ascending: false })
      .range(from, from + limit - 1);
    logs  = data  ?? [];
    total = count ?? 0;
  }

  const totalPages = Math.ceil(total / limit);

  function fmt(ms: number | null) {
    if (!ms) return "—";
    if (ms < 1000)   return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/admin/imports" className="text-[#94A3B8] hover:text-[#10B981] transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Import History</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">{total.toLocaleString()} import sessions recorded</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-[#111827]">No import history yet</p>
            <p className="text-xs text-[#94A3B8] mt-1">Import some books from Project Gutenberg to see history here.</p>
            <Link href="/admin/imports" className="mt-4 inline-block text-xs font-semibold text-[#10B981] hover:underline">
              Go to Import →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Date", "Admin", "Imported", "Skipped", "Failed", "Duration", "Source"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                      {new Date(log.started_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B] max-w-[160px] truncate">
                      {log.admin_email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#ECFDF5] px-2 py-0.5 text-xs font-semibold text-[#059669]">
                        {log.imported_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">
                      {log.skipped_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {log.failed_count > 0 ? (
                        <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                          {log.failed_count}
                        </span>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8] whitespace-nowrap">
                      {fmt(log.duration_ms)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">
                      {log.source}
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
          <p className="text-[#94A3B8]">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/import-history?page=${page - 1}`}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/import-history?page=${page + 1}`}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
