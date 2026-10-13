/** Módulo 04 educativo em elaboração. Não é protocolo clínico nem substitui orientação institucional. */
export const SEGURANCA_PACIENTE_MODULE_04_DRAFT = {
  slug: "seguranca-paciente-comunicacao-equipes",
  module: 4,
  publicationReady: false,
  lessons: [
    {
      id: "saude60-m04-a01",
      title: "Transporte interno e transferência segura de responsabilidade",
      objective: "Organizar a comunicação operacional entre equipas durante deslocações de pacientes sem prescrever condutas clínicas.",
      scenario: "Um paciente deve deslocar-se para um exame. A equipa de origem comunica apenas o número do quarto; o setor de destino não sabe quem receberá o paciente nem quais pendências documentais precisam de confirmação.",
      content: [
        "Antes da transferência, confirme os identificadores institucionais autorizados, a finalidade do deslocamento, o setor de destino e a pessoa responsável pela receção. Número de quarto isolado não constitui identificação segura.",
        "Utilize lista de verificação compatível com o protocolo local para registar condições de transporte definidas pela equipa habilitada, documentação necessária, comunicação de pendências e confirmação de recebimento. Não determine por conta própria monitorização ou equipamentos clínicos.",
        "Se o destino não confirmar capacidade de receber, escale a pendência pelo circuito institucional. Registe hora, emissor, destinatário e estado da transferência sem expor dados pessoais em canais não autorizados."
      ],
      practice: "Elabore uma checklist de oito campos para uma transferência fictícia, com dupla confirmação de identidade, comunicação da pendência e aceite formal do setor de destino.",
      assessment: "Deve incluir identificação por critérios institucionais, responsabilidade de origem e destino, confirmação documentada e escalonamento, sem criar prescrições clínicas.",
      references: ["World Health Organization, Patient Safety Curriculum Guide: Multi-professional Edition", "Protocolos institucionais de transporte e transferência de pacientes"]
    },
    {
      id: "saude60-m04-a02",
      title: "Auditoria de barreiras de segurança e priorização de melhorias",
      objective: "Transformar observações de processo em ações acompanháveis, distinguindo frequência de risco clínico.",
      scenario: "Uma auditoria documental fictícia revê 50 transferências. Em 42 há registo completo de identificação, em 35 confirmação do destinatário e em 45 registo de horário. Não se sabe quantos registos cumprem os três critérios simultaneamente.",
      content: [
        "Calcule cada taxa separadamente: identificação 42/50 = 84%; confirmação do destinatário 35/50 = 70%; horário 45/50 = 90%. Não some as percentagens para produzir uma taxa global de conformidade.",
        "Os dados agregados não permitem saber a proporção de transferências com todos os critérios satisfeitos. Para isso, é preciso analisar a interseção por registo individual, com proteção de dados e autorização institucional.",
        "Priorize investigação de barreiras com base em criticidade, viabilidade e evidências, não apenas na menor percentagem. Estabeleça responsável, ação, prazo e nova amostra comparável; o indicador de processo não prova isoladamente redução de danos."
      ],
      practice: "Apresente tabela de três indicadores, identifique o dado que falta para calcular conformidade conjunta e proponha plano de melhoria de 30 dias com reauditoria.",
      assessment: "Taxas 84%, 70% e 90%; reconhecer impossibilidade de calcular a interseção exata; definir medidas sistémicas e evitar inferência causal.",
      references: ["World Health Organization, Global Patient Safety Action Plan 2021–2030", "Procedimentos institucionais de auditoria, qualidade e proteção de dados"]
    }
  ]
} as const;
