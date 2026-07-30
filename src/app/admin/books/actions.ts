"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function deleteBook(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!supabaseAdmin) return { error: "Supabase not configured." };

  // Fetch file URLs before deleting so we can clean up Storage
  const { data: book } = await supabaseAdmin
    .from("books")
    .select("cover_url, book_url, created_by")
    .eq("id", id)
    .single();

  // Soft-delete first
  const { error } = await supabaseAdmin
    .from("books")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  // Best-effort Storage cleanup
  if (book?.cover_url) {
    const path = extractStoragePath(book.cover_url, "book-covers");
    if (path) await supabaseAdmin.storage.from("book-covers").remove([path]);
  }
  if (book?.book_url) {
    const path = extractStoragePath(book.book_url, "books");
    if (path) await supabaseAdmin.storage.from("books").remove([path]);
  }

  revalidatePath("/admin/books");
  return {};
}

export async function bulkUpdateStatus(
  ids: string[],
  status: "draft" | "pending" | "published" | "rejected"
): Promise<{ error?: string }> {
  await requireAdmin();
  if (!supabaseAdmin) return { error: "Supabase not configured." };

  const { error } = await supabaseAdmin
    .from("books")
    .update({ status })
    .in("id", ids);

  if (error) return { error: error.message };
  revalidatePath("/admin/books");
  return {};
}

export async function bulkDelete(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  if (!supabaseAdmin) return { error: "Supabase not configured." };

  const { error } = await supabaseAdmin
    .from("books")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids);

  if (error) return { error: error.message };
  revalidatePath("/admin/books");
  return {};
}

// Extract the storage path from a full public URL
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
