import { requireAdmin } from "@/lib/supabase/admin";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side gate — redirects to /login or / if not admin.
  const { profile } = await requireAdmin();

  const displayName = profile.full_name ?? profile.email?.split("@")[0] ?? "Admin";
  const email = profile.email ?? "";

  return (
    <AdminShell displayName={displayName} email={email}>
      {children}
    </AdminShell>
  );
}
