"use client";

import { Headphones, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useState } from "react";

export function ComingSoonAudiobooks() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from("audiobook_notifications")
        .insert({ email, created_at: new Date().toISOString() });
      setSubmitted(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald/5 p-8 lg:p-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="flex justify-center order-2 lg:order-1">
          <div className="relative">
            <div className="flex h-48 w-48 items-center justify-center rounded-full bg-navy/5">
              <Headphones className="h-24 w-24 text-navy/30" strokeWidth={1} />
            </div>
            <div className="absolute -right-4 -top-4 rounded-2xl bg-emerald p-4 shadow-lg">
              <Headphones className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Badge variant="outline" className="mb-4">Coming Soon</Badge>
          <h2 className="font-display text-3xl font-bold text-navy">Audiobooks</h2>
          <p className="mt-4 text-slate-600">
            Listen to classics and premium narrations. Audiobooks will integrate with your library
            and reading history — cart-ready when paid titles arrive.
          </p>

          {submitted ? (
            <p className="mt-8 text-sm text-emerald-700">We&apos;ll notify you when Audiobooks launch!</p>
          ) : (
            <div className="mt-8 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="primary" onClick={handleNotify} disabled={loading || !email}>
                {loading ? "Saving..." : "Notify Me"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
