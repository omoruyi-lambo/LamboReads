"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Search,
  BookOpen,
  Heart,
  Zap,
  BookMarked,
  GraduationCap,
  Briefcase,
  Code2,
  User,
  History,
  HeartPulse,
  TrendingUp,
  BrainCircuit,
  Landmark,
  Sparkles,
  Globe,
  Music,
  Cross,
  Rocket,
  Mountain,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { READING_INTERESTS } from "@/lib/types";
import { getCurrentSession, getCurrentUser } from "@/lib/supabase/auth";
import { fetchPersonalization, saveUserGenres } from "@/lib/personalization";
import { cn } from "@/lib/utils";

// ─── Genre icon map ────────────────────────────────────────────────────────────
const genreIcons: Record<string, React.ReactNode> = {
  "Gospel & Christian": <Cross className="h-5 w-5" />,
  Romance: <Heart className="h-5 w-5" />,
  Fiction: <BookOpen className="h-5 w-5" />,
  "Non-Fiction": <BookMarked className="h-5 w-5" />,
  "Mystery & Thriller": <Zap className="h-5 w-5" />,
  Fantasy: <Sparkles className="h-5 w-5" />,
  "Science Fiction": <Rocket className="h-5 w-5" />,
  Adventure: <Mountain className="h-5 w-5" />,
  Business: <Briefcase className="h-5 w-5" />,
  Entrepreneurship: <TrendingUp className="h-5 w-5" />,
  "Self-Help": <HeartPulse className="h-5 w-5" />,
  "Personal Development": <GraduationCap className="h-5 w-5" />,
  Technology: <Zap className="h-5 w-5" />,
  Programming: <Code2 className="h-5 w-5" />,
  Education: <GraduationCap className="h-5 w-5" />,
  Biography: <User className="h-5 w-5" />,
  History: <History className="h-5 w-5" />,
  "Health & Wellness": <HeartPulse className="h-5 w-5" />,
  Finance: <TrendingUp className="h-5 w-5" />,
  Philosophy: <BrainCircuit className="h-5 w-5" />,
  Politics: <Landmark className="h-5 w-5" />,
  "Children's Books": <Sparkles className="h-5 w-5" />,
  Poetry: <Music className="h-5 w-5" />,
  "African Literature": <Globe className="h-5 w-5" />,
  Science: <Rocket className="h-5 w-5" />,
};

// Minimum genres that must be selected before Save is enabled
const MIN_SELECTIONS = 3;

type ToastState = { type: "success" | "error"; message: string };

// ─── Overlay backdrop ──────────────────────────────────────────────────────────
function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

// ─── Individual genre card ─────────────────────────────────────────────────────
function GenreCard({
  interest,
  active,
  disabled,
  index,
  onToggle,
}: {
  interest: string;
  active: boolean;
  disabled: boolean;
  index: number;
  onToggle: () => void;
}) {
  return (
    <motion.button
      key={interest}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.3) }}
      layout
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 sm:p-4 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          : active
          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-slate-50"
      )}
    >
      {/* Selection checkmark */}
      <AnimatePresence>
        {active && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute right-2 top-2"
            aria-hidden="true"
          >
            <Check className="h-4 w-4 text-emerald-500" />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Icon */}
      <span
        className={cn(
          "rounded-xl p-2",
          active
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-100 text-slate-500"
        )}
        aria-hidden="true"
      >
        {genreIcons[interest] ?? <BookOpen className="h-5 w-5" />}
      </span>

      <span className="text-xs sm:text-sm font-medium leading-tight">
        {interest}
      </span>
    </motion.button>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────────
