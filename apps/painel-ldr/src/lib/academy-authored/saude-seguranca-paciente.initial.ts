/** Rascunho autoral educacional. Não é protocolo clínico nem curso publicado. */
export const SEGURANCA_PACIENTE_DRAFT = {
  slug: "seguranca-paciente-comunicacao-equipes",
  proposedHours: 60,
  publicationReady: false,
  lessons: [
    {
      id: "saude60-m01-a01",
      title: "Passagem de turno estruturada e informação crítica",
      objective: "Organizar comunicação entre profissionais de saúde sem omitir riscos relevantes.",
      scenario: "Numa troca de turno, uma pessoa internada apresenta nova alteração de sinais vitais e há um exame pendente. A equipa seguinte recebe apenas a indicação 'estável'.",
      content: [
        "Uma passagem de turno deve distinguir situação atual, antecedentes pertinentes, avaliação observada e recomendação ou pendência. O modelo SBAR pode servir como estrutura, mas não substitui políticas locais nem julgamento profissional.",
        "Relate dados observáveis com hora e fonte, sem substituir avaliação por rótulos vagos. Alterações relevantes exigem comunicação e escalonamento conforme o protocolo da instituição.",
        "Confirme receção da informação crítica com repetição dos pontos essenciais e registe pendências no sistema autorizado. Evite dados identificáveis em canais informais."
      ],
      practice: "Produza um SBAR fictício com dados mínimos, uma pendência e um pedido explícito de confirmação pela equipa seguinte.",
      assessment: "A resposta deve identificar alteração, momento, pendência, responsabilidade e confirmação de receção, sem sugerir tratamento não autorizado.",
      references: ["WHO Patient Safety Curriculum Guide: Multi-professional Edition (2011)", "Institute for Healthcare Improvement, SBAR Tool"]
    },
    {
      id: "saude60-m01-a02",
      title: "Notificação de quase-incidente e aprendizagem organizacional",
      objective: "Distinguir incidente, quase-incidente e fator contributivo sem culpabilização automática.",
      scenario: "Uma etiqueta de amostra contém dois identificadores inconsistentes; a divergência é detetada antes do processamento.",
      content: [
        "O quase-incidente é uma oportunidade de identificar barreiras que funcionaram e riscos que persistem. Registe o que aconteceu, onde a falha foi detetada e como a exposição foi interrompida.",
        "Uma análise de fatores contributivos pode considerar ambiente, fluxo de trabalho, tecnologia, comunicação e formação. Não atribua causa a uma pessoa sem evidência.",
        "Use o canal institucional de notificação e respeite regras de confidencialidade. A decisão sobre recolha, repetição ou processamento da amostra cabe ao protocolo e aos profissionais habilitados."
      ],
      practice: "Elabore um relato anónimo, uma linha do tempo de quatro eventos e três ações preventivas verificáveis.",
      assessment: "Deve diferenciar observação de hipótese, evitar dados pessoais, identificar barreira de deteção e propor medidas mensuráveis.",
      references: ["WHO, Patient Safety Incident Reporting and Learning Systems: Technical Report and Guidance (2020)", "Políticas locais de gestão de risco e identificação de amostras"]
    }
  ]
} as const;
