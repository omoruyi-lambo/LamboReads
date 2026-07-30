"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { readingTracker } from "@/lib/readingTracker";

export default function SearchSaver() {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    
    readingTracker.saveSearch(q);
    window.location.href = `/library?search=${encodeURIComponent(q)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          name="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by title, author, or genre…"
          className="pl-12 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
        />
      </div>
      <Button type="submit" variant="emerald" size="lg">
        Search Books
      </Button>
    </form>
  );
}
