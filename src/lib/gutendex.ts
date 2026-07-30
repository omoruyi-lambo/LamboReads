import type { GutenbergBook, GutendexResponse, BookFormat } from "./types";
// Presentation-only helpers. Server-side catalog reads live in
// `@/lib/books/catalog`, which is Supabase-first and owns provider fallback.

export function getAuthorName(book: GutenbergBook): string {
  return book.authors.map(a => a.name).join(", ") || "Unknown Author";
}

export function getCoverUrl(book: GutenbergBook): string | null {
  return (
    book.formats?.["image/jpeg"] ??
    book.formats?.["image/png"] ??
    null
  );
}

export function getFormatUrl(book: GutenbergBook, format: BookFormat): string | null {
  if (format === "epub") {
    return book.formats?.["application/epub+zip"] ?? book.formats?.["application/x-mobipocket-ebook"] ?? null;
  }
  if (format === "pdf") {
    return book.formats?.["application/pdf"] ?? null;
  }
  return (
    book.formats?.["text/plain; charset=utf-8"] ?? 
    book.formats?.["text/plain"] ?? 
    book.formats?.["text/plain; charset=us-ascii"] ?? 
    book.formats?.["text/plain; charset=iso-8859-1"] ??
    null
  );
}

export function getReadTextUrl(book: GutenbergBook): string | null {
  return getFormatUrl(book, "txt");
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mapSubjectToCategory(subjects: string[]): string {
  const s = subjects.join(" ").toLowerCase();
  if (s.includes("christian") || s.includes("gospel") || s.includes("bible")) return "Gospel & Christian";
  if (s.includes("romance")) return "Romance";
  if (s.includes("mystery") || s.includes("thriller") || s.includes("detective")) return "Mystery & Thriller";
  if (s.includes("science fiction") || s.includes("fantasy")) return "Fantasy";
  if (s.includes("adventure")) return "Adventure";
  if (s.includes("poetry") || s.includes("poems")) return "Poetry";
  if (s.includes("history")) return "History";
  if (s.includes("philosophy")) return "Philosophy";
  if (s.includes("science")) return "Science";
  if (s.includes("biograph")) return "Biography";
  if (s.includes("africa")) return "African Literature";
  if (s.includes("juvenile") || s.includes("children")) return "Children's Books";
  if (s.includes("fiction")) return "Fiction";
  return "Non-Fiction";
}

export function estimateReadingTime(textLength: number): string {
  const words = textLength / 5;
  const minutes = Math.max(1, Math.round(words / 250));
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m read` : `${hours}h read`;
}
