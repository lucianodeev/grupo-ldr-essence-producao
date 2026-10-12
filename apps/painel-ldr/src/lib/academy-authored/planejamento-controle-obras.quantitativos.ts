import type { AcademyAuthoredLesson } from "./planejamento-controle-obras.initial";

/** Aulas autorais complementares; ainda não vinculadas à publicação. */
export const PLANEJAMENTO_CONTROLE_OBRAS_QUANTITATIVOS: AcademyAuthoredLesson[] = [
  {
    id: "pco-m02-a01",
    title: "Quantitativos: medir alvenaria com descontos rastreáveis",
    objective: "Calcular área líquida de alvenaria a partir de dimensões de projeto e registrar critérios de desconto de aberturas.",
    content: [
      "O quantitativo é uma estimativa documentada de serviços, não apenas um número extraído de planta. Antes de calcular, defina a unidade de medição, a versão do desenho, os limites do serviço e a regra contratual para vãos, encontros e perdas. Critérios distintos de medição podem produzir resultados diferentes para o mesmo desenho.",
      "Considere uma parede de 8,40 m de comprimento e 2,80 m de altura. A área bruta é 23,52 m². Se houver uma porta de 0,90 × 2,10 m e uma janela de 1,20 × 1,00 m, os vãos totalizam 3,09 m². Pelo critério hipotético de desconto integral de todos os vãos, a área líquida é 20,43 m². Essa convenção deve ser identificada como premissa, pois contratos e referências de composição podem adotar outras regras.",
      "Quantidades de materiais não são automaticamente iguais à área de serviço. Consumo de blocos, argamassa e perdas depende do formato, juntas, paginação e produtividade. A memória de cálculo precisa separar geometria, critérios de medição e coeficientes de consumo para permitir revisão independente.",
      "Mudanças de projeto devem atualizar o quantitativo com referência à revisão do desenho. Sem identificação de versão, o orçamento pode combinar paredes do projeto antigo com portas do projeto novo."
    ],
    caseStudy: "Uma medição apresentada como 23,52 m² ignora porta e janela. O fiscal exige memória de cálculo e identifica que o contrato determina desconto integral dos vãos. A equipe corrige para 20,43 m², preservando o registro da medição anterior.",
    exercise: "Calcule a área líquida de duas paredes: A = 8,40 × 2,80 m, com porta 0,90 × 2,10 m e janela 1,20 × 1,00 m; B = 5,00 × 2,80 m, com porta 0,80 × 2,10 m. Use desconto integral dos vãos e apresente a memória separada por parede.",
    assessment: [
      "Parede A: área bruta 23,52 m², vãos 3,09 m² e área líquida 20,43 m².",
      "Parede B: área bruta 14,00 m², vão 1,68 m² e área líquida 12,32 m².",
      "Total líquido: 32,75 m², com unidades e critério de desconto explícitos.",
      "A memória indica a versão do desenho utilizada."
    ],
    references: [
      "ABNT NBR 12721:2006 — Avaliação de custos unitários de construção para incorporação imobiliária e outras disposições para condomínios edilícios (consultar edição e aplicabilidade vigentes).",
      "Caixa Econômica Federal — SINAPI, documentação técnica e cadernos de composições (consultar versão e critérios vigentes)."
    ]
  },
  {
    id: "pco-m03-a01",
    title: "Dependências e caminho crítico em uma reforma de curta duração",
    objective: "Construir uma rede de precedências e identificar atividades com folga total nula.",
    content: [
      "Um cronograma confiável explicita dependências, e não apenas datas. Em uma rede simples com relações término-início e durações em dias úteis, o início mais cedo de uma atividade é o maior término mais cedo de suas predecessoras. A análise pressupõe calendário e disponibilidade de recursos compatíveis.",
      "Considere A: mobilização (2 dias); B: demolição (3 dias), após A; C: infraestrutura elétrica (4 dias), após B; D: regularização de paredes (2 dias), após B; E: fechamento e acabamento (3 dias), após C e D. A sequência A–B–C–E dura 12 dias; A–B–D–E dura 10 dias. Sob essas premissas, C integra o caminho crítico e D tem dois dias de folga em relação ao marco final.",
      "A folga não é autorização automática para atrasar: pode ser consumida por restrições de recursos, inspeções ou marcos intermediários não representados. O planejamento precisa registrar calendário, dependências externas e critérios para atualizar o avanço.",
      "Ao atualizar a rede, use duração remanescente baseada em evidência de campo. Marcar uma atividade como 80% concluída não revela, sozinho, quantos dias faltam para sua entrega."
    ],
    caseStudy: "A infraestrutura elétrica atrasa dois dias por falta de material. Como está no caminho crítico, a previsão final passa de 12 para 14 dias, se nenhuma medida compensatória for aprovada. A regularização de paredes não explica o atraso final.",
    exercise: "Monte a rede A–E, calcule os dois caminhos, identifique o crítico e estime a data final se C passar de quatro para seis dias. Declare a hipótese de inexistência de restrição adicional de recursos.",
    assessment: [
      "A sequência crítica inicial A–B–C–E totaliza 12 dias.",
      "A rota A–B–D–E totaliza 10 dias.",
      "A folga de D é de dois dias sob as hipóteses informadas.",
      "Com C em seis dias, o término projetado é de 14 dias."
    ],
    references: [
      "Project Management Institute. Practice Standard for Scheduling, 3rd ed., 2019.",
      "ISO 21502:2020 — Project, programme and portfolio management — Guidance on project management."
    ]
  },
  {
    id: "pco-m04-a01",
    title: "Produtividade real: estimar duração com equipes e perdas",
    objective: "Converter quantidade de serviço e produtividade observada em duração estimada, distinguindo capacidade nominal de execução efetiva.",
    content: [
      "Produtividade deve ser expressa com unidade e contexto: por exemplo, 18 m² de revestimento por equipe por dia, incluindo preparação e limpeza. Não compare valores que excluem etapas com valores que as incluem. Condições de acesso, complexidade, experiência e interferências alteram a taxa observada.",
      "Se há 180 m² de revestimento e uma equipe executa 18 m²/dia em condições semelhantes, a duração de produção estimada é de 10 dias úteis. Duas equipes não garantem cinco dias: o espaço pode não permitir trabalho simultâneo, e inspeções ou cura podem limitar o avanço.",
      "A estimativa deve registrar origem da taxa, quantidade, composição da equipe, jornada, perdas e atividades não produtivas. Uma análise de sensibilidade com 15, 18 e 20 m²/dia produz previsões de 12, 10 e 9 dias, respectivamente, antes de arredondamentos e dependências externas.",
      "Compare semanalmente produção realizada e planejada. Se foram concluídos 54 m² em quatro dias, a taxa observada foi 13,5 m²/dia. Mantida essa taxa, os 126 m² restantes exigem aproximadamente 9,33 dias de produção; para planejar dias completos, arredonde para 10, sem ocultar a hipótese."
    ],
    caseStudy: "Uma equipe prometeu concluir 180 m² em dez dias, mas no quarto dia registrou 54 m². O gestor não declara '40% do prazo, 40% do serviço'; calcula 30% da quantidade concluída, atualiza a taxa observada e avalia causas do desvio.",
    exercise: "Com 180 m² previstos, produtividade inicial de 18 m²/dia e 54 m² executados em quatro dias, calcule a produtividade observada, percentual físico concluído e duração restante com taxa constante. Proponha duas verificações antes de aumentar equipes.",
    assessment: [
      "Produtividade observada: 13,5 m² por dia.",
      "Avanço físico: 30% da quantidade.",
      "Saldo: 126 m²; estimativa de 9,33 dias de produção ou dez dias completos.",
      "A proposta verifica restrições de espaço, suprimentos e sequência de serviços."
    ],
    references: [
      "Caixa Econômica Federal — SINAPI, metodologias e composições de custos e serviços (consultar versões vigentes).",
      "Project Management Institute. A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed., 2021."
    ]
  }
];
