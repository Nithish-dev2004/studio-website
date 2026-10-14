import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS v4 is wired into Turbopack through this rule (from the starter template).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Allow next/image to load the placeholder photos from picsum.photos.
    // TODO: when you switch to your real photos (or Supabase Storage), add that hostname here.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
