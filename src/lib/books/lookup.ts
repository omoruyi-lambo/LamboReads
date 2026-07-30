import { createSupabaseServerClient } from "@/lib/supabase/server";

export const READER_BOOK_FIELDS = "id,external_id,title,subtitle,author,description,genre,language,cover_url,book_url,reading_time,pages,status";

export async function findPublishedBook(routeId: string) {
  const supabase = await createSupabaseServerClient();
  // Provider IDs are used by older navigation records; database IDs are used
  // by uploaded books. Resolve the provider key first, then the real PK.
  const byExternal = await supabase.from("books").select(READER_BOOK_FIELDS).eq("external_id", routeId).eq("status", "published").is("deleted_at", null).maybeSingle();
  if (byExternal.error) throw byExternal.error;
  if (byExternal.data) return byExternal.data;
  const byDatabaseId = await supabase.from("books").select(READER_BOOK_FIELDS).eq("id", routeId).eq("status", "published").is("deleted_at", null).maybeSingle();
  if (byDatabaseId.error) throw byDatabaseId.error;
  return byDatabaseId.data;
}
