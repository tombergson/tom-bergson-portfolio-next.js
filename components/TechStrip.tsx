import Image from "next/image";

type TechItem = {
  name: string;
  icon: string;
  scale?: string;
  invert?: boolean;
};

const groups: { items: TechItem[] }[] = [
  {
    items: [
      { name: "Photoshop", icon: "/images/tech/photoshop.webp" },
      { name: "Illustrator", icon: "/images/tech/illustrator.webp" },
      { name: "InDesign", icon: "/images/tech/indesign.webp" },
    ],
  },
  {
    items: [
      { name: "HTML5", icon: "/images/tech/html5.webp" },
      { name: "CSS3", icon: "/images/tech/css3.webp" },
      { name: "React", icon: "/images/tech/react.webp" },
      {
        name: "Next.js",
        icon: "/images/tech/next-js.webp",
        invert: true,
        scale: "scale-150",
      },
      { name: "Laravel", icon: "/images/tech/laravel.webp" },
      { name: "Drupal", icon: "/images/tech/drupal.webp", scale: "scale-150" },
    ],
  },
  {
    items: [
      { name: "Python", icon: "/images/tech/python.webp" },
      { name: "Debian", icon: "/images/tech/debian.webp" },
      {
        name: "OpenAI",
        icon: "/images/tech/openai-logomark.webp",
        invert: true,
      },
    ],
  },
];

/** Jedna płaska taśma: ikony + | między grupami */
function buildStrip() {
  const strip: Array<
    { kind: "icon"; tech: TechItem } | { kind: "divider" }
  > = [];

  groups.forEach((group, gi) => {
    group.items.forEach((tech) => {
      strip.push({ kind: "icon", tech });
    });
    if (gi < groups.length - 1) {
      strip.push({ kind: "divider" });
    }
  });

  // Separator między końcem a początkiem przy zapętleniu marquee
  strip.push({ kind: "divider" });

  return strip;
}

export default function TechStrip() {
  const strip = buildStrip();
  const loop = [...strip, ...strip, ...strip];

  return (
    <section className="py-14 bg-black border-y border-neutral-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs uppercase tracking-widest text-neutral-500 mb-10 font-semibold">
          Powered by Industry-Standard Tools & Technologies
        </p>

        <div className="relative overflow-hidden max-w-5xl mx-auto">
          <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

          <div className="flex w-full overflow-hidden">
            <div
              className="animate-marquee flex items-center gap-10 md:gap-14"
              role="list"
              aria-label="Wykorzystywane technologie"
            >
              {loop.map((entry, index) => {
                const isDuplicate = index >= strip.length;

                if (entry.kind === "divider") {
                  return (
                    <span
                      key={`divider-${index}`}
                      className="shrink-0 text-neutral-600 text-2xl md:text-3xl font-light select-none px-1"
                      aria-hidden="true"
                    >
                      |
                    </span>
                  );
                }

                const { tech } = entry;

                return (
                  <div
                    key={`${tech.name}-${index}`}
                    className="opacity-90 hover:opacity-100 transition-opacity duration-300 group cursor-pointer shrink-0 flex items-center justify-center w-14 h-14 md:w-16 md:h-16"
                    title={tech.name}
                    role={isDuplicate ? undefined : "listitem"}
                    aria-hidden={isDuplicate ? true : undefined}
                  >
                    <Image
                      src={tech.icon}
                      alt={isDuplicate ? "" : tech.name}
                      width={64}
                      height={64}
                      className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-110 ${
                        tech.scale ?? ""
                      } ${tech.invert ? "invert brightness-200" : ""}`}
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