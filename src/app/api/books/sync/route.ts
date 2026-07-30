import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { refreshBookMetadata } from "@/lib/books/catalog";

/**
 * Bounded background refresh hook for a cron provider (Vercel Cron, Supabase
 * Edge Function, or a worker). It never runs in the request path for readers.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sync-secret");
  if (!process.env.BOOK_SYNC_SECRET || secret !== process.env.BOOK_SYNC_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const { data: books, error } = await supabaseAdmin.from("books").select("external_id").not("external_id", "is", null).order("updated_at", { ascending: true }).limit(20);
  if (error) return NextResponse.json({ error: "Unable to load sync queue" }, { status: 500 });
  let refreshed = 0;
  for (const book of books ?? []) { const id = Number(book.external_id); if (Number.isInteger(id) && await refreshBookMetadata(id)) refreshed++; }
  return NextResponse.json({ ok: true, inspected: books?.length ?? 0, refreshed });
}
