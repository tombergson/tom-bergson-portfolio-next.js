import Link from "next/link";
import Header from "@/components/Header";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col justify-between">
      {/* Menu / Header */}
      <Header />

      {/* Główna treść błędu */}
      <div className="flex-1 flex items-center justify-center px-6 py-32 text-center">
        <div className="max-w-md mx-auto space-y-6">
          
          <span className="text-6xl md:text-8xl font-extrabold font-playfair text-[var(--color-brand)] tracking-wider">
            404
          </span>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Page not found
          </h1>

          <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-[var(--color-brand-hover)]"
            >
              ← Back to Home
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