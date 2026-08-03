import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { fetchGutendexBook, buildBookRow } from "@/lib/gutenberg";

const BATCH = 25; // upsert chunk size

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

  const body = await req.json().catch(() => ({}));
  const ids: number[] = Array.isArray(body.ids) ? body.ids.map(Number).filter(Boolean) : [];

  if (!ids.length) {
    return NextResponse.json({ error: "Provide at least one Gutenberg ID." }, { status: 400 });
  }

  const startedAt = Date.now();
  let imported = 0;
  let skipped  = 0;
  let failed   = 0;
  const errors: string[] = [];

  // ── Check existing ────────────────────────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from("books")
    .select("external_id")
    .in("external_id", ids.map(String));

  const existingSet = new Set((existing ?? []).map((r: { external_id: string }) => r.external_id));

  const toImport = ids.filter((id) => !existingSet.has(String(id)));
  skipped = ids.length - toImport.length;

  // ── Fetch + build rows ────────────────────────────────────────────────────
  const rows: Record<string, unknown>[] = [];

  for (const id of toImport) {
    try {
      const book = await fetchGutendexBook(id);
      rows.push(buildBookRow(book, admin.user.id));
    } catch (err) {
      failed++;
      errors.push(`Book ${id}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  // ── Upsert in batches ─────────────────────────────────────────────────────
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabaseAdmin
      .from("books")
      .upsert(chunk, { onConflict: "external_id", ignoreDuplicates: false });

    if (error) {
      failed   += chunk.length;
      errors.push(`Upsert batch ${i}–${i + chunk.length}: ${error.message}`);
    } else {
      imported += chunk.length;
    }
  }

  // ── Log ───────────────────────────────────────────────────────────────────
  await supabaseAdmin.from("import_logs").insert({
    admin_id:       admin.user.id,
    admin_email:    admin.profile.email,
    source:         "Project Gutenberg",
    imported_count: imported,
    skipped_count:  skipped,
    failed_count:   failed,
    started_at:     new Date(startedAt).toISOString(),
    finished_at:    new Date().toISOString(),
    duration_ms:    Date.now() - startedAt,
    notes:          errors.length ? errors.slice(0, 10).join(" | ") : null,
  });

  return NextResponse.json({ imported, skipped, failed, errors: errors.slice(0, 20) });
}
