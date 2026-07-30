"use server";

import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

interface BookPayload {
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
  status: "draft" | "pending" | "published";
  featured: boolean;
  trending: boolean;
  tags: string[];
  preview_pages: number | null;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  created_by: string | null;
}

export async function saveBook(
  payload: BookPayload
): Promise<{ error?: string; id?: string }> {
  await requireAdmin();

  if (!supabaseAdmin) return { error: "Supabase admin client not available." };
  if (!payload.title?.trim()) return { error: "Title is required." };
  if (!payload.author?.trim()) return { error: "Author is required." };

  const { data, error } = await supabaseAdmin
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
      status:           payload.status,
      featured:         payload.featured,
      trending:         payload.trending,
      tags:             payload.tags,
      preview_pages:    payload.preview_pages,
      seo_title:        payload.seo_title?.trim() || null,
      seo_description:  payload.seo_description?.trim() || null,
      seo_keywords:     payload.seo_keywords?.trim() || null,
      created_by:       payload.created_by,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}
