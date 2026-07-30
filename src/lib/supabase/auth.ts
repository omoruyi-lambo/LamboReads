import { getSupabaseClient } from "@/lib/supabase/client";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

type AuthSubscription = {
  unsubscribe: () => void;
};

const noopSubscription: AuthSubscription = {
  unsubscribe() {},
};

function getOptionalSupabaseClient(): SupabaseClient | null {
  try {
    return getSupabaseClient();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Supabase not configured")
    ) {
      return null;
    }

    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getOptionalSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      const isMissingSession =
        (error as any)?.name === "AuthSessionMissingError" ||
        String((error as any)?.message ?? "").toLowerCase().includes("auth session missing");
      if (!isMissingSession) console.warn("Error getting current user:", error);
      return null;
    }

    return data?.user ?? null;
  } catch (error) {
    const isMissingSession =
      (error as any)?.name === "AuthSessionMissingError" ||
      String((error as any)?.message ?? "").toLowerCase().includes("auth session missing");
    if (!isMissingSession) console.warn("Error getting current user:", error);
    return null;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getOptionalSupabaseClient();
  if (!supabase) return null;

  try {
    const { data } = await supabase.auth.getSession();
    return data?.session ?? null;
  } catch (error) {
    const isMissingSession =
      (error as any)?.name === "AuthSessionMissingError" ||
      String((error as any)?.message ?? "").toLowerCase().includes("auth session missing");
    if (!isMissingSession) console.warn("Error getting current session:", error);
    return null;
  }
}

export async function signIn(email: string, password: string) {
  const supabase = getOptionalSupabaseClient();
  if (!supabase) {
    return { error: { message: "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local", status: 500 } };
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = getOptionalSupabaseClient();
  if (!supabase) {
    return { error: { message: "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local", status: 500 } };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: fullName ? { data: { full_name: fullName } } : undefined,
  });
}

export async function signInWithGoogle(redirectPath?: string) {
  const supabase = getOptionalSupabaseClient();
  if (!supabase) {
    return { error: { message: "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local", status: 500 } };
  }
  const safeRedirect =
    redirectPath && redirectPath.startsWith("/") && !redirectPath.startsWith("//")
      ? redirectPath
      : "/dashboard";
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(safeRedirect)}`,
    },
  });
}

export async function signOut() {
  const supabase = getOptionalSupabaseClient();
  if (!supabase) return { error: null };
  return await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const supabase = getOptionalSupabaseClient();
  if (!supabase) {
    return { error: { message: "Supabase not configured.", status: 500 } };
  }
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const supabase = getOptionalSupabaseClient();
  if (!supabase) return noopSubscription;

  try {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session ?? null);
    });
    return data.subscription;
  } catch (error) {
    console.warn("Error setting up auth state change:", error);
    return noopSubscription;
  }
}
