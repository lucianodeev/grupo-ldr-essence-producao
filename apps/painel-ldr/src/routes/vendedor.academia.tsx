import { createFileRoute } from "@tanstack/react-router";
import { UnifiedPublicPage } from "@/components/unified-public-page";
export const Route=createFileRoute("/vendedor/academia")({head:()=>({meta:[{title:"Academia Comercial | Rede Comercial LDR"},{name:"description",content:"Acesso à Academia Comercial da Rede LDR."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/vendedor/academia"}]}),component:()=> <UnifiedPublicPage kind="sellerAcademy"/>});
