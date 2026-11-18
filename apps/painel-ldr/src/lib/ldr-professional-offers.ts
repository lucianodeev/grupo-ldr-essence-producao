import type { COMMERCIAL_SOLUTIONS } from "./commercial-request";

type Solution = (typeof COMMERCIAL_SOLUTIONS)[number];

export const PROFESSIONAL_OFFERS = [
  {
    id: "integracao",
    solution: "Integração de novos colaboradores",
    description:
      "Estruture o acolhimento desde a preparação da chegada até à avaliação do primeiro mês.",
    scope:
      "Plano de 30 dias, manual de acolhimento adaptado, checklist do gestor e pontos de acompanhamento.",
    briefing:
      "Indique a data de entrada, quantas pessoas serão recebidas, as funções e os materiais disponíveis.",
  },
  {
    id: "recrutamento",
    solution: "Recrutamento e seleção",
    description:
      "Defina o perfil da vaga e organize as etapas de avaliação antes de receber candidaturas.",
    scope:
      "Perfil, etapas de seleção e critérios de avaliação definidos de acordo com o âmbito contratado.",
    briefing: "Descreva a função, o número de vagas, o local e a data prevista de contratação.",
  },
  {
    id: "consultoria-rh",
    solution: "Consultoria de recursos humanos",
    description:
      "Identifique onde o processo de RH atrasa o trabalho e decida o que deve ser tratado primeiro.",
    scope:
      "Diagnóstico dos processos, prioridades de melhoria e acompanhamento conforme a proposta.",
    briefing: "Indique o tamanho da equipa, o processo a rever e a principal dificuldade.",
  },
  {
    id: "formacao",
    solution: "Formação empresarial",
    description:
      "Defina com a LDR Academy um percurso ligado às competências que a equipa precisa de desenvolver.",
    scope:
      "Percurso formativo selecionado do catálogo vigente, com calendário e acesso definidos na proposta.",
    briefing:
      "Indique o tema, o número de participantes, os horários disponíveis e o objetivo da formação.",
  },
] as const satisfies readonly {
  id: string;
  solution: Solution;
  description: string;
  scope: string;
  briefing: string;
}[];

export const MENTORSHIP_CATALOG_KEYS = ["mentoria_sessao", "mentoria_4", "mentoria_8"];
