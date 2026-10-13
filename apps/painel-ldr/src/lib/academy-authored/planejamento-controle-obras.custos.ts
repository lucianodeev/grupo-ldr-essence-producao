import type { AcademyAuthoredLesson } from "./planejamento-controle-obras.initial";

/** Aulas específicas de custos e medições, ainda fora do catálogo publicado. */
export const PLANEJAMENTO_CONTROLE_OBRAS_CUSTOS: AcademyAuthoredLesson[] = [
  {
    id: "pco-m05-a01",
    title: "Orçamento de serviço: decompor preço unitário sem ocultar premissas",
    objective: "Calcular custo direto de serviço a partir de insumos e coeficientes, separando preço de custo e encargos indiretos.",
    content: [
      "Uma composição de custo unitário transforma consumo de recursos por unidade de serviço em custo. Para cada insumo, registre descrição, unidade, coeficiente de consumo, preço unitário, data e origem da cotação. A soma dos produtos coeficiente × preço representa o custo direto unitário sob as premissas adotadas.",
      "Considere 1 m² de revestimento com 1,05 m² de placa a R$ 42,00/m², 4,5 kg de argamassa a R$ 1,80/kg e 0,75 hora de mão de obra a R$ 32,00/h. Os custos são R$ 44,10, R$ 8,10 e R$ 24,00, totalizando R$ 76,20/m². O fator de 1,05 representa perda hipotética de 5% de placa, e não uma taxa universal.",
      "Para 180 m², o custo direto estimado é R$ 13.716,00. Não se deve chamar esse valor de preço de venda: mobilização, administração, tributos, riscos e margem dependem do contrato, do mercado e da legislação aplicável.",
      "Se a equipe usar um preço atualizado de placa, mantenha a cotação anterior e registre a revisão. Uma composição sem rastreabilidade de preços não permite explicar variações."
    ],
    caseStudy: "O orçamento de um piso foi apresentado por R$ 70,00/m², mas a planilha não mostrava perdas nem horas de mão de obra. Ao recompor os insumos, a equipe identifica R$ 76,20/m² de custo direto e revisa a proposta antes de assumir obrigação contratual.",
    exercise: "Reproduza a composição de 1 m² e o total para 180 m². Depois recalcule o custo unitário se o preço da placa subir de R$ 42,00 para R$ 46,00, mantendo todos os coeficientes.",
    assessment: [
      "Composição inicial: R$ 76,20/m².",
      "Total inicial: R$ 13.716,00 para 180 m².",
      "Nova parcela de placa: 1,05 × R$ 46,00 = R$ 48,30/m².",
      "Novo custo direto unitário: R$ 80,40/m²; diferença de R$ 4,20/m²."
    ],
    references: [
      "Caixa Econômica Federal. SINAPI — Metodologias e Conceitos, consultar edição vigente.",
      "Mattos, Aldo Dórea. Como Preparar Orçamentos de Obras. Editora Pini."
    ]
  },
  {
    id: "pco-m06-a01",
    title: "Cronograma físico-financeiro: conciliar produção e desembolso",
    objective: "Distribuir o orçamento por períodos com base nas quantidades programadas, distinguindo execução, medição e pagamento.",
    content: [
      "O cronograma físico-financeiro associa o avanço previsto dos serviços ao valor correspondente. O percentual físico não deve ser confundido com o percentual de desembolso quando há antecipações, retenções ou pagamentos de materiais antes da instalação.",
      "Considere um serviço de 200 m² ao valor contratual hipotético de R$ 100,00/m². O plano prevê 50 m² na semana 1, 80 m² na semana 2 e 70 m² na semana 3. Os valores de produção são R$ 5.000,00, R$ 8.000,00 e R$ 7.000,00. O acumulado previsto passa por 25%, 65% e 100% do serviço.",
      "Se o contrato prevê pagamento dez dias após a medição aprovada, a curva de caixa terá deslocamento temporal em relação à curva de produção. Registrar as duas curvas evita tratar trabalho executado como dinheiro disponível.",
      "Uma atualização útil apresenta quantidade prevista, quantidade realizada, valor medido e valor efetivamente pago. Diferenças entre essas quatro medidas exigem explicações distintas e não devem ser agregadas em um único indicador."
    ],
    caseStudy: "Ao fim da segunda semana, a equipe concluiu apenas 110 m² dos 130 m² planejados. O avanço real acumulado é 55%, contra 65% previsto. O financeiro informa que a primeira medição ainda não foi paga, embora a execução correspondente tenha sido aceita.",
    exercise: "Monte a tabela semanal com produção e valor previsto. Calcule o desvio acumulado ao fim da semana 2 quando a produção real totaliza 110 m² e identifique por que o saldo bancário não pode ser inferido desse desvio.",
    assessment: [
      "Orçamento contratual hipotético: R$ 20.000,00.",
      "Acumulado previsto na semana 2: 130 m², 65% e R$ 13.000,00.",
      "Acumulado realizado na semana 2: 110 m², 55% e R$ 11.000,00.",
      "Desvio físico: menos 20 m² ou menos 10 pontos percentuais; pagamento depende das condições contratuais."
    ],
    references: [
      "Project Management Institute. A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed., 2021.",
      "Mattos, Aldo Dórea. Planejamento e Controle de Obras. Editora Pini."
    ]
  },
  {
    id: "pco-m07-a01",
    title: "Curva ABC de custos: priorizar insumos sem perder rastreabilidade",
    objective: "Ordenar itens por impacto financeiro, calcular participação acumulada e justificar prioridades de cotação e controle.",
    content: [
      "A curva ABC é uma análise de concentração: itens são ordenados pelo valor total, e calcula-se a participação individual e acumulada. A classificação A, B ou C depende dos limites escolhidos pela organização; percentuais usuais são convenções de gestão, não regras técnicas universais.",
      "Em um orçamento fictício de R$ 100.000,00, cinco itens representam: estrutura R$ 45.000,00, instalações R$ 25.000,00, revestimentos R$ 15.000,00, esquadrias R$ 10.000,00 e pintura R$ 5.000,00. As participações acumuladas são 45%, 70%, 85%, 95% e 100%.",
      "A leitura gerencial sugere revisar primeiro quantitativos e cotações de estrutura e instalações, que concentram 70% do valor. Contudo, um item barato pode ser crítico para o prazo ou para a segurança; a curva ABC não substitui a análise de risco nem o caminho crítico.",
      "Antes de comparar versões da curva, normalize unidades, critérios de agrupamento e data-base. Caso contrário, uma mudança aparente de prioridade pode decorrer apenas de agrupamento diferente."
    ],
    caseStudy: "O comprador dedica a mesma quantidade de tempo a todos os insumos. Após ordenar os valores, a equipe concentra dupla cotação nos itens de maior impacto e mantém controle de prazo de uma peça de baixo custo, porém de fornecimento demorado.",
    exercise: "Ordene os cinco itens do caso, calcule participação individual e acumulada, proponha uma política de cotação para os dois primeiros e identifique um motivo pelo qual pintura poderia exigir atenção apesar de representar apenas 5%.",
    assessment: [
      "A soma dos itens é R$ 100.000,00.",
      "Participações acumuladas corretas: 45%, 70%, 85%, 95%, 100%.",
      "Os dois primeiros itens concentram 70% do orçamento.",
      "A justificativa diferencia impacto financeiro de criticidade de prazo e qualidade."
    ],
    references: [
      "Caixa Econômica Federal. SINAPI — documentação técnica, consultar versão vigente.",
      "Mattos, Aldo Dórea. Como Preparar Orçamentos de Obras. Editora Pini."
    ]
  },
  {
    id: "pco-m08-a01",
    title: "Medição contratual: reconciliar quantidade executada e valor devido",
    objective: "Produzir memória de medição com saldo contratual e impedir faturamento de quantidades não aceitas.",
    content: [
      "Uma medição é uma apuração documentada do serviço executado conforme o contrato. Ela deve registrar período, item, unidade, quantidade contratada, acumulado anterior, execução aceita no período, acumulado atual, saldo e preço unitário. Fotos e diários ajudam, mas não substituem os critérios contratuais de aceitação.",
      "Considere 500 m² de pintura a R$ 28,00/m². Até a medição anterior foram aceitos 180 m². No período atual, foram executados 140 m², mas 20 m² exigem correção e ainda não foram aceitos. A quantidade elegível nesta medição é 120 m², no valor de R$ 3.360,00.",
      "O acumulado aceito passa a 300 m², equivalente a R$ 8.400,00; o saldo contratual não medido é 200 m², ou R$ 5.600,00. A quantidade executada, porém rejeitada, deve aparecer em registro de pendência para reinspeção.",
      "A medição não determina automaticamente o pagamento líquido: retenções, adiantamentos, tributos e prazos de aprovação dependem do contrato. Separar medição de liquidação financeira reduz conflitos."
    ],
    caseStudy: "Um empreiteiro solicita pagamento pelos 140 m² pintados na semana. O fiscal documenta 20 m² com falhas de cobertura, aceita 120 m² e registra a necessidade de reinspeção após correção, sem apagar a produção reportada.",
    exercise: "Prepare o boletim de medição com os valores do caso e explique por que 140 m² executados não significam 140 m² medidos. Apresente quantidade contratual, anterior, atual aceita, acumulada e saldo.",
    assessment: [
      "Quantidade aceita no período: 120 m².",
      "Valor da medição atual: R$ 3.360,00.",
      "Acumulado aceito: 300 m² e R$ 8.400,00.",
      "Saldo não medido: 200 m² e R$ 5.600,00; 20 m² pendentes de correção."
    ],
    references: [
      "Project Management Institute. A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed., 2021.",
      "ISO 21502:2020 — Project, programme and portfolio management — Guidance on project management."
    ]
  }
];
