/** Módulo 04 autoral em elaboração. Não publicar sem revisão de segurança alimentar. */
export const COZINHA_CUSTOS_MODULE_04_DRAFT = {
  slug: "boas-praticas-controle-custos-cozinhas",
  module: 4,
  publicationReady: false,
  lessons: [
    {
      id: "gas120-m04-a01",
      title: "Plano HACCP: distinguir monitorização, correção e verificação",
      objective: "Documentar decisões sobre perigos e desvios sem inventar limites críticos universais.",
      scenario: "Numa cozinha, o registo de uma etapa de conservação indica desvio relativamente ao limite definido no plano HACCP validado pelo estabelecimento. O colaborador propõe apagar o registo e continuar o serviço.",
      content: [
        "A análise de perigos considera perigos biológicos, químicos e físicos e identifica medidas de controlo adequadas ao processo. A determinação de pontos críticos, limites e procedimentos deve seguir o plano HACCP aplicável e validação competente, não uma regra improvisada.",
        "Monitorização é a observação ou medição planeada de um controlo; ação corretiva trata o desvio e o produto potencialmente afetado conforme procedimento; verificação avalia se o sistema funciona como previsto. São funções diferentes e exigem evidência.",
        "Perante desvio, preserve o registo, identifique o produto potencialmente afetado, impeça a sua utilização até decisão autorizada e comunique ao responsável. Não conclua que o alimento é seguro com base apenas numa medição posterior favorável."
      ],
      practice: "Construa uma tabela de seis colunas: etapa, perigo, controlo, evidência de monitorização, ação perante desvio e verificação. Use apenas limites definidos no plano do cenário, sem propor temperaturas genéricas.",
      assessment: "Distinguir monitorização, correção e verificação; conservar rastreabilidade; encaminhar decisão sobre o produto a responsável habilitado.",
      references: ["Regulamento (CE) n.º 852/2004 relativo à higiene dos géneros alimentícios, artigo 5.º", "Codex Alimentarius, General Principles of Food Hygiene (CXC 1-1969), princípios HACCP"]
    },
    {
      id: "gas120-m04-a02",
      title: "Previsão de procura e erro de planeamento de produção",
      objective: "Medir desvios entre previsão e procura real e propor ajustes sem comprometer segurança alimentar.",
      scenario: "Uma cantina prevê vender 80, 100 e 120 refeições em três dias. As vendas reais são 90, 90 e 110. Para simplificar, considere uma refeição vendida como uma unidade de procura atendida, sem ruturas.",
      content: [
        "Erros absolutos por dia: |90 − 80| = 10, |90 − 100| = 10 e |110 − 120| = 10 refeições. O erro absoluto médio (MAE) é (10 + 10 + 10) ÷ 3 = 10 refeições.",
        "A previsão total foi 300 refeições; a procura observada total foi 290. O viés acumulado, definido como previsão menos real, é +10 refeições, sinalizando sobreprevisão agregada neste período. MAE e viés respondem a perguntas diferentes.",
        "Para ajustar produção, examine sazonalidade, reservas, eventos e limites de capacidade. Sobras não podem ser automaticamente reutilizadas: qualquer reaproveitamento depende de rastreabilidade, condições de segurança e procedimentos autorizados."
      ],
      practice: "Recalcule MAE e viés para previsões de 95, 95 e 105 refeições, mantendo as vendas reais. Explique por que menor MAE não garante melhor resultado financeiro.",
      assessment: "Erros absolutos 5, 5 e 5; MAE = 5 refeições. Viés total: (95 + 95 + 105) − (90 + 90 + 110) = +5 refeições. Considerar custos, ruturas e desperdício.",
      references: ["Registos de previsão, vendas e produção do estabelecimento", "Princípios de previsão de procura e medição de erro (MAE e viés)", "Procedimentos HACCP para gestão de alimentos preparados"]
    }
  ]
} as const;
