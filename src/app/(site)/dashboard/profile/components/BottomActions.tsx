"use client";

import { motion } from "framer-motion";
import { Download, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface BottomActionsProps {
  user: User | null;
}

interface Action {
  label: string;
  description: string;
  icon: any;
  action: () => void;
  destructive?: boolean;
}

export function BottomActions({ user }: BottomActionsProps) {
  const router = useRouter();

  const handleExportData = () => {
    router.push("/dashboard/settings");
  };

  const handleDownloadHistory = () => {
    router.push("/dashboard/history");
  };

  const handlePrivacySettings = () => {
    router.push("/dashboard/settings");
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const actions: Action[] = [
    {
      label: "Export Reading Data",
      description: "Download all your reading data",
      icon: Download,
      action: handleExportData,
    },
    {
      label: "Download Reading History",
      description: "Get a copy of your reading history",
      icon: Download,
      action: handleDownloadHistory,
    },
    {
      label: "Privacy Settings",
      description: "Manage your privacy preferences",
      icon: Shield,
      action: handlePrivacySettings,
    },
    {
      label: "Logout",
      description: "Sign out of your account",
      icon: LogOut,
      action: handleLogout,
      destructive: true,
    },
  ];

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Account Actions</h3>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={action.action}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 text-center",
                action.destructive
                  ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40 hover:bg-red-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                action.destructive
                  ? "bg-red-500/20 text-red-400"
                  : "bg-slate-700/50 text-slate-400"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  action.destructive ? "text-red-400" : "text-white"
                )}>{action.label}</p>
                <p className="text-xs text-slate-500 mt-1">{action.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
