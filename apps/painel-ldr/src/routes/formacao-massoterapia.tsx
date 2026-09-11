import { createFileRoute } from "@tanstack/react-router";
import { MassotherapyTrainingPage } from "@/components/massotherapy-training-page";
export const Route=createFileRoute("/formacao-massoterapia")({head:()=>({meta:[{title:"Formação Completa em Massoterapia | Grupo LDR Essence"},{name:"description",content:"Formação profissional em Massoterapia: 15 módulos, 300 aulas, 1.200 horas, 100% online e percurso recomendado de 6 a 12 meses."}]}),component:MassotherapyTrainingPage});
