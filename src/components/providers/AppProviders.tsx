"use client";

import { SplashLoader } from "@/components/ui/SplashLoader";
import { InterestModal } from "@/components/onboarding/InterestModal";
import { useEffect, useState } from "react";
import { getCurrentUser, onAuthStateChange } from "@/lib/supabase/auth";
import { fetchPersonalization } from "@/lib/personalization";

// A user is considered "new" if their account was created within the last 5 minutes.
// This prevents showing the onboarding modal to existing users who happen to have
// no genres set.
function isNewSignup(createdAt: string | undefined): boolean {
  if (!createdAt) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < 5 * 60 * 1000; // 5 minutes
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkGenresForNewUser(createdAt: string | undefined) {
      // Only show modal if this is a genuinely new account
      if (!isNewSignup(createdAt)) {
        if (mounted) setShowOnboarding(false);
        return;
      }
      try {
        const data = await fetchPersonalization();
        if (!mounted) return;
        // Show only if they haven't saved any genres yet
        setShowOnboarding(Array.isArray(data.userGenres) && data.userGenres.length === 0);
      } catch {
        if (mounted) setShowOnboarding(false);
      }
    }

    async function init() {
      try {
        const user = await getCurrentUser();
        if (!mounted) return;
        if (user?.id) {
          await checkGenresForNewUser(user.created_at);
        }
      } catch {
        // ensure splash screen always finishes
      } finally {
        if (mounted) setReady(true);
      }
    }

    init();

    const subscription = onAuthStateChange(async (event, session) => {
      const user = session?.user;
      if (!user?.id) {
        setShowOnboarding(false);
        return;
      }
      // Only trigger onboarding check on SIGNED_IN (covers OAuth + email signup).
      // INITIAL_SESSION fires on every page load for existing sessions — skip it.
      if (event === "SIGNED_IN") {
        await checkGenresForNewUser(user.created_at);
      }
    });

    return () => {
      mounted = false;
      if (subscription && "unsubscribe" in subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <>
      {!ready && <SplashLoader onDone={() => setReady(true)} />}
      {children}
      <InterestModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </>
  );
}
