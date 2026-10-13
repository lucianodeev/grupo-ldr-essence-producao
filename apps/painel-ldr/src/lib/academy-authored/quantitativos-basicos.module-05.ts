/** Módulo 05 autoral em elaboração. Não publicar; exemplos não substituem projeto ou responsável técnico. */
export const QUANTITATIVOS_BASICOS_MODULE_05_DRAFT = {
  slug: "leitura-projetos-quantitativos-basicos",
  module: 5,
  publicationReady: false,
  lessons: [
    {
      id: "obra60-m05-a01",
      title: "Quantificação de pintura por superfícies e demãos",
      objective: "Distinguir área de aplicação, consumo teórico por demão e quantidade comercial de produto.",
      scenario: "Uma sala possui quatro paredes: duas com 5,0 m e duas com 4,0 m de comprimento, todas com 2,8 m de altura. Há uma porta de 0,9 × 2,1 m e duas janelas de 1,2 × 1,0 m. O exercício considera duas demãos, rendimento nominal de 10 m²/L por demão e reserva didática de 8%.",
      content: [
        "O perímetro é 2 × (5 + 4) = 18 m. A área bruta das paredes é 18 × 2,8 = 50,40 m². Descontando integralmente porta (1,89 m²) e janelas (2,40 m²), a área líquida é 46,11 m²; tetos, guarnições e retornos não estão incluídos.",
        "A área equivalente para duas demãos é 46,11 × 2 = 92,22 m²-demão. Com rendimento hipotético de 10 m²/L por demão, o consumo teórico é 9,222 L. Aplicando a reserva didática de 8%, obtém-se 9,95976 L, aproximadamente 9,96 L.",
        "O rendimento real depende de substrato, porosidade, preparação, método de aplicação e ficha técnica. A reserva e os descontos de vãos são hipóteses do exercício, não regras universais de orçamento. Confira embalagens disponíveis e critérios contratuais antes de encomendar."
      ],
      practice: "Refaça a memória de cálculo com três demãos e rendimento de 8 m²/L por demão, mantendo 8% de reserva. Separe área líquida, área-demão e litros.",
      assessment: "Área líquida 46,11 m²; área-demão 138,33 m²; consumo teórico 17,29125 L; com reserva 18,67455 L (aproximadamente 18,67 L). Explicitar hipóteses e arredondamento comercial.",
      references: ["Plantas e mapa de vãos do projeto", "Fichas técnicas de tintas e procedimentos de medição aplicáveis"]
    },
    {
      id: "obra60-m05-a02",
      title: "Medição de rodapés e perfis lineares com plano de cortes",
      objective: "Converter comprimentos de projeto em unidades comerciais, reconhecendo perdas de corte e emendas.",
      scenario: "Uma divisão retangular mede 6,0 m × 4,0 m. Existe uma abertura de porta de 0,90 m sem rodapé e um armário fixo de 2,0 m junto a uma parede, onde o projeto dispensa rodapé. As barras comerciais medem 2,40 m.",
      content: [
        "O perímetro geométrico é 2 × (6 + 4) = 20,0 m. Sob as exclusões explícitas do projeto, o comprimento líquido é 20,0 − 0,90 − 2,0 = 17,10 m lineares. Não desconte automaticamente outras aberturas ou móveis sem indicação.",
        "O limite inferior por comprimento é teto(17,10 ÷ 2,40) = 8 barras, que fornecem 19,20 m. Contudo, oito barras só serão suficientes se a distribuição dos segmentos e o plano de cortes permitirem aproveitar os comprimentos; cantos, emendas e peças inutilizáveis podem exigir mais.",
        "Prepare um mapa por parede com trechos, obstáculos, peças comerciais e sobras previstas. A unidade de medição do contrato pode ser metro linear instalado, enquanto a compra é feita em barras; mantenha essas quantidades separadas."
      ],
      practice: "Monte plano de cortes preliminar para trechos de 6,0 m, 4,0 m, 3,1 m e 4,0 m, que somam 17,1 m, usando barras de 2,4 m. Indique se o limite inferior de oito barras é viável sob emendas permitidas e sem perda de serra, e liste hipóteses a verificar.",
      assessment: "Comprimento líquido 17,10 m; mínimo aritmético oito barras. Deve distinguir limite teórico de plano executável, documentar cortes e não inventar regra de emendas.",
      references: ["Desenhos de acabamentos e especificações do projeto", "Ficha técnica do perfil, comprimentos comerciais e critérios de medição do contrato"]
    }
  ]
} as const;
