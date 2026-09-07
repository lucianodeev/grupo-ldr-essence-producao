import { createFileRoute } from "@tanstack/react-router";
import { CommercialPublicPage } from "@/components/commercial-public-page";

export const Route=createFileRoute("/livros")({
  head:()=>({meta:[{title:"Livros & eBooks | LDR RH & Estratégia"},{name:"description",content:"Biblioteca de livros e eBooks do ecossistema LDR para pessoas, profissionais e empreendedores."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/livros"}]}),
  component:()=> <CommercialPublicPage kind="books"/>
});
