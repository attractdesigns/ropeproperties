import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Nhost storage — pattern: <subdomain>.storage.<region>.nhost.run
      {
        protocol: "https",
        hostname: "*.storage.*.nhost.run",
      },
    ],
  },
};

export default nextConfig;