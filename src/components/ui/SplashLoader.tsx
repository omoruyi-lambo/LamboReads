"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

export function SplashLoader({ onDone }: { onDone?: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onDone?.();
    }, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B1220]"
        >
          <motion.div
            animate={{ rotateY: [0, 15, 0, -15, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <BookOpen className="h-12 w-12 text-[#10B981]" strokeWidth={1.5} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 font-display text-xl font-semibold text-white"
          >
            LamboReads
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
