import { createFileRoute } from "@tanstack/react-router";
import { PsychoanalysisTrainingPage } from "@/components/psychoanalysis-training-page";

export const Route = createFileRoute("/formacao-psicanalise")({
 head:()=>({meta:[
  {title:"Formação em Psicanálise · Autismo + Atuação Internacional | Grupo LDR Essence"},
  {name:"description",content:"Formação em Psicanálise com 15 módulos, 1.200 horas, 240 unidades de aprendizagem, 6 encontros ao vivo, projetos e avaliações, com autismo, neurodiversidade e atuação internacional."},
 ]}),
 component:PsychoanalysisTrainingPage,
});
