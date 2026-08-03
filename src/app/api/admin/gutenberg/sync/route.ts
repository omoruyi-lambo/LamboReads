import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { gutendexFetch, buildBookRow, GutendexPage } from "@/lib/gutenberg";

const GUTENDEX = "https://gutendex.com/books";
const BATCH    = 50;

export async function POST(req: NextRequest) {
  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured." }, { status: 500 });
  }

  const body       = await req.json().catch(() => ({}));
  const language   = body.language ?? "en";
  const maxPages   = Math.min(Number(body.maxPages ?? 10), 100); // cap at 100 pages per sync

  const startedAt  = Date.now();
  let imported     = 0;
  let skipped      = 0;
  let failed       = 0;
  let pagesFetched = 0;
  let nextUrl: string | null = `${GUTENDEX}/?languages=${language}`;

  while (nextUrl && pagesFetched < maxPages) {
    let page: GutendexPage;
    try {
      const res = await gutendexFetch(nextUrl);
      if (!res.ok) break;
      page = await res.json() as GutendexPage;
    } catch {
      break;
    }

    pagesFetched++;

    // Deduplicate against existing rows
    const ids = page.results.map((b) => String(b.id));
    const { data: existing } = await supabaseAdmin
      .from("books")
      .select("external_id")
      .in("external_id", ids);

    const existingSet = new Set((existing ?? []).map((r: { external_id: string }) => r.external_id));
    const newBooks    = page.results.filter((b) => !existingSet.has(String(b.id)));
    skipped          += page.results.length - newBooks.length;

    // Build + upsert in batches
    for (let i = 0; i < newBooks.length; i += BATCH) {
      const chunk = newBooks.slice(i, i + BATCH).map((b) => buildBookRow(b, admin.user.id));
      const { error } = await supabaseAdmin
        .from("books")
        .upsert(chunk, { onConflict: "external_id", ignoreDuplicates: true });

      if (error) { failed += chunk.length; }
      else        { imported += chunk.length; }
    }

    nextUrl = page.next ?? null;
    // Brief pause between pages
    if (nextUrl) await new Promise((r) => setTimeout(r, 300));
  }

  // Log
  await supabaseAdmin.from("import_logs").insert({
    admin_id:       admin.user.id,
    admin_email:    admin.profile.email,
    source:         "Project Gutenberg (Sync)",
    imported_count: imported,
    skipped_count:  skipped,
    failed_count:   failed,
    started_at:     new Date(startedAt).toISOString(),
    finished_at:    new Date().toISOString(),
    duration_ms:    Date.now() - startedAt,
    notes:          `${pagesFetched} pages fetched, lang=${language}`,
  });

  return NextResponse.json({ imported, skipped, failed, pagesFetched });
}
