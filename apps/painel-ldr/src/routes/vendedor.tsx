import { createFileRoute } from "@tanstack/react-router";
import { CommercialPublicPage } from "@/components/commercial-public-page";

export const Route=createFileRoute("/vendedor")({
  head:()=>({meta:[{title:"Rede Comercial LDR | Representante Comercial"},{name:"description",content:"Conheça a Rede Comercial LDR e os caminhos oficiais para representar soluções de pessoas, carreira, bem-estar, empreendedorismo e empresas."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/vendedor"}]}),
  component:()=> <CommercialPublicPage kind="seller"/>
});
