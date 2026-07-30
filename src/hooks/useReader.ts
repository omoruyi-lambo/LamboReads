"use client";

/**
 * useReader — central state + persistence for the reading experience.
 *
 * Loads from /api/reader on mount, auto-saves progress every N seconds,
 * and exposes imperative methods for bookmarks, notes, and preferences.
 * Never touches localStorage.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getCurrentSession } from "@/lib/supabase/auth";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Theme  = "light" | "sepia" | "dark" | "night";
export type Width  = "narrow" | "medium" | "wide" | "full";
export type Margins = "tight" | "normal" | "wide";

export interface ReaderPreferences {
  font_family: string;
  font_size:   number;
  line_height: number;
  width:       Width;
  theme:       Theme;
  margins:     Margins;
}

export interface Bookmark {
  id:         string;
  label:      string;
  position:   number;
  scroll_top: number;
  created_at: string;
}

export interface ReadingNote {
  id:         string;
  note:       string;
  position:   number;
  scroll_top: number;
  created_at: string;
}

export interface ReadingHighlight {
  id: string;
  text: string;
  color: string;
  position: number;
  scroll_top: number;
  created_at: string;
}

const DEFAULT_PREFS: ReaderPreferences = {
  font_family: "Georgia",
  font_size:   18,
  line_height: 1.8,
  width:       "medium",
  theme:       "light",
  margins:     "normal",
};

// ── API helper ─────────────────────────────────────────────────────────────────
async function readerFetch(
  method: "GET" | "POST",
  body?: Record<string, unknown>,
  bookId?: string
) {
  const session = await getCurrentSession();
  const token = session?.access_token;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url =
    method === "GET" && bookId
      ? `/api/reader?bookId=${bookId}`
      : "/api/reader";

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) return null;
  return res.json();
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useReader(bookId: string) {
  const [prefs,       setPrefs]     = useState<ReaderPreferences>(DEFAULT_PREFS);
  const [bookmarks,   setBookmarks] = useState<Bookmark[]>([]);
  const [notes,       setNotes]     = useState<ReadingNote[]>([]);
  const [highlights,  setHighlights] = useState<ReadingHighlight[]>([]);
  const [favorite,    setFavorite] = useState(false);
  const [resumeAt,    setResumeAt]  = useState<{ position: number; scrollTop: number } | null>(null);
  const [initialized, setInit]      = useState(false);

  // Progress tracking refs (not state — don't need to re-render on every scroll)
  const progressRef    = useRef(0);
  const scrollTopRef   = useRef(0);
  const sessionStartMs = useRef<number | null>(null);
  const saveTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize session start time on mount
  useEffect(() => {
    sessionStartMs.current = Date.now();
  }, []);

  // ── Load on mount ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    readerFetch("GET", undefined, bookId).then((data) => {
      if (!mounted || !data) { setInit(true); return; }

      // Preferences
      if (data.preferences) {
        setPrefs((p) => ({ ...p, ...data.preferences }));
      }

      // Bookmarks
      if (Array.isArray(data.bookmarks)) setBookmarks(data.bookmarks);

      // Notes
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (Array.isArray(data.highlights)) setHighlights(data.highlights);
      setFavorite(Boolean(data.favorite));

      // Resume position
      if (data.position?.scroll_top > 0 || data.position?.progress > 0) {
        setResumeAt({
          position:  data.position.progress  ?? 0,
          scrollTop: data.position.scroll_top ?? 0,
        });
      }

      setInit(true);
    });

    return () => { mounted = false; };
  }, [bookId]);

  // ── Auto-save progress every 10 s ────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const duration = sessionStartMs.current ? Math.round((Date.now() - sessionStartMs.current) / 1000) : 0;
      sessionStartMs.current = Date.now();

      readerFetch("POST", {
        action:    "save-progress",
        bookId,
        progress:  progressRef.current,
        scrollTop: scrollTopRef.current,
        duration,
      });
    }, 10_000);

    return () => clearInterval(id);
  }, [bookId]);

  // Save once on unmount too
  useEffect(() => {
    const startMs = sessionStartMs.current;
    return () => {
      const duration = startMs ? Math.round((Date.now() - startMs) / 1000) : 0;
      readerFetch("POST", {
        action:    "save-progress",
        bookId,
        progress:  progressRef.current,
        scrollTop: scrollTopRef.current,
        duration,
      });
    };
  }, [bookId]);

  // ── Update progress ref from scroll ──────────────────────────
  const onProgress = useCallback((pct: number, scrollTop: number) => {
    progressRef.current  = pct;
    scrollTopRef.current = scrollTop;
  }, []);

  // ── Save preferences ─────────────────────────────────────────
  const savePrefs = useCallback((partial: Partial<ReaderPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };

      // Debounce the network call
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        readerFetch("POST", { action: "save-prefs", ...next });
      }, 800);

      return next;
    });
  }, []);

  // ── Bookmarks ────────────────────────────────────────────────
  const addBookmark = useCallback(
    async (label: string, position: number, scrollTop: number) => {
      const data = await readerFetch("POST", {
        action: "add-bookmark",
        bookId,
        label,
        position,
        scrollTop,
      });
      if (data?.bookmark) {
        setBookmarks((prev) => [data.bookmark, ...prev]);
        return data.bookmark as Bookmark;
      }
      return null;
    },
    [bookId]
  );

  const updateBookmark = useCallback(async (id: string, label: string) => {
    await readerFetch("POST", { action: "update-bookmark", id, label });
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, label } : b))
    );
  }, []);

  const deleteBookmark = useCallback(async (id: string) => {
    await readerFetch("POST", { action: "delete-bookmark", id });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ── Notes ────────────────────────────────────────────────────
  const addNote = useCallback(
    async (note: string, position: number, scrollTop: number) => {
      const data = await readerFetch("POST", {
        action: "add-note",
        bookId,
        note,
        position,
        scrollTop,
      });
      if (data?.note) {
        setNotes((prev) => [data.note, ...prev]);
        return data.note as ReadingNote;
      }
      return null;
    },
    [bookId]
  );

  const updateNote = useCallback(async (id: string, note: string) => {
    await readerFetch("POST", { action: "update-note", id, note });
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, note } : n)));
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    await readerFetch("POST", { action: "delete-note", id });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addHighlight = useCallback(async (text: string, color: string, position: number, scrollTop: number) => {
    const data = await readerFetch("POST", { action: "add-highlight", bookId, text, color, position, scrollTop });
    if (data?.highlight) {
      setHighlights((prev) => [data.highlight, ...prev]);
      return data.highlight as ReadingHighlight;
    }
    return null;
  }, [bookId]);

  const updateHighlight = useCallback(async (id: string, color: string) => {
    await readerFetch("POST", { action: "update-highlight", id, color });
    setHighlights((prev) => prev.map((h) => h.id === id ? { ...h, color } : h));
  }, []);

  const deleteHighlight = useCallback(async (id: string) => {
    await readerFetch("POST", { action: "delete-highlight", id });
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleFavorite = useCallback(async () => {
    const data = await readerFetch("POST", { action: "toggle-favorite", bookId });
    if (typeof data?.favorite === "boolean") setFavorite(data.favorite);
  }, [bookId]);

  return {
    prefs,
    bookmarks,
    notes,
    highlights,
    favorite,
    resumeAt,
    initialized,
    onProgress,
    savePrefs,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addNote,
    updateNote,
    deleteNote,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    toggleFavorite,
  };
}
