"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Eye, ExternalLink } from "lucide-react";

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
    title: "Nadwiślańskie Stwarzyszenie Historii Militarnej - branding i serwis internetowy",
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
  { key: "all", label: "ALL" },
  { key: "calendar", label: "CALENDAR" },
  { key: "poster", label: "POSTER" },
  { key: "coin", label: "COIN" },
  { key: "sportswear", label: "SPORTSWEAR" },
  { key: "logo", label: "LOGO" },
  { key: "web", label: "WEB" },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(activeCategory));

  return (
    <section id="portfolio" className="py-24 bg-[#050505] relative border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Nagłówek sekcji */}
        <div className="text-center mb-12">
          <h2 className="text-brand font-bold tracking-widest uppercase text-xs md:text-sm mb-3">
            Selected Work
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Portfolio
          </h3>
        </div>

        {/* Filtry kategorii */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold tracking-wider uppercase transition-all duration-300 border ${
                activeCategory === cat.key
                  ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                  : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Siatka projektów */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group relative bg-neutral-950 border border-neutral-800/80 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-brand/50 hover:shadow-xl hover:shadow-brand/5 flex flex-col justify-between"
            >
              <div>
                {/* Podgląd obrazka */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Overlay przycisku podglądu */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-xs">
                    <div className="p-3 rounded-full bg-brand text-white shadow-lg flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                      <Eye className="w-4 h-4" /> View Project
                    </div>
                  </div>
                </div>

                {/* Informacje o projekcie */}
                <div className="p-6">
                  <span className="text-xs font-mono font-semibold text-brand tracking-wider uppercase mb-2 block">
                    {project.categoryLabel}
                  </span>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-brand transition-colors">
                    {project.title}
                  </h4>
                  <p className="text-neutral-400 text-sm line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Tagi */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Link w formie Chip */}
              {project.link && (
                <div className="px-6 pb-6 pt-0">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-neutral-900 hover:bg-brand text-neutral-300 hover:text-white border border-neutral-800 transition-all duration-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{project.linkLabel || "Visit Site"}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Modal ze szczegółami projektu */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Przycisk zamykania */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Obrazek w modalu */}
            <div className="relative aspect-video w-full bg-neutral-900 shrink-0">
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className="object-contain object-center"
              />
            </div>

            {/* Treść w modalu */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <span className="text-xs font-mono font-semibold text-brand tracking-wider uppercase mb-2 block">
                {selectedProject.categoryLabel}
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
                {selectedProject.title}
              </h3>
              <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-6">
                {selectedProject.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-md"
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white font-mono font-semibold text-xs rounded-full hover:bg-red-700 transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
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