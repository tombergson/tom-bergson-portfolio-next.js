import { Palette, Layers, Code2 } from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Graphic & Visual Design",
    description:
      "High-impact vector graphics, premium branding, print materials, and specialized digital assets crafted for modern platforms.",
  },
  {
    icon: Layers,
    title: "Branding Systems",
    description:
      "Comprehensive visual identities, logo development, design tokens, and scalable design guidelines.",
  },
  {
    icon: Code2,
    title: "Modern Web Development",
    description:
      "High-performance websites and web applications built with Next.js, Tailwind CSS, and clean TypeScript.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#050505] relative border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-brand font-bold tracking-widest uppercase text-xs md:text-sm mb-3">
            Capabilities & Focus
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Services
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-8 transition-all duration-300 hover:border-brand/50 hover:bg-neutral-900/40 flex flex-col items-center text-center"
              >
                {/* Red accent glow on hover */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/15 transition-all duration-300 pointer-events-none" />

                {/* Duża wyśrodkowana ikona */}
                <div className="mb-6 p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-brand group-hover:text-white group-hover:bg-brand transition-all duration-300 flex items-center justify-center">
                  <Icon className="w-10 h-10 stroke-[1.5]" />
                </div>

                <h4 className="text-xl font-bold text-white mb-3 tracking-tight">
                  {service.title}
                </h4>

                <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}