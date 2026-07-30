"use client";

import { motion } from "framer-motion";
import { Lock, Shield, Smartphone, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface SecuritySettingsProps {
  user: User | null;
}

interface SecurityOption {
  label: string;
  description: string;
  icon: any;
  action: string;
  destructive?: boolean;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const securityOptions: SecurityOption[] = [
    {
      label: "Change Password",
      description: "Update your password to keep your account secure",
      icon: Lock,
      action: "Change",
    },
    {
      label: "Google Login",
      description: "Manage your Google account connection",
      icon: Shield,
      action: "Manage",
    },
    {
      label: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      icon: Shield,
      action: "Enable",
    },
    {
      label: "Manage Sessions",
      description: "View and manage your active sessions",
      icon: Smartphone,
      action: "View",
    },
    {
      label: "Connected Devices",
      description: "Manage devices connected to your account",
      icon: Smartphone,
      action: "Manage",
    },
    {
      label: "Delete Account",
      description: "Permanently delete your account and all data",
      icon: Trash2,
      action: "Delete",
      destructive: true,
    },
  ];

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Security Settings</h3>
      
      <div className="space-y-3">
        {securityOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4",
                option.destructive
                  ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40 hover:bg-red-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  option.destructive
                    ? "bg-red-500/20 text-red-400"
                    : "bg-slate-700/50 text-slate-400"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className={cn(
                    "text-sm font-medium",
                    option.destructive ? "text-red-400" : "text-white"
                  )}>{option.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                </div>
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 shrink-0",
                option.destructive ? "text-red-400" : "text-slate-500"
              )} />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
