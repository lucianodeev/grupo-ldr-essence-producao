import { createFileRoute } from "@tanstack/react-router";
import { BriefTherapyTrainingPage } from "@/components/brief-therapy-training-page";
export const Route=createFileRoute("/formacao-terapia-breve-psicanalitica")({head:()=>({meta:[{title:"Formação em Terapia Breve Psicanalítica | Grupo LDR Essence"},{name:"description",content:"Formação em Terapia Breve Psicanalítica: 15 módulos, 300 aulas, 1.200 horas e 6 encontros ao vivo."}]}),component:BriefTherapyTrainingPage});
