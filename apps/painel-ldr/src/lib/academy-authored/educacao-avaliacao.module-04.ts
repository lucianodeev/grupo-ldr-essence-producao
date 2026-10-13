/** Módulo 04 autoral em elaboração. Não publicar sem validação pedagógica. */
export const AVALIACAO_FORMATIVA_MODULE_04_DRAFT = {
  slug: "avaliacao-formativa-planeamento-educacional",
  module: 4,
  publicationReady: false,
  lessons: [
    {
      id: "edu60-m04-a01",
      title: "Portefólio de aprendizagem e progressão demonstrável",
      objective: "Selecionar evidências ao longo do tempo e justificar decisões pedagógicas sem confundir quantidade de trabalhos com aprendizagem.",
      scenario: "Uma turma entrega seis atividades ao longo de um período. Um estudante inclui todas no portefólio, mas não explica o que mudou entre a primeira e a última versão.",
      content: [
        "Um portefólio orientado à aprendizagem reúne amostras escolhidas segundo objetivos explícitos, versões sucessivas e reflexão sobre mudanças observáveis. Mais documentos não significam necessariamente maior progresso.",
        "Peça que cada evidência seja acompanhada de data, objetivo, critério de seleção e breve justificação. Compare versões da mesma competência, distinguindo revisão superficial de melhoria de raciocínio ou autonomia.",
        "Na avaliação, use critérios previamente comunicados: pertinência das evidências, demonstração de progressão e qualidade da reflexão. Respeite privacidade de terceiros em fotografias, gravações e trabalhos colaborativos."
      ],
      practice: "Desenhe um portefólio com três evidências de escrita argumentativa em momentos diferentes. Crie uma grelha de avaliação com três critérios e descreva como devolver feedback.",
      assessment: "Evidências alinhadas a objetivo, comparação temporal fundamentada, reflexão verificável e critérios transparentes, sem avaliar volume de ficheiros como mérito.",
      references: ["Paulson, F. L., Paulson, P. R. & Meyer, C. A. (1991), What Makes a Portfolio a Portfolio?", "Black, P. & Wiliam, D. (1998), Assessment and Classroom Learning"]
    },
    {
      id: "edu60-m04-a02",
      title: "Calibração de avaliadores e análise de concordância",
      objective: "Comparar classificações independentes e identificar critérios que precisam de esclarecimento.",
      scenario: "Dois docentes avaliam independentemente quatro trabalhos numa escala de 1 a 4. O avaliador A atribui [2, 3, 4, 2] e o avaliador B atribui [2, 4, 3, 2].",
      content: [
        "Há concordância exata nos trabalhos 1 e 4: 2 de 4, ou 50%. Nos trabalhos 2 e 3 existe divergência de um nível. A percentagem simples de acordo descreve esta amostra, mas não desconta concordância ao acaso.",
        "Antes de negociar notas, peça que cada avaliador indique evidência textual e descritor aplicado. A discussão deve esclarecer fronteiras entre níveis da rubrica, não pressionar para uma média predeterminada.",
        "Após ajustar descritores, teste a rubrica com novos exemplos anónimos. Para decisões de alto impacto, escolha medidas de fiabilidade apropriadas ao desenho e à escala; quatro trabalhos não sustentam generalizações sobre consistência global."
      ],
      practice: "Calcule a concordância exata para A = [1, 2, 3, 4, 3] e B = [1, 2, 2, 4, 4]. Proponha procedimento de calibração com exemplos âncora e registo de divergências.",
      assessment: "Três acordos em cinco trabalhos = 60%; identificar divergências nos itens 3 e 5, justificar revisão de descritores e reconhecer limitações da amostra.",
      references: ["Brookhart, S. M. (2013), How to Create and Use Rubrics for Formative Assessment and Grading", "Stemler, S. E. (2004), A Comparison of Consensus, Consistency, and Measurement Approaches to Estimating Interrater Reliability"]
    }
  ]
} as const;
