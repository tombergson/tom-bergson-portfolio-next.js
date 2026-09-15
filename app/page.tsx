import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import TechStrip from "@/components/TechStrip";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Image from "next/image";

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

      <footer className="py-8 border-t border-neutral-900 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
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
        <div>
          © {new Date().getFullYear()} Copyright |{" "}
          <a 
            href="https://tombergson.eu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-neutral-300 transition-colors"
          >
            tombergson.eu
          </a>
        </div>
      </footer>
    </main>
  );
}