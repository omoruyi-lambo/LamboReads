"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchPersonalization, saveUserGenres } from "@/lib/personalization";

interface GenreSelectorProps {
  onSave?: (genres: string[]) => void;
  initialGenres?: string[];
  minSelect?: number;
}

const GENRES = [
  "Fiction",
  "Mystery & Thriller",
  "Romance",
  "Fantasy",
  "Science Fiction",
  "Adventure",
  "History",
  "Biography",
  "Philosophy",
  "Poetry",
  "Religion & Spirituality",
  "Children's Books",
  "Young Adult",
  "Non-Fiction",
  "Business",
  "Science",
  "Self-Help",
];

export default function GenreSelector({
  onSave,
  initialGenres = [],
  minSelect = 1,
}: GenreSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialGenres)
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadGenres() {
      if (initialGenres.length > 0) {
        return;
      }

      try {
        const data = await fetchPersonalization();
        if (mounted && data.userGenres.length > 0) {
          setSelected(new Set(data.userGenres));
        }
      } catch (err) {
        console.error("Failed to load saved genres:", err);
      }
    }

    loadGenres();

    return () => {
      mounted = false;
    };
  }, [initialGenres]);

  const toggle = (genre: string) => {
    const nextSelected = new Set(selected);
    if (nextSelected.has(genre)) {
      nextSelected.delete(genre);
    } else {
      nextSelected.add(genre);
    }
    setSelected(nextSelected);
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    if (selected.size < minSelect) {
      setError(`Please select at least ${minSelect} genre(s).`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const genres = Array.from(selected);
      await saveUserGenres(genres);
      setSaved(true);
      onSave?.(genres);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save your preferences."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-xl font-bold tracking-tight text-[#0B1220]">
          Select Favorite Genres
        </h3>
        <p className="mb-6 text-xs text-[#64748B]">
          Choose at least {minSelect} genre{minSelect > 1 ? "s" : ""} to customize your homepage recommendations.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {GENRES.map((genre) => {
            const isSelected = selected.has(genre);
            return (
              <button
                key={genre}
                onClick={() => toggle(genre)}
                type="button"
                className={`relative rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? "border-[#10B981] bg-[#ECFDF5] text-[#0B1220] shadow-xs"
                    : "border-[#E5E7EB] bg-white text-[#334155] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{genre}</span>
                  {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          variant="emerald"
          size="md"
          isLoading={loading}
          disabled={selected.size < minSelect}
        >
          Save Reading Preferences
        </Button>
        {saved && (
          <span className="text-xs font-medium text-[#10B981] flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Preferences saved!
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

