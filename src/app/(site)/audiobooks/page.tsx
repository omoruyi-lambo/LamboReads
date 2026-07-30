"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  Wifi,
  Download,
  Play,
  Sparkles,
  Mic2,
  CheckCircle,
  Mail,
  User,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseClient } from "@/lib/supabase/client";

const benefits = [
  {
    icon: Headphones,
    title: "Listen anywhere",
    description: "Enjoy books on your commute, workout, or wherever life takes you.",
  },
  {
    icon: Play,
    title: "Background playback",
    description: "Keep listening while using other apps. Never miss a word.",
  },
  {
    icon: Download,
    title: "Offline listening",
    description: "Download audiobooks and listen without an internet connection.",
  },
  {
    icon: Sparkles,
    title: "Immersive narration",
    description: "Natural-sounding voices that bring every story to life.",
  },
  {
    icon: Mic2,
    title: "Professional narration",
    description: "Select titles narrated by professional voice actors.",
  },
  {
    icon: Wifi,
    title: "Smart sync",
    description: "Your position syncs across all your devices automatically.",
  },
];

const heroImageUrl =
  "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=1920&q=80";

export default function AudiobooksPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "already" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const supabase = getSupabaseClient();

      // Check for duplicate
      const { data: existing } = await supabase
        .from("audiobook_waitlist")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (existing) {
        setStatus("already");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("audiobook_waitlist").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      if (error) throw error;

      setStatus("success");
      setName("");
      setEmail("");
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || "Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B1220] px-4 py-24 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImageUrl})` }}
        />
        <div className="absolute inset-0 bg-[#0B1220]/80" />
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#10B981]/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Illustration */}
            <div className="flex justify-center mb-8">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20">
                <Headphones className="h-14 w-14 text-[#10B981]" />
                {/* Animated pulse rings */}
                <span className="absolute inset-0 rounded-3xl animate-ping border border-[#10B981]/20" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-1.5 text-sm font-medium text-[#10B981] mb-6">
              <Clock className="h-3.5 w-3.5" />
              Coming Soon
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5">
              Audiobooks are{" "}
              <span className="text-[#10B981]">Coming Soon</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
              We&apos;re building a world-class audiobook experience for LamboReads. Listen to thousands of titles with immersive narration, professional voice actors, and seamless offline playback — available on every device.
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-left"
                  >
                    <Icon className="h-5 w-5 text-[#10B981] mb-2" />
                    <p className="text-sm font-semibold text-white leading-tight">{b.title}</p>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-snug">{b.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <div className="mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] mb-4">
                <Mail className="h-6 w-6 text-[#10B981]" />
              </div>
              <h2 className="text-2xl font-bold text-[#111827]">Join the Audiobook Waitlist</h2>
              <p className="text-[#64748B] mt-2 text-sm">
                Be the first to know when audiobooks launch. We&apos;ll notify you with early access.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] border-2 border-[#10B981] mb-4"
                  >
                    <CheckCircle className="h-8 w-8 text-[#10B981]" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-[#111827] mb-1">You&apos;re on the list!</h3>
                  <p className="text-sm text-[#64748B] max-w-xs">
                    We&apos;ll send you an email the moment audiobooks go live. Thanks for your support!
                  </p>
                </motion.div>
              ) : status === "already" ? (
                <motion.div
                  key="already"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center"
                >
                  <CheckCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-800">You are already on the waitlist.</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    We&apos;ll notify you when audiobooks launch.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="aw-name" className="block text-sm font-medium text-[#111827] mb-1.5">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                      <Input
                        id="aw-name"
                        required
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="aw-email" className="block text-sm font-medium text-[#111827] mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                      <Input
                        id="aw-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {status === "error" && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {errorMsg}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="emerald"
                    size="lg"
                    isLoading={loading}
                    className="w-full flex items-center gap-2"
                  >
                    Join Waitlist <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-center text-xs text-[#94A3B8]">
                    No spam. Unsubscribe anytime.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
