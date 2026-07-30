"use client";

import { motion } from "framer-motion";
import { Mail, Bell, BookOpen, Star, Tag, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface NotificationPreferencesProps {
  user: User | null;
}

interface NotificationToggle {
  id: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
}

export function NotificationPreferences({ user }: NotificationPreferencesProps) {
  const [toggles, setToggles] = useState<NotificationToggle[]>([
    {
      id: "email_notifications",
      label: "Email Notifications",
      description: "Receive updates and news via email",
      icon: Mail,
      enabled: true,
    },
    {
      id: "reading_reminder",
      label: "Reading Reminder",
      description: "Get reminded to continue your reading streak",
      icon: Bell,
      enabled: true,
    },
    {
      id: "weekly_recommendations",
      label: "Weekly Recommendations",
      description: "Personalized book suggestions every week",
      icon: BookOpen,
      enabled: true,
    },
    {
      id: "new_releases",
      label: "New Releases",
      description: "Be notified when new books are available",
      icon: Star,
      enabled: false,
    },
    {
      id: "author_updates",
      label: "Author Updates",
      description: "Follow your favorite authors' new works",
      icon: Tag,
      enabled: false,
    },
    {
      id: "special_offers",
      label: "Special Offers",
      description: "Exclusive deals and promotions",
      icon: Gift,
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setToggles(prev => prev.map(toggle => 
      toggle.id === id ? { ...toggle, enabled: !toggle.enabled } : toggle
    ));
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
      
      <div className="space-y-3">
        {toggles.map((toggle, index) => {
          const Icon = toggle.icon;
          return (
            <motion.div
              key={toggle.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/50 text-slate-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{toggle.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{toggle.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggle(toggle.id)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                  toggle.enabled ? "bg-emerald-500" : "bg-slate-700"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200",
                    toggle.enabled ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
