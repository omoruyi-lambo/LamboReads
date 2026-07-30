import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { GutenbergBook } from "@/lib/types";
import { getBookFromCatalog, getLocalBooks } from "@/lib/books/catalog";
import { supabaseAdmin } from "@/lib/supabase/server";

type SupabaseClient = NonNullable<typeof supabaseAdmin>;

interface ReadingHistoryRow {
  id: number;
  book_id: number;
  progress: number | null;
  last_opened: string | null;
}

interface SavedBookRow {
  book_id: number;
  saved_at: string | null;
}

interface ReadingHistoryItem {
  bookId: number;
  progress: number;
  lastOpened: string;
  book: GutenbergBook | null;
}

interface SavedBookItem {
  bookId: number;
  savedAt: string;
  book: GutenbergBook | null;
}

const cache = new Map<string, { expires: number; data: unknown }>();
const TTL = 60 * 1000;

const emptyData = {
  userGenres: [],
  recommended: [],
  trending: [],
  continueReading: [],
  recentlyViewed: [],
  discoverMore: [],
  newForYou: [],
  savedBooks: [],
  recentSearches: [],
  emptyState: true,
};

function getAdminClient(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error("Supabase not configured");
  }

  return supabaseAdmin;
}

async function getRequestUser(req: NextRequest): Promise<User | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return null;
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
}

function cacheKey(userId: string) {
  return `home:${userId}`;
}

function clearUserCache(userId: string) {
  cache.delete(cacheKey(userId));
}

function clampProgress(progress: number) {
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function normalizeGenre(genre: unknown) {
  return typeof genre === "string" ? genre.trim() : "";
}

function isBackgroundAction(action: unknown) {
  return (
    action === "track-reading" ||
    action === "track-recent-view" ||
    action === "save-search"
  );
}

function genreSearchTerm(genre: string) {
  return genre.replace(/&/g, " ").replace(/\s+/g, " ").trim();
}

function bookMatchesGenres(book: GutenbergBook, genres: string[]) {
  const haystack = [
    book.title,
    ...book.subjects,
    ...book.bookshelves,
  ]
    .join(" ")
    .toLowerCase();

  return genres.some((genre) => {
    const terms = genre
      .toLowerCase()
      .split(/&|,|\/|\band\b/)
      .map((term) => term.trim())
      .filter(Boolean);

    return terms.some((term) => haystack.includes(term));
  });
}

function appendUniqueBooks(
  target: GutenbergBook[],
  books: GutenbergBook[],
  seen: Set<number>,
  limit: number
) {
  for (const book of books) {
    if (!seen.has(book.id)) {
      seen.add(book.id);
      target.push(book);
    }

    if (target.length >= limit) {
      break;
    }
  }
}

function uniqueReadingRows(rows: ReadingHistoryRow[]) {
  const seen = new Set<number>();
  return rows.filter((row) => {
    if (seen.has(row.book_id)) {
      return false;
    }
    seen.add(row.book_id);
    return true;
  });
}

async function fetchUserGenres(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_genres")
    .select("genre")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row) => normalizeGenre(row.genre))
    .filter(Boolean);
}

async function fetchSavedBookRows(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("saved_books")
    .select("book_id, saved_at")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false })
    .limit(24);

  if (error) {
    throw error;
  }

  return (data ?? []) as SavedBookRow[];
}

async function fetchRecentSearches(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("recent_searches")
    .select("query")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row) => (typeof row.query === "string" ? row.query : ""))
    .filter(Boolean);
}

async function fetchReadingHistoryRows(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("reading_history")
    .select("id, book_id, progress, last_opened")
    .eq("user_id", userId)
    .order("last_opened", { ascending: false })
    .limit(24);

  if (error) {
    throw error;
  }

  return uniqueReadingRows((data ?? []) as ReadingHistoryRow[]);
}

async function hydrateReadingRows(rows: ReadingHistoryRow[]) {
  const hydrated = await Promise.all(
    rows.map(async (row): Promise<ReadingHistoryItem> => ({
      bookId: row.book_id,
      progress: clampProgress(row.progress ?? 0),
      lastOpened: row.last_opened ?? new Date().toISOString(),
      book: await getBookFromCatalog(row.book_id),
    }))
  );

  return hydrated.filter((item) => item.book);
}

async function hydrateSavedBookRows(rows: SavedBookRow[]) {
  const hydrated = await Promise.all(
    rows.map(async (row): Promise<SavedBookItem> => ({
      bookId: row.book_id,
      savedAt: row.saved_at ?? new Date().toISOString(),
      book: await getBookFromCatalog(row.book_id),
    }))
  );

  return hydrated.filter((item) => item.book);
}

