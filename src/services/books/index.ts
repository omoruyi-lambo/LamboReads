import type { BookFormat, GutenbergBook, GutendexResponse } from '@/lib/types';
import { getBooksFromCatalog, getBookFromCatalog } from '@/lib/books/catalog';

export const BooksService = {
  async getBooks(
    params: Record<string, string> = {},
  ): Promise<GutendexResponse> {
    return getBooksFromCatalog(params);
  },
  
  async getBook(id: number): Promise<GutenbergBook> {
    const data = await getBookFromCatalog(id);
    if (!data) throw new Error('Book not found');
    return data;
  },
  
  getAuthorName(book: GutenbergBook): string {
    return book.authors.map(a => a.name).join(', ') || 'Unknown Author';
  },
  
  getCoverUrl(book: GutenbergBook): string | null {
    return (
      book.formats?.["image/jpeg"] ??
      book.formats?.["image/png"] ??
      null
    );
  },
  
  getFormatUrl(book: GutenbergBook, format: BookFormat): string | null {
    if (format === "epub") {
      return book.formats?.["application/epub+zip"] ?? book.formats?.["application/x-mobipocket-ebook"] ?? null;
    }
    if (format === "pdf") {
      return book.formats?.["application/pdf"] ?? null;
    }
    return book.formats?.["text/plain; charset=utf-8"] ?? book.formats?.["text/plain"] ?? null;
  },
  
  getReadTextUrl(book: GutenbergBook): string | null {
    return this.getFormatUrl(book, 'txt');
  }
};
