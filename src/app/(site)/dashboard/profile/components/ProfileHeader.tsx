"use client";

import { motion } from "framer-motion";
import { Edit, Share2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface ProfileHeaderProps {
  user: User | null;
}

interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  memberSince: string;
  avatarInitial: string;
  avatarUrl: string | null;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "Reader",
    username: "reader",
    bio: "",
    memberSince: "Recently",
    avatarInitial: "R",
    avatarUrl: null,
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("user_profiles")
          .select("display_name, bio")
          .eq("user_id", user.id)
          .single();

        const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Reader";
        const username = user?.user_metadata?.username || displayName.toLowerCase().replace(/\s+/g, "");
        const bio = data?.bio || "";
        const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently";
        const avatarInitial = displayName?.[0]?.toUpperCase() || "R";
        const avatarUrl = user?.user_metadata?.avatar_url || null;

        setProfile({ displayName, username, bio, memberSince, avatarInitial, avatarUrl });
      } catch {
        // silently fail
      }
    }

    loadProfile();
  }, [user]);

  return (
    <motion.div
      variants={fadeInUp}
      className="relative rounded-[32px] overflow-hidden border border-white/10 bg-white/5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/90 to-[#0B1220]/95" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start lg:items-center">
            <div className="relative shrink-0">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white/10 bg-slate-800 flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-semibold text-white">{profile.avatarInitial}</span>
                )}
              </div>
              <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-[#0B1220] bg-emerald-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">{profile.displayName}</h2>
              <p className="text-slate-400">@{profile.username}</p>
              {profile.bio && <p className="max-w-md text-sm text-slate-500 leading-relaxed">{profile.bio}</p>}
              {!profile.bio && <p className="text-sm text-slate-600">No bio yet</p>}
              <p className="text-xs text-slate-600">Member since {profile.memberSince}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
