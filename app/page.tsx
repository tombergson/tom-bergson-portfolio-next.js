import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import TechStrip from "@/components/TechStrip";
import About from "@/components/About";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      <Services />
      <TechStrip />
      <About />

      {/* Placeholdery na kolejne fazy */}
      <section id="portfolio" className="py-24 border-t border-neutral-900 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Portfolio</h2>
        <p className="text-neutral-500">Galeria w trakcie wdrażania...</p>
      </section>

      <section id="contact" className="py-24 border-t border-neutral-900 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Contact</h2>
        <p className="text-neutral-500">Formularz w trakcie wdrażania...</p>
      </section>

      <footer className="py-8 border-t border-neutral-900 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Tom Bergson. All rights reserved.
      </footer>
    </main>
  );
}