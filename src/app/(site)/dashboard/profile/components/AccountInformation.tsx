"use client";

import { motion } from "framer-motion";
import { Mail, Phone, Globe, Monitor, Bell, Calendar, Clock } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface AccountInformationProps {
  user: User | null;
}

interface AccountField {
  label: string;
  value: string;
  icon: any;
}

export function AccountInformation({ user }: AccountInformationProps) {
  const [accountFields, setAccountFields] = useState<AccountField[]>([]);

  useEffect(() => {
    async function loadAccountInfo() {
      if (!user?.id) return;
      try {
        const supabase = getSupabaseClient();
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        const email = user?.email || "";
        const phone = user?.user_metadata?.phone || profile?.phone || "";
        const country = profile?.country || user?.user_metadata?.country || "";
        const language = profile?.language || user?.user_metadata?.language || "";
        const theme = profile?.theme || user?.user_metadata?.theme || "";
        const notifications = profile?.notification_preference || user?.user_metadata?.notification_preference || "";
        const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
        const lastLogin = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

        const fields: AccountField[] = [
          { label: "Email", value: email, icon: Mail },
        ];

        if (phone) fields.push({ label: "Phone", value: phone, icon: Phone });
        if (country) fields.push({ label: "Country", value: country, icon: Globe });
        if (language) fields.push({ label: "Language", value: language, icon: Globe });
        if (theme) fields.push({ label: "Theme", value: theme, icon: Monitor });
        if (notifications) fields.push({ label: "Notification Preference", value: notifications, icon: Bell });
        if (joinedDate) fields.push({ label: "Joined Date", value: joinedDate, icon: Calendar });
        if (lastLogin) fields.push({ label: "Last Login", value: lastLogin, icon: Clock });

        setAccountFields(fields);
      } catch {
        // silently fail
      }
    }

    loadAccountInfo();
  }, [user]);

  if (accountFields.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Account Information</h3>
        <p className="text-sm text-slate-400">No account information available.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Account Information</h3>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {accountFields.map((field, index) => {
          const Icon = field.icon;
          return (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-4 rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/50 text-slate-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">{field.label}</p>
                  <p className="text-sm text-white truncate">{field.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
