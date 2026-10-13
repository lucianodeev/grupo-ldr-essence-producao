/** Módulo autoral 02 em elaboração — não integrar no catálogo antes da revisão. */
export const RECEPCAO_HOTELEIRA_MODULE_02_DRAFT = {
  slug: "atendimento-operacoes-recepcao-hoteleira",
  module: 2,
  publicationReady: false,
  lessons: [
    {
      id: "hotel60-m02-a01",
      title: "Conciliação do fecho de caixa e depósitos",
      objective: "Reconciliar pagamentos, lançamentos no PMS e valores disponíveis sem confundir autorização com liquidação.",
      scenario: "O turno regista 3 pagamentos em dinheiro (80 €, 120 € e 50 €), um reembolso de 30 € em dinheiro e dois pagamentos por cartão de 90 € e 140 €. O fundo de caixa inicial era de 100 €.",
      content: [
        "Separe o movimento por meio de pagamento. Entradas em dinheiro: 250 €. Saída por reembolso: 30 €. Movimento líquido de numerário: 220 €. Com fundo inicial de 100 €, o numerário esperado no fecho é 320 €, se não houver outros movimentos.",
        "O total de cartões, 230 €, pertence ao relatório do terminal e à reconciliação de transações; não deve ser somado ao numerário físico. Uma transação autorizada pode ainda não estar liquidada na conta bancária.",
        "Compare recibos, lançamentos no PMS, relatório do terminal, reembolsos e contagem assinada. Em divergência, registe diferença e escalone-a segundo a política interna, sem ajustar valores para forçar o fecho."
      ],
      practice: "Monte tabela de reconciliação por meio de pagamento e descreva a investigação se a contagem física for 315 €. Identifique os documentos de suporte.",
      assessment: "Numerário esperado 320 €, diferença de -5 € na hipótese apresentada; cartões 230 € fora da contagem de numerário. A resposta deve preservar trilho de auditoria.",
      references: ["Procedimentos internos de tesouraria e fecho de caixa", "Política contratual de pagamentos e reembolsos do alojamento"]
    },
    {
      id: "hotel60-m02-a02",
      title: "Gestão de pedidos de acessibilidade sem pressupostos",
      objective: "Confirmar necessidades funcionais e disponibilidade com comunicação respeitosa.",
      scenario: "Um hóspede informa que precisa de acesso sem degraus, mas o quarto atribuído tem um desnível na entrada.",
      content: [
        "Pergunte quais características concretas são necessárias, sem exigir diagnóstico ou detalhes clínicos. Verifique percurso de entrada, elevadores, portas, casa de banho e saídas de emergência com informação fiável da propriedade.",
        "Não descreva um quarto como acessível apenas por estar no piso térreo. Confirme medidas e condições relevantes; quando houver dúvida, consulte a equipa responsável e explique o que está efetivamente verificado.",
        "Se a opção reservada não satisfaz a necessidade, apresente alternativas disponíveis, custos e condições de forma transparente e documente a solução aceite. Evite promessas de adaptação sem autorização."
      ],
      practice: "Crie uma lista de verificação de sete características do percurso e redija resposta que ofereça alternativa sem solicitar dados médicos.",
      assessment: "A resposta deve reconhecer o desnível, confirmar características específicas, evitar suposições e preservar autonomia e privacidade.",
      references: ["Requisitos de acessibilidade aplicáveis ao estabelecimento e à jurisdição", "Políticas internas de atendimento inclusivo e segurança"]
    }
  ]
} as const;
