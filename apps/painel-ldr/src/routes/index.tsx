import { createFileRoute } from "@tanstack/react-router";
import { LibrarySalesHome } from "@/components/library-sales-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biblioteca LDR | Cursos, Formações e Treinamentos Online" },
      { name: "description", content: "Cursos, formações profissionais, treinamentos, livros e conteúdos digitais para carreira, negócios, liderança, RH, psicanálise e empreendedorismo." },
      { property: "og:title", content: "Biblioteca LDR | Cursos e Formações Online" },
      { property: "og:description", content: "Cursos, formações profissionais, treinamentos, livros e conteúdos digitais em uma única plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibrarySalesHome,
});
