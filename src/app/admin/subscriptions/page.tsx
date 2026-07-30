import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CreditCard, Users, TrendingUp, CheckCircle } from "lucide-react";

export const metadata = { title: "Subscriptions — Admin" };

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  let subscriptions: any[] = [];

  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    subscriptions = data ?? [];
  }

  const active = subscriptions.filter((s) => s.status === "active");
  const cancelled = subscriptions.filter((s) => s.status === "cancelled");
  const expired = subscriptions.filter((s) => s.status === "expired");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Subscriptions</h1>
        <p className="text-[#64748B] mt-1">Monitor active Premium memberships and revenue.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Subscribers", value: subscriptions.length, icon: Users, color: "bg-[#ECFDF5] text-[#10B981]" },
          { label: "Active", value: active.length, icon: CheckCircle, color: "bg-[#EFF6FF] text-[#3B82F6]" },
          { label: "Cancelled", value: cancelled.length, icon: TrendingUp, color: "bg-amber-50 text-amber-500" },
          { label: "Expired", value: expired.length, icon: CreditCard, color: "bg-red-50 text-red-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-[#111827]">{value}</p>
            <p className="text-sm text-[#64748B]">{label}</p>
          </div>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#111827]">All Subscriptions</h2>
          <p className="text-xs text-[#64748B] mt-0.5">{subscriptions.length} total records</p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <CreditCard className="h-10 w-10 text-[#CBD5E1] mb-3" />
            <p className="text-sm font-semibold text-[#111827]">No subscriptions yet</p>
            <p className="text-xs text-[#64748B] mt-1">
              Premium subscriptions will appear here once users subscribe.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Started</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-3 text-[#64748B] font-mono text-xs">
                      {sub.user_id?.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700 capitalize">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          sub.status === "active"
                            ? "bg-[#ECFDF5] text-[#10B981]"
                            : sub.status === "cancelled"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[#64748B] text-xs">
                      {new Date(sub.started_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-[#64748B] text-xs">
                      {sub.expires_at
                        ? new Date(sub.expires_at).toLocaleDateString()
                        : "Lifetime"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
