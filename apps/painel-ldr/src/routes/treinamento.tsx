import { createFileRoute } from "@tanstack/react-router";
import { TrainingLaunchPage } from "@/components/training-launch-page";

export const Route=createFileRoute("/treinamento")({
  head:()=>({
    meta:[
      {title:"Do Mamão ao Negócio | Formação para Empreendedores"},
      {name:"description",content:"Formação de empreendedorismo em 90 dias e 300 horas, com 90 aulas, atividades práticas, projetos e avaliação de projeto."},
      {property:"og:title",content:"Do Mamão ao Negócio — Oferta de Lançamento"},
      {property:"og:description",content:"90 dias, 300 horas, acesso vitalício, projetos práticos e avaliação de projeto."}
    ],
    links:[{rel:"canonical",href:"https://ldracademy.online/treinamento"}]
  }),
  component:TrainingLaunchPage
});
