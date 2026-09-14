import Image from "next/image";

const techStack = [
  { name: "Photoshop", icon: "/images/tech/photoshop.webp" },
  { name: "Illustrator", icon: "/images/tech/illustrator.webp" },
  { name: "InDesign", icon: "/images/tech/indesign.webp" },
  { name: "HTML5", icon: "/images/tech/html5.webp" },
  { name: "CSS3", icon: "/images/tech/css3.webp" },
  { name: "Python", icon: "/images/tech/python.webp" },
  { name: "Debian", icon: "/images/tech/debian.webp" },
  { name: "Drupal", icon: "/images/tech/drupal.webp", scale: "scale-150" },
  { name: "OpenAI", icon: "/images/tech/openai-logomark.webp", invert: true },
  { name: "Laravel", icon: "/images/tech/laravel.webp" },
];

export default function TechStrip() {
  const triplicatedTech = [...techStack, ...techStack, ...techStack];

  return (
    <section className="py-14 bg-black border-y border-neutral-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-widest text-neutral-500 mb-10 font-semibold">
          Powered by Industry-Standard Tools & Technologies
        </p>

        {/* Kontener z maską gradientową 25% po obu stronach */}
        <div className="relative overflow-hidden max-w-5xl mx-auto">
          <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

          <div className="flex w-full overflow-hidden">
            <div className="animate-marquee flex items-center gap-14 md:gap-20" role="list" aria-label="Wykorzystywane technologie">
              {triplicatedTech.map((tech, index) => {
                const isDuplicate = index >= techStack.length;
                return (
                  <div
                    key={`${tech.name}-${index}`}
                    className="opacity-90 hover:opacity-100 transition-opacity duration-300 group cursor-pointer shrink-0 flex items-center justify-center w-14 h-14 md:w-16 md:h-16"
                    title={tech.name}
                    role={isDuplicate ? undefined : "listitem"}
                    aria-hidden={isDuplicate ? "true" : undefined}
                  >
                    <Image
                      src={tech.icon}
                      alt={isDuplicate ? "" : tech.name}
                      width={64}
                      height={64}
                      className={`max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 ${
                        tech.scale ? tech.scale : ""
                      } group-hover:scale-110 ${
                        tech.invert ? "invert brightness-200" : ""
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}