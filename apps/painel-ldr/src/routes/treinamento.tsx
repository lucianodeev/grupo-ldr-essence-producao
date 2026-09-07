import { createFileRoute } from "@tanstack/react-router";
import { UnifiedPublicPage } from "@/components/unified-public-page";
export const Route=createFileRoute("/treinamento")({head:()=>({meta:[{title:"Do Mamão ao Negócio | LDR RH & Estratégia"},{name:"description",content:"Treinamento empreendedor Do Mamão ao Negócio."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/treinamento"}]}),component:()=> <UnifiedPublicPage kind="training"/>});
