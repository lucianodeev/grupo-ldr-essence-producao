/** Módulo 03 autoral em revisão; não publicar no catálogo. */
export const QUANTITATIVOS_BASICOS_MODULE_03_DRAFT = {
  slug: "leitura-projetos-quantitativos-basicos",
  module: 3,
  publicationReady: false,
  lessons: [
    {
      id: "obra60-m03-a01",
      title: "Quantificação de alvenaria com vãos e unidades comerciais",
      objective: "Converter área líquida de parede em quantidade estimada de blocos, explicitando hipóteses.",
      scenario: "Uma parede mede 9,00 m de comprimento por 2,80 m de altura e possui porta de 0,90 m × 2,10 m e janela de 1,20 m × 1,00 m. Para este exercício, o consumo de referência é 12,5 blocos/m², com 5% de reserva.",
      content: [
        "Área bruta: 9,00 × 2,80 = 25,20 m². Vãos: porta 1,89 m² e janela 1,20 m². Área líquida, supondo desconto integral de ambos, é 25,20 − 1,89 − 1,20 = 22,11 m².",
        "Quantidade teórica: 22,11 × 12,5 = 276,375 blocos. Com reserva de 5%, 276,375 × 1,05 = 290,19375; arredondamento para cima resulta em 291 blocos.",
        "O consumo de 12,5 blocos/m² e a reserva de 5% são hipóteses didáticas, não valores universais. Antes da compra, confira modulação, dimensões reais, juntas, peças especiais, critério contratual de medição e embalagem comercial."
      ],
      practice: "Recalcule a quantidade com 8% de reserva e apresente mapa de medição com unidades, fórmula e pressupostos. Identifique dois motivos para a quantidade real divergir.",
      assessment: "Área líquida 22,11 m²; com 8% de reserva, 22,11 × 12,5 × 1,08 = 298,485, ou 299 blocos inteiros; indicar hipóteses e arredondamento.",
      references: ["Projeto de arquitetura e mapa de vãos da obra", "Ficha técnica do bloco, critérios de medição e fornecimento aplicáveis"]
    },
    {
      id: "obra60-m03-a02",
      title: "Mapa de medições auditável e prevenção de dupla contagem",
      objective: "Organizar quantidades por elemento, localização, unidade e versão do desenho.",
      scenario: "Um orçamento contém 18 m² de revestimento da parede A e 12 m² da parede B. Uma segunda folha lista novamente a parede A como 'zona de entrada' com 18 m². O desenho revisto acrescenta 4 m² à parede B.",
      content: [
        "Uma medição auditável identifica código do elemento, localização, disciplina, prancha, revisão, unidade, memória de cálculo e responsável. Designações diferentes não garantem elementos diferentes.",
        "A soma simples das três linhas antigas, 18 + 12 + 18 = 48 m², duplica a parede A. Após reconciliar identificadores e aplicar a revisão da parede B, o total correto do cenário é 18 + (12 + 4) = 34 m².",
        "Conserve histórico de revisão e evidência da decisão: linha duplicada excluída, parede B atualizada e versão usada. Não altere medições aprovadas sem o fluxo de validação previsto no contrato."
      ],
      practice: "Monte uma tabela com identificador único, localização, revisão, quantidade anterior, quantidade atual e motivo da alteração. Explique como impedir duplicações futuras.",
      assessment: "Identificar dupla contagem de 18 m²; total revisto 34 m²; manter rastreabilidade e aprovação de alterações.",
      references: ["Mapa de quantidades e peças desenhadas do projeto", "Procedimento de controlo documental e revisões do empreendimento"]
    }
  ]
} as const;
