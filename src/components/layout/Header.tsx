"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faChevronDown, faUser, faGauge,
  faBookOpen, faBookmark, faGear, faRightFromBracket,
  faBars, faFire, faStar, faTags, faUserPen, faUpload,
  faUsers, faClockRotateLeft, faBell, faWandMagicSparkles, } from "@fortawesome/free-solid-svg-icons";
import { InstallAppButton } from "@/components/InstallAppButton";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";
import { getCurrentUser, onAuthStateChange, signOut } from "@/lib/supabase/auth";

const BROWSE_ITEMS = [
  { href: "/library",                icon: faBookOpen, label: "All Books",      desc: "Browse the full catalogue" },
  { href: "/library?sort=popular",   icon: faFire,     label: "Trending",       desc: "Most read this week" },
  { href: "/library?sort=ascending", icon: faWandMagicSparkles, label: "New Releases",   desc: "Recently added titles" },
  { href: "/recommendations",        icon: faStar,     label: "Staff Picks", desc: "Hand-selected titles" },
  { href: "/categories",             icon: faTags,     label: "Categories",     desc: "Browse by genre" },
];

const AUTHOR_ITEMS = [
  { href: "/about",                   icon: faUsers,   label: "Featured Authors", desc: "Meet our top writers" },
  { href: "/author/signup",           icon: faUserPen, label: "Become an Author", desc: "Publish your work" },
  { href: "/author/dashboard",        icon: faGauge,   label: "Author Dashboard", desc: "Manage your books" },
  { href: "/author/dashboard/upload", icon: faUpload,  label: "Upload Book",      desc: "Add a new title" },
];

