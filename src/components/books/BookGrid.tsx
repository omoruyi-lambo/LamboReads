import type { GutenbergBook } from "@/lib/types";
import { BookCard } from "./BookCard";
import { BookCardSkeleton } from "@/components/ui/Skeleton";

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} showActions={showActions} />
      ))}
    </div>
  );
}
