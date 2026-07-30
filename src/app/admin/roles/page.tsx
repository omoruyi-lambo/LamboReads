import { requireAdmin } from "@/lib/supabase/admin";
import { ShieldCheck } from "lucide-react";

export default async function RolesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Roles</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">Manage user roles and permissions</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white py-20 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8FAFC] mb-4">
          <ShieldCheck className="h-6 w-6 text-[#94A3B8]" />
        </div>
        <p className="text-sm font-medium text-[#111827]">Role management coming soon</p>
        <p className="mt-1 text-xs text-[#94A3B8]">Assign and manage user roles from here</p>
      </div>
    </div>
  );
}
