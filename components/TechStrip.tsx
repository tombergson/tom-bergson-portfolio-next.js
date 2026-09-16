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
      { name: "Photoshop", icon: "/images/tech/Adobe-Photoshop.svg" },
      { name: "Illustrator", icon: "/images/tech/Adobe-Illustrator.svg" },
      { name: "VS Code", icon: "/images/tech/VSCode.svg" },
    ],
  },
  {
    items: [
      { name: "HTML5", icon: "/images/tech/HTML5.svg" },
      { name: "CSS3", icon: "/images/tech/CSS3.svg" },
      { name: "Bootstrap", icon: "/images/tech/Bootstrap.svg" },
      { name: "React", icon: "/images/tech/React.svg" },
      { name: "Next.js", icon: "/images/tech/Next.js.svg", invert: true },
      { name: "Laravel", icon: "/images/tech/Laravel.svg" },
      { name: "Drupal", icon: "/images/tech/Drupal.svg" },
    ],
  },
  {
    items: [
      { name: "Python", icon: "/images/tech/Python.svg" },
      { name: "Bash", icon: "/images/tech/Bash.svg", invert: true },
      { name: "JSON", icon: "/images/tech/JSON.svg", invert: true },
      { name: "Redis", icon: "/images/tech/Redis.svg" },
    ],
  },
  {
    items: [
      { name: "Docker", icon: "/images/tech/Docker.svg" },
      { name: "Debian", icon: "/images/tech/Debian.svg" },
      { name: "Fedora", icon: "/images/tech/Fedora.svg" },
      { name: "Red Hat", icon: "/images/tech/Red-Hat.svg" },
      { name: "NGINX", icon: "/images/tech/NGINX.svg" },
      { name: "Cloudflare", icon: "/images/tech/Cloudflare.svg" },
      { name: "Ansible", icon: "/images/tech/Ansible.svg" },
      { name: "Vault", icon: "/images/tech/HashiCorp-Vault.svg" },
      { name: "Git", icon: "/images/tech/Git.svg" },
      { name: "GitHub", icon: "/images/tech/GitHub.svg", invert: true },
    ],
  },
];

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

          <div className="flex w-full overflow-hidden py-10">
            <div
              className="animate-marquee flex items-center gap-10 md:gap-14"
              role="list"
              aria-label="Wykorzystywane technologie"
            >
              {loop.map((entry, index) => {
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
                    className="relative opacity-90 hover:opacity-100 transition-opacity duration-300 group cursor-pointer shrink-0 flex items-center justify-center w-14 h-14 md:w-16 md:h-16"
                    role="listitem"
                  >
                    <Image
                      src={tech.icon}
                      alt={tech.name}
                      width={64}
                      height={64}
                      className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-110 ${
                        tech.scale ?? ""
                      } ${tech.invert ? "invert brightness-200" : ""}`}
                    />

                    <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-900 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                      {tech.name}
                    </span>
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