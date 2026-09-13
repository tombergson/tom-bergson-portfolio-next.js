import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Header />
      <Hero />

      {/* Placeholdery pod kolejne Fazy */}
      <section id="services" className="py-24 border-t border-neutral-900/60 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Services</h2>
        <p className="text-neutral-500">Sekcja w trakcie wdrażania (Faza 2)...</p>
      </section>

      <section id="about" className="py-24 border-t border-neutral-900/60 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">About</h2>
        <p className="text-neutral-500">Sekcja w trakcie wdrażania (Faza 2)...</p>
      </section>

      <section id="portfolio" className="py-24 border-t border-neutral-900/60 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Portfolio</h2>
        <p className="text-neutral-500">Galeria w trakcie wdrażania (Faza 3)...</p>
      </section>

      <section id="contact" className="py-24 border-t border-neutral-900/60 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Contact</h2>
        <p className="text-neutral-500">Formularz w trakcie wdrażania (Faza 4)...</p>
      </section>

      <footer className="py-8 border-t border-neutral-900 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Tom Bergson. All rights reserved.
      </footer>
    </main>
  );
}