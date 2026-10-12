/** Módulo 02: conteúdo original em revisão. Não publicar antes da validação. */
export const QUANTITATIVOS_BASICOS_MODULE_02_DRAFT = {
  slug: "leitura-projetos-quantitativos-basicos",
  module: 2,
  publicationReady: false,
  lessons: [
    {
      id: "obra60-m02-a01",
      title: "Quantificação de revestimentos com recortes e desperdício",
      objective: "Separar área geométrica, recortes, perdas e quantidade de compra.",
      scenario: "Um pavimento retangular mede 7,20 m por 5,40 m. Há uma abertura não revestida de 1,20 m por 0,90 m. As placas escolhidas cobrem 0,36 m² por unidade; o cenário de planeamento admite 8% de perdas.",
      content: [
        "A área bruta é 7,20 × 5,40 = 38,88 m². A abertura mede 1,20 × 0,90 = 1,08 m². A área geométrica líquida, admitindo desconto integral da abertura, é 37,80 m².",
        "Com perda hipotética de 8%, a área de aquisição de referência é 37,80 × 1,08 = 40,824 m². Dividindo por 0,36 m²/placa, obtêm-se 113,4 placas; a aquisição mínima aritmética é 114 placas inteiras.",
        "A percentagem de perdas é premissa do exercício, não norma geral. Confirme orientação de assentamento, dimensão das peças, padrão, cortes, lotes e embalagem comercial antes de encomendar."
      ],
      practice: "Apresente mapa de medição com área bruta, abertura, área líquida, perdas e quantidade inteira. Recalcule para 12% de perdas e explique a diferença.",
      assessment: "Para 12%, 42,336 m² e 118 placas inteiras; indicar que embalagem e recortes podem alterar a compra efetiva.",
      references: ["Planta cotada e mapa de acabamentos do projeto", "Ficha técnica e condições de fornecimento do revestimento"]
    },
    {
      id: "obra60-m02-a02",
      title: "Rastreabilidade de revisões de projeto no orçamento",
      objective: "Controlar alterações dimensionais sem misturar versões de desenho.",
      scenario: "A revisão R01 indica parede de 8,00 m × 2,80 m. A revisão R02 altera o comprimento para 8,60 m e acrescenta abertura de 1,00 m × 2,10 m. O orçamento anterior não tinha aberturas.",
      content: [
        "A área R01 é 8,00 × 2,80 = 22,40 m². A área bruta R02 é 8,60 × 2,80 = 24,08 m² e a líquida, com desconto integral da abertura, é 21,98 m².",
        "A variação líquida entre versões é 21,98 − 22,40 = −0,42 m². A parede aumentou em comprimento, mas a abertura reduziu a quantidade líquida de revestimento; comparar apenas o comprimento levaria a erro.",
        "Registe identificação da prancha, revisão, data, disciplina, elemento alterado, critério de medição, responsável pela confirmação e impacto em prazo/custo. Uma alteração não aprovada não deve ser tratada como ordem de execução."
      ],
      practice: "Elabore registo de alterações R01→R02, com memória de cálculo e campo para validação técnica. Explique a diferença entre mudança de desenho e mudança contratual aprovada.",
      assessment: "Área R01 22,40 m²; R02 21,98 m²; variação −0,42 m², com rastreabilidade de versões e ressalva de aprovação.",
      references: ["Sistema de controlo de documentos e revisões do projeto", "Contrato e critérios de medição aplicáveis à obra"]
    }
  ]
} as const;
