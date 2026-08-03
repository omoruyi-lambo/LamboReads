import { requireAdmin } from "@/lib/supabase/admin";
import { ImportsClient } from "./ImportsClient";

export const metadata = { title: "Import Books — Admin" };

export default async function ImportsPage() {
  const { user } = await requireAdmin();
  return <ImportsClient adminId={user.id} />;
}