async function saveReadingHistory(
  supabase: SupabaseClient,
  userId: string,
  bookId: number,
  progress?: number
) {
  const lastOpened = new Date().toISOString();
  const { data: existingRows, error: selectError } = await supabase
    .from("reading_history")
    .select("id, progress")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .limit(1);

  if (selectError) {
    throw selectError;
  }

  const currentProgress = existingRows?.[0]?.progress ?? 0;
  const nextProgress =
    typeof progress === "number" ? clampProgress(progress) : clampProgress(currentProgress);

  if (existingRows && existingRows.length > 0) {
    const { error } = await supabase
      .from("reading_history")
      .update({ progress: nextProgress, last_opened: lastOpened })
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("reading_history").insert({
    user_id: userId,
    book_id: bookId,
    progress: nextProgress,
    last_opened: lastOpened,
  });

  if (error) {
    throw error;
  }
}

async function buildPersonalizationData(userId: string) {
  const supabase = getAdminClient();

  const [genres, savedRows, recentSearches, historyRows] = await Promise.all([
    fetchUserGenres(supabase, userId),
    fetchSavedBookRows(supabase, userId),
    fetchRecentSearches(supabase, userId),
    fetchReadingHistoryRows(supabase, userId),
  ]);

  const [savedBooks, history] = await Promise.all([
    hydrateSavedBookRows(savedRows),
    hydrateReadingRows(historyRows),
  ]);

  const continueReading = history
    .filter((item) => item.progress > 0 && item.progress < 100)
    .slice(0, 8);
  const recentlyViewed = history.slice(0, 8);

  if (genres.length === 0) {
    return {
      ...emptyData,
      continueReading,
      recentlyViewed,
      savedBooks,
      recentSearches,
    };
  }

  const seen = new Set<number>();
  const genreResults = await Promise.all(
    genres
      .slice(0, 4)
      .map((genre) =>
        getLocalBooks({ search: genreSearchTerm(genre), page: "1", sort: "popular" })
      )
  );

  const recommended: GutenbergBook[] = [];
  for (const result of genreResults) {
    appendUniqueBooks(recommended, result.results, seen, 12);
    if (recommended.length >= 12) {
      break;
    }
  }

  const popularData = await getLocalBooks({ page: "1", sort: "popular" });
  const trending = popularData.results
    .filter((book) => bookMatchesGenres(book, genres))
    .filter((book) => !seen.has(book.id))
    .slice(0, 8);
  trending.forEach((book) => seen.add(book.id));

  const newForYou: GutenbergBook[] = [];
  for (const genre of genres.slice(0, 4)) {
    const result = await getLocalBooks({
      search: genreSearchTerm(genre),
      page: "1",
      sort: "ascending",
    });
    appendUniqueBooks(newForYou, result.results, seen, 8);
    if (newForYou.length >= 8) {
      break;
    }
  }

  const discoverData = await getLocalBooks({ page: "3", sort: "popular" });
  const discoverMore = discoverData.results
    .filter((book) => !bookMatchesGenres(book, genres))
    .filter((book) => !seen.has(book.id))
    .slice(0, 8);

  return {
    userGenres: genres,
    recommended,
    trending,
    continueReading,
    recentlyViewed,
    discoverMore,
    newForYou,
    savedBooks,
    recentSearches,
    emptyState: false,
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return NextResponse.json(emptyData);
    }

    const key = cacheKey(user.id);
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const data = await buildPersonalizationData(user.id);
    cache.set(key, { expires: Date.now() + TTL, data });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { action } = body;
    const user = await getRequestUser(req);

    if (!user) {
      if (isBackgroundAction(action)) {
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const supabase = getAdminClient();
    const userId = user.id;

    if (action === "save-genres") {
      const genres = Array.isArray(body.genres)
        ? body.genres.map(normalizeGenre).filter(Boolean)
        : null;

      if (!genres) {
        return NextResponse.json({ error: "genres must be an array" }, { status: 400 });
      }

      const { error: deleteError } = await supabase
        .from("user_genres")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        throw deleteError;
      }

      if (genres.length > 0) {
        const { error: insertError } = await supabase.from("user_genres").insert(
          genres.map((genre: string) => ({ user_id: userId, genre }))
        );

        if (insertError) {
          throw insertError;
        }
      }

      clearUserCache(userId);
      return NextResponse.json({ ok: true });
    }

    if (action === "save-book") {
      const bookId = Number(body.bookId);
      if (!Number.isInteger(bookId)) {
        return NextResponse.json({ error: "bookId required" }, { status: 400 });
      }

      const { data: existingRows, error: selectError } = await supabase
        .from("saved_books")
        .select("id")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .limit(1);

      if (selectError) {
        throw selectError;
      }

      if (!existingRows || existingRows.length === 0) {
        const { error } = await supabase.from("saved_books").insert({
          user_id: userId,
          book_id: bookId,
          saved_at: new Date().toISOString(),
        });

        if (error && error.code !== "23505") {
          throw error;
        }
      }

      clearUserCache(userId);
      return NextResponse.json({ ok: true, saved: true });
    }

    if (action === "remove-book") {
      const bookId = Number(body.bookId);
      if (!Number.isInteger(bookId)) {
        return NextResponse.json({ error: "bookId required" }, { status: 400 });
      }

      const { error } = await supabase
        .from("saved_books")
        .delete()
        .eq("user_id", userId)
        .eq("book_id", bookId);

      if (error) {
        throw error;
      }

      clearUserCache(userId);
      return NextResponse.json({ ok: true, saved: false });
    }

    if (action === "track-reading") {
      const bookId = Number(body.bookId);
      const progress = Number(body.progress);
      if (!Number.isInteger(bookId) || !Number.isFinite(progress)) {
        return NextResponse.json(
          { error: "bookId and numeric progress required" },
          { status: 400 }
        );
      }

      await saveReadingHistory(supabase, userId, bookId, progress);
      clearUserCache(userId);
      return NextResponse.json({ ok: true });
    }

    if (action === "track-recent-view") {
      const bookId = Number(body.bookId);
      if (!Number.isInteger(bookId)) {
        return NextResponse.json({ error: "bookId required" }, { status: 400 });
      }

      await saveReadingHistory(supabase, userId, bookId);
      clearUserCache(userId);
      return NextResponse.json({ ok: true });
    }

    if (action === "save-search") {
      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (!query) {
        return NextResponse.json({ error: "query required" }, { status: 400 });
      }

      const { error } = await supabase.from("recent_searches").insert({
        user_id: userId,
        query,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      clearUserCache(userId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
