import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/server';

const footerLinks = {
  explore: [
    { href: '/library', label: 'Free Library' },
    { href: '/categories', label: 'Book Categories' },
    { href: '/audiobooks', label: 'Audiobooks' },
    { href: '/recommendations', label: 'Personalized Picks' },
    { href: '/library?sort=popular', label: 'Trending Titles' },
  ],
  account: [
    { href: '/dashboard', label: 'Reading Dashboard' },
    { href: '/dashboard/bookmarks', label: 'Saved Bookmarks' },
    { href: '/dashboard/history', label: 'Reading History' },
    { href: '/dashboard/settings', label: 'Preferences' },
  ],
  support: [
    { href: '/about', label: 'About LamboReads' },
    { href: '/faq', label: 'Frequently Asked Questions' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export async function Footer() {
  let totalBooks = 0;
  if (supabaseAdmin) {
    const { count } = await supabaseAdmin
      .from('books')
      .select('*', { count: 'exact', head: true });
    totalBooks = count ?? 0;
  }

  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1220] text-white shadow-sm overflow-hidden">
                <img src="/images/logo.png" alt="LamboReads" className="h-5 w-5 object-contain" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-[#0B1220]">
                LamboReads
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-[#64748B]">
              Explore {totalBooks.toLocaleString()}+ public-domain literary classics. Read online, save personal bookmarks, listen to audiobooks, and track your reading journey — 100% free with no paywalls.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-xs text-[#94A3B8]">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                Public Domain Open Access
              </span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0B1220] mb-4">
              Explore
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#475569] hover:text-[#10B981] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0B1220] mb-4">
              My Library
            </h4>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#475569] hover:text-[#10B981] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0B1220] mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#475569] hover:text-[#10B981] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-2">
              <a
                href="mailto:lamboreads.support@gmail.com"
                className="text-sm text-[#64748B] hover:text-[#10B981] transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#F1F5F9] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#94A3B8]">
            © {new Date().getFullYear()} LamboReads. All public domain content rights reserved.
          </p>
          <p className="text-sm text-[#94A3B8]">
            Designed for readers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
