import { createFileRoute } from "@tanstack/react-router";
import { CommercialPublicPage } from "@/components/commercial-public-page";

export const Route=createFileRoute("/treinamento")({
  head:()=>({meta:[{title:"Do Mamão ao Negócio | LDR RH & Estratégia"},{name:"description",content:"Treinamento empreendedor Do Mamão ao Negócio: 3 meses e 300 horas para organizar uma ideia em um projeto de negócio mais claro e estruturado."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/treinamento"}]}),
  component:()=> <CommercialPublicPage kind="training"/>
});
