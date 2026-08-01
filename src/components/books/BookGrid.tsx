import type { GutenbergBook } from "@/lib/types";
import { BookCard } from "./BookCard";
import { BookCardSkeleton } from "@/components/ui/Skeleton";

// Grid columns:
//  mobile 375px → 2 cols (books ~160px wide, large enough to read the cover)
//  sm 640px     → 3 cols
//  md 768px     → 4 cols
//  lg 1024px    → 5 cols
//  xl 1280px+   → 6 cols
const GRID = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function BookGrid({
  books,
  loading,
  showActions,
}: {
  books: GutenbergBook[];
  loading?: boolean;
  showActions?: boolean;
}) {
  if (loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 12 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={GRID}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} showActions={showActions} />
      ))}
    </div>
  );
}
