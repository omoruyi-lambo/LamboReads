import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/CookieBanner";

/**
 * Public-site layout — wraps every non-admin route with the shared
 * Header, Footer, and CookieBanner.  The /admin tree uses its own
 * layout and never renders these components.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
