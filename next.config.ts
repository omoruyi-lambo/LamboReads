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
    ],
  },
};

export default nextConfig;
