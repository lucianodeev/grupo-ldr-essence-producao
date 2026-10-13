/** Rascunho educativo: não é protocolo clínico; não publicar. */
export const SEGURANCA_PACIENTE_MODULE_03_DRAFT = {
  slug: "seguranca-paciente-comunicacao-equipes",
  module: 3,
  publicationReady: false,
  lessons: [
    {
      id: "saude60-m03-a01",
      title: "Reconciliação documental de medicamentos nas transições de cuidados",
      objective: "Identificar discrepâncias entre registos e encaminhá-las à equipa habilitada sem modificar prescrições.",
      scenario: "Na transferência entre serviços, uma lista contém quatro medicamentos e outra cinco; também há uma divergência de dose entre documentos.",
      content: [
        "Compare as fontes autorizadas, a respetiva data e o contexto da transferência. Uma lista mais recente não é necessariamente a correta; a diferença pode resultar de mudança intencional ainda não documentada.",
        "Registe cada divergência numa matriz com medicamento codificado, origem da informação, tipo de diferença, profissional responsável, momento de contacto e estado de resolução. Identificar discrepâncias não autoriza alterar prescrições.",
        "Encaminhe divergências relevantes pelo circuito institucional, confirme a receção da pendência e documente a decisão do profissional competente. Preserve confidencialidade e evite enviar listas identificáveis por canais informais."
      ],
      practice: "Crie duas listas fictícias de cinco medicamentos codificados A–E, assinale duas divergências e construa uma matriz de escalonamento e confirmação.",
      assessment: "Distinguir discrepância de alteração autorizada; indicar fonte, responsável e confirmação, sem recomendar dose ou tratamento.",
      references: ["World Health Organization, Medication Without Harm", "Protocolos institucionais de reconciliação terapêutica"]
    },
    {
      id: "saude60-m03-a02",
      title: "Indicadores de higiene das mãos e melhoria de processos",
      objective: "Calcular adesão observada e propor intervenções sistémicas sem conclusões causais indevidas.",
      scenario: "Numa simulação, foram observadas 40 oportunidades de higiene das mãos e 31 ações adequadas conforme o protocolo local.",
      content: [
        "A adesão observada é 31 ÷ 40 × 100 = 77,5%. O indicador descreve a amostra simulada; não representa automaticamente a instituição nem mede diretamente infeções.",
        "Defina oportunidade e ação adequada antes da recolha. Registe método de observação e considere viés de observador, dimensão da amostra, disponibilidade de materiais e características do turno.",
        "Investigue barreiras do processo, proponha ações com responsáveis e prazos e repita a medição usando critérios comparáveis. Divulgue dados agregados e não utilize observações isoladas para atribuir culpa."
      ],
      practice: "Calcule a adesão para 36 ações adequadas em 45 oportunidades e apresente plano de melhoria com indicador, responsável e data de reavaliação.",
      assessment: "Resultado de 80%; apresentar denominador, limitações, ação verificável e proteção de dados.",
      references: ["World Health Organization, WHO Guidelines on Hand Hygiene in Health Care", "Procedimentos institucionais de prevenção e controlo de infeção"]
    }
  ]
} as const;
