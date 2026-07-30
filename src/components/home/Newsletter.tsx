"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseClient } from "@/lib/supabase/client";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, subscribed_at: new Date().toISOString() });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSubmitted(true);
      setEmail("");
    } catch {
      setError("Unable to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#F8FAFC] border-y border-[#E5E7EB] py-16">
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <h2 className="font-display text-2xl font-bold text-[#111827]">Stay in the loop</h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Get notified about new additions, features, and updates.
        </p>

        {submitted ? (
          <p className="mt-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            You&apos;re subscribed! We&apos;ll keep you updated.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex gap-2 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="you@example.com"
              required
              className="flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="emerald" disabled={loading}>
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        )}

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </section>
  );
}
