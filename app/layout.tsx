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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-neutral-950 text-neutral-100 antialiased selection:bg-[#BE1522] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}