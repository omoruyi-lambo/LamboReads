"use client";

/**
 * InstallAppButton
 * A reusable button that triggers the PWA install prompt.
 * Shows only when the `beforeinstallprompt` event is available (Android/Desktop).
 * Hidden once the app is already installed.
 */

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  className?: string;
  label?: string;
}

export function InstallAppButton({ className = "", label = "Install App" }: Props) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone === true) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent) return null;

  const handleInstall = async () => {
    if (!promptEvent) return;
    setInstalling(true);
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setPromptEvent(null);
    }
    setInstalling(false);
  };

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={installing}
      className={className}
    >
      <Download className="h-4 w-4" />
      {installing ? "Installing…" : label}
    </button>
  );
}
