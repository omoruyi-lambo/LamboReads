import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  await requireAdmin();
  if (!supabaseAdmin) return new NextResponse("Not configured", { status: 500 });

  const { searchParams } = new URL(request.url);
  const q      = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const genre  = searchParams.get("genre") ?? "all";
  const type   = searchParams.get("type") ?? "all";

  let query = supabaseAdmin
    .from("books")
    .select("title,author,genre,book_type,status,download_count,view_count,bookmark_count,created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (q.trim())        query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  if (status !== "all") query = query.eq("status", status);
  if (genre !== "all")  query = query.eq("genre", genre);
  if (type !== "all")   query = query.eq("book_type", type);

  const { data, error } = await query;
  if (error) return new NextResponse(error.message, { status: 500 });

  const header = "Title,Author,Genre,Type,Status,Downloads,Views,Bookmarks,Created\n";
  const rows = (data ?? []).map((b: any) =>
    [
      `"${(b.title ?? "").replace(/"/g, '""')}"`,
      `"${(b.author ?? "").replace(/"/g, '""')}"`,
      `"${(b.genre ?? "").replace(/"/g, '""')}"`,
      b.book_type,
      b.status,
      b.download_count ?? 0,
      b.view_count ?? 0,
      b.bookmark_count ?? 0,
      new Date(b.created_at).toLocaleDateString(),
    ].join(",")
  ).join("\n");

  const filename = `books-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
