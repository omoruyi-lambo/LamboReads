type ConfiguredSupabase = {
  isConfigured: true;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type MissingSupabaseConfig = {
  isConfigured: false;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export type SupabaseConfig = ConfiguredSupabase | MissingSupabaseConfig;

function stripWrappingQuotes(value: string) {
  return value.replace(/^['"]|['"]$/g, "");
}

export function normalizeSupabaseUrl(value?: string) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) return undefined;

  const url = stripWrappingQuotes(trimmedValue)
    .replace(/^=+/, "")
    .replace(/^(https?):?\/\//i, "$1://")
    .replace(/^(https?):\/(?!\/)/i, "$1://")
    .replace(/\/+$/, "");

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (/^[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

function isHttpUrl(value?: string): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseConfig(): SupabaseConfig {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (isHttpUrl(supabaseUrl) && supabaseAnonKey) {
    return {
      isConfigured: true,
      supabaseUrl,
      supabaseAnonKey,
    };
  }

  return {
    isConfigured: false,
    supabaseUrl,
    supabaseAnonKey,
  };
}
