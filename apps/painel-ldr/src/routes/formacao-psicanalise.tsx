import { createFileRoute } from "@tanstack/react-router";
import { PsychoanalysisTrainingPage } from "@/components/psychoanalysis-training-page";

export const Route = createFileRoute("/formacao-psicanalise")({
 head:()=>({meta:[
  {title:"Formação Online em Psicanálise | Grupo LDR Essence"},
  {name:"description",content:"Formação Online em Psicanálise: 12 módulos, 6 encontros ao vivo, leituras orientadas, atividades e acesso vitalício aos conteúdos digitais."},
 ]}),
 component:PsychoanalysisTrainingPage,
});
