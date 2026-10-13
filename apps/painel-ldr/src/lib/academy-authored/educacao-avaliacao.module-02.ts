/** Módulo 02 autoral em elaboração; não publicar no catálogo. */
export const AVALIACAO_FORMATIVA_MODULE_02_DRAFT = {
  slug: "avaliacao-formativa-planeamento-educacional",
  module: 2,
  publicationReady: false,
  lessons: [
    {
      id: "edu60-m02-a01",
      title: "Feedback formativo e plano de revisão",
      objective: "Produzir devolutivas acionáveis ligadas a evidências de aprendizagem.",
      scenario: "Uma estudante resolve corretamente uma equação, mas não justifica a passagem entre duas etapas. O professor escreve apenas 'incompleto'.",
      content: [
        "Feedback útil indica o que foi demonstrado, qual critério ainda não foi cumprido e qual ação concreta pode melhorar o trabalho. A palavra 'incompleto', isoladamente, não orienta a revisão.",
        "Uma devolutiva específica poderia ser: 'A solução numérica está correta. Acrescenta uma linha explicando por que podes subtrair o mesmo termo de ambos os lados da igualdade'.",
        "Reserve tempo para o estudante utilizar o feedback, apresentar uma segunda versão e comparar os critérios. Sem oportunidade de revisão, a devolutiva tende a funcionar apenas como comentário final."
      ],
      practice: "Reescreva cinco comentários vagos em devolutivas específicas e planeie uma revisão de dez minutos com evidência antes/depois.",
      assessment: "Cada devolutiva deve reconhecer evidência observável, indicar lacuna e propor uma ação executável sem julgar a pessoa.",
      references: ["Hattie, J. & Timperley, H. (2007), The Power of Feedback", "Sadler, D. R. (1989), Formative assessment and instructional systems"]
    },
    {
      id: "edu60-m02-a02",
      title: "Análise de itens e revisão de uma avaliação",
      objective: "Usar padrões de resposta para identificar questões ambíguas sem atribuir causalidade indevida.",
      scenario: "Em uma turma de 30 estudantes, 24 acertam a questão 1, 9 acertam a questão 2 e 21 acertam a questão 3. Na questão 2, dois distratores recebem quase todas as respostas.",
      content: [
        "A proporção de acerto é 24/30 = 80% na questão 1, 9/30 = 30% na questão 2 e 21/30 = 70% na questão 3. Uma taxa baixa pode sinalizar dificuldade do conteúdo, problema de redação ou desalinhamento com o ensino.",
        "Analise enunciado, chave de correção, distratores e evidências de aprendizagem antes de eliminar um item. Não conclua que uma questão é injusta apenas porque poucos acertaram.",
        "Se alterar um item após a aplicação, documente motivo, versão, decisão de pontuação e comunicação à turma. A consistência do critério é tão importante quanto a análise estatística."
      ],
      practice: "Monte tabela de acertos e proponha duas hipóteses verificáveis para a questão 2. Redija versão revisada do enunciado com justificativa.",
      assessment: "Apresentar 80%, 30% e 70%; separar observação de hipótese e justificar revisão sem inventar dados.",
      references: ["Haladyna, T. M. (2004), Developing and Validating Multiple-Choice Test Items", "Brookhart, S. M. (2013), How to Create and Use Rubrics"]
    }
  ]
} as const;
