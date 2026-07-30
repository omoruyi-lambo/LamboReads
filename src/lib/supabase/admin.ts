/**
 * Server-only admin authorization helper.
 *
 * Usage in any Server Component or Route Handler:
 *
 *   import { requireAdmin } from "@/lib/supabase/admin";
 *   const { user, profile } = await requireAdmin();
 *
 * If the caller is not authenticated or does not have role = "admin" in
 * the profiles table, this function redirects to "/" — it never returns
 * to the caller in that case.
 *
 * No email addresses, localStorage, mock data, or hardcoded roles anywhere.
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface AdminProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
}

export interface AdminContext {
  user: User;
  profile: AdminProfile;
}

/**
 * Verifies that the current request comes from an authenticated user whose
 * `profiles.role` equals "admin".
 *
 * - Unauthenticated → redirect to /login
 * - Authenticated but not admin → redirect to /
 * - Admin → returns { user, profile }
 */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createSupabaseServerClient();

  // Validate the JWT against Supabase servers (prevents cookie spoofing).
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Read the role from the profiles table — the single source of truth.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/");
  }

  return { user, profile };
}

/**
 * Returns the profile for the current user, or null if unauthenticated or
 * if the profile row does not exist.  Does NOT redirect — use this when
 * you want to conditionally render admin UI without hard-gating.
 */
export async function getProfileRole(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return data?.role ?? null;
  } catch {
    return null;
  }
}
