"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faXTwitter,
  faInstagram,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

// ── Data ─────────────────────────────────────────────────────────────────────

const NAV = [
  {
    label: "Explore",
    links: [
      { href: "/library",            label: "Library" },
      { href: "/categories",         label: "Categories" },
      { href: "/audiobooks",         label: "Audiobooks" },
      { href: "/library?sort=popular", label: "Trending" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/dashboard",          label: "Dashboard" },
      { href: "/dashboard/bookmarks", label: "Bookmarks" },
      { href: "/dashboard/history",  label: "Reading History" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about",              label: "About" },
      { href: "/author/signup",      label: "Become an Author" },
      { href: "mailto:lamboreads.support@gmail.com", label: "Contact" },
      { href: "/faq",                label: "FAQ" },
    ],
  },
];

const SOCIAL = [
  { icon: faFacebook,  href: "https://facebook.com",  label: "Facebook"  },
  { icon: faXTwitter,  href: "https://x.com",         label: "X"         },
  { icon: faInstagram, href: "https://instagram.com",  label: "Instagram" },
  { icon: faLinkedin,  href: "https://linkedin.com",   label: "LinkedIn"  },
  { icon: faGithub,    href: "https://github.com/omoruyi-lambo/LamboReads", label: "GitHub" },
];

// ── Fade-in on scroll hook ────────────────────────────────────────────────────

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ── Mobile accordion ─────────────────────────────────────────────────────────

function Accordion({ section }: { section: typeof NAV[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-200"
        aria-expanded={open}
      >
        {section.label}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={cn(
            "h-3 w-3 text-white/40 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          open ? "max-h-60 pb-4" : "max-h-0"
        )}
      >
        <ul className="space-y-3">
          {section.links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-white/50 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

export function Footer() {
  const { ref, visible } = useFadeIn();

  return (
    <footer
      ref={ref}
      style={{ backgroundColor: "#08111F" }}
      className={cn(
        "text-white transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      aria-label="Site footer"
    >
      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:px-8">

        {/* ── Desktop layout ────────────────────────────────────────────── */}
        <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] lg:gap-12">

          {/* Brand column */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group" aria-label="LamboReads home">
              <img
                src="/images/logo.png"
                alt="LamboReads"
                className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-[17px] font-bold tracking-tight text-white">
                LamboReads
              </span>
            </Link>

            <p className="text-[15px] font-semibold text-white leading-tight">
              Read. Learn. Grow.
            </p>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#10B981] uppercase tracking-widest">
                1,500+ Public Domain Books
              </p>
              <p className="text-sm text-white/50 leading-relaxed max-w-[220px]">
                Free forever. Carefully curated classics anyone can read.
              </p>
            </div>
          </div>

          {/* Nav columns */}
          {NAV.map((section) => (
            <div key={section.label} className="space-y-5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
                {section.label}
              </h4>
              <ul className="space-y-3">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group/link inline-flex items-center text-sm text-white/55 hover:text-white transition-all duration-200"
                    >
                      <span className="transition-transform duration-200 group-hover/link:translate-x-1">
                        {l.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social column */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
              Follow Us
            </h4>
            <div className="flex flex-col gap-3">
              {SOCIAL.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group/icon inline-flex items-center gap-3 text-sm text-white/55 hover:text-white transition-all duration-200"
                >
                  <FontAwesomeIcon
                    icon={icon}
                    className="h-4 w-4 transition-transform duration-200 group-hover/icon:scale-110"
                  />
                  <span className="transition-transform duration-200 group-hover/icon:translate-x-1">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile layout ─────────────────────────────────────────────── */}
        <div className="lg:hidden space-y-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="LamboReads home">
              <img
                src="/images/logo.png"
                alt="LamboReads"
                className="h-10 w-10 object-contain"
              />
              <span className="text-[17px] font-bold tracking-tight text-white">
                LamboReads
              </span>
            </Link>
            <p className="text-[15px] font-semibold text-white">Read. Learn. Grow.</p>
            <div>
              <p className="text-xs font-semibold text-[#10B981] uppercase tracking-widest mb-1">
                1,500+ Public Domain Books
              </p>
              <p className="text-sm text-white/50 leading-relaxed">
                Free forever. Carefully curated classics anyone can read.
              </p>
            </div>
          </div>

          {/* Accordions — only one open at a time handled per component */}
          <div>
            {NAV.map((section) => (
              <Accordion key={section.label} section={section} />
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center justify-center gap-6 pt-2">
            {SOCIAL.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/40 hover:text-white transition-all duration-200 hover:scale-110"
              >
                <FontAwesomeIcon icon={icon} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.07]">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} LamboReads
            </p>
            <p className="text-xs text-white/30 hidden sm:block">
              Built for readers everywhere.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-xs text-white/30 hover:text-white/70 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="text-white/20 text-xs">·</span>
              <Link
                href="/terms"
                className="text-xs text-white/30 hover:text-white/70 transition-colors duration-200"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
