/**
 * DELETE /api/upload/delete
 *
 * Authenticated route handler that removes a file from a Supabase Storage
 * bucket.  All business-logic access checks are enforced here:
 *
 *  - Admin  → may delete from any bucket / any path
 *  - Author → may only delete paths that belong to their own books
 *    (verified against books.created_by)
 *
 * Body (JSON):
 *   { bucket: string; path: string }
 *
 * Responses:
 *   200 { ok: true }
 *   400 { error: string }   — missing / invalid payload
 *   401 { error: string }   — unauthenticated
 *   403 { error: string }   — authenticated but not authorised
 *   500 { error: string }   — storage / db error
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { StorageBucket } from "@/lib/upload";

const ALLOWED_BUCKETS: StorageBucket[] = [
  "book-covers",
  "books",
  "samples",
  "audiobooks",
  "author-images",
];

export async function DELETE(req: NextRequest) {
  // ── Parse body ─────────────────────────────────────────────────────────
  let bucket: string;
  let path: string;

  try {
    const body = (await req.json()) as { bucket?: string; path?: string };
    bucket = (body.bucket ?? "").trim();
    path = (body.path ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!bucket || !path) {
    return NextResponse.json(
      { error: "Both 'bucket' and 'path' are required." },
      { status: 400 }
    );
  }

  if (!ALLOWED_BUCKETS.includes(bucket as StorageBucket)) {
    return NextResponse.json(
      { error: `Unknown bucket '${bucket}'.` },
      { status: 400 }
    );
  }

  // ── Auth ───────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  // ── Role check ─────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "user";

  if (!["admin", "author"].includes(role)) {
    return NextResponse.json(
      { error: "Only admins and approved authors may delete uploaded files." },
      { status: 403 }
    );
  }

  // ── Ownership check for authors ────────────────────────────────────────
  // Path layout for book buckets: {folder}/{bookId}/{filename}
  // Path layout for author-images: {userId}/{filename}
  if (role === "author") {
    if (bucket === "author-images") {
      // Must own the top-level folder (= their userId)
      const pathUserId = path.split("/")[0];
      if (pathUserId !== user.id) {
        return NextResponse.json(
          { error: "You may only delete your own author images." },
          { status: 403 }
        );
      }
    } else {
      // Extract bookId from path segment 2 (e.g. "books/abc-id/file.pdf" → "abc-id")
      const bookId = path.split("/")[1];
      if (!bookId) {
        return NextResponse.json(
          { error: "Cannot determine book from path." },
          { status: 400 }
        );
      }

      const { data: book } = await supabase
        .from("books")
        .select("created_by")
        .eq("id", bookId)
        .single();

      if (!book || book.created_by !== user.id) {
        return NextResponse.json(
          { error: "You may only delete files for your own books." },
          { status: 403 }
        );
      }
    }
  }

  // ── Delete via admin client (bypasses RLS for server-side deletes) ─────
  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          "Server is not configured for storage management. " +
          "Set SUPABASE_SERVICE_ROLE_KEY in your environment.",
      },
      { status: 500 }
    );
  }

  const { error: deleteError } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
