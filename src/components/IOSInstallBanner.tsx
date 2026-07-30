"use client";

/**
 * IOSInstallBanner
 * Shown only on iOS Safari when the app is NOT already installed.
 * iOS doesn't fire `beforeinstallprompt`, so we must guide the user manually.
 * Detects: iOS device + Safari (not Chrome/Firefox on iOS) + not standalone.
 */

import { useEffect, useState } from "react";
import { X, Share, BookOpen } from "lucide-react";

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isIOSSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  // Must be iOS AND not Chrome/Firefox/Edge/CriOS/FxiOS
  return isIOS() && /safari/i.test(ua) && !/crios|fxios|opios|chrome/i.test(ua);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function IOSInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOSSafari()) return;
    if (isStandalone()) return;
    if (localStorage.getItem("ios-install-dismissed")) return;

    // Show after a short delay
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("ios-install-dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Add LamboReads to your Home Screen"
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl shadow-black/10 p-4">
        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220] shadow-sm">
            <BookOpen className="h-6 w-6 text-[#10B981]" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0B1220]">
              Add to Home Screen
            </p>
            <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
              Install LamboReads for instant access and a full app experience.
            </p>

            {/* Steps */}
            <ol className="mt-3 space-y-2">
              <li className="flex items-center gap-2 text-xs text-[#475569]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[#10B981] font-bold text-[10px]">
                  1
                </span>
                <span>
                  Tap the{" "}
                  <Share className="inline h-3.5 w-3.5 align-middle text-[#3B82F6]" />{" "}
                  <strong>Share</strong> button in the toolbar below
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs text-[#475569]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[#10B981] font-bold text-[10px]">
                  2
                </span>
                <span>
                  Scroll down and tap{" "}
                  <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs text-[#475569]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[#10B981] font-bold text-[10px]">
                  3
                </span>
                <span>
                  Tap <strong>&ldquo;Add&rdquo;</strong> — that&apos;s it!
                </span>
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="mt-3 text-xs text-[#64748B] hover:text-[#0B1220] transition-colors"
            >
              Dismiss
            </button>
          </div>

          {/* Close */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="shrink-0 p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors text-[#94A3B8] hover:text-[#64748B]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Arrow pointing to share button */}
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5">
            <span className="text-xs text-[#64748B]">Share button is at the</span>
            <span className="text-xs font-semibold text-[#0B1220]">bottom of your screen ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
