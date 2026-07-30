/**
 * /api/reader
 *
 * Handles all reader-specific persistence:
 *   GET  ?bookId=   → load preferences + bookmarks + last position
 *   POST { action } → save-prefs | save-progress | add-bookmark |
 *                     update-bookmark | delete-bookmark | add-note |
 *                     update-note | delete-note
 *
 * All writes require a valid JWT.  Reads also require auth so that
 * users can only see their own data.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// ── Auth helper ────────────────────────────────────────────────────────────────
async function getUser(req: NextRequest): Promise<User | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token || !supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// ── GET ────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user || !supabaseAdmin) {
    return NextResponse.json({ preferences: null, bookmarks: [], notes: [], position: null });
  }

  const bookId = req.nextUrl.searchParams.get("bookId") ?? "";

  const [prefsRes, bookmarksRes, notesRes, highlightsRes, favoriteRes, positionRes] = await Promise.all([
    supabaseAdmin
      .from("reader_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),

    bookId
      ? supabaseAdmin
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .eq("book_id", bookId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    bookId
      ? supabaseAdmin
          .from("reading_notes")
          .select("*")
          .eq("user_id", user.id)
          .eq("book_id", bookId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    bookId
      ? supabaseAdmin
          .from("reading_highlights")
          .select("*")
          .eq("user_id", user.id)
          .eq("book_id", bookId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    bookId
      ? supabaseAdmin.from("saved_books").select("id").eq("user_id", user.id).eq("book_id", bookId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    bookId
      ? supabaseAdmin
          .from("reading_history")
          .select("progress, scroll_top, last_opened")
          .eq("user_id", user.id)
          .eq("book_id", bookId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  return NextResponse.json({
    preferences: prefsRes.data ?? null,
    bookmarks:   bookmarksRes.data ?? [],
    notes:       notesRes.data ?? [],
    highlights:  highlightsRes.data ?? [],
    favorite:   Boolean(favoriteRes.data),
    position:    positionRes.data ?? null,
  });
}

// ── POST ───────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user || !supabaseAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const { action } = body;
  const sb = supabaseAdmin;

  // ── save-prefs ──────────────────────────────────────────────
  if (action === "save-prefs") {
    const { error } = await sb.from("reader_preferences").upsert(
      {
        user_id:     user.id,
        font_family: body.font_family ?? "Georgia",
        font_size:   clamp(Number(body.font_size ?? 18), 12, 32),
        line_height: Number(body.line_height ?? 1.8),
        width:       body.width       ?? "medium",
        theme:       body.theme       ?? "light",
        margins:     body.margins     ?? "normal",
        updated_at:  new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // ── save-progress ───────────────────────────────────────────
  if (action === "save-progress") {
    const bookId    = String(body.bookId ?? "");
    const progress  = clamp(Number(body.progress ?? 0), 0, 100);
    const scrollTop = Number(body.scrollTop ?? 0);
    const duration  = Number(body.duration  ?? 0);

    if (!bookId) {
      return NextResponse.json({ error: "bookId required" }, { status: 400 });
    }

    const { data: existing } = await sb
      .from("reading_history")
      .select("id, duration_secs, progress")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();

    const newDuration = (existing?.duration_secs ?? 0) + duration;
    const completed   = progress >= 98;

    if (existing) {
      await sb
        .from("reading_history")
        .update({
          progress,
          scroll_top:    scrollTop,
          last_opened:   new Date().toISOString(),
          duration_secs: newDuration,
          completed,
        })
        .eq("user_id", user.id)
        .eq("book_id", bookId);
    } else {
      await sb.from("reading_history").insert({
        user_id:       user.id,
        book_id:       bookId,
        progress,
        scroll_top:    scrollTop,
        last_opened:   new Date().toISOString(),
        duration_secs: newDuration,
        completed,
        created_at:    new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  }

  // ── add-bookmark ────────────────────────────────────────────
  if (action === "add-bookmark") {
    const bookId    = String(body.bookId ?? "");
    const position  = clamp(Number(body.position  ?? 0), 0, 100);
    const scrollTop = Number(body.scrollTop ?? 0);
    const label     = String(body.label ?? `Bookmark at ${position}%`).slice(0, 120);

    if (!bookId) {
      return NextResponse.json({ error: "bookId required" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("bookmarks")
      .insert({ user_id: user.id, book_id: bookId, label, position, scroll_top: scrollTop })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, bookmark: data });
  }

  // ── update-bookmark ─────────────────────────────────────────
  if (action === "update-bookmark") {
    const id    = String(body.id ?? "");
    const label = String(body.label ?? "").slice(0, 120);
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await sb
      .from("bookmarks")
      .update({ label })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // ── delete-bookmark ─────────────────────────────────────────
  if (action === "delete-bookmark") {
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await sb
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // ── add-note ────────────────────────────────────────────────
  if (action === "add-note") {
    const bookId    = String(body.bookId ?? "");
    const note      = String(body.note ?? "").trim().slice(0, 2000);
    const position  = clamp(Number(body.position  ?? 0), 0, 100);
    const scrollTop = Number(body.scrollTop ?? 0);

    if (!bookId || !note) {
      return NextResponse.json({ error: "bookId and note required" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("reading_notes")
      .insert({ user_id: user.id, book_id: bookId, note, position, scroll_top: scrollTop })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, note: data });
  }

  // ── update-note ─────────────────────────────────────────────
  if (action === "update-note") {
    const id   = String(body.id ?? "");
    const note = String(body.note ?? "").trim().slice(0, 2000);
    if (!id || !note) return NextResponse.json({ error: "id and note required" }, { status: 400 });

    const { error } = await sb
      .from("reading_notes")
      .update({ note })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // ── delete-note ─────────────────────────────────────────────
  if (action === "delete-note") {
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await sb
      .from("reading_notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "add-highlight") {
    const bookId = String(body.bookId ?? "");
    const text = String(body.text ?? "").trim().slice(0, 1000);
    const color = String(body.color ?? "yellow").slice(0, 20);
    const position = clamp(Number(body.position ?? 0), 0, 100);
    const scrollTop = Number(body.scrollTop ?? 0);
    if (!bookId || !text) return NextResponse.json({ error: "bookId and text required" }, { status: 400 });
    const { data, error } = await sb.from("reading_highlights")
      .insert({ user_id: user.id, book_id: bookId, text, color, position, scroll_top: scrollTop })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, highlight: data });
  }

  if (action === "toggle-favorite") {
    const bookId = String(body.bookId ?? "");
    if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });
    const { data: existing } = await sb.from("saved_books").select("id").eq("user_id", user.id).eq("book_id", bookId).maybeSingle();
    if (existing) {
      const { error } = await sb.from("saved_books").delete().eq("id", existing.id).eq("user_id", user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, favorite: false });
    }
    const { error } = await sb.from("saved_books").insert({ user_id: user.id, book_id: bookId, saved_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, favorite: true });
  }

  if (action === "update-highlight") {
    const id = String(body.id ?? "");
    const color = String(body.color ?? "yellow").slice(0, 20);
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { error } = await sb.from("reading_highlights").update({ color }).eq("id", id).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete-highlight") {
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { error } = await sb.from("reading_highlights").delete().eq("id", id).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
