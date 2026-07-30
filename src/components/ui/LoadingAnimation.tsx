"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export function LoadingAnimation({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white">
      <motion.div
        animate={{
          rotateY: [0, 30, 0, -30, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <BookOpen className="h-10 w-10 text-[#10B981]" />
      </motion.div>
      
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-sm text-[#64748B]"
      >
        {text}
      </motion.div>
    </div>
  );
}
