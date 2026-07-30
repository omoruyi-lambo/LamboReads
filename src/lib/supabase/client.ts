"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    throw new Error(
      "Supabase not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  // createBrowserClient from @supabase/ssr uses cookies (not localStorage) so
  // the session token is readable by middleware and server components.
  supabaseInstance = createBrowserClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  );

  return supabaseInstance;
}

// Backward-compatible proxy so existing imports keep working without changes.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});
