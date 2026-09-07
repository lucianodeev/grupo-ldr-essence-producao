import { createFileRoute } from "@tanstack/react-router";
import { UnifiedPublicPage } from "@/components/unified-public-page";
export const Route=createFileRoute("/acoragemdecomecar")({head:()=>({meta:[{title:"A Coragem de Começar | LDR RH & Estratégia"},{name:"description",content:"eBook A Coragem de Começar em PT, EN, FR e ES."}],links:[{rel:"canonical",href:"https://ldrrhestrategia.com/acoragemdecomecar"}]}),component:()=> <UnifiedPublicPage kind="ebook"/>});
