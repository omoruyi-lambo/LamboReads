"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faMagnifyingGlass, faHouse, faBookOpen, faFire,
  faWandMagicSparkles, faStar, faTags, faUsers, faUserPen, faUpload,
  faGauge, faUser, faClockRotateLeft, faBookmark, faGear,
  faRightFromBracket, faRightToBracket, faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { InstallAppButton } from "@/components/InstallAppButton";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  user: any;
  displayName: string;
  avatarUrl: string | null;
  initials: string;
  onLogout: () => void;
}

const NAV_SECTIONS = [
  {
    label: "Discover",
    links: [
      { href: "/",                        icon: faHouse,        label: "Home" },
      { href: "/library",                 icon: faBookOpen,     label: "All Books" },
      { href: "/library?sort=popular",    icon: faFire,         label: "Trending" },
      { href: "/library?sort=ascending",  icon: faWandMagicSparkles, label: "New Releases" },
      { href: "/recommendations",         icon: faStar,         label: "Editor's Picks" },
      { href: "/categories",              icon: faTags,         label: "Categories" },
    ],
  },
  {
    label: "Authors",
    links: [
      { href: "/about",                   icon: faUsers,        label: "Featured Authors" },
      { href: "/author/signup",           icon: faUserPen,      label: "Become an Author" },
      { href: "/author/dashboard",        icon: faGauge,        label: "Author Dashboard" },
      { href: "/author/dashboard/upload", icon: faUpload,       label: "Upload Book" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about",   icon: faUsers, label: "About" },
      { href: "/faq",     icon: faStar,  label: "FAQ" },
    ],
  },
];

export function MobileNav({ open, onClose, user, displayName, avatarUrl, initials, onLogout }: Props) {
  const pathname = usePathname();

  // close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel — slides in from right */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] shrink-0">
              <div className="flex items-center gap-2.5">
                <img src="/images/logo.png" alt="LamboReads" className="h-8 w-8 object-contain" />
                <span className="text-[15px] font-bold tracking-tight text-[#0B1220]">LamboReads</span>
              </div>
              <button type="button" onClick={onClose} aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#111827] transition-colors">
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

              {/* Search */}
              <form action="/library" onSubmit={onClose} className="relative">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
                <input name="search" placeholder="Search books, authors…"
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#10B981] focus:bg-white transition-all" />
              </form>

              {/* User card if logged in */}
              {user && (
                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-3">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover shrink-0" />
                    : <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0B1220] to-[#1E3A5F] flex items-center justify-center shrink-0">
                        <span className="text-[12px] font-bold text-white">{initials}</span>
                      </div>}
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#0B1220] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Nav sections */}
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2 px-1">{section.label}</p>
                  <div className="space-y-0.5">
                    {section.links.map(({ href, icon, label }) => (
                      <Link key={href} href={href} onClick={onClose}
                        className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                          pathname === href ? "bg-[#F1F5F9] text-[#0B1220] font-semibold" : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827]")}>
                        <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* Account section */}
              {user ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2 px-1">Account</p>
                  <div className="space-y-0.5">
                    {[
                      { href: "/dashboard/profile",   icon: faUser,            label: "Profile" },
                      { href: "/dashboard/history",   icon: faClockRotateLeft, label: "Continue Reading" },
                      { href: "/dashboard/library",   icon: faBookOpen,        label: "My Library" },
                      { href: "/dashboard/bookmarks", icon: faBookmark,        label: "Favorites" },
                      { href: "/dashboard/settings",  icon: faGear,            label: "Settings" },
                    ].map(({ href, icon, label }) => (
                      <Link key={href} href={href} onClick={onClose}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors">
                        <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                        {label}
                      </Link>
                    ))}
                    <button type="button" onClick={() => { onLogout(); onClose(); }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                      <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5 shrink-0" />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-semibold text-[#111827] hover:bg-[#F8FAFC] transition-colors">
                    <FontAwesomeIcon icon={faRightToBracket} className="h-4 w-4" />
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#0B1220] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#162032] transition-colors">
                    <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" />
                    Create account
                  </Link>
                </div>
              )}
            </div>

            {/* Footer strip */}
            <div className="shrink-0 border-t border-[#F1F5F9] px-5 py-4">
              <InstallAppButton
                label="Install App"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-[13px] font-semibold text-[#0B1220] hover:bg-white transition-colors" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
