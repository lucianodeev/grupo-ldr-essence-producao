import { createFileRoute } from "@tanstack/react-router";
import { UnifiedPublicPage } from "@/components/unified-public-page";
export const Route=createFileRoute("/vendedor")({head:()=>({meta:[{title:"Rede Comercial LDR | Vendedor"},{name:"description",content:"Candidate-se ou acesse o portal oficial da Rede Comercial LDR."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/vendedor"}]}),component:()=> <UnifiedPublicPage kind="seller"/>});
