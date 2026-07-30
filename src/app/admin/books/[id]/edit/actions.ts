"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const u = new URL(url);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export async function updateBook(
  id: string,
  payload: Record<string, unknown>,
  previousCoverUrl: string | null,
  previousBookUrl: string | null
): Promise<{ error?: string }> {
  await requireAdmin();
  if (!supabaseAdmin) return { error: "Supabase not configured." };

  const { error } = await supabaseAdmin
    .from("books")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  // Clean up replaced Storage files
  const newCoverUrl = payload.cover_url as string | null;
  const newBookUrl  = payload.book_url  as string | null;

  if (previousCoverUrl && newCoverUrl && previousCoverUrl !== newCoverUrl) {
    const path = extractStoragePath(previousCoverUrl, "book-covers");
    if (path) await supabaseAdmin.storage.from("book-covers").remove([path]);
  }
  if (previousBookUrl && newBookUrl && previousBookUrl !== newBookUrl) {
    const path = extractStoragePath(previousBookUrl, "books");
    if (path) await supabaseAdmin.storage.from("books").remove([path]);
  }

  revalidatePath("/admin/books");
  revalidatePath(`/admin/books/${id}/edit`);
  return {};
}

export async function permanentlyDeleteBook(id: string): Promise<void> {
  await requireAdmin();
  if (!supabaseAdmin) return;

  // Fetch URLs for Storage cleanup
  const { data: book } = await supabaseAdmin
    .from("books")
    .select("cover_url, book_url")
    .eq("id", id)
    .single();

  await supabaseAdmin.from("books").delete().eq("id", id);

  if (book?.cover_url) {
    const path = extractStoragePath(book.cover_url, "book-covers");
    if (path) await supabaseAdmin.storage.from("book-covers").remove([path]);
  }
  if (book?.book_url) {
    const path = extractStoragePath(book.book_url, "books");
    if (path) await supabaseAdmin.storage.from("books").remove([path]);
  }

  revalidatePath("/admin/books");
  redirect("/admin/books");
}
