"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Możesz tutaj zalogować błąd do zewnętrznego systemu (np. Sentry)
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col justify-between">
      {/* Menu / Header */}
      <Header />

      {/* Główna treść błędu */}
      <div className="flex-1 flex items-center justify-center px-6 py-32 text-center">
        <div className="max-w-md mx-auto space-y-6">
          
          <span className="text-5xl md:text-7xl font-extrabold font-playfair text-red-500 tracking-wider">
            Oops!
          </span>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Something went wrong
          </h1>

          <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
            An unexpected error has occurred. We apologize for the inconvenience. You can try refreshing the page or return home.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={
                // Próba ponownego renderowania segmentu
                () => reset()
              }
              className="w-full sm:w-auto rounded-full bg-neutral-800 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-neutral-700"
            >
              Try again
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-[var(--color-brand-hover)]"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>

      {/* Stopka */}
      <footer className="py-8 border-t border-neutral-900 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <span>Designed by</span>
          <a 
            href="https://tombergson.eu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/footer-tb-logo.png"
              alt="Logo"
              width={18}
              height={18}
              className="w-[18px] h-[18px] rounded-sm object-contain scale-110"
            />
          </a>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <span>© {new Date().getFullYear()} Copyright |</span>
          <a 
            href="https://tombergson.eu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-neutral-300 transition-colors"
          >
            tombergson.eu
          </a>
        </div>

        <div>
          <Link 
            href="/privacy-policy" 
            className="hover:text-neutral-300 transition-colors underline underline-offset-4"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </main>
  );
}