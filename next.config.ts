import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إصلاح Turbopack root warning
  turbopack: {
    root: __dirname,
  },

  images: {
    remotePatterns: [
      // Supabase (Production)
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // localhost (Development — تخزين محلي)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
    // ✅ تعطيل Image Optimization — يحل مشكلة Private IP (localhost)
    unoptimized: true,
  },
};



export default nextConfig;
