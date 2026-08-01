import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { IOSInstallBanner } from "@/components/IOSInstallBanner";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://lamboreads.com"
  ),
  title: "LamboReads",
  description:
    "Read and download free books. Save your progress and build your library.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LamboReads",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/favicon-32x32.png",
  },
  openGraph: {
    title: "LamboReads",
    description:
      "Read and download free books. Save your progress and build your library.",
    type: "website",
    locale: "en_US",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "LamboReads" }],
  },
  twitter: {
    card: "summary",
    title: "LamboReads",
    description:
      "Free books. Read, save, and track your progress.",
    images: ["/icons/icon-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA: iOS splash / status bar */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LamboReads" />
        {/* MS Tiles */}
        <meta name="msapplication-TileColor" content="#0B1220" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased bg-white">
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster position="bottom-right" richColors closeButton />
        <ServiceWorkerRegistration />
        <PWAInstallPrompt />
        <IOSInstallBanner />
      </body>
    </html>
  );
}
