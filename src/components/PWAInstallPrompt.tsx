"use client";

/**
 * PWAInstallPrompt
 * Handles the `beforeinstallprompt` event fired by Chrome/Edge/Android.
 * Shows a slide-up banner at the bottom of the screen with an Install button.
 * Dismissed state is stored in sessionStorage (reappears next session).
 */

import { useEffect, useState } from "react";
import { Download, X, BookOpen } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Already installed — don't show
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone === true) return;

    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      // Small delay so page load isn't jarring
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    setInstalling(true);
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    } else {
      setInstalling(false);
    }
    setPromptEvent(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  };

  if (!visible || !promptEvent) return null;

  return (
    <div
      role="dialog"
      aria-label="Install LamboReads app"
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-300"
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
              Install LamboReads
            </p>
            <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
              Add to your home screen for faster access, offline reading, and a full app experience.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#059669] transition-colors disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5" />
                {installing ? "Installing…" : "Install"}
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-[#64748B] hover:text-[#0B1220] transition-colors px-2 py-1.5"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="shrink-0 p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors text-[#94A3B8] hover:text-[#64748B]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
