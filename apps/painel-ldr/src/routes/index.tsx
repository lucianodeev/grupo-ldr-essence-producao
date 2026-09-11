import { createFileRoute } from "@tanstack/react-router";
import { LibrarySalesHomeAccessChoice } from "@/components/library-sales-home-access-choice";
import { EditorialSalesCards } from "@/components/editorial-sales-cards";

function SalesHome(){
  return <>
    <LibrarySalesHomeAccessChoice />
    <EditorialSalesCards />
  </>;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biblioteca LDR | Cursos, Formações e Treinamentos Online" },
      { name: "description", content: "Cursos, formações profissionais, treinamentos, livros e conteúdos digitais com compra individual de acesso vitalício ou assinatura mensal. Destaque para a Formação em Psicanálise e o módulo Autismo na Clínica Psicanalítica." },
      { property: "og:title", content: "Biblioteca LDR | Cursos e Formações Online" },
      { property: "og:description", content: "Escolha entre pagamento único com acesso vitalício ou assinatura mensal para acessar conteúdos digitais pagos da Biblioteca LDR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesHome,
});
