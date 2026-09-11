import { createFileRoute } from "@tanstack/react-router";
import { Business24PublicPage } from "@/components/business24-public-page";
export const Route=createFileRoute("/formacao-negocio-em-24-horas")({head:()=>({meta:[{title:"Negócio em 24 Horas | Biblioteca LDR"},{name:"description",content:"Formação prática 100% online: 9 módulos, 90 aulas, 360 horas e projeto final avaliado."}]}),component:Business24PublicPage});
