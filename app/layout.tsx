import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tom Bergson | Graphic Design & Web Development",
  description: "Portfolio of Tom Bergson – Graphic Design, AI Solutions, and Modern Web Development.",
  openGraph: {
    title: "Tom Bergson | Graphic Design & Web Development",
    description: "Graphic Design, AI Solutions, and Modern Web Development.",
    url: "https://tombergson.eu",
    siteName: "Tom Bergson",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-neutral-950 text-neutral-100 antialiased selection:bg-amber-500 selection:text-neutral-950`}>
        {children}
      </body>
    </html>
  );
}