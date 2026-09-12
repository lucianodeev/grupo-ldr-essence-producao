import { createFileRoute } from "@tanstack/react-router";
import { InternationalPsychoanalysisPage } from "@/components/international-psychoanalysis-page";
export const Route=createFileRoute("/formacao-psicanalise-internacional")({head:()=>({meta:[{title:"Psicanálise Internacional, Neurodiversidade e Autismo | LDR Academy"},{name:"description",content:"Curso premium 100% online, com projetos práticos, avaliação de projetos, autismo, neurodiversidade e carreira internacional."}]}),component:InternationalPsychoanalysisPage});
