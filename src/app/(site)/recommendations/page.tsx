"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { fetchPersonalization } from "@/lib/personalization";
import type { PersonalizationData } from "@/lib/personalization";
import { getAuthorName, getCoverUrl } from "@/lib/gutendex";

export default function Recommendations() {
  const [data, setData] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const personalization = await fetchPersonalization();
        if (mounted) setData(personalization);
      } catch {
        // silently fail
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const recommended = data?.recommended ?? [];
  const trending = data?.trending ?? [];
  const newForYou = data?.newForYou ?? [];
  const discoverMore = data?.discoverMore ?? [];

  const hasAny = recommended.length > 0 || trending.length > 0 || newForYou.length > 0 || discoverMore.length > 0;

  if (loading) {
    return (
      <main className="bg-white min-h-screen py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-semibold text-[#111827] mb-4">Personalized Recommendations</h1>
          <p className="text-[#64748B] mb-12">Discover books tailored to your reading preferences</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse aspect-[2/3] rounded-xl bg-[#F1F5F9]" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!hasAny) {
    return (
      <main className="bg-white min-h-screen py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-semibold text-[#111827] mb-4">Personalized Recommendations</h1>
          <p className="text-[#64748B] mb-12">Discover books tailored to your reading preferences</p>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-10 text-center max-w-2xl mx-auto">
            <div className="h-12 w-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 text-[#10B981] shadow-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-[#111827]">
              No recommendations available yet
            </h3>
            <p className="mt-2 text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
              Select your favorite genres or start exploring classic literature to unlock personalized shelves and recommendations.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/categories" className="inline-flex items-center gap-2 rounded-xl bg-[#0B1220] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#162032] transition-colors cursor-pointer">
                Select Genres
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen py-20 px-4 relative">
      <div className="mx-auto max-w-7xl">
        <div className="relative mb-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
          </div>
          <h1 className="text-4xl font-semibold text-[#111827] mb-4">Personalized Recommendations</h1>
          <p className="text-[#64748B]">Discover books tailored to your reading preferences</p>
        </div>

        <div className="space-y-12">
          {recommended.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-[#111827] mb-6">Recommended For You</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {recommended.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`} className="group">
                    <div className="aspect-[2/3] rounded-xl bg-[#F8FAFC] overflow-hidden mb-2">
                      {getCoverUrl(book) ? (
                        <img src={getCoverUrl(book) ?? undefined} alt={book.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#94A3B8]">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#111827] group-hover:text-[#10B981] transition-colors line-clamp-2">{book.title}</p>
                    <p className="text-xs text-[#64748B] mt-1 truncate">{getAuthorName(book)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {trending.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-[#111827] mb-6">Trending Books</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {trending.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`} className="group">
                    <div className="aspect-[2/3] rounded-xl bg-[#F8FAFC] overflow-hidden mb-2">
                      {getCoverUrl(book) ? (
                        <img src={getCoverUrl(book) ?? undefined} alt={book.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#94A3B8]">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#111827] group-hover:text-[#10B981] transition-colors line-clamp-2">{book.title}</p>
                    <p className="text-xs text-[#64748B] mt-1 truncate">{getAuthorName(book)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {newForYou.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-[#111827] mb-6">New For You</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {newForYou.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`} className="group">
                    <div className="aspect-[2/3] rounded-xl bg-[#F8FAFC] overflow-hidden mb-2">
                      {getCoverUrl(book) ? (
                        <img src={getCoverUrl(book) ?? undefined} alt={book.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#94A3B8]">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#111827] group-hover:text-[#10B981] transition-colors line-clamp-2">{book.title}</p>
                    <p className="text-xs text-[#64748B] mt-1 truncate">{getAuthorName(book)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {discoverMore.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-[#111827] mb-6">Discover More</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {discoverMore.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`} className="group">
                    <div className="aspect-[2/3] rounded-xl bg-[#F8FAFC] overflow-hidden mb-2">
                      {getCoverUrl(book) ? (
                        <img src={getCoverUrl(book) ?? undefined} alt={book.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#94A3B8]">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#111827] group-hover:text-[#10B981] transition-colors line-clamp-2">{book.title}</p>
                    <p className="text-xs text-[#64748B] mt-1 truncate">{getAuthorName(book)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
