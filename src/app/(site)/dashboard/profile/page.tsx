"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCurrentUser } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { ProfileHeader } from "./components/ProfileHeader";
import { ReadingStatistics } from "./components/ReadingStatistics";
import { ReadingLevel } from "./components/ReadingLevel";
import { CurrentlyReading } from "./components/CurrentlyReading";
import { RecentActivity } from "./components/RecentActivity";
import { FavoriteGenres } from "./components/FavoriteGenres";
import { ReadingGoals } from "./components/ReadingGoals";
import { Achievements } from "./components/Achievements";
import { SavedCollections } from "./components/SavedCollections";
import { AccountInformation } from "./components/AccountInformation";
import { SecuritySettings } from "./components/SecuritySettings";
import { NotificationPreferences } from "./components/NotificationPreferences";
import { SubscriptionManagement } from "./components/SubscriptionManagement";
import { BottomActions } from "./components/BottomActions";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-72 rounded-2xl bg-[#F1F5F9]" />
          <div className="h-64 rounded-2xl bg-[#F1F5F9]" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "account", label: "Account" },
    { id: "security", label: "Security" },
    { id: "subscription", label: "Subscription" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto"
    >
      <motion.div variants={fadeInUp} className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#111827]">Profile</h1>
            <p className="mt-2 text-[#64748B]">Manage your reading journey and account settings</p>
          </div>
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none flex-shrink-0 w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  activeTab === tab.id
                    ? "bg-[#10B981] text-white border border-[#10B981]"
                    : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC] border border-[#E5E7EB]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {activeTab === "overview" && (
        <motion.div variants={fadeInUp} className="space-y-8">
          <ProfileHeader user={user} />
          <ReadingStatistics user={user} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ReadingLevel user={user} />
            <CurrentlyReading user={user} />
          </div>
          <RecentActivity user={user} />
          <div className="grid gap-6 lg:grid-cols-2">
            <FavoriteGenres user={user} />
            <ReadingGoals user={user} />
          </div>
          <Achievements user={user} />
          <SavedCollections user={user} />
        </motion.div>
      )}

      {activeTab === "account" && (
        <motion.div variants={fadeInUp} className="space-y-8">
          <AccountInformation user={user} />
          <NotificationPreferences user={user} />
        </motion.div>
      )}

      {activeTab === "security" && (
        <motion.div variants={fadeInUp} className="space-y-8">
          <SecuritySettings user={user} />
        </motion.div>
      )}

      {activeTab === "subscription" && (
        <motion.div variants={fadeInUp} className="space-y-8">
          <SubscriptionManagement user={user} />
        </motion.div>
      )}

      <BottomActions user={user} />
    </motion.div>
  );
}
