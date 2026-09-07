import { createFileRoute } from "@tanstack/react-router";
import { CommercialPublicPage } from "@/components/commercial-public-page";

export const Route=createFileRoute("/acoragemdecomecar")({
  head:()=>({meta:[{title:"A Coragem de Começar | LDR RH & Estratégia"},{name:"description",content:"Livro digital A Coragem de Começar: história, reflexão e empreendedorismo real dentro do ecossistema LDR."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/acoragemdecomecar"}]}),
  component:()=> <CommercialPublicPage kind="ebook"/>
});
