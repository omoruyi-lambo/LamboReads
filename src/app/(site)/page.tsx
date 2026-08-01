import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Crown,
  Upload,
  BarChart2,
  DollarSign,
  Users,
  Star,
  PenTool,
  BookMarked,
  CheckCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase/server";
import HomeFreeBooks from "@/components/home/HomeFreeBooks";
import { HeroBookViewer } from "@/components/home/HeroBookViewer";

function FreeBooksSkeleton() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="h-5 w-24 rounded-full bg-[#F1F5F9] animate-pulse" />
            <div className="h-9 w-64 rounded-xl bg-[#F1F5F9] animate-pulse" />
            <div className="h-4 w-80 rounded bg-[#F1F5F9] animate-pulse" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-[#F1F5F9] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2.5 animate-pulse">
              <div className="aspect-[2/3] w-full rounded-xl bg-[#F1F5F9]" />
              <div className="h-4 w-3/4 rounded bg-[#F1F5F9]" />
              <div className="h-3 w-1/2 rounded bg-[#F1F5F9]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const revalidate = 3600;

export default async function HomePage() {
  // Fetch premium books from Supabase (no mock data)
  let premiumBooks: any[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("premium_books")
      .select("id, title, author, description, cover_url, price, category")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(4);
    premiumBooks = data ?? [];
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section — 3D animated book as full-bleed background */}
      <section className="relative overflow-hidden bg-[#0B1220]" style={{ minHeight: "min(100vw, 600px)" }}>
        {/* 3D book viewer — client component so it never SSR-fetches */}
        <HeroBookViewer />

        {/* Text content sits on top of the overlay */}
        <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32" style={{ minHeight: "inherit" }}>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6 drop-shadow-lg">
              Your Premium Reading Experience
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Discover thousands of public-domain literary classics. Read online, save your progress, and enjoy a beautifully crafted reading experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/library">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Reading
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#111827] mb-4">
              Everything You Need
            </h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">
              A complete reading platform designed for book lovers, with features that enhance your literary journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 mb-4">
                <BookOpen className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-semibold text-[#111827] mb-2">
                Extensive Library
              </h3>
              <p className="text-[#64748B]">
                Access thousands of public-domain classics from world-renowned authors, completely free.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 mb-4">
                <Sparkles className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-semibold text-[#111827] mb-2">
                Personalized Experience
              </h3>
              <p className="text-[#64748B]">
                Save your reading progress, bookmark favorite passages, and get personalized recommendations.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 mb-4">
                <TrendingUp className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-semibold text-[#111827] mb-2">
                Track Your Progress
              </h3>
              <p className="text-[#64748B]">
                Monitor your reading streak, track completed books, and celebrate your achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Free Books — streams in while the rest of the page is already visible */}
      <Suspense fallback={<FreeBooksSkeleton />}>
        <HomeFreeBooks />
      </Suspense>

      {/* Premium Books Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-600 mb-3">
                <Crown className="h-3.5 w-3.5" /> Premium Collection
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#111827]">
                Premium Books
              </h2>
              <p className="text-[#64748B] mt-2">
                Exclusive titles available to Premium members. Preview free.
              </p>
            </div>
            <Link href="/premium" className="flex-shrink-0">
              <Button variant="outline" className="flex items-center gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {premiumBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-12 text-center">
              <Crown className="h-10 w-10 text-amber-300 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-[#111827] mb-1">
                No premium books have been published yet.
              </h3>
              <p className="text-sm text-[#64748B] mb-5">
                Our team is curating an exclusive collection. Join the waitlist to get early access.
              </p>
              <Link href="/premium-membership">
                <Button variant="primary" size="sm" className="flex items-center gap-2 mx-auto">
                  <Sparkles className="h-4 w-4" /> Join Premium Waitlist
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {premiumBooks.map((book) => (
                <div
                  key={book.id}
                  className="group rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-amber-200 transition-all duration-200"
                >
                  <div className="relative h-44 bg-gradient-to-br from-[#0B1220] to-[#1E2D40]">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="h-full w-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        <Crown className="h-2.5 w-2.5" /> Premium
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    {book.category && (
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#10B981] mb-1">
                        {book.category}
                      </p>
                    )}
                    <h3 className="font-semibold text-[#111827] text-sm leading-snug line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#64748B]">by {book.author}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#111827]">
                        ${Number(book.price).toFixed(2)}
                      </span>
                      <Link href="/premium">
                        <Button variant="primary" size="sm" className="text-[11px] px-2.5 py-1">
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/premium-membership">
              <Button variant="emerald" size="lg" className="inline-flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Unlock All Premium Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Become an Author Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: content */}
              <div className="p-8 sm:p-12 lg:p-14">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] border border-[#10B981]/20 px-3 py-1 text-xs font-semibold text-[#10B981] mb-6">
                  <PenTool className="h-3.5 w-3.5" /> For Authors
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-4 leading-tight">
                  Publish Your Story on LamboReads
                </h2>
                <p className="text-[#64748B] text-lg mb-8 leading-relaxed">
                  Reach readers around the world and earn royalties by publishing your ebooks on LamboReads.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: Upload, label: "Upload ebooks" },
                    { icon: BookMarked, label: "Manage books" },
                    { icon: Users, label: "Track readers" },
                    { icon: BarChart2, label: "View analytics" },
                    { icon: DollarSign, label: "Earn royalties" },
                    { icon: Crown, label: "Sell premium books" },
                    { icon: Star, label: "Build your audience" },
                    { icon: PenTool, label: "Manage profile" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ECFDF5] flex-shrink-0">
                        <Icon className="h-3.5 w-3.5 text-[#10B981]" />
                      </div>
                      <span className="text-sm font-medium text-[#334155]">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/author/signup">
                    <Button variant="primary" size="lg" className="flex items-center gap-2 w-full sm:w-auto">
                      <PenTool className="h-4 w-4" />
                      Become an Author
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg" className="flex items-center gap-2 w-full sm:w-auto">
                      Learn More <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right: visual */}
              <div className="relative bg-gradient-to-br from-[#0B1220] to-[#1E2D40] p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_right,_#10B981,_transparent_70%)]" />
                <div className="relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Authors", value: "Growing" },
                      { label: "Readers", value: "Worldwide" },
                      { label: "Royalty Rate", value: "Up to 70%" },
                      { label: "Setup Cost", value: "Free" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                      >
                        <p className="text-xl font-bold text-white">{item.value}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl border border-[#10B981]/20 bg-[#10B981]/10 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-[#10B981] flex-shrink-0" />
                      <p className="text-sm text-white font-medium">
                        No upfront fees. No hidden costs. Publish for free.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="bg-[#0B1220] rounded-2xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              Start Your Reading Journey Today
            </h2>
            <p className="text-[#94A3B8] mb-8 max-w-2xl mx-auto">
              Join thousands of readers enjoying premium literary classics. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="emerald" size="lg" className="w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent text-white border-white/20 hover:bg-white/10">
                  Browse Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
