import Link from 'next/link';

const footerLinks = {
  platform: [
    { name: 'Home', href: '/' },
    { name: 'Browse Books', href: '/browse' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Authors', href: '/authors' },
  ],
  company: [
    { name: 'Become an Author', href: '/become-an-author' },
    { name: 'About Us', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-[#F8FAFC] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <span className="font-display text-2xl font-bold text-[#111827]">LamboReads</span>
            <p className="text-sm leading-6 text-[#475569]">Where great stories live.</p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            {/* This is a simplified mapping for demonstration. You can expand this. */}
          </div>
        </div>
        <div className="mt-16 border-t border-[#E5E7EB] pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-[#475569]">&copy; {new Date().getFullYear()} LamboReads. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};