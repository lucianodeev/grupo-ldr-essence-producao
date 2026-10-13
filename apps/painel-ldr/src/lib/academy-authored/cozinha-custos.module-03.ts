/** Módulo 03 autoral em elaboração. Não publicar antes de validação técnica. */
export const COZINHA_CUSTOS_MODULE_03_DRAFT = {
  slug: "boas-praticas-controle-custos-cozinhas",
  module: 3,
  publicationReady: false,
  lessons: [
    {
      id: "gas120-m03-a01",
      title: "Ponto de equilíbrio e análise de sensibilidade do menu",
      objective: "Estimar volume mínimo de vendas e avaliar impacto de alterações nos custos variáveis.",
      scenario: "Uma operação vende uma refeição por 20 €. Ingredientes, embalagem e taxas variáveis somam 8 € por unidade. Os custos fixos mensais atribuídos à operação são 6.000 €. Desconsidere impostos e limitações de capacidade apenas para o exercício.",
      content: [
        "A margem de contribuição unitária é 20 − 8 = 12 €. O ponto de equilíbrio contabilístico simplificado é 6.000 ÷ 12 = 500 refeições no mês. Nesse volume, a contribuição cobre exatamente os custos fixos considerados.",
        "Se o custo variável subir para 9,50 € sem alterar o preço, a contribuição cai para 10,50 €. O novo ponto de equilíbrio é 6.000 ÷ 10,50 ≈ 571,43; como não se vende fração de refeição, são necessárias pelo menos 572 unidades.",
        "O modelo pressupõe preço e custos unitários constantes, vendas de um único produto e ausência de restrições operacionais. Não confunda ponto de equilíbrio com garantia de caixa positivo, nem use o resultado sem testar procura e capacidade."
      ],
      practice: "Calcule o ponto de equilíbrio se o preço cair para 19 € mantendo custo variável de 8 €. Identifique três hipóteses que precisariam ser revistas num menu com vários pratos.",
      assessment: "Margem 11 €; 6.000 ÷ 11 ≈ 545,45; mínimo 546 refeições. Deve citar mix de vendas, sazonalidade e capacidade ou custos variáveis.",
      references: ["Relatórios internos de custos fixos e variáveis", "Contabilidade de gestão: análise custo-volume-resultado"]
    },
    {
      id: "gas120-m03-a02",
      title: "Rastreabilidade de lotes e resposta a recolha de produto",
      objective: "Desenhar procedimento documental de contenção e identificação de produtos potencialmente afetados.",
      scenario: "O fornecedor informa uma recolha de um lote específico de queijo. O armazém recebeu 12 kg desse lote; 5 kg continuam fechados, 3 kg estão em preparação identificada e 4 kg foram utilizados em refeições já servidas.",
      content: [
        "A primeira ação operacional é identificar e imobilizar produto ainda sob controlo do estabelecimento conforme plano HACCP e instruções da autoridade competente. No cenário, 5 + 3 = 8 kg permanecem no circuito interno e devem ser localizados e segregados sem pressupor segurança.",
        "Reconcilie receção, número do lote, datas, movimentos de stock, receitas e registos de serviço. Os 4 kg já utilizados exigem escalonamento à gestão de segurança alimentar para determinar obrigações de comunicação e medidas aplicáveis; não improvise uma avaliação de risco.",
        "Registe decisão, responsáveis, quantidades, destino, comunicações e encerramento do incidente. A soma 5 + 3 + 4 = 12 kg serve como verificação documental, mas a reconciliação física e os registos podem revelar divergências."
      ],
      practice: "Monte uma tabela de rastreabilidade com origem, lote, localização, quantidade, estado e ação. Escreva um plano de comunicação interno de cinco passos sem divulgar dados pessoais desnecessários.",
      assessment: "Identificar 8 kg sob controlo interno e 4 kg já servidos; prever segregação, escalonamento e documentação, sem decidir autonomamente a segurança do produto.",
      references: ["Regulamento (CE) n.º 178/2002, rastreabilidade e responsabilidades dos operadores", "Procedimentos HACCP, recolha e retirada de produtos do estabelecimento"]
    }
  ]
} as const;
