import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and
 * Route Handlers.  It reads and writes session cookies through Next.js's
 * `cookies()` API so the session stays in sync with middleware.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    throw new Error(
      "Supabase not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll is called from a Server Component where cookies are
          // read-only.  The middleware handles session refresh in that case,
          // so this is safe to ignore.
        }
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Legacy named export kept for backward compatibility with existing imports
// that use `import { supabase } from '@/lib/supabase/server'`.
// Server components that need the client should prefer createSupabaseServerClient().
// ---------------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

const config = getSupabaseConfig();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export const supabase = config.isConfigured
  ? createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

export const supabaseAdmin =
  config.isConfigured && serviceRoleKey
    ? createClient(config.supabaseUrl, serviceRoleKey)
    : null;
