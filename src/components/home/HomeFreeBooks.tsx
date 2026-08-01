import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { getBooksFromCatalog } from "@/lib/books/catalog";
import { BookCard } from "@/components/books/BookCard";
import { Button } from "@/components/ui/Button";

/**
 * Server component that renders a "Free Books" section on the homepage.
 *
 * Data strategy (matches the requirements):
 *  1. Calls getBooksFromCatalog() which is Supabase-first: returns uploaded/admin books
 *     cached in the DB when available.
 *  2. If Supabase is empty it automatically falls through to the Gutendex (Project
 *     Gutenberg) external API and caches the results — so free books always appear.
 *  3. If both sources fail (network outage, etc.) the section renders a friendly
 *     empty state rather than crashing the page.
 *  4. No mock data is used anywhere in this path.
 */
export default async function HomeFreeBooks() {
  let books: Awaited<ReturnType<typeof getBooksFromCatalog>>["results"] = [];
  let fetchFailed = false;

  try {
    const data = await getBooksFromCatalog({ page: "1" });
    books = data.results ?? [];
  } catch {
    fetchFailed = true;
  }

  // Limit to 12 cards in the featured grid
  const featured = books.slice(0, 12);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] border border-[#10B981]/20 px-3 py-1 text-xs font-semibold text-[#10B981] mb-3">
              <BookOpen className="h-3.5 w-3.5" /> Free Library
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#111827]">
              Free Books
            </h2>
            <p className="text-[#64748B] mt-2">
              Read and download for free.
            </p>
          </div>
          <Link href="/library" className="flex-shrink-0">
            <Button variant="outline" className="flex items-center gap-2">
              Browse All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Book grid */}
        {featured.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {featured.map((book) => (
                <BookCard key={book.id} book={book} showActions />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/library">
                <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
                  Browse all books
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-12 text-center">
            <BookOpen className="h-10 w-10 text-[#94A3B8] mx-auto mb-4" />
            <h3 className="text-base font-semibold text-[#111827] mb-1">
              {fetchFailed
                ? "Free books are temporarily unavailable."
                : "No books have been published yet."}
            </h3>
            <p className="text-sm text-[#64748B] mb-5">
              {fetchFailed
                ? "We couldn\u2019t reach the book provider right now. Please check back shortly."
                : "No books yet. Check back soon."}
            </p>
            <Link href="/library">
              <Button variant="outline" size="sm">
                Go to Library
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
