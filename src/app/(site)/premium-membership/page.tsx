"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  BookOpen,
  Headphones,
  Download,
  Zap,
  Star,
  BarChart2,
  CheckCircle,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseClient } from "@/lib/supabase/client";

const benefits = [
  {
    icon: BookOpen,
    title: "Unlimited Premium Books",
    description: "Access every premium title in our growing exclusive library with no per-book fees.",
  },
  {
    icon: Headphones,
    title: "Audiobooks",
    description: "Full access to our upcoming audiobook library with professional narration and offline listening.",
  },
  {
    icon: Download,
    title: "Offline Reading",
    description: "Download books and read without an internet connection, anywhere you go.",
  },
  {
    icon: Zap,
    title: "Early Releases",
    description: "Get access to new titles before they're available to the general public.",
  },
  {
    icon: Star,
    title: "Exclusive Collections",
    description: "Curated collections and anthologies available only to Premium members.",
  },
  {
    icon: BarChart2,
    title: "Reading Insights",
    description: "Advanced analytics, reading goals, and personalized progress tracking.",
  },
];

const heroImageUrl =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80";

export default function PremiumMembershipPage() {
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

      const { data: existing } = await supabase
        .from("premium_waitlist")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (existing) {
        setStatus("already");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("premium_waitlist").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      if (error) throw error;

      setStatus("success");
      setName("");
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
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
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#10B981]/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Crown className="h-10 w-10 text-amber-400" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400 mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Membership — Coming Soon
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5">
              Read Without Limits
            </h1>
            <p className="text-lg text-[#94A3B8] max-w-xl mx-auto mb-8 leading-relaxed">
              Premium gives you unlimited access to exclusive books, audiobooks, offline reading, and insights — everything you need to make reading a deeper part of your life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">Everything in Premium</h2>
            <p className="text-[#64748B]">
              One membership. Unlimited reading. No per-book fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-400/10 border border-amber-200/50 mb-4">
                    <Icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-[#111827] mb-1.5">{benefit.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's included checklist */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-bold text-[#111827]">Premium includes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[
                "All premium & exclusive books",
                "Full audiobook library",
                "Offline reading & downloads",
                "Early access to new releases",
                "Exclusive curated collections",
                "Advanced reading analytics",
                "Priority customer support",
                "New features before anyone else",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-[#10B981] flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-[#334155] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <div className="mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm p-5 sm:p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-400/10 mb-4">
                <Lock className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#111827]">Join Premium Waitlist</h2>
              <p className="text-[#64748B] mt-2 text-sm">
                Be first to access Premium when it launches. We&apos;ll reserve your spot.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                    We&apos;ll notify you the moment Premium launches with an exclusive early-access offer.
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
                    We&apos;ll let you know when Premium goes live.
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
                    <label htmlFor="pw-name" className="block text-sm font-medium text-[#111827] mb-1.5">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                      <Input
                        id="pw-name"
                        required
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pw-email" className="block text-sm font-medium text-[#111827] mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                      <Input
                        id="pw-email"
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
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full flex items-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Join Premium Waitlist
                    <ArrowRight className="h-4 w-4" />
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

      {/* Bottom CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-[#94A3B8]">
            Already have a free account?{" "}
            <Link href="/library" className="text-[#10B981] font-medium hover:underline">
              Browse our free library →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
