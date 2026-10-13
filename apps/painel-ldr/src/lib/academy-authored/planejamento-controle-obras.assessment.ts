/**
 * Avaliação integradora da formação livre Planejamento e Controle de Obras.
 * Em revisão: não registrar certificado ou conclusão automática.
 */
export type IntegratedQuestion = {
  id: string;
  prompt: string;
  expected: string;
  points: number;
};
export const PLANEJAMENTO_CONTROLE_OBRAS_FINAL_ASSESSMENT = {
  title: "Simulação de planejamento e recuperação de uma reforma comercial",
  case: {
    description: "Uma loja será reformada em 60 dias úteis. A obra prevê 200 m² de piso a R$ 100/m², 500 m² de pintura a R$ 28/m² e fornecimento de esquadrias. Na semana de controle, o piso deveria alcançar 130 m², mas a equipe entregou 110 m² aceitos. Na pintura, havia 180 m² aceitos anteriormente; no período, 140 m² foram executados, dos quais 20 m² não passaram na inspeção. As esquadrias são necessárias no início do dia útil 40, com quatro dias úteis de aprovação, quinze de fabricação, três de transporte e dois de inspeção e recebimento, sem sobreposição.",
    assumptions: [
      "Todos os prazos de suprimento são dias úteis e consecutivos.",
      "Não há retenções, impostos ou adiantamentos incluídos nos valores de produção.",
      "Os critérios de aceite e os preços são hipotéticos para fins didáticos.",
      "O aluno não pode assumir aprovação técnica ou contratual não documentada."
    ]
  },
  questions: [
    {
      id: "af-01",
      prompt: "Calcule a produção planejada e realizada de piso em valor, além do desvio físico e financeiro de produção na data de corte.",
      expected: "Previsto: 130 m² e R$ 13.000; realizado aceito: 110 m² e R$ 11.000; desvio: -20 m² e -R$ 2.000 de valor de produção, sem inferir pagamento.",
      points: 20
    },
    {
      id: "af-02",
      prompt: "Calcule a medição elegível de pintura no período, acumulado aceito e saldo contratual.",
      expected: "Aceito no período: 120 m² ou R$ 3.360; acumulado aceito: 300 m² ou R$ 8.400; saldo não medido: 200 m² ou R$ 5.600; 20 m² ficam pendentes de correção.",
      points: 20
    },
    {
      id: "af-03",
      prompt: "Retroplaneje a compra das esquadrias e identifique o último dia útil para iniciar a aprovação.",
      expected: "A cadeia dura 24 dias úteis; para disponibilidade no início do dia 40, iniciar a aprovação no dia 16, conforme a convenção de contagem adotada.",
      points: 15
    },
    {
      id: "af-04",
      prompt: "Descreva duas respostas ao risco de atraso de esquadrias, com gatilho, responsável e evidência de execução.",
      expected: "Apresentar duas respostas factíveis, como confirmação formal de marcos de fabricação e fornecedor alternativo previamente homologado; cada uma deve indicar gatilho mensurável, dono e registro.",
      points: 15
    },
    {
      id: "af-05",
      prompt: "Monte uma matriz de aceite com piso, pintura e esquadrias, identificando documentos, pendências e responsáveis.",
      expected: "A matriz separa serviço executado de aceito; registra os 20 m² de pintura pendentes, a evidência de recebimento de esquadrias e os critérios contratuais aplicáveis.",
      points: 15
    },
    {
      id: "af-06",
      prompt: "Redija uma síntese executiva de até 250 palavras com a situação, decisões pendentes e dados que faltam para revisar a data final.",
      expected: "O relatório explicita a data de corte, os desvios conhecidos, hipóteses ainda não verificadas, dependências e ações com responsáveis; não declara uma nova data final sem dados suficientes.",
      points: 15
    }
  ] satisfies IntegratedQuestion[],
  grading: {
    totalPoints: 100,
    suggestedMinimumPoints: 70,
    mandatoryConditions: [
      "Nenhuma quantidade rejeitada pode ser contabilizada como aceita.",
      "A avaliação de riscos e prazos deve identificar hipóteses e responsáveis.",
      "Fontes e critérios de medição devem ser explicitados.",
      "A aprovação final depende de revisão humana; esta rubrica não libera certificado automaticamente."
    ]
  },
  project: {
    title: "Dossiê de Planejamento, Medição e Recuperação de Obra Simulada",
    deliverables: [
      "Declaração de escopo com requisitos, exclusões e critérios de aceite",
      "EAP e dicionário de ao menos cinco pacotes de trabalho",
      "Memória de quantitativos com versões e critérios de desconto",
      "Cronograma com predecessoras, caminho crítico e linha de base",
      "Composição de custos e cronograma físico-financeiro",
      "Boletim de medição com pendências e saldo contratual",
      "Registro de riscos e plano de suprimentos com gatilhos",
      "Relatório de desvios e proposta de recuperação com premissas",
      "Matriz de encerramento e evidências de aceite"
    ],
    reviewCriteria: [
      "Coerência entre quantitativos, custos, cronograma e medições",
      "Rastreabilidade de dados e versões",
      "Justificativa de alternativas e limites técnicos",
      "Qualidade dos registros e capacidade de auditoria"
    ]
  },
  disclaimer: "Curso livre profissional; não substitui formação superior, registro profissional ou atribuições legalmente reservadas."
} as const;
