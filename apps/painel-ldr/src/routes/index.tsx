import { createFileRoute } from "@tanstack/react-router";
import { AcademyUniversityHome } from "@/components/academy-university-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LDR Academy | Cursos, Formações, Livros e Conhecimento" },
      { name: "description", content: "Explore cursos, formações profissionais, conteúdos gratuitos, livros, revistas e publicações da LDR Academy em uma biblioteca acadêmica digital organizada." },
      { property: "og:title", content: "LDR Academy | Biblioteca Acadêmica Digital" },
      { property: "og:description", content: "Cursos, formações, livros e publicações organizados em uma experiência inspirada em uma biblioteca universitária." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AcademyUniversityHome,
});
