"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Settings as SettingsIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { READING_INTERESTS } from "@/lib/types";
import { getCurrentUser } from "@/lib/supabase/auth";
import { fetchPersonalization, saveUserGenres } from "@/lib/personalization";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Reader';
  const avatarUrl = user?.user_metadata?.avatar_url;

  useEffect(() => {
    let mounted = true;

    async function load() {
      const currentUser = await getCurrentUser();
      if (!mounted || !currentUser) {
        if (mounted) setLoading(false);
        return;
      }
      setUser(currentUser);
      setEmail(currentUser.email || "");

      try {
        const data = await fetchPersonalization();
        if (mounted && data.userGenres) {
          setInterests(data.userGenres);
        }
      } catch {
        // silently fail
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const toggleInterest = (i: string) => {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      if (interests.length > 0) {
        await saveUserGenres(interests);
      }
      setMessage("Settings saved successfully!");
    } catch (err: unknown) {
      setMessage((err as Error)?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-7 w-32 rounded bg-[#F1F5F9]" />
        <div className="h-4 w-48 rounded bg-[#F1F5F9]" />
        <div className="h-48 rounded-2xl bg-[#F1F5F9]" />
        <div className="h-32 rounded-2xl bg-[#F1F5F9]" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage your profile and preferences</p>
      </motion.div>

      <motion.div variants={item} className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-5 w-5 text-[#10B981]" />
          <h2 className="text-lg font-semibold text-[#111827]">Profile</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#10B981]/20 bg-[#F8FAFC] shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-[#94A3B8]" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="text-sm font-medium text-[#64748B]">Full Name</label>
              <div className="mt-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-[#111827]">
                {displayName}
              </div>
              <p className="mt-1 text-xs text-[#94A3B8]">Managed by your auth provider</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#64748B]">Email</label>
              <div className="mt-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm text-[#111827]">
                {email}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-5 w-5 text-[#10B981]" />
          <h2 className="text-lg font-semibold text-[#111827]">Reading Interests</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {READING_INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleInterest(i)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-all duration-200",
                interests.includes(i)
                  ? "border-[#10B981] bg-[#10B981] text-white"
                  : "border-[#E5E7EB] bg-white text-[#64748B] hover:text-[#111827] hover:border-[#CBD5E1]"
              )}
            >
              {i}
            </button>
          ))}
        </div>

        {message && (
          <p className={cn(
            "mt-4 text-sm",
            message.includes("success") ? "text-[#10B981]" : "text-red-600"
          )}>
            {message}
          </p>
        )}

        <Button
          variant="primary"
          className="mt-6"
          onClick={saveProfile}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
