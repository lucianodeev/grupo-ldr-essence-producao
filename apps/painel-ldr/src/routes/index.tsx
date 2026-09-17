import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AcademyUniversityHome } from "@/components/academy-university-home";
import { AcademyEcosystemSection } from "@/components/academy-ecosystem-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LDR Essence Academy | Educação Online, Cursos, Formações e Biblioteca" },
      { name: "description", content: "Explore cursos, formações profissionais, conteúdos gratuitos, livros, revistas e publicações da LDR Essence Academy em uma biblioteca acadêmica digital organizada." },
      { property: "og:title", content: "LDR Essence Academy | Biblioteca Acadêmica Digital" },
      { property: "og:description", content: "Educação online, cursos, formações, livros e publicações organizados em uma experiência inspirada em uma biblioteca universitária." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicHome,
});

function PublicHome() {
  useEffect(() => {
    if (typeof window !== "undefined" && /^portal\.ldrrhestrategia\.com$/i.test(window.location.hostname)) {
      window.location.replace("/cliente/login");
    }
  }, []);

  return <>
    <AcademyUniversityHome />
    <AcademyEcosystemSection />
  </>;
}
