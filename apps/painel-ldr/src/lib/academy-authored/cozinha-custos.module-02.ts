/** Conteúdo autoral do módulo 02 em elaboração. Não integrar no catálogo público. */
export const COZINHA_CUSTOS_MODULE_02_DRAFT = {
  slug: "boas-praticas-controle-custos-cozinhas",
  module: 2,
  publicationReady: false,
  lessons: [
    {
      id: "gas120-m02-a01",
      title: "Preço de venda, margem de contribuição e food cost",
      objective: "Distinguir custo de ingredientes, margem de contribuição e lucro líquido.",
      scenario: "Um prato é vendido por 18 €. Ingredientes custam 5,40 €, embalagem 0,60 € e comissão variável do canal 1,80 €. Custos fixos mensais não foram informados.",
      content: [
        "O food cost percentual dos ingredientes é 5,40 ÷ 18 × 100 = 30%. Não confunda esse indicador com o custo variável total nem com lucro.",
        "O custo variável total por prato é 5,40 + 0,60 + 1,80 = 7,80 €. A margem de contribuição unitária é 18 − 7,80 = 10,20 €, equivalente a aproximadamente 56,67% da receita.",
        "A margem de contribuição cobre custos fixos e só depois pode contribuir para resultado. Sem renda, salários fixos, energia, impostos e demais despesas, não se pode afirmar o lucro líquido do prato."
      ],
      practice: "Recalcule os indicadores se a comissão aumentar para 2,70 €. Registe quais custos adicionais faltam para avaliar o resultado do negócio.",
      assessment: "Food cost permanece 30%; custo variável passa a 8,70 €; margem unitária 9,30 €, cerca de 51,67%. Diferenciar contribuição de lucro.",
      references: ["Fichas técnicas e política de formação de preços do estabelecimento", "Conceitos de contabilidade de gestão e margem de contribuição"]
    },
    {
      id: "gas120-m02-a02",
      title: "Planeamento de compras com validade e stock de segurança",
      objective: "Calcular necessidade de aquisição e identificar limites do cálculo perante perecibilidade.",
      scenario: "Uma cozinha prevê utilizar 45 kg de tomate na semana. Tem 12 kg utilizáveis em stock, 5 kg já encomendados e deseja terminar com 8 kg de stock de segurança.",
      content: [
        "A necessidade líquida de compra é consumo previsto + stock final pretendido − stock disponível − encomendas confirmadas: 45 + 8 − 12 − 5 = 36 kg.",
        "O cálculo pressupõe que os 12 kg estão utilizáveis e que os 5 kg chegam a tempo. Lotes perto da validade, atrasos e diferenças de qualidade exigem revisão antes da encomenda.",
        "Separe controlo FEFO (primeiro a expirar, primeiro a sair) de FIFO (primeiro a entrar, primeiro a sair) quando a gestão da validade o exigir. A rotação nunca autoriza usar alimentos fora das condições de segurança."
      ],
      practice: "Refaça a necessidade se 4 kg do stock atual forem rejeitados na inspeção. Apresente plano de receção e registo de lotes.",
      assessment: "Stock utilizável 8 kg; necessidade de compra 40 kg. Deve explicitar validade, receção, temperaturas aplicáveis e rastreabilidade sem presumir segurança do produto.",
      references: ["Regulamento (CE) n.º 852/2004 relativo à higiene dos géneros alimentícios", "Procedimentos HACCP e de receção de mercadorias do estabelecimento"]
    }
  ]
} as const;
