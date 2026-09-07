import { createFileRoute } from "@tanstack/react-router";
import { CommercialPublicPage } from "@/components/commercial-public-page";

export const Route=createFileRoute("/vendedor/apresentacao")({
  head:()=>({meta:[{title:"Apresentação Comercial | Rede Comercial LDR"},{name:"description",content:"Apresentação oficial da Rede Comercial LDR, suas soluções e próximos passos."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/vendedor/apresentacao"}]}),
  component:()=> <CommercialPublicPage kind="sellerPresentation"/>
});
