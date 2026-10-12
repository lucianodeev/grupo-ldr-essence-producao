/** Conteúdo autoral em elaboração: leitura de projetos e quantitativos. Não publicar no catálogo. */
export const QUANTITATIVOS_BASICOS_DRAFT = {
  slug: "leitura-projetos-quantitativos-basicos",
  proposedHours: 60,
  publicationReady: false,
  lessons: [
    {
      id: "obra60-m01-a01",
      title: "Escala, cotas e área líquida de revestimento",
      objective: "Calcular quantidade líquida com premissas rastreáveis e sem medir diretamente desenho não calibrado.",
      scenario: "Parede retangular com comprimento cotado de 4,20 m e altura de 2,70 m. Porta de 0,90 × 2,10 m. Uma planta digital foi impressa com ajuste automático de página.",
      content: [
        "Prefira cotas explícitas à régua sobre impressão redimensionada. Se uma medida não estiver cotada, registe a incerteza e peça confirmação ao projetista antes de orçamentar como definitiva.",
        "A área bruta é 4,20 × 2,70 = 11,34 m². O vão da porta mede 0,90 × 2,10 = 1,89 m². Se o critério de medição exigir desconto integral do vão, a área líquida é 9,45 m².",
        "Regras de medição, remates, desperdício e faces de vãos variam com contrato e especificação. Nunca some percentagem de desperdício sem a declarar separadamente."
      ],
      practice: "Calcule a área líquida para duas paredes iguais, uma com porta e outra sem abertura. Apresente quadro com fórmula, unidade, deduções e premissas.",
      assessment: "Resultado esperado: 9,45 + 11,34 = 20,79 m² antes de desperdício. Avaliar unidades, deduções e premissas.",
      references: ["Projeto e mapa de medições contratual", "Especificações técnicas do revestimento"]
    },
    {
      id: "obra60-m01-a02",
      title: "Volume de betonagem e verificação dimensional",
      objective: "Estimar volume geométrico e separar quantidade de projeto de perdas de execução.",
      scenario: "Laje de 6,00 m por 4,50 m e espessura nominal de 0,12 m, sem aberturas, vigas ou desníveis considerados.",
      content: [
        "Converta todas as dimensões para metros antes de multiplicar. O volume geométrico é 6,00 × 4,50 × 0,12 = 3,24 m³.",
        "A estimativa não substitui projeto estrutural nem instruções do responsável técnico. Não presuma que a espessura nominal é adequada ou que o elemento pode ser executado sem verificação profissional.",
        "Perdas, sobrespessura e tolerâncias são parcelas distintas e dependem de condições de obra e critérios de fornecimento. Apresente-as em linha separada e nunca as esconda na quantidade geométrica."
      ],
      practice: "Prepare uma ficha de medição com dimensão, fonte, unidade, volume geométrico e três riscos de desvio. Compare acréscimo hipotético de 5% apenas como cenário, não como regra.",
      assessment: "Volume geométrico 3,24 m³; cenário +5% = 3,402 m³, sem arredondamento de encomenda automático.",
      references: ["Projeto estrutural aprovado", "Condições de medição e fornecimento contratadas"]
    }
  ]
} as const;
