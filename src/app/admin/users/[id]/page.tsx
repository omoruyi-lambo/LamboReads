import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export const metadata = { title: "User Details — Admin" };

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  if (!supabaseAdmin) notFound();

  const { data: user, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", id)
    .single();

  if (error || !user) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">User</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5 truncate">{user.id}</p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#475569] hover:border-[#10B981] hover:text-[#10B981] transition-colors"
        >
          Back to Users
        </Link>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Full Name
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              {user.full_name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Email
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">{user.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Role
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111827] capitalize">
              {user.role ?? "user"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Created
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              {user.created_at ? new Date(user.created_at).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

