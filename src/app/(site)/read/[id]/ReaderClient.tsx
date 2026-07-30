"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Minus,
  Plus,
  Maximize,
  Minimize,
  Bookmark,
  BookMarked,
  Settings,
  X,
  List,
  Sun,
  Moon,
  Coffee,
  Eye,
  Heart,
  Share2,
  Highlighter,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReader } from "@/hooks/useReader";

// ── Theme config ──────────────────────────────────────────────────────────────
type Theme = "light" | "sepia" | "dark" | "night";
type Width = "narrow" | "medium" | "wide" | "full";
type Margin = "tight" | "normal" | "wide";

const THEMES: Record<Theme, { bg: string; text: string; border: string; label: string; icon: React.ElementType }> = {
  light: { bg: "bg-[#FAFAF9]",  text: "text-[#1C1917]",  border: "border-stone-200", label: "Light",  icon: Sun    },
  sepia: { bg: "bg-[#F5EFE6]",  text: "text-[#44403C]",  border: "border-amber-200", label: "Sepia",  icon: Coffee },
  dark:  { bg: "bg-[#1E293B]",  text: "text-[#E2E8F0]",  border: "border-slate-700", label: "Dark",   icon: Moon   },
  night: { bg: "bg-[#0B1220]",  text: "text-[#CBD5E1]",  border: "border-slate-800", label: "Night",  icon: Eye    },
};

const FONTS = ["Georgia", "Times New Roman", "Palatino", "Merriweather", "Lora", "Inter", "Source Sans 3"];

const WIDTH_MAP: Record<Width, string> = {
  narrow: "max-w-xl",
  medium: "max-w-2xl",
  wide:   "max-w-4xl",
  full:   "max-w-full",
};

const MARGIN_MAP: Record<Margin, string> = {
  tight:  "px-4",
  normal: "px-8 sm:px-12",
  wide:   "px-12 sm:px-24",
};

// ── Main Component ───────────────────────────────────────────────────────────────
type ReaderBook = { id: string | number; title: string; subtitle?: string | null; author?: string | null; description?: string | null; cover_url?: string | null; book_url?: string | null; reading_time?: number | null; pages?: number | null };

