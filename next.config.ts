import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chckt-api.railway.app",
        pathname: "/storage/**",
      },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", pathname: "/storage/**" },
      {
        protocol: "https",
        hostname: "qpzvflzmlkeynunatwoz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Tambahkan dua baris ini:
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
