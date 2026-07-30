/**
 * Server-only author authorization helper.
 *
 * requireAuthor() — validates the session and checks that the caller has
 * role = "author" OR role = "admin" in the profiles table.
 * Redirects to /login if unauthenticated, / if authenticated but not an author.
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface AuthorProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
}

export interface AuthorContext {
  user: User;
  profile: AuthorProfile;
}

export async function requireAuthor(): Promise<AuthorContext> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  // Allow admins to access author pages too
  if (profileError || !profile || !["author", "admin"].includes(profile.role)) {
    redirect("/");
  }

  return { user, profile };
}
