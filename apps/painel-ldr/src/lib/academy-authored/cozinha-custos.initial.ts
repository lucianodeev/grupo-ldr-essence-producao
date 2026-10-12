/** Curso livre em elaboração: custos de cozinha profissional. Não publicar. */
export const COZINHA_CUSTOS_DRAFT = {
  slug: "boas-praticas-controle-custos-cozinhas",
  proposedHours: 120,
  publicationReady: false,
  lessons: [
    {
      id: "gas120-m01-a01",
      title: "Ficha técnica e rendimento real de uma preparação",
      objective: "Distinguir peso bruto, peso líquido, rendimento e custo por dose.",
      scenario: "A cozinha compra 8 kg de cenoura por 1,60 €/kg. Depois de descascar e aparar, restam 6,4 kg. Cada dose usa 160 g líquidos.",
      content: [
        "O rendimento é 6,4 ÷ 8 = 80%. A perda de preparação é 20% do peso comprado, sem assumir que todas as preparações terão a mesma perda.",
        "O custo do ingrediente comprado é 12,80 €. O custo por kg utilizável é 12,80 ÷ 6,4 = 2,00 €. São possíveis 40 doses de 160 g, com custo de cenoura de 0,32 € por dose.",
        "A ficha técnica deve identificar fornecedor, data, unidade, rendimento medido, quantidade líquida por dose e critérios de atualização. Energia, trabalho, embalagens e outros ingredientes não estão incluídos neste custo parcial."
      ],
      practice: "Recalcule com rendimento observado de 75% e explique o impacto sobre custo por dose, mantendo a dose de 160 g.",
      assessment: "6,0 kg líquidos; 37,5 doses teóricas; custo de ingrediente de aproximadamente 0,3413 € por dose. A produção efetiva em doses inteiras requer regra de arredondamento explícita.",
      references: ["Regulamento (CE) n.º 852/2004 relativo à higiene dos géneros alimentícios", "Ficha técnica e registos internos de rendimento do estabelecimento"]
    },
    {
      id: "gas120-m01-a02",
      title: "Desvio entre consumo teórico e consumo real",
      objective: "Investigar desperdício, diferenças de porcionamento e registos de inventário.",
      scenario: "Foram vendidas 120 doses, cada uma com 180 g de arroz cru previstos. O inventário indica consumo de 25 kg no período.",
      content: [
        "O consumo teórico é 120 × 0,180 = 21,6 kg. A diferença observada é 25 − 21,6 = 3,4 kg.",
        "O desvio relativo ao consumo teórico é 3,4 ÷ 21,6 × 100 ≈ 15,74%. Não é possível atribuir automaticamente a diferença a furto ou desperdício: testes de receita, refeições da equipa, erros de contagem e porcionamento também são hipóteses.",
        "Uma investigação responsável reconcilia compras, transferências, devoluções, inventário inicial e final, produção não vendida e alterações de ficha técnica antes de responsabilizar pessoas."
      ],
      practice: "Construa uma folha de reconciliação com cinco hipóteses e evidências necessárias para cada uma. Calcule o consumo teórico se a porção prevista cair para 170 g.",
      assessment: "Novo consumo teórico 20,4 kg; diferença face a 25 kg = 4,6 kg. A resposta deve distinguir cálculo de causalidade.",
      references: ["Registos de inventário e fichas técnicas do estabelecimento", "Princípios HACCP aplicáveis ao controlo de processos alimentares"]
    }
  ]
} as const;
