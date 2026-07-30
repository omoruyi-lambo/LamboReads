import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.gutenberg.org", pathname: "/**" },
      { protocol: "https", hostname: "gutenberg.org", pathname: "/**" },
      { protocol: "https", hostname: "coresg-normal.trae.ai", pathname: "/**" },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "covers.openlibrary.org", pathname: "/**" },
      // Supabase Storage (avatars, book covers, uploads)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      // Google profile pictures (OAuth)
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
