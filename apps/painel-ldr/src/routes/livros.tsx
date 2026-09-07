import { createFileRoute } from "@tanstack/react-router";
import { UnifiedPublicPage } from "@/components/unified-public-page";
export const Route=createFileRoute("/livros")({head:()=>({meta:[{title:"Livros & eBooks | LDR RH & Estratégia"},{name:"description",content:"Biblioteca de livros e eBooks do ecossistema LDR."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/livros"}]}),component:()=> <UnifiedPublicPage kind="books"/>});
