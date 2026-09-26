"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Opóźnienie pojawienia się banera (np. 1.5 sekundy)
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <aside 
      aria-label="Cookie consent banner" 
      className="fixed bottom-6 right-6 z-50 max-w-sm p-6 bg-neutral-900 text-neutral-100 rounded-2xl shadow-2xl border border-neutral-800 backdrop-blur-md transition-all duration-300 animate-fade-in"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl" role="img" aria-label="Cookie">🍪</span>
        <div>
          <h3 className="font-semibold text-base text-white">
            Cookie Policy
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
            We use cookies to ensure the website functions properly and for analytics purposes. Find out more in our{" "}
            <Link 
              href="/privacy-policy" 
              className="text-[var(--color-brand)] font-medium underline hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          onClick={handleAccept}
          className="w-full rounded-full bg-[var(--color-brand)] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[var(--color-brand-hover)] hover:shadow-md hover:shadow-[var(--color-brand)]/20 cursor-pointer"
        >
          Accept and enter
        </button>
      </div>
    </aside>
  );
}