import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { searchGutendex } from "@/lib/gutenberg";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp       = req.nextUrl.searchParams;
  const search   = sp.get("search")    ?? "";
  const author   = sp.get("author")    ?? "";
  const language = sp.get("language")  ?? "";
  const topic    = sp.get("topic")     ?? "";
  const page     = Number(sp.get("page") ?? 1);

  if (!search && !author && !topic) {
    return NextResponse.json({ error: "Provide at least one search parameter." }, { status: 400 });
  }

  try {
    const data = await searchGutendex({
      search:    search    || undefined,
      author:    author    || undefined,
      languages: language  || undefined,
      topic:     topic     || undefined,
      page,
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 502 }
    );
  }
}
