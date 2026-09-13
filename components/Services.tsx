import Image from "next/image";

const services = [
  {
    id: "graphic-design",
    title: "Graphic & Tactical Design",
    description: "Military-inspired vector graphics, high-impact branding, print materials, and specialized digital assets.",
    icon: "/images/logo-icon.webp",
  },
  {
    id: "branding-identity",
    title: "Branding Systems",
    description: "Comprehensive visual identities, logo development, design tokens, and scalable design guidelines.",
    icon: "/images/project.webp",
  },
  {
    id: "web-development",
    title: "Modern Web Development",
    description: "High-performance websites and web applications built with Next.js, Tailwind CSS, and clean TypeScript.",
    icon: "/images/webicon.webp",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-28 bg-neutral-950 border-t border-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-brand font-bold tracking-widest uppercase mb-3 text-xs md:text-sm">
            What I Do
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Specialized Services & Craft
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center hover:border-brand/70 transition-all duration-300 hover:-translate-y-2 group shadow-xl hover:shadow-brand/10"
            >
              <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-2xl bg-neutral-950 border border-neutral-800 group-hover:border-brand/50 transition-colors shadow-inner">
                <Image
                  src={service.icon}
                  alt={service.title}
                  width={64}
                  height={64}
                  className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-brand transition-colors">
                {service.title}
              </h4>
              <p className="text-neutral-400 text-base leading-relaxed max-w-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}