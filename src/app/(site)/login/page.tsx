"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn, signInWithGoogle, onAuthStateChange } from "@/lib/supabase/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine where to send the user after login.
  // If a ?redirect= param is present (set by middleware), honour it;
  // otherwise fall through to /dashboard.
  const rawRedirect = searchParams.get("redirect");
  const redirectTo =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/dashboard";

  // Listen for the SIGNED_IN event so Google OAuth (which redirects back via
  // /auth/callback and may briefly show the login page) also navigates away.
  useEffect(() => {
    const subscription = onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.replace(redirectTo);
      }
    });
    return () => {
      if (subscription && "unsubscribe" in subscription) {
        subscription.unsubscribe();
      }
    };
  }, [redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(
        fd.get("email") as string,
        fd.get("password") as string
      );

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // pressing Back won't send the user back to /login while authenticated.
      // Do NOT call router.refresh() here: it re-renders server components
      // before the cookie has propagated, which causes a visible flicker and
      // can trigger the middleware to bounce back to /login.
      router.replace(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await signInWithGoogle(redirectTo);
      // On success signInWithOAuth redirects the browser to Google — no
      // further action is needed here.  The onAuthStateChange listener above
      // handles the navigation once /auth/callback sets the session cookie.
      if (error) setError(error.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to sign in with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#10B981] hover:text-[#059669]">
            Sign up
          </Link>
        </>
      }
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-[#111827]">Sign in to LamboReads</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Enter your details below to access your account.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {searchParams.get("verified") === "false" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-sm text-amber-800">Please check your email to verify your account before signing in.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#111827] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input id="email" name="email" type="email" required placeholder="you@example.com" className="pl-10" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#111827] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-[#E5E7EB] text-[#10B981] focus:ring-[#10B981]/50" defaultChecked />
                <span className="text-sm text-[#475569]">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-[#10B981] hover:text-[#059669]">
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" size="md" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-[#94A3B8]">or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full"
            size="md"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
