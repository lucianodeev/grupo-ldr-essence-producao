import { createFileRoute } from "@tanstack/react-router";
import { TrainingLaunchPageV2 } from "@/components/training-launch-page-v2";

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
  component:TrainingLaunchPageV2
});
