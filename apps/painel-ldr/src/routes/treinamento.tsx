import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const TRAINING_PUBLIC_URL = "https://kind-crest-9804.hosted.pageshare.ai";

function TrainingPublicRedirect() {
  useEffect(() => {
    window.location.replace(TRAINING_PUBLIC_URL);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl">Do Mamão ao Negócio</h1>
        <p className="mt-3 text-sm text-muted-foreground">Abrindo a página pública do treinamento…</p>
        <a
          href={TRAINING_PUBLIC_URL}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"
        >
          Abrir treinamento
        </a>
      </div>
    </main>
  );
}

export const Route=createFileRoute("/treinamento")({
  head:()=>({
    meta:[
      {title:"Do Mamão ao Negócio | Formação para Empreendedores"},
      {name:"description",content:"Formação de empreendedorismo em 90 dias e 300 horas, com 90 aulas, atividades diárias, Manual do Negócio, encontros opcionais e projeto avaliado."},
      {property:"og:title",content:"Do Mamão ao Negócio — Oferta de Lançamento"},
      {property:"og:description",content:"90 dias, 300 horas, acesso vitalício e preço especial de lançamento para os primeiros 100 alunos."}
    ],
    links:[{rel:"canonical",href:"https://ldrrhestrategia.com/treinamento"}]
  }),
  component:TrainingPublicRedirect
});
