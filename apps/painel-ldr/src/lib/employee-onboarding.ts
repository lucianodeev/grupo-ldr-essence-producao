export const ONBOARDING_SOLUTION = "Integração de novos colaboradores" as const;
export const ONBOARDING_SOURCE = "integracao-colaboradores" as const;

export const ONBOARDING_CHECKLIST = [
  { period: "Antes da chegada", task: "Nomear o gestor responsável e a pessoa de referência para dúvidas do dia a dia.", evidence: "Nomes e contactos confirmados no plano de acolhimento." },
  { period: "Antes da chegada", task: "Confirmar horário, local ou acesso remoto, equipamentos e instruções para o primeiro dia.", evidence: "Mensagem de boas-vindas enviada pelo canal acordado." },
  { period: "Antes da chegada", task: "Preparar os acessos necessários à função e definir quem os autoriza.", evidence: "Lista de acessos com responsável e estado; sem palavras-passe no documento." },
  { period: "Primeiro dia", task: "Apresentar a equipa, os canais de comunicação e a quem recorrer em cada situação.", evidence: "Mapa de contactos entregue e apresentação realizada." },
  { period: "Primeiro dia", task: "Explicar a função, as prioridades iniciais e as regras de trabalho relevantes.", evidence: "Responsabilidades e primeiras tarefas revistas com o gestor." },
  { period: "Primeiro dia", task: "Verificar se equipamentos e acessos funcionam e registar o que falta resolver.", evidence: "Pendências com responsável e data prevista de resolução." },
  { period: "Primeira semana", task: "Demonstrar uma tarefa habitual e acompanhar a primeira execução.", evidence: "Exemplo de trabalho revisto e dúvidas registadas." },
  { period: "Primeira semana", task: "Combinar objetivos observáveis para os primeiros 30 dias.", evidence: "Até três objetivos com critérios de conclusão acordados." },
  { period: "Primeira semana", task: "Fazer uma conversa curta sobre clareza da função, recursos e dificuldades encontradas.", evidence: "Ações de apoio definidas em conjunto, sem recolher informação clínica." },
  { period: "Dias 8 a 30", task: "Realizar os pontos de acompanhamento previstos e verificar a resolução das pendências.", evidence: "Registo de decisões, responsáveis e próximos passos." },
  { period: "Dias 8 a 30", task: "Recolher feedback do colaborador e do gestor sobre o processo de acolhimento.", evidence: "Ajustes concretos ao manual, às instruções ou ao apoio disponível." },
  { period: "Dias 8 a 30", task: "Encerrar o ciclo com uma revisão dos objetivos e um plano para a etapa seguinte.", evidence: "Síntese da reunião de encerramento e ações para continuidade." },
] as const;

/** A plain-text resource with the same actions displayed on the page; no form or tracking. */
export function onboardingChecklistText(): string {
  return [
    "ECOSSISTEMA LDR — CHECKLIST BÁSICO DE INTEGRAÇÃO",
    "Primeiros 30 dias | Recurso gratuito",
    "https://ldrecossistema.online/empresas/integracao-colaboradores",
    "",
    "Empresa: ____________________  Função: ____________________",
    "Data de início: ______________  Gestor responsável: ____________________",
    "",
    ...ONBOARDING_CHECKLIST.flatMap((item, index) => [
      `${index + 1}. [ ] ${item.period} — ${item.task}`,
      `   Evidência: ${item.evidence}`,
      "   Responsável: ____________________  Prazo: __________  Estado: __________",
      "",
    ]),
    "Adapte as ações à função, à modalidade de trabalho e aos procedimentos da empresa.",
    "Não registe palavras-passe, documentos de identificação ou dados clínicos neste checklist.",
    "Este recurso organiza o acolhimento; não substitui obrigações laborais ou formação obrigatória.",
    "A utilização do checklist não contrata serviços nem gera qualquer cobrança.",
    "",
  ].join("\n");
}