export function ReaderClient({ book, routeId }: { book: ReaderBook; routeId: string }) {
  const reader = useReader(routeId);

  // Reading settings
  const [theme, setTheme] = useState<Theme>("light");
  const [font, setFont] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [width, setWidth] = useState<Width>("medium");
  const [margin, setMargin] = useState<Margin>("normal");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // UI state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [readingPct, setReadingPct] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didRestoreScrollRef = useRef(false);

  // Fetch book content
  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/books/content?bookId=${encodeURIComponent(routeId)}`);
        if (!response.ok) {
          const contentType = response.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            const payload = await response.json().catch(() => null);
            const message =
              typeof payload?.error === "string"
                ? payload.error
                : "Failed to load book content";
            throw new Error(message);
          }
          throw new Error("Failed to load book content");
        }
        setContent(await response.text());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load book");
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [routeId]);

  useEffect(() => {
    if (!reader.initialized) return;

    const p = reader.prefs;
    setTheme(p.theme);
    setFont(p.font_family);
    setFontSize(p.font_size);
    setLineHeight(p.line_height);
    setWidth(p.width);
    setMargin(p.margins);
  }, [reader.initialized, reader.prefs]);

  useEffect(() => {
    if (loading) return;
    if (!scrollRef.current) return;
    if (!reader.initialized) return;
    if (!reader.resumeAt) return;
    if (didRestoreScrollRef.current) return;

    if (reader.resumeAt.scrollTop > 0) {
      scrollRef.current.scrollTop = reader.resumeAt.scrollTop;
    }
    didRestoreScrollRef.current = true;
  }, [loading, reader.initialized, reader.resumeAt]);

  const handleScroll = useMemo(() => {
    return () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const denom = Math.max(1, scrollHeight - clientHeight);
      const pct = Math.max(0, Math.min(100, Math.round((scrollTop / denom) * 100)));
      setReadingPct(pct);
      reader.onProgress(pct, scrollTop);
    };
  }, [reader]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const addBookmark = async () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const denom = Math.max(1, scrollHeight - clientHeight);
    const pct = Math.max(0, Math.min(100, Math.round((scrollTop / denom) * 100)));
    await reader.addBookmark(`Bookmark at ${pct}%`, pct, scrollTop);
    setBookmarksOpen(true);
  };

  const selectionPosition = () => {
    if (!scrollRef.current) return { position: 0, scrollTop: 0 };
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    return { position: Math.round((scrollTop / Math.max(1, scrollHeight - clientHeight)) * 100), scrollTop };
  };

  const addHighlight = async () => {
    const text = window.getSelection()?.toString().trim();
    if (!text) return;
    const p = selectionPosition();
    await reader.addHighlight(text, "yellow", p.position, p.scrollTop);
    window.getSelection()?.removeAllRanges();
    setHighlightsOpen(true);
  };

  const addNote = async () => {
    const note = window.prompt("Add a note at this reading position");
    if (!note?.trim()) return;
    const p = selectionPosition();
    await reader.addNote(note, p.position, p.scrollTop);
  };

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    const timer = window.setInterval(() => scrollRef.current?.scrollBy({ top: 1, behavior: "auto" }), 40);
    return () => window.clearInterval(timer);
  }, [autoScroll]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSettingsOpen(false);
        setBookmarksOpen(false);
        setTocOpen(false);
      }
      if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#64748B]">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Unable to load book</h2>
          <p className="text-[#64748B] mb-6">{error}</p>
          <Link href={/^\d+$/.test(routeId) ? `/book/${routeId}` : "/library"}>
            <button className="px-6 py-2.5 rounded-xl bg-[#0B1220] text-white font-medium hover:bg-[#162032] transition-colors">
              Back to Book
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const currentTheme = THEMES[theme];
  const bookmarks = reader.bookmarks;

  return (
    <div className={cn("min-h-screen transition-colors duration-200", currentTheme.bg)}>
      {/* Top Toolbar */}
      <header className={cn("sticky top-0 z-50 border-b transition-colors duration-200", currentTheme.bg, currentTheme.border)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href={/^\d+$/.test(routeId) ? `/book/${routeId}` : "/library"} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold truncate max-w-xs">{book.title}</h1>
                <p className="text-xs opacity-60">{book.author ?? "Unknown author"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                title="Table of Contents"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={addBookmark}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                title="Add Bookmark"
              >
                <Bookmark className="h-5 w-5" />
              </button>
              <button
                onClick={() => setBookmarksOpen(!bookmarksOpen)}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                title="Bookmarks"
              >
                <BookMarked className="h-5 w-5" />
              </button>
              <button onClick={addHighlight} className="p-2 rounded-lg hover:bg-black/5 transition-colors" title="Highlight selected text" aria-label="Highlight selected text"><Highlighter className="h-5 w-5" /></button>
              <button onClick={addNote} className="p-2 rounded-lg hover:bg-black/5 transition-colors" title="Add note" aria-label="Add note"><StickyNote className="h-5 w-5" /></button>
              <button onClick={() => setHighlightsOpen(!highlightsOpen)} className="p-2 rounded-lg hover:bg-black/5 transition-colors" title="Highlights" aria-label="Highlights"><Highlighter className="h-5 w-5" /></button>
              <button onClick={reader.toggleFavorite} className="p-2 rounded-lg hover:bg-black/5 transition-colors" title="Favorite" aria-label="Favorite"><Heart className={cn("h-5 w-5", reader.favorite && "fill-rose-500 text-rose-500")} /></button>
              <button onClick={() => navigator.share?.({ title: book.title, url: window.location.href })} className="p-2 rounded-lg hover:bg-black/5 transition-colors" title="Share" aria-label="Share"><Share2 className="h-5 w-5" /></button>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reading Progress Bar */}
      <div className="sticky top-14 z-40 h-1 bg-black/10">
            <div
          className="h-full bg-[#10B981] transition-all duration-300"
          style={{ width: `${readingPct}%` }}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex">
        {/* Reading Content */}
        <div 
          ref={scrollRef}
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-200",
            currentTheme.bg,
            MARGIN_MAP[margin]
          )}
          style={{ height: "calc(100vh - 57px)" }}
        >
          <div 
            ref={contentRef}
            className={cn(
              "mx-auto py-12 transition-all duration-200",
              WIDTH_MAP[width]
            )}
            style={{
              fontFamily: font,
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
            }}
          >
            <div className={cn("prose prose-lg max-w-none", currentTheme.text)}>
              <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
              <p className="text-lg opacity-70 mb-8">by {book.author ?? "Unknown author"}</p>
              {book.cover_url && <img src={book.cover_url} alt="" className="mx-auto mb-10 h-48 w-32 rounded-lg object-cover shadow-lg" />}
              <div className="whitespace-pre-wrap">
                {content}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {settingsOpen && (
          <aside className={cn("fixed right-0 top-14 h-full w-80 border-l p-6 overflow-y-auto transition-transform duration-200 z-50", currentTheme.bg, currentTheme.border)}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Reading Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Theme Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(THEMES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const next = key as Theme;
                      setTheme(next);
                      reader.savePrefs({ theme: next });
                    }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                      theme === key ? "border-[#10B981] bg-[#ECFDF5]" : "border-black/10 hover:bg-black/5"
                    )}
                  >
                    <value.icon className="h-4 w-4" />
                    <span className="text-sm">{value.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Font Family</label>
              <select
                value={font}
                onChange={(e) => {
                  const next = e.target.value;
                  setFont(next);
                  reader.savePrefs({ font_family: next });
                }}
                className="w-full p-2 rounded-lg border border-black/10 bg-transparent"
              >
                {FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Font Size: {fontSize}px</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = Math.max(12, fontSize - 2);
                    setFontSize(next);
                    reader.savePrefs({ font_size: next });
                  }}
                  className="p-2 rounded-lg border border-black/10"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={fontSize}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setFontSize(next);
                    reader.savePrefs({ font_size: next });
                  }}
                  className="flex-1"
                />
                <button
                  onClick={() => {
                    const next = Math.min(32, fontSize + 2);
                    setFontSize(next);
                    reader.savePrefs({ font_size: next });
                  }}
                  className="p-2 rounded-lg border border-black/10"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Line Height: {lineHeight}</label>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={lineHeight}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setLineHeight(next);
                  reader.savePrefs({ line_height: next });
                }}
                className="w-full"
              />
            </div>

            {/* Reading Width */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Reading Width</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(WIDTH_MAP).map(([key]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const next = key as Width;
                      setWidth(next);
                      reader.savePrefs({ width: next });
                    }}
                    className={cn(
                      "p-2 rounded-lg border text-sm capitalize transition-colors",
                      width === key ? "border-[#10B981] bg-[#ECFDF5]" : "border-black/10"
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Margins */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Margins</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(MARGIN_MAP).map(([key]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const next = key as Margin;
                      setMargin(next);
                      reader.savePrefs({ margins: next });
                    }}
                    className={cn(
                      "p-2 rounded-lg border text-sm capitalize transition-colors",
                      margin === key ? "border-[#10B981] bg-[#ECFDF5]" : "border-black/10"
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Bookmarks Panel */}
        {bookmarksOpen && (
          <aside className={cn("fixed right-0 top-14 h-full w-80 border-l p-6 overflow-y-auto transition-transform duration-200 z-50", currentTheme.bg, currentTheme.border)}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Bookmarks</h3>
              <button onClick={() => setBookmarksOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            {bookmarks.length === 0 ? (
              <p className="text-sm opacity-60 text-center py-8">No bookmarks yet</p>
            ) : (
              <ul className="space-y-2">
                {bookmarks.map((bookmark) => (
                  <li
                    key={bookmark.id}
                    className="p-3 rounded-lg border border-black/10 hover:bg-black/5 cursor-pointer"
                    onClick={() => {
                      if (scrollRef.current) scrollRef.current.scrollTop = bookmark.scroll_top;
                      setBookmarksOpen(false);
                    }}
                  >
                    <p className="text-sm font-medium">{bookmark.label}</p>
                    <p className="text-xs opacity-60">{bookmark.position}%</p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}

        {highlightsOpen && (
          <aside className={cn("fixed right-0 top-14 h-full w-80 border-l p-6 overflow-y-auto z-50", currentTheme.bg, currentTheme.border)}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-semibold">Highlights & notes</h3><button onClick={() => setHighlightsOpen(false)} aria-label="Close highlights"><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              {reader.highlights.map((highlight) => <div key={highlight.id} className="rounded-lg border border-black/10 p-3"><p className="text-sm italic">“{highlight.text}”</p><div className="mt-2 flex justify-between text-xs opacity-60"><span>{highlight.position}%</span><button onClick={() => reader.deleteHighlight(highlight.id)} className="text-red-500">Delete</button></div></div>)}
              {reader.notes.map((note) => <div key={note.id} className="rounded-lg border border-black/10 p-3"><p className="text-sm">{note.note}</p><div className="mt-2 flex justify-between text-xs opacity-60"><span>{note.position}%</span><button onClick={() => reader.deleteNote(note.id)} className="text-red-500">Delete</button></div></div>)}
              {!reader.highlights.length && !reader.notes.length && <p className="text-sm opacity-60">Select text to create a highlight or add a note.</p>}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

