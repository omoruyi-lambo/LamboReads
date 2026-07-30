"use client";

import { Crown, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

const benefits = [
  "Exclusive indie author titles",
  "Early access to new releases",
  "Support writers directly",
  "Offline reading on all devices",
];

export function ComingSoonPremium() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const handleNotify = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from("premium_notifications")
        .insert({ email, created_at: new Date().toISOString() });
      setSubmitted(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const freeBookCountText = totalBooks !== null
    ? `${totalBooks.toLocaleString()}+ free classics`
    : "free classics";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-800 p-8 text-white lg:p-12">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge variant="outline" className="mb-4 bg-white/20 text-white border-white/30">
            Coming Soon
          </Badge>
          <div className="flex items-center gap-3">
            <Crown className="h-10 w-10 text-amber-300" />
            <h2 className="font-display text-3xl font-bold">Premium Books</h2>
          </div>
          <p className="mt-4 text-white/80">
            Paid titles from independent authors are on the way. For now, enjoy {freeBookCountText}.
            When premium launches, your cart will be ready.
          </p>
          <ul className="mt-6 space-y-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-white/90">
                <Check className="h-4 w-4 text-emerald" /> {b}
              </li>
            ))}
          </ul>

          {submitted ? (
            <p className="mt-8 text-sm text-emerald-200">We'll notify you when Premium launches!</p>
          ) : (
            <div className="mt-8 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="emerald" onClick={handleNotify} disabled={loading || !email}>
                {loading ? "Saving..." : "Notify Me"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur">
            <Crown className="mx-auto h-24 w-24 text-amber-300/80 strokeWidth={1}" />
            <p className="mt-4 text-center text-sm text-white/60">Premium badge preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}
