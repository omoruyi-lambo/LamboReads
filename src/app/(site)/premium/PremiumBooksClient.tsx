"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Lock,
  BookOpen,
  Star,
  ArrowRight,
  X,
  Eye,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PremiumBook {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  price: number;
  preview_chapter: string | null;
  category: string | null;
  pages: number | null;
  language: string;
  published_at: string;
}

interface Props {
  books: PremiumBook[];
}

const heroImageUrl =
  "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=" +
  encodeURIComponent(
    "premium books collection hero background, elegant leather bound books on a table, dark modern library atmosphere, warm amber spotlight with subtle emerald accents, cinematic realistic photography, high detail, no text, no watermark"
  ) +
  "&image_size=landscape_16_9";

function PremiumBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
        className
      )}
    >
      <Crown className="h-2.5 w-2.5" /> Premium
    </span>
  );
}

function PremiumBookCard({
  book,
  onPreview,
}: {
  book: PremiumBook;
  onPreview: (book: PremiumBook) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all duration-300"
    >
      {/* Cover */}
      <div className="relative h-52 bg-gradient-to-br from-[#0B1220] to-[#1E2D40] overflow-hidden flex-shrink-0">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-16 w-16 text-white/20" />
          </div>
        )}
        {/* Premium overlay badge */}
        <div className="absolute top-3 left-3">
          <PremiumBadge />
        </div>
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Lock className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          {book.category && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#10B981] mb-1 block">
              {book.category}
            </span>
          )}
          <h3 className="font-semibold text-[#111827] leading-snug line-clamp-2 text-base">
            {book.title}
          </h3>
          <p className="text-sm text-[#64748B] mt-0.5">by {book.author}</p>
        </div>

        {book.description && (
          <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-auto">
          {book.pages && <span>{book.pages} pages</span>}
          {book.pages && book.language && <span>·</span>}
          {book.language && <span>{book.language}</span>}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] gap-2">
          <div>
            <span className="text-lg font-bold text-[#111827]">
              ${book.price.toFixed(2)}
            </span>
            {book.price === 0 && (
              <span className="ml-1.5 text-xs text-[#10B981] font-medium">Free with Premium</span>
            )}
          </div>
          <div className="flex gap-2">
            {book.preview_chapter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(book)}
                className="text-xs flex items-center gap-1"
              >
                <Eye className="h-3 w-3" /> Preview
              </Button>
            )}
            <Link href="/premium-membership">
              <Button variant="primary" size="sm" className="text-xs flex items-center gap-1">
                <Lock className="h-3 w-3" /> Unlock
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewModal({
  book,
  onClose,
}: {
  book: PremiumBook;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E5E7EB] flex-shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <PremiumBadge />
                <span className="text-xs text-[#94A3B8] font-medium">Chapter Preview</span>
              </div>
              <h2 className="font-semibold text-[#111827] text-lg leading-tight">{book.title}</h2>
              <p className="text-sm text-[#64748B]">by {book.author}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 leading-relaxed text-[#334155] text-[15px]">
            <p className="whitespace-pre-wrap">{book.preview_chapter}</p>
          </div>

          {/* Locked paywall gradient */}
          <div className="relative flex-shrink-0">
            <div className="h-24 bg-gradient-to-t from-white via-white/90 to-transparent -mt-16 relative z-10 pointer-events-none" />
            <div className="bg-white px-6 pb-6 pt-2 border-t border-[#E5E7EB]">
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex-shrink-0">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">Continue reading with Premium</p>
                  <p className="text-xs text-[#64748B] mt-0.5">Unlock the full book and 100+ more premium titles</p>
                </div>
                <Link href="/premium-membership" onClick={onClose}>
                  <Button variant="primary" size="sm" className="shrink-0 flex items-center gap-1">
                    Unlock <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function PremiumBooksClient({ books }: Props) {
  const [previewBook, setPreviewBook] = useState<PremiumBook | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0B1220] px-4 py-16 sm:py-20 sm:px-6 lg:px-8 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImageUrl})` }}
        />
        <div className="absolute inset-0 bg-[#0B1220]/80" />
        <div className="mx-auto max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400 mb-6">
              <Crown className="h-4 w-4" />
              Premium Collection
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Premium Books
            </h1>
            <p className="text-lg text-[#94A3B8] max-w-xl mx-auto mb-8">
              Exclusive titles curated for serious readers. Preview the first chapter free — unlock the rest with Premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/premium-membership">
                <Button
                  variant="emerald"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Join Premium
                </Button>
              </Link>
              <Link href="/library">
                <Button
                  size="lg"
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Free Library
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium perks bar */}
      <div className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#64748B]">
            {[
              "Unlimited premium reads",
              "Preview before purchase",
              "New titles weekly",
              "Cancel anytime",
            ].map((perk) => (
              <span key={perk} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#10B981] flex-shrink-0" />
                {perk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-400/10 border border-amber-200 mb-6">
              <Crown className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-semibold text-[#111827] mb-2">
              No premium books have been published yet.
            </h2>
            <p className="text-[#64748B] max-w-sm mb-8">
              Our team is curating an exclusive collection. Check back soon or join the waitlist.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/premium-membership">
                <Button variant="primary" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Join Premium Waitlist
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="outline" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Browse Free Library
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-[#111827]">
                  {books.length} Premium {books.length === 1 ? "Title" : "Titles"}
                </h2>
                <p className="text-sm text-[#64748B] mt-0.5">Preview for free · Unlock all with Premium</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PremiumBookCard book={book} onPreview={setPreviewBook} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#0B1220] to-[#1E2D40] p-8 sm:p-12 text-center">
          <Crown className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Unlock the Entire Premium Library
          </h2>
          <p className="text-[#94A3B8] max-w-md mx-auto mb-6">
            Get unlimited access to all premium titles, early releases, and exclusive collections.
          </p>
          <Link href="/premium-membership">
            <Button
              variant="emerald"
              size="lg"
              className="inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Join Premium Waitlist
            </Button>
          </Link>
        </div>
      </section>

      {/* Preview Modal */}
      {previewBook && (
        <PreviewModal book={previewBook} onClose={() => setPreviewBook(null)} />
      )}
    </div>
  );
}
