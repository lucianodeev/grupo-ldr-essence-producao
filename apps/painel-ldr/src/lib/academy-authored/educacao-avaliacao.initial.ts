/** Curso livre em elaboração. Material autoral não publicado. */
export const AVALIACAO_FORMATIVA_DRAFT = {
  slug: "avaliacao-formativa-planeamento-educacional",
  proposedHours: 60,
  publicationReady: false,
  lessons: [
    {
      id: "edu60-m01-a01",
      title: "Objetivo observável e evidência de aprendizagem",
      objective: "Converter objetivos vagos em resultados verificáveis com critérios claros.",
      scenario: "Um docente escreve no plano: 'compreender percentagens'. A turma resolve contas simples, mas erra descontos sucessivos.",
      content: [
        "Um objetivo observável descreve uma ação demonstrável, as condições de execução e um critério de qualidade. 'Calcular o preço final após dois descontos sucessivos e justificar o procedimento' permite recolher evidência melhor do que 'compreender'.",
        "Dois descontos de 10% não equivalem a 20%: sobre 100 €, primeiro 90 €, depois 81 €. O erro de 80 € indica uma hipótese diagnóstica sobre composição de percentagens, não falta de esforço do estudante.",
        "Alinhe objetivo, atividade e instrumento de avaliação. Uma pergunta de escolha múltipla pode identificar o resultado; uma explicação escrita curta revela o raciocínio e permite feedback acionável."
      ],
      practice: "Reescreva três objetivos vagos e crie uma questão diagnóstica, uma resposta exemplar e dois erros plausíveis com feedback específico.",
      assessment: "A resposta deve incluir verbo observável, condição, critério e alinhamento entre tarefa e evidência.",
      references: ["Black, P. & Wiliam, D. (1998), Assessment and Classroom Learning", "Bloom et al. (1956), Taxonomy of Educational Objectives"]
    },
    {
      id: "edu60-m01-a02",
      title: "Rubrica analítica para um relatório curto",
      objective: "Construir critérios de correção transparentes e reduzir arbitrariedade.",
      scenario: "Duas pessoas avaliam o mesmo relatório de experiência científica e atribuem classificações muito diferentes.",
      content: [
        "Uma rubrica analítica separa critérios como método, interpretação de dados e clareza. Descritores concretos de desempenho evitam rótulos como 'bom' e 'fraco' sem evidência.",
        "Defina pesos antes da correção. Exemplo: método 40%, interpretação 40%, comunicação 20%. A nota ponderada de 3/4, 2/4 e 4/4 é 0,4×3 + 0,4×2 + 0,2×4 = 2,8/4.",
        "Faça calibração entre avaliadores com duas respostas anónimas. Registe divergências de interpretação e ajuste descritores, não a nota para atingir uma média pré-determinada."
      ],
      practice: "Elabore rubrica com três critérios e quatro níveis; aplique-a a dois exemplos fictícios e proponha uma ação de melhoria por critério.",
      assessment: "Os níveis devem ser distinguíveis por evidência observável, pesos somar 100% e feedback apontar próxima ação.",
      references: ["Brookhart, S. M. (2013), How to Create and Use Rubrics for Formative Assessment and Grading", "Sadler, D. R. (1989), Formative assessment and instructional systems"]
    }
  ]
} as const;
