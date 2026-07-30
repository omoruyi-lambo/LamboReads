import Link from "next/link";
import { CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl font-semibold text-[#111827]">Checkout</h1>
        <Badge variant="outline">Coming Soon</Badge>
      </div>
      <p className="mt-2 text-[#64748B]">Payment processing is not enabled in Version 1.</p>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="font-display font-semibold text-[#111827]">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#64748B]">
              <span>Subtotal</span><span>₦0</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>VAT (7.5%)</span><span>₦0</span>
            </div>
            <div className="flex justify-between border-t border-[#E5E7EB] pt-2 font-semibold text-[#111827]">
              <span>Total</span><span>₦0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 opacity-60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <CreditCard className="h-5 w-5" />
            <h2 className="font-display font-semibold">Payment Method</h2>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-8 text-center text-sm text-[#94A3B8]">
            Card payments, bank transfer, and mobile money — coming with Premium Books.
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-2 text-xs text-[#94A3B8]">
        <Lock className="h-4 w-4" /> Secure checkout will be enabled when monetization launches.
      </div>

      <Link href="/library" className="mt-8 inline-block">
        <Button variant="primary">Browse Free Books Instead</Button>
      </Link>
    </div>
  );
}
