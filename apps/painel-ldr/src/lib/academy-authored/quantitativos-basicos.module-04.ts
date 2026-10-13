/** Módulo 04 autoral em revisão. Não publicar antes da validação técnica. */
export const QUANTITATIVOS_BASICOS_MODULE_04_DRAFT = {
  slug: "leitura-projetos-quantitativos-basicos",
  module: 4,
  publicationReady: false,
  lessons: [
    {
      id: "obra60-m04-a01",
      title: "Volumes de escavação por secções e unidades de medição",
      objective: "Calcular volumes geométricos de valas e explicitar diferenças entre volume in situ e material transportado.",
      scenario: "Uma vala de secção retangular uniforme tem 18 m de comprimento, 0,80 m de largura e 1,20 m de profundidade. Um segundo troço mede 7 m × 0,80 m × 0,90 m.",
      content: [
        "Para a hipótese de secções retangulares constantes, o primeiro volume geométrico é 18 × 0,80 × 1,20 = 17,28 m³; o segundo é 7 × 0,80 × 0,90 = 5,04 m³. Total: 22,32 m³ in situ.",
        "O volume de escavação geométrico não é automaticamente igual ao volume solto transportado. Empolamento, taludes, sobrelarguras, contenções e critérios de medição contratuais devem ser avaliados separadamente por responsável habilitado.",
        "Registe os dois troços em linhas distintas com dimensões, unidade, desenho de referência e premissas. A geometria simplificada do exercício não constitui orientação para executar escavações nem dispensa projeto de segurança."
      ],
      practice: "Recalcule o total se o segundo troço passar a 1,10 m de profundidade. Apresente mapa com volumes separados e explique por que não aplicar fator de empolamento sem dados.",
      assessment: "Segundo troço 7 × 0,80 × 1,10 = 6,16 m³; total 23,44 m³. Distinguir volume in situ de volume solto e documentar hipóteses.",
      references: ["Projeto de escavações e mapa de medições da obra", "Critérios contratuais de medição de movimentos de terras e plano de segurança aplicável"]
    },
    {
      id: "obra60-m04-a02",
      title: "Conversão de unidades e verificação de coerência de quantitativos",
      objective: "Detetar erros de escala e conversão antes de consolidar uma encomenda.",
      scenario: "Uma planta indica 3.500 mm de comprimento e 240 cm de largura para uma laje retangular de espessura uniforme de 120 mm. Uma folha de cálculo apresenta volume de 1008 m³.",
      content: [
        "Converta todas as medidas para metros antes de multiplicar: 3.500 mm = 3,50 m; 240 cm = 2,40 m; 120 mm = 0,120 m. Volume geométrico: 3,50 × 2,40 × 0,120 = 1,008 m³.",
        "O valor 1008 m³ é mil vezes maior que o resultado correto e sinaliza provável erro de unidade ou separador decimal. Uma verificação de ordem de grandeza e a indicação da unidade em cada coluna ajudam a detetar falhas.",
        "Antes de encomendar material, confirme geometria, vãos, elementos associados, tolerâncias, critério de medição e revisão do projeto. Não adicione reservas arbitrárias a um volume geométrico sem justificação técnica."
      ],
      practice: "Crie uma folha de cálculo com colunas de valor original, unidade, fator de conversão e valor em metros. Explique como uma fórmula de validação pode sinalizar volumes anómalos.",
      assessment: "Dimensões convertidas 3,50 m, 2,40 m e 0,120 m; volume 1,008 m³; erro de fator 1000 na folha apresentada.",
      references: ["Sistema Internacional de Unidades (SI), BIPM", "Planta cotada, especificações e critérios de medição do projeto"]
    }
  ]
} as const;
