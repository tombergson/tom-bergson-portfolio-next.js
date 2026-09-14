import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tombergson.eu"),
  title: {
    default: "Tom Bergson | Graphic Design & Web Development",
    template: "%s | Tom Bergson",
  },
  description:
    "Portfolio of Tom Bergson – Graphic Design, AI Solutions, and Modern Web Development.",
  keywords: [
    "Tom Bergson",
    "Graphic Design",
    "Web Development",
    "AI Solutions",
    "Branding",
    "UI/UX Design",
    "Next.js Developer",
    "Portfolio",
  ],
  authors: [{ name: "Tom Bergson", url: "https://tombergson.eu" }],
  creator: "Tom Bergson",
  publisher: "Tom Bergson",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tombergson.eu",
    title: "Tom Bergson | Graphic Design & Web Development",
    description:
      "Portfolio of Tom Bergson – Graphic Design, AI Solutions, and Modern Web Development.",
    siteName: "Tom Bergson Portfolio",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Tom Bergson — Graphic Design & Web Development Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tom Bergson | Graphic Design & Web Development",
    description:
      "Portfolio of Tom Bergson – Graphic Design, AI Solutions, and Modern Web Development.",
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} font-sans bg-neutral-950 text-neutral-100 antialiased selection:bg-[#BE1522] selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}