import Link from "next/link";
import Image from "next/image";
import ParticlesBackground from "./ParticlesBackground";
import AnimatedText from "./AnimatedText";

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden bg-black">
      {/* Background Image - Rozjaśniony obrazek (opacity-85) */}
      <div className="absolute inset-0 z-0 opacity-85">
        <Image
          src="/images/background.webp"
          alt="Hero background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Interaktywny efekt cząsteczek nad obrazkiem */}
      <ParticlesBackground />

      {/* Lżejszy gradient overlay dla zachowania czytelności tekstu */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
        <h2 className="text-brand font-bold tracking-widest uppercase mb-4 text-xs md:text-sm drop-shadow-md">
          Graphic Design & Web Development
        </h2>
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-lg">
          Crafting Visual Identities & Digital Experiences
        </h1>
        <p className="text-neutral-400 text-base md:text-xl max-w-2xl leading-relaxed mb-10 font-mono min-h-[4rem] mx-auto">
          <AnimatedText text="Specializing in premium graphic design, branding systems, and modern web applications." />
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#portfolio"
            className="w-full sm:w-auto px-8 py-3.5 bg-brand text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-[#BE1522]/40"
          >
            View Portfolio
          </Link>
          <Link
            href="#contact"
            className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700/80 font-semibold rounded-lg transition-all backdrop-blur-sm"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}