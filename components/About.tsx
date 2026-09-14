import Image from "next/image";
import { Terminal, Sparkles, CheckCircle2 } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 bg-black relative border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Kolumna lewa: Zdjęcie / Grafika profilowa */}
          <div className="lg:col-span-5 relative mb-10 lg:mb-0">
            <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
              <Image
                src="/images/project.webp"
                alt="Tom Bergson"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 448px"
                className="object-cover object-center grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            </div>

            {/* Badge - Doświadczenie */}
            <div className="absolute -bottom-6 right-4 sm:right-8 bg-neutral-900/90 border border-neutral-800 backdrop-blur-md p-4 rounded-xl shadow-xl flex items-center gap-3">
              <span className="text-3xl font-extrabold text-brand">20+</span>
              <div className="text-xs text-neutral-300 font-mono leading-tight">
                Years of Design<br />& Systems Experience
              </div>
            </div>
          </div>

          {/* Kolumna prawy: Treść O Mnie */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="text-brand font-bold tracking-widest uppercase text-xs md:text-sm mb-3">
              What Can I Do For You
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6">
              Hi, I’m Tom Bergson
            </h3>

            <p className="text-neutral-300 text-base md:text-lg leading-relaxed mb-6 font-sans">
              A freelance graphic designer passionate about crafting impactful designs that elevate brand identities and convey messages with clarity.
            </p>

            <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-6">
              With over 20 years of experience (I started on CorelDRAW 9) and a keen eye for the future, I leverage industry-standard software like Adobe Creative Suite (Photoshop, Illustrator, InDesign) alongside the potential of AI.
            </p>

            {/* Kluczowe obszary ekspertyzy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800/80 p-3 rounded-lg text-sm text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                <span>Logo & Branding</span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800/80 p-3 rounded-lg text-sm text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                <span>Marketing & Web</span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800/80 p-3 rounded-lg text-sm text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                <span>Packaging Solutions</span>
              </div>
            </div>

            <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-6">
              I cater to small businesses, non-profits, and corporations, working collaboratively to bring your vision to life. Excellent communication and project management skills ensure timely delivery within budget.
            </p>

            {/* Sekcja AI i Linux/Python */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-900">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-900 rounded-lg text-brand border border-neutral-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-1">AI Integration</h4>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Exploring AI workflows to enhance creativity and turnaround efficiency.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-900 rounded-lg text-brand border border-neutral-800">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-1">Linux & Automation</h4>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Python scripting and Linux environment for design task automation.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}