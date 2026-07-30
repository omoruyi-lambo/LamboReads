import Link from "next/link";
import { BookX, ArrowLeft, Library } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function BookNotFound({ bookId }: { bookId?: number }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F1F5F9] mb-6">
        <BookX className="h-10 w-10 text-[#94A3B8]" />
      </div>

      <h1 className="text-3xl font-bold text-[#111827]">Book Not Found</h1>

      <p className="mt-3 max-w-md text-[#64748B]">
        {bookId
          ? `We couldn't find a book with ID #${bookId}. It may have been removed or the link might be incorrect.`
          : "The link you followed doesn't point to a valid book. It may be malformed or out of date."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/library">
          <Button variant="primary" size="lg">
            <Library className="mr-2 h-4 w-4" />
            Browse Library
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
