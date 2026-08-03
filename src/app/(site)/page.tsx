import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import {
  BookOpen, ArrowRight, Sparkles, TrendingUp, Crown,
  Upload, BarChart2, DollarSign, Users, Star, PenTool,
  BookMarked, CheckCircle, BookCopy, Bookmark,
} from "lucide-react";
import { supabase } from "@/lib/supabase/server";
import HomeFreeBooks from "@/components/home/HomeFreeBooks";
import { HeroBookViewer } from "@/components/home/HeroBookViewer";

export const revalidate = 3600;

function FreeBooksSkeleton() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 space-y-3">
          <div className="h-9 w-56 rounded-lg bg-[#F1F5F9] animate-pulse" />
          <div className="h-5 w-80 rounded bg-[#F1F5F9] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2.5">
              <div className="aspect-[2/3] w-full rounded-2xl bg-[#F1F5F9]" />
              <div className="h-[13px] w-3/4 rounded bg-[#F1F5F9]" />
              <div className="h-[11px] w-1/2 rounded bg-[#F1F5F9]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
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

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-[#0B1220]"
        style={{ minHeight: "min(100vw, 600px)" }}
      >
        <HeroBookViewer />
        <div
          className="relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32"
          style={{ minHeight: "inherit" }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.1]">
              Read More.<br className="hidden sm:block" /> Pay Nothing.
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-lg mx-auto leading-relaxed">
              Over 70,000 public-domain books. No account required to start reading.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/library">
                <Button size="lg" variant="emerald" className="w-full sm:w-auto font-semibold">
                  Browse Library
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 hover:text-white font-semibold"
                >
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How LamboReads Works ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[#F8FAFC] border-t border-[#F1F5F9]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] mb-3">
              How LamboReads works
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto leading-relaxed">
              Three steps. No credit card. No friction.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "Browse",
                desc: "Search over 70,000 public-domain titles by title, author, or genre.",
              },
              {
                step: "02",
                icon: BookCopy,
                title: "Read",
                desc: "Open any book instantly in the reader. No downloads required.",
              },
              {
                step: "03",
                icon: Bookmark,
                title: "Save progress",
                desc: "Create a free account to bookmark, track progress, and build your library.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-start">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] shadow-sm mb-5">
                  <Icon className="h-5 w-5 text-[#10B981]" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#10B981] mb-1">{step}</p>
                <h3 className="text-base font-bold text-[#111827] mb-2">{title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Books ───────────────────────────────────────────────────── */}
      <Suspense fallback={<FreeBooksSkeleton />}>
        <HomeFreeBooks />
      </Suspense>

      {/* ── Why Public Domain ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[#F8FAFC] border-t border-[#F1F5F9]">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] mb-4">
                Why public domain?
              </h2>
              <p className="text-[#64748B] leading-relaxed mb-6">
                Public domain books are works whose copyright has expired. They are permanently free,
                legally available to anyone, and will never be taken down.
              </p>
              <p className="text-[#64748B] leading-relaxed">
                Every book on LamboReads is sourced from Project Gutenberg — the oldest digital library
                in the world — and is verified to be free of copyright restrictions in the United States.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Legally free", desc: "No copyright. No licensing. Ever." },
                { label: "No piracy", desc: "Every book is verified public domain." },
                { label: "Available forever", desc: "Rights expired. They stay free." },
                { label: "70,000+ titles", desc: "The complete Project Gutenberg catalogue." },
              ].map(({ label, desc }) => (
                <div key={label} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0" />
                    <p className="text-sm font-semibold text-[#111827]">{label}</p>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Everything You Need ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white border-t border-[#F1F5F9]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] mb-3">
              Everything you need
            </h2>
            <p className="text-[#64748B] max-w-xl leading-relaxed">
              A reading platform built around the books — not around the business model.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "70,000+ books",
                desc: "Tens of thousands of classics across every genre, fully searchable.",
              },
              {
                icon: Sparkles,
                title: "Personalised shelf",
                desc: "Save progress, bookmark passages, and get recommendations as you read.",
              },
              {
                icon: TrendingUp,
                title: "Reading streaks",
                desc: "Track completed books, maintain streaks, and build a real reading habit.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-sm hover:shadow-md hover:border-[#D1D5DB] transition-all duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0FDF4] mb-5">
                  <Icon className="h-5 w-5 text-[#10B981]" />
                </div>
                <h3 className="text-base font-bold text-[#111827] mb-2">{title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Premium Books ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[#F8FAFC] border-t border-[#F1F5F9]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
                Premium Books
              </h2>
              <p className="text-[#64748B] mt-2 leading-relaxed">
                Exclusive titles from independent authors. Preview free.
              </p>
            </div>
            <Link href="/premium" className="shrink-0">
              <Button variant="outline" className="text-sm">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {premiumBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-14 text-center">
              <Crown className="h-9 w-9 text-[#D1D5DB] mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-[#111827] mb-1">
                No premium books yet
              </h3>
              <p className="text-sm text-[#64748B] mb-6 max-w-xs mx-auto">
                Our team is curating an exclusive collection. Join the waitlist.
              </p>
              <Link href="/premium-membership">
                <Button variant="primary" size="sm">Join Premium Waitlist</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {premiumBooks.map((book) => (
                <div key={book.id}
                  className="group rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200">
                  <div className="relative h-44 bg-[#0B1220]">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-200" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-10 w-10 text-white/20" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-flex items-center rounded-md bg-[#0B1220]/80 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                        Premium
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    {book.category && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] mb-1.5">{book.category}</p>
                    )}
                    <h3 className="text-sm font-semibold text-[#111827] leading-snug line-clamp-2 mb-1">{book.title}</h3>
                    <p className="text-xs text-[#64748B] mb-3">by {book.author}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#111827]">${Number(book.price).toFixed(2)}</span>
                      <Link href="/premium">
                        <Button variant="outline" size="sm" className="text-xs h-7 px-3">Preview</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/premium-membership">
              <Button variant="emerald" size="lg" className="font-semibold">
                Unlock all premium books
                <Crown className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Become an Author ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white border-t border-[#F1F5F9]">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
            <div className="grid lg:grid-cols-2">
              {/* Left */}
              <div className="p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] mb-4 leading-tight">
                  Publish on LamboReads
                </h2>
                <p className="text-[#64748B] leading-relaxed mb-8">
                  Reach readers everywhere and earn royalties by publishing your ebooks on our growing platform.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: Upload,     label: "Upload ebooks" },
                    { icon: BookMarked, label: "Manage titles" },
                    { icon: Users,      label: "Track readers" },
                    { icon: BarChart2,  label: "Analytics" },
                    { icon: DollarSign, label: "Earn royalties" },
                    { icon: Star,       label: "Build audience" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F0FDF4] shrink-0">
                        <Icon className="h-3 w-3 text-[#10B981]" />
                      </div>
                      <span className="text-sm text-[#334155]">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/author/signup">
                    <Button variant="primary" size="md" className="w-full sm:w-auto font-semibold">
                      <PenTool className="h-4 w-4" /> Become an author
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="ghost" size="md" className="w-full sm:w-auto text-[#64748B]">
                      Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Right */}
              <div className="bg-[#0B1220] p-8 sm:p-12 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Authors",      value: "Growing" },
                    { label: "Readers",      value: "Worldwide" },
                    { label: "Royalty rate", value: "Up to 70%" },
                    { label: "Setup cost",   value: "Free" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-lg font-bold text-white">{item.value}</p>
                      <p className="text-xs text-white/50 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                    <p className="text-sm text-white/80 leading-relaxed">
                      No upfront fees. No hidden costs. Start publishing for free.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[#F8FAFC] border-t border-[#F1F5F9]">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Are the books really free?",
                a: "Yes. Every book on LamboReads is in the public domain — their copyright has legally expired. We do not charge for them, ever.",
              },
              {
                q: "Do I need an account to read?",
                a: "No. You can browse and read any book without signing up. An account lets you save progress, bookmarks, and build a personal library.",
              },
              {
                q: "Where do the books come from?",
                a: "All books are sourced from Project Gutenberg, the oldest and largest digital library of public domain literature.",
              },
              {
                q: "What formats are available?",
                a: "Most books are available in plain text and HTML. Many also have EPUB and PDF versions for offline reading.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-[#E5E7EB] pb-6 last:border-0 last:pb-0">
                <h3 className="text-base font-semibold text-[#111827] mb-2">{q}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/faq" className="text-sm font-semibold text-[#10B981] hover:text-[#059669] transition-colors inline-flex items-center gap-1.5">
              See all questions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[#0B1220]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
            Start reading today.
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Free, forever. No subscription. No credit card.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button variant="emerald" size="lg" className="w-full sm:w-auto font-semibold">
                Create free account
              </Button>
            </Link>
            <Link href="/library">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:text-white font-semibold"
              >
                Browse library
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
