"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ExternalLink } from "lucide-react";

type ProjectCategory = "all" | "calendar" | "poster" | "coin" | "sportswear" | "logo" | "web";

interface Project {
  id: string;
  title: string;
  categories: ProjectCategory[];
  categoryLabel: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  linkLabel?: string;
}

const projects: Project[] = [
  {
    id: "1",
    title: "Kalendarz Forum Broni 2018",
    categories: ["calendar"],
    categoryLabel: "Calendar",
    description: "Autorski projekt kalendarza ściennego przygotowany dla społeczności pasjonatów broni.",
    image: "/portfolio/kalendarz-forum-bron-2018.webp",
    tags: ["Print", "Calendar", "Typography"],
  },
  {
    id: "2",
    title: "Kalendarz Forum Broni 2019",
    categories: ["calendar"],
    categoryLabel: "Calendar",
    description: "Edycja 2019 wielkoformatowego kalendarza z dedykowaną oprawą graficzną i składem.",
    image: "/portfolio/kalendarz-forum-bron-2019.webp",
    tags: ["Print", "Editorial", "Design"],
  },
  {
    id: "3",
    title: "Plakat Piknik Pszczelarski 2018",
    categories: ["poster"],
    categoryLabel: "Poster",
    description: "Projekt plakatu promocyjnego na wydarzenie plenerowe o wysokiej czytelności i wyrazistym stylu.",
    image: "/portfolio/plakat-piknik-pszczelarski-2018.webp",
    tags: ["Poster", "Branding", "Event"],
  },
  {
    id: "4",
    title: "Ceny Broni - logo",
    categories: ["logo"],
    categoryLabel: "Logo",
    description: "Przejrzyste logo dla serwisu cenybroni.pl.",
    image: "/portfolio/ceny-broni_gal.webp",
    tags: ["Infographic", "Vector", "Poster"],
    link: "https://cenybroni.pl",
    linkLabel: "cenybroni.pl",
  },
  {
    id: "5",
    title: "Ulotka i Materiały Promocyjne",
    categories: ["poster"],
    categoryLabel: "Poster",
    description: "Komercyjny projekt ulotki gastronomicznej z nastawieniem na ekspozycję oferty i nowoczesny układ.",
    image: "/portfolio/ulotka-kebab.webp",
    tags: ["Print", "Marketing", "Flyer"],
  },
  {
    id: "6",
    title: "Pamiątkowa Moneta Kolekcjonerska",
    categories: ["coin"],
    categoryLabel: "Coin",
    description: "Wektorowy projekt trójwymiarowej monety kolekcjonerskiej z precyzyjnym reliefem.",
    image: "/portfolio/coin.webp",
    tags: ["3D Relief", "Coin Design", "Vector"],
  },
  {
    id: "7",
    title: "Medal Pamiątkowy NSHM",
    categories: ["coin"],
    categoryLabel: "Coin",
    description: "Grawerowany projekt medalu okolicznościowego z dbałością o detale numizmatyczne.",
    image: "/portfolio/medal-nshm.webp",
    tags: ["Medal", "Metalwork", "Vector Art"],
  },
  {
    id: "8",
    title: "Forca Dęblin Visual Concept",
    categories: ["sportswear"],
    categoryLabel: "Sportswear",
    description: "Projekt wizualny oraz wzornictwo sportowe nastawione na nowoczesną alokację i dynamikę krojów.",
    image: "/portfolio/MOSAIC.webp",
    tags: ["Sportswear", "Apparel", "Design"],
  },
  {
    id: "9",
    title: "Koło Pszczelarzy w Dęblinie - System Wizualny",
    categories: ["logo"],
    categoryLabel: "Logo",
    description: "System wizualny, znak graficzny oraz obecność cyfrowa dopasowana do wymogów organizacji.",
    image: "/portfolio/pzp1.webp",
    tags: ["Logo", "Web Design", "Vector"],
  },
  {
    id: "10",
    title: "Miody Staropolskie - Kompleksowa Identyfikacja Wizualna",
    categories: ["logo", "web"],
    categoryLabel: "Logo & Web",
    description: "Kompleksowa identyfikacja wizualna, branding produktowy oraz serwis internetowy marki.",
    image: "/portfolio/miody-staropolskie-2023.webp",
    tags: ["Branding", "Web Development", "E-Commerce"],
    link: "https://miodystaropolskie.pl",
    linkLabel: "miodystaropolskie.pl",
  },
  {
    id: "11",
    title: "Nadwiślańskie Stowarzyszenie Historii Militarnej - branding i serwis internetowy",
    categories: ["logo", "web"],
    categoryLabel: "Logo & Web",
    description: "Zestaw wektorowych zasobów graficznych, znaków towarowych oraz architektury serwisu WWW.",
    image: "/portfolio/master-file.webp",
    tags: ["Logo Design", "Web Ecosystem", "Assets"],
    link: "https://nshm.org.pl",
    linkLabel: "nshm.org.pl",
  },
  {
    id: "12",
    title: "Shooting Team Custom Project",
    categories: ["logo"],
    categoryLabel: "Logo",
    description: "Identyfikacja wizualna oraz rozszerzona obecność cyfrowa dla zespołu strzeleckiego.",
    image: "/portfolio/shootinh-team.webp",
    tags: ["Logo", "Web Architecture", "Branding"],
  },
];

