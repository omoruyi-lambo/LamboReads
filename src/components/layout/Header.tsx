"use client";

import Link from "next/link";
import Image from "next/image";
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
  Bookmark,
  LayoutDashboard,
} from "lucide-react";
import { InstallAppButton } from "@/components/InstallAppButton";
import { cn } from "@/lib/utils";
import { getCurrentUser, onAuthStateChange, signOut } from "@/lib/supabase/auth";

const navLinks = [
  { href: "/library", label: "Library" },
  { href: "/categories", label: "Categories" },
  { href: "/premium", label: "Premium", soon: true },
  { href: "/audiobooks", label: "Audiobooks", soon: true },
  { href: "/recommendations", label: "For You" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Reader";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => { if (mounted) setUser(u); });
    const sub = onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => {
      mounted = false;
      if (sub && "unsubscribe" in sub) (sub as any).unsubscribe();
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_#E5E7EB]"
          : "bg-white/80 backdrop-blur-md border-b border-[#F1F5F9]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">

        {/* ── Logo ───────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="LamboReads home"
        >
          <Image
            src="/images/logo.png"
            alt="LamboReads"
            width={40}
            height={40}
            className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
            priority
          />
          <span className="hidden sm:block text-[15px] font-bold tracking-tight text-[#0B1220] select-none">
            LamboReads
          </span>
        </Link>

        {/* ── Desktop nav ─────────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors duration-150",
                  isActive
                    ? "text-[#111827] bg-[#F1F5F9]"
                    : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]"
                )}
              >
                {link.label}
                {link.soon && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#10B981] leading-none">
                    Soon
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#10B981]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right side ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Search — expands inline on desktop */}
          <div className="relative hidden sm:flex items-center">
            <form
              action="/library"
              className={cn(
                "flex items-center overflow-hidden rounded-xl border transition-all duration-300",
                searchOpen
                  ? "w-56 md:w-72 border-[#10B981] bg-white shadow-sm"
                  : "w-9 border-transparent bg-transparent"
              )}
            >
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="flex h-9 w-9 shrink-0 items-center justify-center text-[#64748B] hover:text-[#111827] transition-colors"
                aria-label="Toggle search"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                ref={searchRef}
                name="search"
                placeholder="Search books, authors…"
                className={cn(
                  "flex-1 bg-transparent py-2 pr-3 text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none transition-all duration-300",
                  searchOpen ? "opacity-100 w-full" : "opacity-0 w-0"
                )}
                onBlur={() => setSearchOpen(false)}
              />
            </form>
          </div>

          {/* Auth */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-[#E5E7EB]"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0B1220] to-[#1E3A5F] flex items-center justify-center ring-1 ring-[#E5E7EB]">
                    <span className="text-[10px] font-bold text-white">{initials}</span>
                  </div>
                )}
                <span className="hidden md:block text-[13px] font-semibold text-[#111827] max-w-[100px] truncate">
                  {displayName.split(" ")[0]}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-[#94A3B8] transition-transform duration-200",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white shadow-xl shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-3 border-b border-[#F1F5F9]">
                    <p className="text-sm font-semibold text-[#111827] truncate">{displayName}</p>
                    <p className="text-xs text-[#64748B] truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {[
                      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                      { href: "/dashboard/bookmarks", icon: Bookmark, label: "Bookmarks" },
                      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
                      >
                        <Icon className="h-4 w-4 text-[#94A3B8]" />
                        {label}
                      </Link>
                    ))}
                    <div className="my-1 h-px bg-[#F1F5F9]" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-[13px] font-semibold text-[#475569] hover:text-[#111827] transition-colors rounded-lg hover:bg-[#F8FAFC]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 text-[13px] font-semibold text-white bg-[#0B1220] hover:bg-[#162032] rounded-lg transition-colors shadow-sm"
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#F1F5F9] bg-white/95 backdrop-blur-xl px-4 pb-6 pt-4 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Mobile search */}
          <form action="/library" className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="search"
              placeholder="Search books, authors…"
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#10B981] focus:bg-white transition-all"
            />
          </form>

          {/* Nav links */}
          <div className="space-y-0.5 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-[#F1F5F9] text-[#0B1220] font-semibold"
                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0B1220]"
                )}
              >
                <span>{link.label}</span>
                {link.soon && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#10B981]">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="border-t border-[#F1F5F9] pt-4">
            {user ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-3.5 py-3 mb-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0B1220] to-[#1E3A5F] flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white">{initials}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0B1220] truncate">{displayName}</p>
                    <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                  </div>
                </div>
                {[
                  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[#334155] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <Icon className="h-4 w-4 text-[#64748B]" />
                    {label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
                <InstallAppButton
                  label="Install App"
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] border border-[#E5E7EB] transition-colors mt-1"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#F8FAFC] transition-colors">
                    Sign in
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <button className="w-full rounded-xl bg-[#0B1220] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162032] transition-colors">
                    Get started
                  </button>
                </Link>
                <InstallAppButton
                  label="Install App"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#0B1220] hover:bg-white transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
