import { createFileRoute } from "@tanstack/react-router";
import { UnifiedPublicPage } from "@/components/unified-public-page";
export const Route=createFileRoute("/empreendedores")({head:()=>({meta:[{title:"Empreendedores | LDR RH & Estratégia"},{name:"description",content:"Livros, eBooks e treinamento para empreendedores."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/empreendedores"}]}),component:()=> <UnifiedPublicPage kind="entrepreneurs"/>});
