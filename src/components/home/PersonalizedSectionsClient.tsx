"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookGrid } from "@/components/books/BookGrid";
import { Card, CardContent } from "@/components/ui/Card";
import { fetchPersonalization } from "@/lib/personalization";
import type {
  PersonalizationData,
  ReadingHistoryItem,
} from "@/lib/personalization";
import type { GutenbergBook } from "@/lib/types";
import { getAuthorName, getCoverUrl } from "@/lib/gutendex";
import { Sparkles, BookOpen, Clock, ArrowRight } from "lucide-react";

function hasBooks(books: GutenbergBook[]) {
  return books && books.length > 0;
}

function sectionBooks(items: ReadingHistoryItem[]) {
  return (items || []).filter((item) => item && item.book);
}

function ReadingSection({
  title,
  subtitle,
  items,
  showProgress,
}: {
  title: string;
  subtitle?: string;
  items: ReadingHistoryItem[];
  showProgress?: boolean;
}) {
  const visibleItems = sectionBooks(items);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="mb-14">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-[#E5E7EB] pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#0B1220]">{title}</h2>
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleItems.map((item) => {
          const book = item.book;
          if (!book) return null;

          const cover = getCoverUrl(book);
          const author = getAuthorName(book);

          return (
            <Link key={`${title}-${item.bookId}`} href={`/read/${item.bookId}`} className="group block">
              <Card className="h-full border-[#E5E7EB] transition-all duration-200 hover:border-[#10B981]/40 hover:shadow-md">
                <CardContent className="flex h-full gap-4 p-4">
                  <div className="relative h-28 w-18 shrink-0 overflow-hidden rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-2 text-center">
                        <BookOpen className="h-5 w-5 text-[#94A3B8]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="line-clamp-2 text-xs font-bold text-[#0B1220] leading-snug group-hover:text-[#10B981] transition-colors">
                        {book.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-[#64748B] font-medium">{author}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.lastOpened).toLocaleDateString()}
                      </p>
                      {showProgress && (
                        <div className="mt-2">
                          <div className="mb-1 flex justify-between text-[11px] font-medium text-[#475569]">
                            <span>Progress</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#10B981] transition-all duration-500"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function PersonalizedSectionsClient() {
  const [data, setData] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const personalization = await fetchPersonalization();
        if (mounted) {
          setData(personalization);
        }
      } catch (err) {
        console.error("Error loading personalized sections:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load personalized content."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const hasPersonalizedContent =
    data &&
    (hasBooks(data.recommended) ||
      hasBooks(data.trending) ||
      hasBooks(data.discoverMore) ||
      hasBooks(data.newForYou) ||
      sectionBooks(data.continueReading).length > 0 ||
      sectionBooks(data.recentlyViewed).length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {loading ? (
        <section className="space-y-6">
          <div className="border-b border-[#E5E7EB] pb-4">
            <h2 className="font-display text-2xl font-bold text-[#0B1220]">Recommended For You</h2>
            <p className="mt-1 text-xs text-[#64748B]">Curating titles based on your reading preferences...</p>
          </div>
          <BookGrid books={[]} loading showActions />
        </section>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <h3 className="text-lg font-bold text-red-900">
            Unable to load personalized content
          </h3>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      ) : !data || !hasPersonalizedContent ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-10 text-center max-w-2xl mx-auto my-8">
          <div className="h-12 w-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 text-[#10B981] shadow-xs">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-[#0B1220]">
            Personalizing your reading shelf
          </h3>
          <p className="mt-2 text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
            Select your favorite genres or start exploring classic literature to unlock personalized shelves and recommendations.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/categories">
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#0B1220] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#162032] transition-colors cursor-pointer">
                Select Genres <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {data.recommended.length > 0 && (
            <section className="mb-14">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-[#E5E7EB] pb-4 gap-2">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-[#0B1220]">
                    Recommended For You
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Handpicked titles tailored to your reading profile</p>
                </div>
                <Link href="/library" className="text-xs font-semibold text-[#10B981] hover:underline flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <BookGrid books={data.recommended} showActions />
            </section>
          )}

          {data.trending.length > 0 && (
            <section className="mb-14">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-[#E5E7EB] pb-4 gap-2">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-[#0B1220]">
                    Trending In Your Interests
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Popular classics among readers with similar taste</p>
                </div>
              </div>
              <BookGrid books={data.trending} showActions />
            </section>
          )}

          <ReadingSection
            title="Continue Reading"
            subtitle="Pick up right where you left off"
            items={data.continueReading}
            showProgress
          />

          <ReadingSection 
            title="Recently Viewed" 
            subtitle="Books you recently explored"
            items={data.recentlyViewed} 
          />

          {data.discoverMore.length > 0 && (
            <section className="mb-14">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-[#E5E7EB] pb-4 gap-2">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-[#0B1220]">Discover More</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Expand your horizons with related literary works</p>
                </div>
              </div>
              <BookGrid books={data.discoverMore} showActions />
            </section>
          )}

          {data.newForYou.length > 0 && (
            <section className="mb-14">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-[#E5E7EB] pb-4 gap-2">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-[#0B1220]">New For You</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Fresh additions to our public domain archive</p>
                </div>
              </div>
              <BookGrid books={data.newForYou} showActions />
            </section>
          )}
        </>
      )}
    </div>
  );
}

