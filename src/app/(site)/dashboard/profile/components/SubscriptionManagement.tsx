"use client";

import { motion } from "framer-motion";
import { CreditCard, FileText, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

interface SubscriptionManagementProps {
  user: User | null;
}

export function SubscriptionManagement({ user }: SubscriptionManagementProps) {
  const currentPlan = user?.user_metadata?.subscription_plan || "Free";
  const renewalDate = user?.user_metadata?.renewal_date 
    ? new Date(user.user_metadata.renewal_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "N/A";

  const subscriptionOptions = [
    {
      label: "Current Plan",
      value: currentPlan,
      icon: CreditCard,
      action: "Upgrade",
    },
    {
      label: "Renewal Date",
      value: renewalDate,
      icon: Calendar,
      action: "Manage",
    },
    {
      label: "Manage Subscription",
      value: "View and modify your plan",
      icon: CreditCard,
      action: "Manage",
    },
    {
      label: "Payment History",
      value: "View past transactions",
      icon: FileText,
      action: "View",
    },
    {
      label: "Invoices",
      value: "Download your invoices",
      icon: FileText,
      action: "Download",
    },
  ];

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Subscription Management</h3>
      
      <div className="space-y-3">
        {subscriptionOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/50 text-slate-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{option.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{option.value}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
