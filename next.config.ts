import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "frame-src https://challenges.cloudflare.com",
  `connect-src 'self' https://challenges.cloudflare.com${isDev ? " ws: wss:" : ""}`,
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  allowedDevOrigins: [
    "192.168.8.16",
    "192.168.8.16:3000",
    "192.168.8.11",
    "localhost:3000",
  ],
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        {
          key: "Permissions-Policy",
          value:
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
        },
      ],
    },
  ],
};

export default nextConfig;