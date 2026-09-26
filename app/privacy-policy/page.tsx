import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

export const metadata = {
  title: "Privacy Policy | Tom Bergson",
  description: "Privacy Policy and cookie usage information for Tom Bergson portfolio website.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      {/* Menu / Header */}
      <Header />

      {/* Główna treść */}
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24 md:py-40 space-y-12">

        {/* Nagłówek */}
        <header className="space-y-4 border-b border-neutral-800 pb-8">
          <h1 className="text-3xl md:text-5xl font-bold font-playfair text-white tracking-wide">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-400">
            Last updated: September 26, 2026
          </p>
        </header>

        {/* Sekcje treści */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-neutral-300">

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              1. Data Controller
            </h2>
            <p>
              The data controller responsible for your personal data processed through this
              website is [FULL LEGAL NAME / BUSINESS NAME], [ADDRESS], [NIP / REGON if
              applicable], reachable at [CONTACT EMAIL]. This policy is provided in accordance
              with Regulation (EU) 2016/679 (GDPR) and the Polish Act of 10 May 2018 on the
              Protection of Personal Data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              2. What Data We Collect and Why
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li>
                <strong className="text-neutral-200">Contact form data</strong> (name, email
                address, message content): processed to respond to your inquiry. Legal basis:
                Art. 6(1)(f) GDPR — our legitimate interest in responding to messages sent to us,
                or Art. 6(1)(b) where the inquiry relates to a contract you wish to enter into.
              </li>
              <li>
                <strong className="text-neutral-200">Technical data</strong> (IP address, browser
                type, device information, pages visited): collected automatically for security
                and analytics purposes. Legal basis: Art. 6(1)(f) GDPR — legitimate interest in
                maintaining and securing the website.
              </li>
              <li>
                <strong className="text-neutral-200">Cookie-based data</strong>: collected only
                where described in Section 3, based on your consent (Art. 6(1)(a) GDPR) except
                for strictly necessary cookies, which do not require consent under Art. 173(3) of
                the Polish Telecommunications Law.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              3. Cookies
            </h2>
            <p>
              We use cookies and similar technologies. When you first visit the site, a cookie
              banner lets you accept or reject non-essential cookies; you can change your choice
              at any time by clearing your browser&apos;s cookie storage for this site and
              revisiting.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li>
                <strong className="text-neutral-200">Essential cookies:</strong> required for the
                website to function and to remember your cookie consent choice. Set without
                consent, as permitted by Art. 173(3) of the Polish Telecommunications Law.
              </li>
              <li>
                <strong className="text-neutral-200">Analytics cookies:</strong> used, only with
                your consent, to understand how visitors use the website. [Name the specific
                provider, e.g. Google Analytics / Plausible / none, and link to its own privacy
                policy.]
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              4. Data Retention
            </h2>
            <p>
              Contact form submissions are retained for [X months/years] or until you request
              deletion, whichever comes first. Technical/log data is retained for [X days] for
              security purposes. Cookie consent choices are stored for up to 12 months.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              5. Recipients and International Transfers
            </h2>
            <p>
              Your data may be processed by service providers acting on our behalf, such as our
              hosting provider [NAME] and email delivery provider [NAME], strictly for the
              purposes described above. [If any provider is located outside the EEA, state the
              transfer mechanism, e.g. Standard Contractual Clauses, here. If all providers are
              within the EEA, state that instead.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              6. Your Rights
            </h2>
            <p>Under the GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li>access the personal data we hold about you;</li>
              <li>request rectification of inaccurate data;</li>
              <li>request erasure of your data (&quot;right to be forgotten&quot;);</li>
              <li>request restriction of processing;</li>
              <li>object to processing based on our legitimate interest;</li>
              <li>request data portability, where technically feasible;</li>
              <li>withdraw consent at any time, without affecting prior lawful processing;</li>
              <li>
                lodge a complaint with the Polish supervisory authority, the President of the
                Personal Data Protection Office (Prezes Urzędu Ochrony Danych Osobowych, UODO),
                ul. Stawki 2, 00-193 Warszawa, or with the supervisory authority of your EU
                country of residence.
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us at [CONTACT EMAIL]. We will respond
              within one month, as required by Art. 12(3) GDPR.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              7. Third-Party Links
            </h2>
            <p>
              This website may contain links to third-party sites not operated by us. We are not
              responsible for the privacy practices of those sites and recommend reviewing their
              own privacy policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. Material changes will be reflected by
              updating the &quot;Last updated&quot; date above. We encourage you to review this
              page periodically.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white font-playfair">
              9. Contact
            </h2>
            <p>
              For any questions about this Privacy Policy or how your data is processed, contact
              us at [CONTACT EMAIL] or through the contact form on the main page of this website.
            </p>
          </section>

        </div>

        {/* Powrót do strony głównej */}
        <div className="pt-8 border-t border-neutral-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-[var(--color-brand-hover)]"
          >
            ← Back to Home
          </Link>
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