function NavDropdown({ label, items, open, onToggle, onClose }: {
  label: string;
  items: { href: string; icon: any; label: string; desc: string }[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={onToggle} aria-expanded={open}
        className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors duration-150 cursor-pointer select-none",
          open ? "text-[#111827] bg-[#F1F5F9]" : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]")}>
        {label}
        <FontAwesomeIcon icon={faChevronDown} className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-[#E5E7EB] bg-white shadow-xl shadow-black/8 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1.5 space-y-0.5">
            {items.map(({ href, icon, label: l, desc }) => (
              <Link key={href} href={href} onClick={onClose}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-[#F8FAFC] transition-colors group">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] group-hover:bg-[#ECFDF5] transition-colors mt-0.5">
                  <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-[#64748B] group-hover:text-[#10B981]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#111827]">{l}</p>
                  <p className="text-[11px] text-[#94A3B8] leading-snug">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ user, displayName, avatarUrl, initials, open, onToggle, onClose, onLogout }: {
  user: any; displayName: string; avatarUrl: string | null; initials: string;
  open: boolean; onToggle: () => void; onClose: () => void; onLogout: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);

  if (!user) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        <Link href="/login" className="px-3.5 py-1.5 text-[13px] font-semibold text-[#475569] hover:text-[#111827] rounded-lg hover:bg-[#F8FAFC] transition-colors">Sign in</Link>
        <Link href="/signup" className="px-3.5 py-1.5 text-[13px] font-semibold text-white bg-[#0B1220] hover:bg-[#162032] rounded-lg transition-colors shadow-sm">Get started</Link>
      </div>
    );
  }

  const isAdmin  = user?.app_metadata?.role === "admin"  || user?.user_metadata?.role === "admin";
  const isAuthor = user?.app_metadata?.role === "author" || user?.user_metadata?.role === "author";
  const items = [
    { href: "/dashboard/profile",   icon: faUser,            label: "Profile" },
    { href: "/dashboard/history",   icon: faClockRotateLeft, label: "Continue Reading" },
    { href: "/dashboard/library",   icon: faBookOpen,        label: "My Library" },
    { href: "/dashboard/bookmarks", icon: faBookmark,        label: "Favorites" },
    { href: "/dashboard/settings",  icon: faGear,            label: "Settings" },
    ...(isAuthor ? [{ href: "/author/dashboard", icon: faUserPen, label: "Author Dashboard" }] : []),
    ...(isAdmin  ? [{ href: "/admin",            icon: faGauge,   label: "Admin Dashboard" }]  : []),
  ];

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-label="Profile menu"
        className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-[#F8FAFC] transition-colors cursor-pointer">
        {avatarUrl
          ? <img src={avatarUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover ring-1 ring-[#E5E7EB]" />
          : <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0B1220] to-[#1E3A5F] flex items-center justify-center ring-1 ring-[#E5E7EB]">
              <span className="text-[10px] font-bold text-white leading-none">{initials}</span>
            </div>}
        <span className="hidden md:block text-[13px] font-semibold text-[#111827] max-w-[100px] truncate">{displayName.split(" ")[0]}</span>
        <FontAwesomeIcon icon={faChevronDown} className={cn("h-3 w-3 text-[#94A3B8] transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white shadow-xl shadow-black/8 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 py-3 border-b border-[#F1F5F9]">
            <p className="text-[13px] font-semibold text-[#111827] truncate">{displayName}</p>
            <p className="text-[11px] text-[#64748B] truncate mt-0.5">{user.email}</p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {items.map(({ href, icon, label }) => (
              <Link key={href} href={href} onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors">
                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                {label}
              </Link>
            ))}
            <div className="my-1 h-px bg-[#F1F5F9]" />
            <button type="button" onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user,        setUser]        = useState<any>(null);
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [browseOpen,  setBrowseOpen]  = useState(false);
  const [authorsOpen, setAuthorsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Reader";
  const avatarUrl   = user?.user_metadata?.avatar_url ?? null;
  const initials    = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => { if (mounted) setUser(u); });
    const sub = onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => { mounted = false; if (sub && "unsubscribe" in sub) (sub as any).unsubscribe(); };
  }, [pathname]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const closeAll = () => { setBrowseOpen(false); setAuthorsOpen(false); setProfileOpen(false); };

  const handleLogout = async () => {
    await signOut(); setUser(null); closeAll(); router.push("/");
  };

  return (
    <>
      <header className={cn("sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/92 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
                 : "bg-white/80 backdrop-blur-md border-b border-[#F1F5F9]")}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" aria-label="LamboReads" className="flex items-center gap-2.5 shrink-0 group">
            <Image src="/images/logo.png" alt="LamboReads" width={40} height={40} priority
              className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105" />
            <span className="hidden sm:block text-[15px] font-bold tracking-tight text-[#0B1220] select-none">LamboReads</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className={cn("rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors duration-150",
              pathname === "/" ? "text-[#111827] bg-[#F1F5F9]" : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]")}>
              Home
            </Link>
            <NavDropdown label="Browse" items={BROWSE_ITEMS} open={browseOpen}
              onToggle={() => { setAuthorsOpen(false); setProfileOpen(false); setBrowseOpen(v => !v); }}
              onClose={() => setBrowseOpen(false)} />
            <NavDropdown label="Authors" items={AUTHOR_ITEMS} open={authorsOpen}
              onToggle={() => { setBrowseOpen(false); setProfileOpen(false); setAuthorsOpen(v => !v); }}
              onClose={() => setAuthorsOpen(false)} />
            <Link href="/about" className={cn("rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors duration-150",
              pathname === "/about" ? "text-[#111827] bg-[#F1F5F9]" : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]")}>
              About
            </Link>
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 items-center mx-2 max-w-sm">
            <form action="/library" className={cn("relative flex w-full items-center rounded-xl border transition-all duration-300",
              searchOpen ? "border-[#10B981] bg-white shadow-sm" : "border-[#E5E7EB] bg-[#F8FAFC]")}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 h-3.5 w-3.5 text-[#94A3B8] pointer-events-none" />
              <input ref={searchRef} name="search" placeholder="Search books, authors, genres…"
                onFocus={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)}
                className="h-9 w-full bg-transparent pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none" />
            </form>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            {user && (
              <button type="button" aria-label="Notifications"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors relative">
                <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              </button>
            )}
            {user && (
              <Link href="/dashboard/bookmarks" aria-label="Wishlist"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors">
                <FontAwesomeIcon icon={faBookmark} className="h-4 w-4" />
              </Link>
            )}
            <ProfileMenu user={user} displayName={displayName} avatarUrl={avatarUrl} initials={initials}
              open={profileOpen}
              onToggle={() => { closeAll(); setProfileOpen(v => !v); }}
              onClose={() => setProfileOpen(false)}
              onLogout={handleLogout} />
            {/* Mobile hamburger */}
            <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors">
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        displayName={displayName}
        avatarUrl={avatarUrl}
        initials={initials}
        onLogout={handleLogout}
      />
    </>
  );
}
