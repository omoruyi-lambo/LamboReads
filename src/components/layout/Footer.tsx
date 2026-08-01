import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';

const footerLinks = {
  explore: [
    { href: '/library', label: 'Free Library' },
    { href: '/categories', label: 'Categories' },
    { href: '/audiobooks', label: 'Audiobooks' },
    { href: '/recommendations', label: 'For You' },
    { href: '/library?sort=popular', label: 'Trending' },
  ],
  account: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/bookmarks', label: 'Bookmarks' },
    { href: '/dashboard/history', label: 'History' },
    { href: '/dashboard/settings', label: 'Settings' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/author/signup', label: 'Become an Author' },
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
    <footer className="bg-[#0B1220] text-white">
      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-5">
              <img
                src="/images/logo.png"
                alt="LamboReads"
                className="h-12 w-12 object-contain opacity-90"
              />
              <span className="text-lg font-bold tracking-tight text-white">
                LamboReads
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              {totalBooks > 0
                ? `${totalBooks.toLocaleString()}+ public-domain classics. Free to read, save, and download — forever.`
                : 'Thousands of public-domain classics. Free to read, save, and download — forever.'}
            </p>
            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                100% Free
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                No Ads
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                Public Domain
              </span>
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: 'Explore', links: footerLinks.explore },
            { title: 'Account', links: footerLinks.account },
            { title: 'Company', links: footerLinks.company },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} LamboReads. Built for readers everywhere.
          </p>
          <a
            href="mailto:lamboreads.support@gmail.com"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            lamboreads.support@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
