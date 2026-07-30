"use server";

/**
 * Server actions for managing book file uploads.
 *
 * These actions are called after the client-side XHR upload has already
 * placed the file in Supabase Storage.  Their job is to:
 *   1. Verify that the caller owns the book (or is an admin).
 *   2. Persist the resulting URL / storage path into the books table.
 *   3. Optionally delete the old file from storage when replacing.
 */

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAuthor } from "@/lib/supabase/author";
import type { StorageBucket } from "@/lib/upload";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Verify the current user owns this book OR is an admin. */
async function assertCanEditBook(bookId: string): Promise<{ error?: string }> {
  const { user, profile } = await requireAuthor();
  if (profile.role === "admin") return {};

  const supabase = await createSupabaseServerClient();
  const { data: book } = await supabase
    .from("books")
    .select("created_by")
    .eq("id", bookId)
    .single();

  if (!book) return { error: "Book not found." };
  if (book.created_by !== user.id)
    return { error: "You do not have permission to edit this book's files." };

  return {};
}

/** Delete a storage object using the service-role client (bypasses RLS). */
async function deleteStorageObject(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  if (!supabaseAdmin || !path) return;
  await supabaseAdmin.storage.from(bucket).remove([path]);
}

// ─────────────────────────────────────────────────────────────────────────────
// updateBookCover
// Called after a cover image has been uploaded to the book-covers bucket.
// ─────────────────────────────────────────────────────────────────────────────

