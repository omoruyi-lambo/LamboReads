import { ReaderClient } from "./ReaderClient";
import { ReaderNotFound } from "./ReaderNotFound";
import { findPublishedBook } from "@/lib/books/lookup";
import { getBookFromCatalog } from "@/lib/books/catalog";
import { getAuthorName, getCoverUrl, getReadTextUrl } from "@/lib/gutendex";

export const dynamic = "force-dynamic";

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let book;
  try {
    book = await findPublishedBook(id);
  } catch {
    book = null;
  }

  if (!book) {
    const providerId = Number(id);
    if (Number.isInteger(providerId)) {
      const external = await getBookFromCatalog(providerId);
      if (!external) return <ReaderNotFound />;
      const externalBook = {
        id,
        title: external.title,
        author: getAuthorName(external),
        cover_url: getCoverUrl(external),
        description: external.subjects?.slice(0, 5).join(" · ") || null,
        book_url: getReadTextUrl(external),
      };
      if (!externalBook.book_url) return <ReaderNotFound reason="file-missing" />;
      return <ReaderClient routeId={id} book={externalBook} />;
    }
    return <ReaderNotFound reason="storage" />;
  }
  if (!book.book_url) return <ReaderNotFound reason="file-missing" />;
  return <ReaderClient routeId={id} book={book} />;
}
