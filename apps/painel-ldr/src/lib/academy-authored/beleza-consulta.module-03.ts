/** Módulo 03 autoral em elaboração. Não publicar; respeitar normas locais e competências profissionais. */
export const CONSULTA_BELEZA_MODULE_03_DRAFT = {
  slug: "consulta-segura-servicos-beleza",
  module: 3,
  publicationReady: false,
  lessons: [
    {
      id: "beauty60-m03-a01",
      title: "Leitura crítica de rótulos e compatibilidade de cosméticos",
      objective: "Identificar informação obrigatória e decidir quando não utilizar um produto.",
      scenario: "O salão recebe um cosmético com lista de ingredientes, lote e símbolo de período após abertura, mas sem instruções legíveis no idioma exigido para a comercialização local. Uma cliente relata reação anterior a um ingrediente semelhante.",
      content: [
        "Antes da utilização, verifique identificação do produto, responsável, lote, prazo de validade ou período após abertura quando aplicável, precauções e instruções de uso exigidas. Um lote legível não compensa a falta de informação necessária à utilização segura.",
        "A lista INCI permite reconhecer ingredientes declarados, mas não autoriza diagnosticar alergias nem afirmar que dois produtos têm risco idêntico. Se houver dúvida sobre reação prévia, não improvise teste nem substitua orientação de profissional habilitado.",
        "Documente a não conformidade e consulte fornecedor ou responsável técnico. Suspenda o uso quando não for possível confirmar requisitos e condições de segurança, sem alterar ou traduzir informalmente advertências como se fossem instruções oficiais."
      ],
      practice: "Crie uma ficha de conferência de receção com oito campos, incluindo lote, integridade, idioma das advertências, condições de armazenamento e decisão de liberação.",
      assessment: "Identificar ausência de informação legível como motivo para verificação antes de uso; distinguir leitura de rótulo de diagnóstico e registar decisão.",
      references: ["Regulamento (CE) n.º 1223/2009 relativo aos produtos cosméticos, incluindo artigo 19.º", "Orientações da autoridade competente e instruções do fabricante"]
    },
    {
      id: "beauty60-m03-a02",
      title: "Planeamento de agenda com tempo de processamento e qualidade",
      objective: "Calcular capacidade real de atendimento sem omitir etapas de segurança.",
      scenario: "Uma profissional dispõe de 360 minutos úteis. Cada serviço dura 45 minutos, requer 15 minutos de preparação e processamento do posto, e há uma pausa obrigatória de 30 minutos dentro desse período.",
      content: [
        "O tempo útil para ciclos de atendimento é 360 − 30 = 330 minutos. Cada ciclo completo consome 45 + 15 = 60 minutos. A capacidade aritmética máxima é piso(330 ÷ 60) = 5 serviços, com 30 minutos restantes.",
        "Agendar seis serviços exigiria 360 minutos apenas para os ciclos, além da pausa; portanto excederia o tempo disponível em 30 minutos. Não reduza higienização, tempo de contacto de produtos ou intervalos de segurança para acomodar reservas.",
        "A capacidade calculada é um limite didático. A operação real deve prever atrasos, documentação, imprevistos, tempos de ventilação ou processamento aplicáveis e necessidades individuais."
      ],
      practice: "Recalcule a capacidade se a preparação passar a 20 minutos por serviço e proponha um quadro horário com pausa e margem para atraso.",
      assessment: "Ciclo de 65 minutos; piso(330 ÷ 65) = 5 serviços, com 5 minutos restantes. Deve reconhecer que a margem é insuficiente para imprevistos e recomendar ajuste prudente.",
      references: ["Procedimentos operacionais e de higienização do estabelecimento", "Instruções de uso e tempos de processamento dos produtos e instrumentos"]
    }
  ]
} as const;
