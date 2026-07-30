import { requireAdmin } from "@/lib/supabase/admin";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Crown, BookOpen, Plus, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Premium Books — Admin" };

export default async function AdminPremiumBooksPage() {
  await requireAdmin();

  let books: any[] = [];
  let totalRevenue = 0;
  let totalPurchases = 0;

  if (supabaseAdmin) {
    const [booksResult, purchasesResult] = await Promise.all([
      supabaseAdmin
        .from("premium_books")
        .select("*")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("purchases")
        .select("amount, status")
        .eq("status", "completed"),
    ]);
    books = booksResult.data ?? [];
    const purchases = purchasesResult.data ?? [];
    totalPurchases = purchases.length;
    totalRevenue = purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }

  const activeBooks = books.filter((b) => b.is_active);
  const inactiveBooks = books.filter((b) => !b.is_active);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Premium Books</h1>
          <p className="text-[#64748B] mt-1">Manage your exclusive premium book catalog.</p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> Add Premium Book
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Books", value: books.length, icon: BookOpen, color: "bg-[#ECFDF5] text-[#10B981]" },
          { label: "Active Books", value: activeBooks.length, icon: Crown, color: "bg-amber-50 text-amber-500" },
          { label: "Total Purchases", value: totalPurchases, icon: DollarSign, color: "bg-[#EFF6FF] text-[#3B82F6]" },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-[#FCE7F3] text-[#EC4899]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-[#111827]">{value}</p>
            <p className="text-sm text-[#64748B]">{label}</p>
          </div>
        ))}
      </div>

      {/* Books Table */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#111827]">All Premium Books</h2>
            <p className="text-xs text-[#64748B] mt-0.5">{books.length} books in catalog</p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 mb-4">
              <Crown className="h-8 w-8 text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-[#111827]">No premium books yet</p>
            <p className="text-xs text-[#64748B] mt-1 mb-5">
              Add your first premium book to start the exclusive catalog.
            </p>
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Premium Book
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            className="h-10 w-8 rounded-lg object-cover border border-[#E5E7EB]"
                          />
                        ) : (
                          <div className="h-10 w-8 rounded-lg bg-[#F1F5F9] border border-[#E5E7EB] flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-[#94A3B8]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#111827]">{book.title}</p>
                          <p className="text-xs text-[#64748B]">by {book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[#64748B]">{book.category ?? "—"}</td>
                    <td className="px-6 py-3 font-semibold text-[#111827]">
                      ${Number(book.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          book.is_active
                            ? "bg-[#ECFDF5] text-[#10B981]"
                            : "bg-[#F1F5F9] text-[#94A3B8]"
                        }`}
                      >
                        {book.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[#64748B] text-xs">
                      {new Date(book.published_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
