import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  allowedDevOrigins: [
    "192.168.8.16",
    "192.168.8.16:3000",
    "192.168.8.11",
    "localhost:3000",
  ],
  headers: async () => {
    const isDev = process.env.NODE_ENV === "development";

    // W trybie dev musimy zezwolić ws: i wss: dla przeładowywania Next.js (HMR)
    const connectSrc = [
      "'self'",
      "https://api.resend.com",
      "https://challenges.cloudflare.com",
      isDev ? "ws:" : "",
      isDev ? "wss:" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const cspValue = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
      "frame-src https://challenges.cloudflare.com",
      `connect-src ${connectSrc}`,
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]
      .join("; ")
      .replace(/\s{2,}/g, " ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspValue,
          },
        ],
      },
    ];
  },
};

export default nextConfig;