const categories: { key: ProjectCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "calendar", label: "Calendar" },
  { key: "poster", label: "Poster" },
  { key: "coin", label: "Coin" },
  { key: "sportswear", label: "Sportswear" },
  { key: "logo", label: "Logo" },
  { key: "web", label: "Web" },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Blokada scrolla w body oraz obsługa klawisza ESC podczas otwartego modala
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setSelectedProject(null);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedProject]);

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(activeCategory));

  return (
    <section id="portfolio" className="py-20 bg-[#080808] relative border-b border-neutral-900/60">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Nagłówek sekcji */}
        <div className="text-center mb-10">
          <span className="text-neutral-500 font-mono text-xs tracking-widest uppercase mb-2 block">
            Selected Work
          </span>
          <h3 className="text-2xl md:text-4xl font-semibold text-neutral-100 tracking-tight">
            Portfolio
          </h3>
        </div>

        {/* Subtelne filtry kategorii z atrybutami a11y */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mb-12" role="tablist">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  isActive
                    ? "bg-neutral-100 text-neutral-950 border-neutral-100"
                    : "bg-neutral-900/40 text-neutral-400 border-neutral-800/80 hover:border-neutral-700 hover:text-neutral-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Siatka projektów */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedProject(project)}
              className="group relative bg-neutral-950/60 border border-neutral-900 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:border-neutral-800 flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <div className="w-full">
                {/* Podgląd obrazka */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900/50">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-300" />
                </div>

                {/* Informacje o projekcie */}
                <div className="p-5">
                  <span className="text-[11px] font-mono text-neutral-500 tracking-wider uppercase mb-1.5 block">
                    {project.categoryLabel}
                  </span>
                  <h4 className="text-base font-medium text-neutral-200 mb-2 group-hover:text-white transition-colors leading-snug">
                    {project.title}
                  </h4>
                  <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed mb-4 font-normal">
                    {project.description}
                  </p>

                  {/* Tagi */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-neutral-900/80 border border-neutral-800/60 text-neutral-400 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtelny Chip Linku */}
              {project.link && (
                <div className="px-5 pb-5 pt-0">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-800/80 transition-all duration-200"
                  >
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                    <span>{project.linkLabel || "Visit Site"}</span>
                  </a>
                </div>
              )}
            </button>
          ))}
        </div>

      </div>

      {/* Dostępny i mobilny Modal z dvh, Escape & ARIA */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="relative w-[95vw] sm:w-full max-w-4xl bg-neutral-950 border border-neutral-800/90 rounded-xl overflow-hidden shadow-2xl max-h-[92dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Przycisk zamykania */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Zamknij podgląd"
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Podgląd w modalu — jawna wysokość, bez zależności od flex-grow */}
            <div
              className="relative w-full bg-neutral-900/40 shrink-0"
              style={{ height: "70dvh", minHeight: "320px", maxHeight: "70dvh" }}
            >
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                priority
                unoptimized
                sizes="(max-width: 640px) 95vw, (max-width: 1024px) 90vw, 896px"
                className="object-contain object-center p-2"
              />
            </div>

            {/* Treść w modalu */}
            <div className="p-6 overflow-y-auto">
              <span className="text-[11px] font-mono text-neutral-500 tracking-wider uppercase mb-1 block">
                {selectedProject.categoryLabel}
              </span>
              <h3 id="modal-title" className="text-xl font-semibold text-white mb-3">
                {selectedProject.title}
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                {selectedProject.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-900">
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono bg-neutral-900 text-neutral-400 px-2.5 py-1 rounded border border-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {selectedProject.link && (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-white text-neutral-950 font-medium text-xs rounded-md transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{selectedProject.linkLabel || "Visit Website"}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}