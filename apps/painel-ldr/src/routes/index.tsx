import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LibrarySalesHomeAccessChoice } from "@/components/library-sales-home-access-choice";
import { AIFormationSalesCard } from "@/components/ai-formation-sales-card";
import { EditorialSalesCards } from "@/components/editorial-sales-cards";
import { FiveProfessionalFormationCards } from "@/components/five-professional-formation-cards";
import { supabase } from "@/integrations/supabase/client";

function SalesHome(){
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!/(^|\.)ldracademy\.online$/i.test(window.location.hostname)) return;

    let active = true;
    const openLibrary = () => {
      if (active) window.location.replace("/biblioteca");
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) openLibrary();
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) openLibrary();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

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
    <AIFormationSalesCard />
    <FiveProfessionalFormationCards />
    <EditorialSalesCards />
  </>;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biblioteca LDR | Cursos, Formações e Treinamentos Online" },
      { name: "description", content: "Cursos, formações profissionais, treinamentos, livros e conteúdos digitais com compra individual de acesso vitalício ou assinatura mensal. Destaque para a Formação em Psicanálise, Inteligência Artificial Aplicada aos Negócios e à Carreira e outros conteúdos profissionais." },
      { property: "og:title", content: "Biblioteca LDR | Cursos e Formações Online" },
      { property: "og:description", content: "Escolha entre pagamento único com acesso vitalício ou assinatura mensal para acessar conteúdos digitais pagos da Biblioteca LDR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesHome,
});
