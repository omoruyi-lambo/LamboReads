"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";

const staticFaqs = [
  {
    q: "How do I download books?",
    a: "Simply browse our library, click on any book, and use the download button to save it to your device. Books are available in multiple formats including EPUB, PDF, and MOBI.",
  },
  {
    q: "Can I read books offline?",
    a: "Absolutely! Once you download a book, you can read it anytime, anywhere, even without an internet connection.",
  },
  {
    q: "What formats are supported?",
    a: "We support EPUB, PDF, MOBI, and HTML formats. Most popular e-readers and apps can open these files.",
  },
  {
    q: "How do I create an account?",
    a: "Click the 'Sign Up' button at the top right, enter your email and create a password. You'll have instant access to all features.",
  },
  {
    q: "Can I share my books with others?",
    a: "You can download and share the book files with others as they are from the public domain.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No! LamboReads is completely free with no hidden fees, ads, or premium subscriptions required.",
  },
  {
    q: "How often are new books added?",
    a: "We continuously add new titles to our collection. Check back regularly or subscribe to our newsletter for updates.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [totalBooks, setTotalBooks] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTotalBooks() {
      try {
        const supabase = getSupabaseClient();
        const { count } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true });
        setTotalBooks(count ?? 0);
      } catch {
        setTotalBooks(null);
      }
    }
    fetchTotalBooks();
  }, []);

  const bookCountText = totalBooks !== null
    ? `over ${totalBooks.toLocaleString()} books`
    : "a large collection of books";

  const faqs = [
    {
      q: "Is LamboReads really free?",
      a: `Yes! Our collection of ${bookCountText} is completely free to read and download. We believe knowledge should be accessible to everyone.`,
    },
    ...staticFaqs,
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 relative z-10">
          <h1 className="font-display text-4xl font-semibold text-[#111827] sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-2 text-[#64748B]">Find answers to common questions about LamboReads</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <button
              key={i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left rounded-xl border border-[#E5E7EB] bg-white p-5 transition hover:border-[#10B981]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-[#111827]">{faq.q}</h3>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-[#94A3B8] shrink-0 transition-transform",
                    openIndex === i && "rotate-180"
                  )}
                />
              </div>
              {openIndex === i && (
                <p className="mt-3 text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
