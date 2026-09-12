import { createFileRoute } from "@tanstack/react-router";
import { LibrarySalesHomeAccessChoice } from "@/components/library-sales-home-access-choice";
import { AIFormationSalesCard } from "@/components/ai-formation-sales-card";
import { EditorialSalesCards } from "@/components/editorial-sales-cards";
import { FiveProfessionalFormationCards } from "@/components/five-professional-formation-cards";
import { PsychoanalystPerformanceCard } from "@/components/psychoanalyst-performance-card";

function SalesHome(){
  return <>
    <style>{`
      @media (max-width: 640px) {
        header a[href="/cliente/login"] {
          min-height: 44px;
          min-width: 92px;
          padding: 0 16px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          border-radius: 14px !important;
          font-size: 14px !important;
          line-height: 1 !important;
        }
      }
    `}</style>
    <LibrarySalesHomeAccessChoice />
    <PsychoanalystPerformanceCard />
    <AIFormationSalesCard />
    <FiveProfessionalFormationCards />
    <EditorialSalesCards />
  </>;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LDR Academy | Cursos, Formações e Treinamentos Online" },
      { name: "description", content: "Cursos, formações profissionais, treinamentos, livros e conteúdos digitais da LDR Academy. Destaque para Psicanalista de Alta Performance, Formação em Psicanálise e Inteligência Artificial Aplicada aos Negócios e à Carreira." },
      { property: "og:title", content: "LDR Academy | Cursos e Formações Online" },
      { property: "og:description", content: "Aprenda no seu tempo com cursos e formações profissionais da LDR Academy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesHome,
});
