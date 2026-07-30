export interface GutenbergAuthor {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

export interface GutenbergBook {
  id: number;
  title: string;
  authors: GutenbergAuthor[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean;
  media_type: string;
  formats: Record<string, string>;
  download_count: number;
}

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutenbergBook[];
}

export type BookFormat = "epub" | "pdf" | "txt";

export interface SavedBook {
  id: number;
  title: string;
  author: string;
  coverUrl: string | null;
  savedAt: string;
}

export interface Bookmark {
  bookId: number;
  title: string;
  author: string;
  position: number;
  chapter?: string;
  updatedAt: string;
}

export interface ReadingHistoryEntry {
  bookId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  progress: number;
  lastReadAt: string;
}

export interface DownloadRecord {
  bookId: number;
  title: string;
  format: BookFormat;
  downloadedAt: string;
}

export interface UserPreferences {
  interests: string[];
  onboarded: boolean;
}

// Personalization types
export interface UserReadingProgress {
  bookId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  progress: number; // 0-100
  lastOpenedAt: string;
}

export interface RecentlyViewed {
  bookId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  viewedAt: string;
}

export interface RecentSearch {
  query: string;
  searchedAt: string;
}

export const READING_INTERESTS = [
  "Gospel & Christian",
  "Romance",
  "Fiction",
  "Non-Fiction",
  "Business",
  "Entrepreneurship",
  "Technology",
  "Programming",
  "Self-Help",
  "Personal Development",
  "Education",
  "History",
  "Biography",
  "Health & Wellness",
  "Science",
  "Philosophy",
  "Finance",
  "Politics",
  "Children's Books",
  "Poetry",
  "Mystery & Thriller",
  "Fantasy",
  "Adventure",
  "African Literature",
] as const;
