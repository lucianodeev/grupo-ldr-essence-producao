import { createFileRoute } from "@tanstack/react-router";
import { TrainingLaunchPage } from "@/components/training-launch-page";

export const Route=createFileRoute("/treinamento")({
  head:()=>({meta:[{title:"Do Mamão ao Negócio | LDR RH & Estratégia"},{name:"description",content:"Treinamento empreendedor Do Mamão ao Negócio: formação guiada de 3 meses e 300 horas, acesso vitalício, encontros opcionais e projeto com avaliação."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/treinamento"}]}),
  component:()=> <TrainingLaunchPage/>
});
