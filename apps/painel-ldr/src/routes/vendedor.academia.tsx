import { createFileRoute } from "@tanstack/react-router";
import { CommercialPublicPage } from "@/components/commercial-public-page";

export const Route=createFileRoute("/vendedor/academia")({
  head:()=>({meta:[{title:"Academia Comercial | Rede Comercial LDR"},{name:"description",content:"Preparação e materiais da Academia Comercial para representantes da Rede LDR."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/vendedor/academia"}]}),
  component:()=> <CommercialPublicPage kind="sellerAcademy"/>
});
