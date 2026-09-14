import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  allowedDevOrigins: ["192.168.8.11"],
};

export default nextConfig;