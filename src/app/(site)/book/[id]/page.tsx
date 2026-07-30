import type { Metadata } from "next";
import { BookDetailClient } from "./BookDetailClient";
import { BookNotFound } from "./BookNotFound";
import { getBookFromCatalog, getBooksFromCatalog } from "@/lib/books/catalog";
import { getCoverUrl, getAuthorName, mapSubjectToCategory } from "@/lib/gutendex";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) return { title: "Book Not Found" };

  const book = await getBookFromCatalog(bookId);
  if (!book) return { title: "Book Not Found" };

  return {
    title: `${book.title} — LamboReads`,
    description: `Read "${book.title}" by ${getAuthorName(book)} on LamboReads.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BookDetailPage({
  params,
}: {
  // Next.js 15+ passes params as a Promise — must be awaited before access.
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = parseInt(id, 10);

  // Non-numeric segment → friendly not-found page
  if (isNaN(bookId)) {
    return <BookNotFound />;
  }

  const book = await getBookFromCatalog(bookId);

  // Book not found in Gutendex → friendly not-found page (not the raw 404 screen)
  if (!book) {
    return <BookNotFound bookId={bookId} />;
  }

  // Fetch related books by category — non-blocking, gracefully falls back to []
  const category = mapSubjectToCategory(book.subjects);
  let related: typeof book[] = [];
  try {
    const relatedData = await getBooksFromCatalog({
      search: category,
      page: "1",
      sort: "popular",
    });
    related = relatedData.results
      .filter((b) => b.id !== book.id && getCoverUrl(b))
      .slice(0, 5);
  } catch {
    related = [];
  }

  return <BookDetailClient book={book} related={related} />;
}
