import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tom Bergson - Graphic Designer & Branding Specialist",
    short_name: "Tom Bergson",
    description: "Portfolio projektanta graficznego. Specjalizuję się w brandingu, identyfikacji wizualnej i projektowaniu grafiki.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}