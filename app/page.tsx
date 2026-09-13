import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import TechStrip from "@/components/TechStrip";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      <Services />
      <TechStrip />
      <About />
      <Portfolio />
      <Contact />

      <footer className="py-8 border-t border-neutral-900 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Tom Bergson. All rights reserved.
      </footer>
    </main>
  );
}