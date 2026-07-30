"use client";

import type { GutenbergBook } from "@/lib/types";
import { getCurrentSession } from "@/lib/supabase/auth";

export interface ReadingHistoryItem {
  bookId: number;
  progress: number;
  lastOpened: string;
  book: GutenbergBook | null;
}

export interface SavedBookItem {
  bookId: number;
  savedAt: string;
  book: GutenbergBook | null;
}

export interface PersonalizationData {
  userGenres: string[];
  recommended: GutenbergBook[];
  trending: GutenbergBook[];
  continueReading: ReadingHistoryItem[];
  recentlyViewed: ReadingHistoryItem[];
  discoverMore: GutenbergBook[];
  newForYou: GutenbergBook[];
  savedBooks: SavedBookItem[];
  recentSearches: string[];
  emptyState: boolean;
}

const emptyPersonalization: PersonalizationData = {
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

export class PersonalizationAuthRequiredError extends Error {
  constructor(message = "Please sign in to use personalization features.") {
    super(message);
    this.name = "PersonalizationAuthRequiredError";
  }
}

export function isPersonalizationAuthRequiredError(
  error: unknown
): error is PersonalizationAuthRequiredError {
  return error instanceof PersonalizationAuthRequiredError;
}

async function getAuthHeaders() {
  const session = await getCurrentSession();
  const headers = new Headers();

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return headers;
}

async function personalizationRequest<T>(
  init: RequestInit = {},
  fallback?: T
): Promise<T> {
  const headers = await getAuthHeaders();
  const providedHeaders = new Headers(init.headers);

  providedHeaders.forEach((value, key) => headers.set(key, value));

  if (!headers.has("Authorization")) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new PersonalizationAuthRequiredError();
  }

  const response = await fetch("/api/personalization", {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (fallback !== undefined && response.status === 401) {
      return fallback;
    }

    if (response.status === 401) {
      throw new PersonalizationAuthRequiredError();
    }

    let message = "Personalization request failed.";
    try {
      const result = await response.json();
      message = result?.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchPersonalization() {
  return personalizationRequest<PersonalizationData>(
    { method: "GET" },
    emptyPersonalization
  );
}

export async function saveUserGenres(genres: string[]) {
  return personalizationRequest<{ ok: true }>({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save-genres", genres }),
  });
}

export async function saveBook(bookId: number) {
  return personalizationRequest<{ ok: true; saved: true }>({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save-book", bookId }),
  });
}

export async function removeSavedBook(bookId: number) {
  return personalizationRequest<{ ok: true; saved: false }>({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "remove-book", bookId }),
  });
}

export async function trackReadingProgress(bookId: number, progress: number) {
  return personalizationRequest<{ ok: true }>({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "track-reading", bookId, progress }),
  });
}

export async function trackRecentView(bookId: number) {
  return personalizationRequest<{ ok: true }>({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "track-recent-view", bookId }),
  });
}

export async function saveRecentSearch(query: string) {
  return personalizationRequest<{ ok: true }>({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save-search", query }),
  });
}
