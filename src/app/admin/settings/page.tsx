import { requireAdmin } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";

export default async function AdminSettings() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[#111827]">Settings</h1>
      <Card className="mt-8 p-8 text-center text-slate-500">
        Site settings — coming soon.
      </Card>
    </div>
  );
}
