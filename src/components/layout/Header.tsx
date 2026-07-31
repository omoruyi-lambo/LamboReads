"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  BookOpen,
  Headphones,
  Bookmark,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { InstallAppButton } from "@/components/InstallAppButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getCurrentUser, onAuthStateChange, signOut } from "@/lib/supabase/auth";

const navLinks = [
  { href: "/library", label: "Explore Library", comingSoon: false },
  { href: "/categories", label: "Categories", comingSoon: false },
  { href: "/premium", label: "Premium", comingSoon: true },
  { href: "/audiobooks", label: "Audiobooks", comingSoon: true },
  { href: "/recommendations", label: "For You", comingSoon: false },
  { href: "/about", label: "About", comingSoon: false },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Reader';

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const currentUser = await getCurrentUser();
      if (!mounted) return;
      setUser(currentUser);
    }

    loadUser();

    const subscription = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      if (subscription && 'unsubscribe' in subscription) {
        subscription.unsubscribe();
      }
    };
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setUserDropdownOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1220] text-white shadow-sm overflow-hidden">
            <img src="/images/logo.png" alt="LamboReads" className="h-6 w-6 object-contain" />
          </div>
          <span className="hidden sm:block font-display text-xl font-semibold tracking-tight text-[#0B1220]">
            LamboReads
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-150 relative py-1 flex items-center gap-1.5",
                  isActive ?
                  "text-[#111827] font-semibold" :
                  "text-[#64748B] hover:text-[#111827]"
                )}
              >
                {link.label}
                {link.comingSoon && (
                  <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8] leading-none">
                    Soon
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#10B981]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search & User Profile Actions */}
        <div className="flex items-center gap-2 sm:gap-3 justify-end shrink-0 min-w-0">
          {/* Quick Search */}
          <form action="/library" className="hidden sm:flex relative w-44 md:w-64 lg:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              name="search"
              placeholder="Search title, author, genre..."
              className="pl-10 bg-[#F8FAFC] border-[#E5E7EB] text-[#111827] w-full h-9.5 text-sm rounded-xl focus:bg-white transition-all"
            />
          </form>

          {/* User Account Controls */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-[#E5E7EB] bg-white pl-1 pr-3 py-1 text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all cursor-pointer"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={displayName}
                    className="h-6 w-6 rounded-full object-cover border border-[#E5E7EB]"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-[#F8FAFC] flex items-center justify-center border border-[#E5E7EB]">
                    <User className="h-3.5 w-3.5 text-[#6B7280]" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-semibold text-[#111827]">
                  {displayName.split(" ")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[#94A3B8] transition-transform duration-200" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg transition-all duration-150 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 border-b border-[#F1F5F9] mb-1">
                    <p className="text-sm font-semibold text-[#111827] truncate">{displayName}</p>
                    <p className="text-xs text-[#64748B] truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#94A3B8]" /> Dashboard
                  </Link>
                  <Link
                    href="/dashboard/bookmarks"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
                  >
                    <Bookmark className="h-4 w-4 text-[#94A3B8]" /> Saved Bookmarks
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
                  >
                    <Settings className="h-4 w-4 text-[#94A3B8]" /> Account Settings
                  </Link>
                  <div className="my-1 border-t border-[#F1F5F9]" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-500" /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm" className="text-sm font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="rounded-xl p-2 text-[#64748B] lg:hidden hover:bg-[#F8FAFC] hover:text-[#0B1220] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-[#E5E7EB] bg-white px-4 py-5 lg:hidden animate-in fade-in slide-in-from-top-1">
          <form action="/library" className="mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                name="search"
                placeholder="Search books…"
                className="pl-10 bg-[#F8FAFC] border-[#E5E7EB]"
              />
            </div>
          </form>
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-[#F8FAFC] text-[#0B1220] font-semibold"
                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0B1220]"
                )}
              >
                <span>{link.label}</span>
                {link.comingSoon && (
                  <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8] leading-none">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
            {user ? (
              <div className="space-y-1">
                <div className="px-3.5 py-2 mb-2 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                  <p className="text-xs font-semibold text-[#0B1220]">{displayName}</p>
                  <p className="text-[11px] text-[#64748B]">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[#334155] hover:bg-[#F8FAFC]"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#64748B]" /> Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[#334155] hover:bg-[#F8FAFC]"
                >
                  <Settings className="h-4 w-4 text-[#64748B]" /> Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-red-500" /> Log Out
                </button>
                <InstallAppButton
                  label="Install App"
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC] border border-[#E5E7EB] transition-colors"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">Sign In</Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">Get Started</Button>
                </Link>
                <InstallAppButton
                  label="Install App"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#0B1220] hover:bg-white transition-colors"
                />
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
