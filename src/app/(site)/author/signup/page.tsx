"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  PenTool,
  Globe,
  Phone,
  MapPin,
  FileText,
  Link2,
  Camera,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseClient } from "@/lib/supabase/client";
import { signUp } from "@/lib/supabase/auth";

export default function AuthorSignupPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    penName: "",
    email: "",
    password: "",
    confirmPassword: "",
    biography: "",
    country: "",
    phone: "",
    website: "",
    twitter: "",
    instagram: "",
    facebook: "",
    profilePhotoUrl: "",
    terms: false,
  });

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!form.terms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create auth account
      const signUpResult = await signUp(
        form.email,
        form.password,
        form.fullName
      );

      // The signUp helper can return { error: {...} } without a data field when
      // Supabase is not configured, so we narrow the type before accessing .data
      if (signUpResult.error) throw signUpResult.error;

      const userId = "data" in signUpResult ? signUpResult.data?.user?.id : undefined;

      // 2. Insert author profile into authors table
      const supabase = getSupabaseClient();
      const { error: dbError } = await supabase.from("authors").insert({
        user_id: userId ?? null,
        full_name: form.fullName.trim(),
        pen_name: form.penName.trim() || null,
        email: form.email.trim().toLowerCase(),
        biography: form.biography.trim() || null,
        country: form.country.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        social_links: {
          twitter: form.twitter.trim() || null,
          instagram: form.instagram.trim() || null,
          facebook: form.facebook.trim() || null,
        },
        profile_photo_url: form.profilePhotoUrl.trim() || null,
        status: "pending",
      });

      if (dbError) throw dbError;

      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full rounded-2xl border border-[#E5E7EB] bg-white shadow-sm p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF5] border-2 border-[#10B981] mx-auto mb-6"
          >
            <CheckCircle className="h-10 w-10 text-[#10B981]" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#111827] mb-2">Application Submitted!</h1>
          <p className="text-[#64748B] mb-4 leading-relaxed">
            Your author profile has been submitted and is{" "}
            <span className="font-semibold text-amber-600">pending approval</span>. Our team will
            review your application and notify you at{" "}
            <span className="font-medium text-[#111827]">{form.email}</span>.
          </p>
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-6">
            <p className="text-sm text-amber-700 font-medium">Status: Pending Approval</p>
            <p className="text-xs text-amber-600 mt-0.5">Usually reviewed within 1–3 business days.</p>
          </div>
          <Link href="/">
            <Button variant="primary" className="w-full">
              Return to LamboReads
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1220]">
              <Image src="/images/logo.png" alt="LamboReads" width={20} height={20} className="object-contain" />
            </div>
            <span className="font-display text-lg font-semibold text-[#0B1220]">LamboReads</span>
          </Link>
          <div className="text-sm text-[#64748B]">
            Already a reader?{" "}
            <Link href="/login" className="text-[#10B981] font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 sm:px-6">
        {/* Page title */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1220] mb-4">
            <PenTool className="h-7 w-7 text-[#10B981]" />
          </div>
          <h1 className="text-3xl font-bold text-[#111827]">Become an Author</h1>
          <p className="text-[#64748B] mt-2">
            Join LamboReads as an author. Publish your books and reach readers worldwide.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8 justify-center overflow-x-auto scrollbar-none px-2">
          {["Account", "Profile", "Social & Bio"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step > i + 1
                    ? "bg-[#10B981] text-white"
                    : step === i + 1
                    ? "bg-[#0B1220] text-white"
                    : "bg-[#F1F5F9] text-[#94A3B8]"
                }`}
              >
                {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  step === i + 1 ? "text-[#111827]" : "text-[#94A3B8]"
                }`}
              >
                {label}
              </span>
              {i < 2 && <div className="h-px w-4 sm:w-8 md:w-12 bg-[#E5E7EB] mx-0.5 sm:mx-1 flex-shrink-0" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Account */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="text-lg font-semibold text-[#111827] mb-1">Account Details</h2>
                  <p className="text-sm text-[#64748B] mb-5">Create your author login credentials.</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          required
                          placeholder="Your legal full name"
                          value={form.fullName}
                          onChange={(e) => set("fullName", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Pen Name</label>
                      <div className="relative">
                        <PenTool className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          placeholder="Optional author pen name"
                          value={form.penName}
                          onChange={(e) => set("penName", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                      <Input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Min. 6 characters"
                          value={form.password}
                          onChange={(e) => set("password", e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          type={showConfirm ? "text" : "password"}
                          required
                          placeholder="Repeat password"
                          value={form.confirmPassword}
                          onChange={(e) => set("confirmPassword", e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center gap-2 mt-2"
                    onClick={() => {
                      if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
                        setError("Please fill in all required fields.");
                        return;
                      }
                      if (form.password !== form.confirmPassword) {
                        setError("Passwords do not match.");
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                  >
                    Next Step <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Profile */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="text-lg font-semibold text-[#111827] mb-1">Author Profile</h2>
                  <p className="text-sm text-[#64748B] mb-5">Help readers discover and connect with you.</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Country *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          required
                          placeholder="Your country"
                          value={form.country}
                          onChange={(e) => set("country", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          required
                          placeholder="+1 234 567 8900"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Profile Photo URL</label>
                    <div className="relative">
                      <Camera className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                      <Input
                        type="url"
                        placeholder="https://example.com/your-photo.jpg"
                        value={form.profilePhotoUrl}
                        onChange={(e) => set("profilePhotoUrl", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">Paste a direct link to your profile photo</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="flex-1 flex items-center gap-2"
                      onClick={() => {
                        if (!form.country || !form.phone) {
                          setError("Country and phone number are required.");
                          return;
                        }
                        setError(null);
                        setStep(3);
                      }}
                    >
                      Next Step <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Social & Bio */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h2 className="text-lg font-semibold text-[#111827] mb-1">Social Links & Biography</h2>
                  <p className="text-sm text-[#64748B] mb-5">Tell readers about yourself and where to find you.</p>

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Biography *</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-4 h-4 w-4 text-[#94A3B8]" />
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell readers about yourself, your writing style, and the stories you tell..."
                        value={form.biography}
                        onChange={(e) => set("biography", e.target.value)}
                        className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] pl-10 pr-4 py-3 text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none transition-all duration-150 focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-[#10B981]/20 resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                      <Input
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={form.website}
                        onChange={(e) => set("website", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Twitter / X</label>
                      <div className="relative">
                        <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          placeholder="@username"
                          value={form.twitter}
                          onChange={(e) => set("twitter", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Instagram</label>
                      <div className="relative">
                        <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          placeholder="@username"
                          value={form.instagram}
                          onChange={(e) => set("instagram", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111827] mb-1.5">Facebook</label>
                      <div className="relative">
                        <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <Input
                          placeholder="Page name or URL"
                          value={form.facebook}
                          onChange={(e) => set("facebook", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-4">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={form.terms}
                      onChange={(e) => set("terms", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#E5E7EB] text-[#10B981] focus:ring-[#10B981] cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-sm text-[#475569] cursor-pointer leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#10B981] hover:underline font-medium">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[#10B981] hover:underline font-medium">
                        Privacy Policy
                      </Link>
                      . I understand my application will be reviewed before approval.
                    </label>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="emerald"
                      size="lg"
                      isLoading={loading}
                      className="flex-1 flex items-center gap-2"
                    >
                      Submit Application <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && step !== 3 && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-[#94A3B8] mt-6">
          Want to read for free instead?{" "}
          <Link href="/signup" className="text-[#10B981] font-medium hover:underline">
            Reader signup →
          </Link>
        </p>
      </div>
    </div>
  );
}
