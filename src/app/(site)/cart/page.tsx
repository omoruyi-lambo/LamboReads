import Link from "next/link";
import { BookOpen, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-[#111827]">Shopping Cart</h1>
      <p className="mt-2 text-[#64748B]">
        Version 1 is free books only.
      </p>

      <Card className="mt-10">
        <CardContent className="py-16 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#F8FAFC]">
            <ShoppingCart className="h-12 w-12 text-[#94A3B8]" />
          </div>
          <h2 className="mt-6 font-display text-xl font-semibold text-[#111827]">Your cart is empty</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B]">
            Browse free books instead — save to your library, read now, or download.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/library">
              <Button variant="primary"><BookOpen className="h-4 w-4" /> Browse Free Library</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