export async function updateBookCover(payload: {
  bookId: string;
  coverUrl: string;
  coverPath: string;
  /** Previous storage path — if provided, the old file will be deleted */
  previousPath?: string | null;
}): Promise<{ error?: string }> {
  const check = await assertCanEditBook(payload.bookId);
  if (check.error) return check;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("books")
    .update({ cover_url: payload.coverUrl, cover_path: payload.coverPath })
    .eq("id", payload.bookId);

  if (error) return { error: error.message };

  if (payload.previousPath) {
    await deleteStorageObject("book-covers", payload.previousPath);
  }

  revalidatePath(`/book/${payload.bookId}`);
  revalidatePath("/author/dashboard/books");
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
// updateBookFile
// Called after the main book file has been uploaded to the books bucket.
// ─────────────────────────────────────────────────────────────────────────────

export async function updateBookFile(payload: {
  bookId: string;
  bookPath: string;
  bookFileName: string;
  previousPath?: string | null;
}): Promise<{ error?: string }> {
  const check = await assertCanEditBook(payload.bookId);
  if (check.error) return check;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("books")
    .update({
      book_path: payload.bookPath,
      book_file_name: payload.bookFileName,
    })
    .eq("id", payload.bookId);

  if (error) return { error: error.message };

  if (payload.previousPath) {
    await deleteStorageObject("books", payload.previousPath);
  }

  revalidatePath(`/book/${payload.bookId}`);
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
// updateBookSample
// Called after a sample file has been uploaded to the samples bucket.
// ─────────────────────────────────────────────────────────────────────────────

export async function updateBookSample(payload: {
  bookId: string;
  sampleUrl: string;
  samplePath: string;
  previousPath?: string | null;
}): Promise<{ error?: string }> {
  const check = await assertCanEditBook(payload.bookId);
  if (check.error) return check;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("books")
    .update({ sample_url: payload.sampleUrl, sample_path: payload.samplePath })
    .eq("id", payload.bookId);

  if (error) return { error: error.message };

  if (payload.previousPath) {
    await deleteStorageObject("samples", payload.previousPath);
  }

  revalidatePath(`/book/${payload.bookId}`);
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
// updateBookAudiobook
// Called after an audio file has been uploaded to the audiobooks bucket.
// ─────────────────────────────────────────────────────────────────────────────

export async function updateBookAudiobook(payload: {
  bookId: string;
  audiobookPath: string;
  audiobookFileName: string;
  previousPath?: string | null;
}): Promise<{ error?: string }> {
  const check = await assertCanEditBook(payload.bookId);
  if (check.error) return check;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("books")
    .update({
      audiobook_path: payload.audiobookPath,
      audiobook_file_name: payload.audiobookFileName,
    })
    .eq("id", payload.bookId);

  if (error) return { error: error.message };

  if (payload.previousPath) {
    await deleteStorageObject("audiobooks", payload.previousPath);
  }

  revalidatePath(`/book/${payload.bookId}`);
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteBookFile
// Generic delete — removes the storage object and clears the DB column.
// ─────────────────────────────────────────────────────────────────────────────

type FileColumn =
  | "cover_url"
  | "cover_path"
  | "book_path"
  | "book_file_name"
  | "sample_url"
  | "sample_path"
  | "audiobook_path"
  | "audiobook_file_name";

export async function deleteBookFile(payload: {
  bookId: string;
  bucket: StorageBucket;
  storagePath: string;
  /** Columns to null out on the books row after deletion */
  clearColumns: FileColumn[];
}): Promise<{ error?: string }> {
  const check = await assertCanEditBook(payload.bookId);
  if (check.error) return check;

  // Delete from storage first
  await deleteStorageObject(payload.bucket, payload.storagePath);

  // Clear the DB columns
  const supabase = await createSupabaseServerClient();
  const nulls = payload.clearColumns.reduce<Record<string, null>>(
    (acc, col) => ({ ...acc, [col]: null }),
    {}
  );

  const { error } = await supabase
    .from("books")
    .update(nulls)
    .eq("id", payload.bookId);

  if (error) return { error: error.message };

  revalidatePath(`/book/${payload.bookId}`);
  revalidatePath("/author/dashboard/books");
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
// updateAuthorImage
// Called after a profile photo has been uploaded to the author-images bucket.
// ─────────────────────────────────────────────────────────────────────────────

export async function updateAuthorImage(payload: {
  authorImageUrl: string;
  authorImagePath: string;
  previousPath?: string | null;
}): Promise<{ error?: string }> {
  // Any authenticated author or admin may update their own image
  const { user } = await requireAuthor();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      author_image_url: payload.authorImageUrl,
      author_image_path: payload.authorImagePath,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  if (payload.previousPath) {
    await deleteStorageObject("author-images", payload.previousPath);
  }

  revalidatePath("/author/dashboard");
  revalidatePath("/dashboard/profile");
  return {};
}

// ─────────────────────────────────────────────────────────────────────────────
// submitBook  (replaces the one in actions.ts — now includes all URL columns)
// ─────────────────────────────────────────────────────────────────────────────

interface AuthorBookPayload {
  /** Client-generated UUID — used as both the DB row id and the storage folder */
  bookId: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  genre: string;
  language: string;
  publisher: string;
  publication_year: number | null;
  isbn: string;
  pages: number | null;
  reading_time: number | null;
  book_type: "free" | "premium";
  tags: string[];
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  // File fields
  cover_url: string;
  cover_path: string;
  book_path: string;
  book_file_name: string;
  sample_url: string;
  sample_path: string;
  audiobook_path: string;
  audiobook_file_name: string;
}

export async function submitBook(
  payload: AuthorBookPayload
): Promise<{ error?: string; id?: string }> {
  const { user } = await requireAuthor();

  if (!payload.title?.trim()) return { error: "Title is required." };
  if (!payload.author?.trim()) return { error: "Author name is required." };
  if (!payload.book_path) return { error: "Please upload the book file." };

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("books")
    .insert({
      id:               payload.bookId,
      title:            payload.title.trim(),
      subtitle:         payload.subtitle?.trim() || null,
      author:           payload.author.trim(),
      description:      payload.description?.trim() || null,
      genre:            payload.genre || null,
      language:         payload.language || "English",
      publisher:        payload.publisher?.trim() || null,
      publication_year: payload.publication_year,
      isbn:             payload.isbn?.trim() || null,
      pages:            payload.pages,
      reading_time:     payload.reading_time,
      book_type:        payload.book_type,
      tags:             payload.tags,
      seo_title:        payload.seo_title?.trim() || null,
      seo_description:  payload.seo_description?.trim() || null,
      seo_keywords:     payload.seo_keywords?.trim() || null,
      // Storage
      cover_url:            payload.cover_url || null,
      cover_path:           payload.cover_path || null,
      book_path:            payload.book_path,
      book_file_name:       payload.book_file_name || null,
      sample_url:           payload.sample_url || null,
      sample_path:          payload.sample_path || null,
      audiobook_path:       payload.audiobook_path || null,
      audiobook_file_name:  payload.audiobook_file_name || null,
      // Authors always start pending
      status:               "pending",
      created_by:           user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/author/dashboard/books");
  revalidatePath("/author/dashboard");
  return { id: data.id };
}