export function InterestModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isPreparing = isCheckingAuth || isLoadingPreferences;
  // Require ≥ MIN_SELECTIONS genres selected before enabling the save button
  const canSave =
    authenticated === true &&
    !isPreparing &&
    !isSaving &&
    selected.length >= MIN_SELECTIONS;

  // ── Reset & initialise when the modal opens ──────────────────────────────────
  useEffect(() => {
    let mounted = true;

    if (!open) {
      setSelected([]);
      setSearchQuery("");
      setToast(null);
      setShowSuccess(false);
      setAuthenticated(null);
      return;
    }

    async function initialize() {
      setIsCheckingAuth(true);
      setToast(null);

      try {
        const session = await getCurrentSession();
        if (!mounted) return;

        if (!session?.user) {
          setAuthenticated(false);
          return;
        }

        setAuthenticated(true);
        setIsLoadingPreferences(true);

        // If the user has already completed onboarding this session, close immediately
        const hasSeenKey = `lamboreads_onboarding_shown:${session.user.id}`;
        if (typeof window !== "undefined") {
          try {
            if (localStorage.getItem(hasSeenKey) === "true") {
              onClose();
              return;
            }
          } catch {
            // localStorage unavailable, proceed normally
          }
        }

        const personalization = await fetchPersonalization();
        if (!mounted) return;

        // User already has genres saved → close and mark as seen
        if (
          Array.isArray(personalization.userGenres) &&
          personalization.userGenres.length > 0
        ) {
          if (typeof window !== "undefined") {
            try { localStorage.setItem(hasSeenKey, "true"); } catch { /* ignore */ }
          }
          onClose();
          return;
        }

        // Mark as seen so we don't re-show this session
        if (typeof window !== "undefined") {
          try { localStorage.setItem(hasSeenKey, "true"); } catch { /* ignore */ }
        }
      } catch (err) {
        console.error("InterestModal initialization failed:", err);
        if (mounted) {
          setToast({
            type: "error",
            message: "Something went wrong. Please refresh the page and try again.",
          });
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
          setIsLoadingPreferences(false);
        }
      }
    }

    initialize();
    return () => { mounted = false; };
  }, [open, onClose]);

  // ── Auto-dismiss toast after 4 s ─────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  // ── Prevent body scroll while modal is open ──────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Filtered genre list ───────────────────────────────────────────────────────
  const filteredGenres = useMemo(() => {
    if (!searchQuery.trim()) return READING_INTERESTS as unknown as string[];
    const q = searchQuery.toLowerCase();
    return (READING_INTERESTS as unknown as string[]).filter((g) =>
      g.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // ── Toggle a genre without causing layout jumps ───────────────────────────────
  const toggle = (interest: string) => {
    // Preserve current scroll position so selecting doesn't jump the list
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
    // Restore after React re-renders
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollTop;
    });
  };

  // ── Save handler ──────────────────────────────────────────────────────────────
  const save = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setToast(null);

    try {
      const user = await getCurrentUser();
      if (!user) {
        setAuthenticated(false);
        setToast({ type: "error", message: "Please sign in to save your preferences." });
        return;
      }

      await saveUserGenres(selected);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`lamboreads_onboarding_shown:${user.id}`, "true");
        } catch { /* ignore */ }
      }

      setShowSuccess(true);

      // Auto-close after the success animation plays
      window.setTimeout(() => {
        onClose();
        if (pathname !== "/dashboard") router.push("/dashboard");
      }, 1400);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Unable to save your selections.",
      });
      console.error("Error saving user genres:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const loginRequired = authenticated === false && !isPreparing;
  const remainingToSelect = Math.max(0, MIN_SELECTIONS - selected.length);

  return (
    <AnimatePresence>
      {open && (
        /* ── Full-screen overlay ──────────────────────────────────────────── */
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Choose your reading interests"
        >
          <Backdrop onClick={() => !isSaving && onClose()} />

          {/* ── Dialog panel ──────────────────────────────────────────────── */}
          <motion.div
            key="modal-panel"
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            style={{ width: "min(900px, 95vw)", maxHeight: "90vh" }}
            className="relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
          >
            {/* ── Success overlay ──────────────────────────────────────── */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.05 }}
                    className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/20"
                    aria-hidden="true"
                  >
                    <Check className="h-10 w-10 text-white" strokeWidth={3} />
                  </motion.span>
                  <h3 className="text-2xl font-bold text-white">
                    Preferences saved!
                  </h3>
                  <p className="mt-2 text-emerald-100">
                    Taking you to your personalised dashboard…
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STICKY HEADER ────────────────────────────────────────── */}
            <div className="shrink-0 border-b border-slate-100 bg-white px-6 pt-6 pb-5 sm:px-8 sm:pt-7">
              {/* Close button */}
              <button
                type="button"
                onClick={() => !isSaving && onClose()}
                disabled={isSaving}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="pr-10 text-2xl font-bold text-slate-900 sm:text-3xl">
                What kind of books do you enjoy?
              </h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Pick at least {MIN_SELECTIONS} genres so we can personalise your reading experience.
              </p>

              {/* Search input */}
              <div className="relative mt-5">
                <Search
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search genres…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  aria-label="Search genres"
                />
              </div>

              {/* Selection counter */}
              {authenticated && !isPreparing && (
                <p className="mt-3 text-xs text-slate-400">
                  {selected.length === 0
                    ? `Select at least ${MIN_SELECTIONS} genres to continue`
                    : selected.length < MIN_SELECTIONS
                    ? `${remainingToSelect} more genre${remainingToSelect !== 1 ? "s" : ""} needed`
                    : `${selected.length} genre${selected.length !== 1 ? "s" : ""} selected — ready to save`}
                </p>
              )}
            </div>

            {/* ── SCROLLABLE CONTENT ───────────────────────────────────── */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth px-6 py-5 sm:px-8"
              style={{ scrollbarWidth: "none" }} /* hide thin scrollbar in Firefox */
            >
              {/* Hide Webkit scrollbar */}
              <style>{`
                div[data-scroll-container]::-webkit-scrollbar { display: none; }
              `}</style>

              {isPreparing ? (
                /* Loading skeleton */
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-500">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                      className="block h-4 w-4 rounded-full border-2 border-slate-300 border-t-emerald-500"
                      aria-hidden="true"
                    />
                    {isCheckingAuth ? "Checking your session…" : "Loading your preferences…"}
                  </div>
                </div>
              ) : (
                <>
                  {loginRequired && (
                    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                      Sign in to save your reading preferences and unlock personalised recommendations.
                    </div>
                  )}

                  {/* Genre grid — 2 cols mobile / 3 tablet / 4 desktop / 5 wide */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filteredGenres.map((interest, index) => (
                      <GenreCard
                        key={interest}
                        interest={interest}
                        active={selected.includes(interest)}
                        disabled={!authenticated}
                        index={index}
                        onToggle={() => toggle(interest)}
                      />
                    ))}
                  </div>

                  {filteredGenres.length === 0 && (
                    <p className="py-12 text-center text-sm text-slate-400">
                      No genres match &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}

                  {/* Bottom padding so the last row never touches the footer */}
                  <div className="h-6" aria-hidden="true" />
                </>
              )}
            </div>

            {/* ── STICKY FOOTER ────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 sm:px-8">
              {/* Toast */}
              <AnimatePresence>
                {toast && (
                  <motion.div
                    key="toast"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={cn(
                      "mb-4 rounded-xl px-4 py-3 text-sm",
                      toast.type === "success"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border border-red-200 bg-red-50 text-red-700"
                    )}
                    role="status"
                    aria-live="polite"
                  >
                    {toast.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex-1"
                  onClick={() => !isSaving && onClose()}
                  disabled={isSaving}
                >
                  {authenticated ? "Skip for now" : "Maybe later"}
                </Button>

                <Button
                  variant="emerald"
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 disabled:shadow-none"
                  onClick={save}
                  disabled={!canSave}
                  isLoading={isSaving}
                  aria-disabled={!canSave}
                >
                  {isSaving
                    ? "Saving…"
                    : selected.length >= MIN_SELECTIONS
                    ? `Save & Continue (${selected.length})`
                    : `Select ${remainingToSelect} more`}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
