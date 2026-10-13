/** Módulo 03 autoral em desenvolvimento; não publicar sem validação pedagógica. */
export const AVALIACAO_FORMATIVA_MODULE_03_DRAFT = {
  slug: "avaliacao-formativa-planeamento-educacional",
  module: 3,
  publicationReady: false,
  lessons: [
    {
      id: "edu60-m03-a01",
      title: "Avaliação diagnóstica e diferenciação sem rotular estudantes",
      objective: "Interpretar evidências iniciais e planear intervenções proporcionais, evitando conclusões fixas sobre capacidade.",
      scenario: "Numa turma de 24 estudantes, 8 resolvem corretamente descontos sucessivos, 10 somam percentagens indevidamente e 6 não concluem a tarefa. O docente dispõe de duas aulas de 45 minutos para intervenção.",
      content: [
        "A distribuição observada é 8/24 = 33,33% de respostas corretas, 10/24 = 41,67% com erro específico e 6/24 = 25% sem conclusão. A não conclusão não revela, por si só, desconhecimento: pode decorrer de tempo, compreensão do enunciado ou outras condições.",
        "Planeie uma intervenção comum curta sobre descontos sucessivos e atividades temporárias por necessidade evidenciada: resolução guiada do erro de soma, desafio de justificação para quem já acertou e nova oportunidade de resposta para quem não concluiu.",
        "Use uma questão paralela após a intervenção e compare raciocínios, não apenas percentagens agregadas. Os grupos são flexíveis e não devem transformar-se em rótulos permanentes nem limitar acesso ao currículo."
      ],
      practice: "Desenhe as duas aulas de 45 minutos com tempos, tarefas, evidências recolhidas e critério para reorganizar os grupos após nova avaliação.",
      assessment: "Calcular percentagens corretamente, distinguir ausência de resposta de erro, prever reavaliação e justificar agrupamento flexível.",
      references: ["Black, P. & Wiliam, D. (1998), Assessment and Classroom Learning", "Tomlinson, C. A. (2014), The Differentiated Classroom"]
    },
    {
      id: "edu60-m03-a02",
      title: "Acessibilidade na avaliação e equivalência dos critérios",
      objective: "Adaptar a forma de participação sem alterar inadvertidamente o objetivo avaliado.",
      scenario: "A atividade pretende avaliar interpretação de gráficos. Um estudante utiliza leitor de ecrã, e a questão depende exclusivamente de uma imagem sem descrição textual.",
      content: [
        "Primeiro identifique o construto: interpretar relações representadas num gráfico, não demonstrar capacidade visual de ler uma imagem sem alternativa. Oferecer tabela de dados estruturada e descrição acessível pode permitir avaliar o mesmo objetivo.",
        "Prepare instruções claras, cabeçalhos, unidades e ordem de leitura; teste a alternativa com tecnologias de apoio quando possível. Adaptações devem respeitar regras institucionais e necessidades individuais, sem presumir um formato único para todos.",
        "Mantenha critérios transparentes: identificar tendência, comparar valores e justificar conclusão. Registe que a apresentação foi adaptada, não que a resposta correta ou o padrão de exigência foram reduzidos."
      ],
      practice: "Converta um gráfico fictício de vendas (janeiro 10, fevereiro 15, março 12) em tabela acessível. Escreva duas perguntas equivalentes e uma rubrica de três critérios.",
      assessment: "A alternativa deve conservar valores, unidades e objetivo de interpretação, com critérios observáveis e linguagem não discriminatória.",
      references: ["W3C Web Content Accessibility Guidelines (WCAG) 2.2", "CAST Universal Design for Learning Guidelines"]
    }
  ]
} as const;
