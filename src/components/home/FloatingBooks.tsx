"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCoverUrl } from "@/lib/gutendex";
import type { GutenbergBook } from "@/lib/types";

export function FloatingBooks({ books }: { books: GutenbergBook[] }) {
  return (
    <div className="relative h-[500px]">
      {books.map((book, index) => {
        const cover = getCoverUrl(book);
        if (!cover) return null;
        const yOffset = Math.sin(index * 0.8) * 40;
        const delay = index * 0.1;
        return (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: [yOffset - 10, yOffset + 10, yOffset - 10],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 4,
              delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute"
            style={{
              left: `${20 + (index % 3) * 30}%`,
              top: `${10 + Math.floor(index / 3) * 25}%`,
              zIndex: 10 + (index % 3),
            }}
          >
            <Link href={`/book/${book.id}`}>
              <div className="relative group">
                <div className="w-28 h-40 rounded-lg overflow-hidden shadow-xl ring-2 ring-white/10 group-hover:ring-emerald-400/30 transition-all">
                  <Image
                    src={cover}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
