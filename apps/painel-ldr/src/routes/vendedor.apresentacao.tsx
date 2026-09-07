import { createFileRoute } from "@tanstack/react-router";
import { UnifiedPublicPage } from "@/components/unified-public-page";
export const Route=createFileRoute("/vendedor/apresentacao")({head:()=>({meta:[{title:"Apresentação Comercial | Rede Comercial LDR"},{name:"description",content:"Apresentação oficial da Rede Comercial LDR."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/vendedor/apresentacao"}]}),component:()=> <UnifiedPublicPage kind="sellerPresentation"/>});
