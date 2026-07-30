"use client";

import { useState, useEffect } from "react";
import { BookOpen, Users } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AboutPage() {
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

  const features = [
    {
      icon: BookOpen,
      title: totalBooks !== null ? `${totalBooks.toLocaleString()}+ Free Books` : "Free Books",
      description: "Access the entire public domain library with no cost or restrictions.",
    },
    {
      icon: Users,
      title: "Built for Readers",
      description: "Save books, bookmark pages, track reading progress, and download in multiple formats.",
    },
  ];

  return (
    <div className="bg-white">
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
        </div>
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl font-semibold tracking-tight text-[#111827] sm:text-6xl font-display">
            About LamboReads
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#64748B]">
            Making the world&apos;s public domain literature accessible to everyone, for free.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16 sm:py-24">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl font-display">Why LamboReads?</h2>
            <p className="mt-6 text-lg leading-8 text-[#64748B]">
              LamboReads was born from a simple idea: everyone should have access to the great books that shaped our world.
              We believe that knowledge shouldn&apos;t be behind paywalls, and that reading should be a joy, not a chore.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-[#E5E7EB] p-6">
                  <Icon className="h-8 w-8 text-[#10B981]" />
                  <h3 className="mt-4 font-semibold text-[#111827]">{feature.title}</h3>
                  <p className="mt-1 text-sm text-[#64748B]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
