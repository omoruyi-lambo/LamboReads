"use server";

import { revalidatePath } from "next/cache";
import { requireAuthor } from "@/lib/supabase/author";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface AuthorBookPayload {
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
  cover_url: string;
  book_url: string;
  book_type: "free" | "premium";
  tags: string[];
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export async function submitBook(
  payload: AuthorBookPayload
): Promise<{ error?: string; id?: string }> {
  const { user } = await requireAuthor();

  if (!payload.title?.trim()) return { error: "Title is required." };
  if (!payload.author?.trim()) return { error: "Author name is required." };

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("books")
    .insert({
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
      cover_url:        payload.cover_url || null,
      book_url:         payload.book_url || null,
      book_type:        payload.book_type,
      tags:             payload.tags,
      seo_title:        payload.seo_title?.trim() || null,
      seo_description:  payload.seo_description?.trim() || null,
      seo_keywords:     payload.seo_keywords?.trim() || null,
      // Authors always start at pending — never published directly
      status:           "pending",
      created_by:       user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/author/dashboard/books");
  revalidatePath("/author/dashboard");
  return { id: data.id };
}
