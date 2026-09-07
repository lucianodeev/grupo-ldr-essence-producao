import { createFileRoute } from "@tanstack/react-router";
import { CommercialPublicPage } from "@/components/commercial-public-page";

export const Route=createFileRoute("/empreendedores")({
  head:()=>({meta:[{title:"Webinar gratuito | Empreendedorismo sem Fronteiras e Saúde Mental"},{name:"description",content:"Webinar gratuito sobre empreendedorismo sem fronteiras, experiência, coragem, oportunidades e saúde mental."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/empreendedores"}]}),
  component:()=> <CommercialPublicPage kind="webinar"/>
});
