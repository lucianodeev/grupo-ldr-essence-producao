import type { AcademyAuthoredLesson } from "./planejamento-controle-obras.initial";

/** Unidades originais de suprimentos, riscos e auditoria; não publicadas. */
export const PLANEJAMENTO_CONTROLE_OBRAS_CONTROLE: AcademyAuthoredLesson[] = [
  {
    id: "pco-m09-a01",
    title: "Suprimentos: calcular a data-limite de compra a partir da necessidade em obra",
    objective: "Planejar uma aquisição por retroplanejamento e identificar folgas e dependências de fornecimento.",
    content: [
      "Uma data de entrega prometida não basta para planejar suprimentos. É necessário identificar a data em que o material precisa estar disponível para uso, o tempo de inspeção e descarga, o transporte, a fabricação e o ciclo interno de aprovação do pedido. Todos os prazos devem usar o mesmo calendário e explicitar se são dias úteis ou corridos.",
      "Considere um lote de esquadrias necessário no início do dia útil 40. O recebimento e a inspeção demandam dois dias úteis, o transporte três, a fabricação quinze e a aprovação técnica do pedido quatro. Pelo retroplanejamento sem sobreposição, a aprovação precisa começar no dia útil 16: quatro dias de aprovação, quinze de fabricação, três de transporte e dois de recebimento totalizam 24 dias antes da necessidade.",
      "A data calculada é um limite sob as premissas, não uma garantia. Se a fabricação só começa após sinal financeiro, esse marco também precisa aparecer. Atrasos de aprovação consomem a mesma folga de uma entrega tardia quando ambas pertencem à cadeia de precedência.",
      "Para cada aquisição crítica, registre fornecedor, especificação aprovada, marco de liberação, confirmação de prazo, inspeção, plano alternativo e responsável. Substituições técnicas devem passar por aprovação de quem possui atribuição legal quando exigida."
    ],
    caseStudy: "A equipe planejava emitir o pedido no dia 24, porque o fabricante anunciava quinze dias de fabricação. Ao incluir aprovação, transporte e inspeção, descobre que a data-limite para iniciar a aprovação era o dia 16. O cronograma é atualizado antes de contratar.",
    exercise: "Construa a cadeia de aquisição das esquadrias. Calcule a data-limite para iniciar a aprovação e a nova data de disponibilidade se a fabricação aumentar de quinze para dezenove dias úteis, sem compensações.",
    assessment: [
      "A cadeia soma 24 dias úteis antes da necessidade.",
      "O início da aprovação ocorre no dia útil 16 sob a convenção adotada.",
      "Com mais quatro dias de fabricação, a disponibilidade desloca-se para o dia útil 44 se a aprovação começar no dia 16.",
      "O plano diferencia prazo confirmado de prazo estimado."
    ],
    references: [
      "Project Management Institute. A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed., 2021.",
      "ISO 21502:2020 — Project, programme and portfolio management — Guidance on project management."
    ]
  },
  {
    id: "pco-m10-a01",
    title: "Registro de riscos: estimar exposição e definir respostas verificáveis",
    objective: "Distinguir causa, evento e consequência e priorizar riscos sem tratar uma matriz qualitativa como previsão estatística.",
    content: [
      "Um risco é um evento incerto que pode afetar os objetivos da obra. Uma descrição operacional separa causa, evento e consequência: 'devido à dependência de aprovação externa, a liberação pode atrasar, provocando paralisação da frente de instalação'. Essa formulação orienta monitoramento e resposta.",
      "Uma matriz de probabilidade e impacto de 1 a 5 serve para ordenar atenção, não para calcular probabilidade real. Por exemplo, atraso de esquadrias com probabilidade qualitativa 4 e impacto 5 recebe pontuação 20; falta pontual de consumíveis com 2 e 2 recebe 4. A escala e os critérios de classificação devem ser documentados.",
      "Respostas precisam de dono, gatilho e prazo. Para esquadrias, o gatilho pode ser ausência de confirmação de fabricação cinco dias após a liberação; a resposta pode ser contatar fornecedor alternativo previamente homologado e reavaliar a sequência de frentes.",
      "Risco residual permanece após a resposta. O registro deve mostrar o que foi reduzido e o que ainda depende de terceiros. Não se deve prometer risco zero nem confundir aceitação de risco com ausência de controle."
    ],
    caseStudy: "Um fornecedor apresenta histórico de atrasos, mas oferece menor preço. A equipe não transforma a preferência comercial em decisão automática: compara exposição de prazo, alternativas e marcos de acompanhamento.",
    exercise: "Registre dois riscos para uma reforma: atraso de esquadrias (probabilidade 4, impacto 5) e falta de consumíveis (probabilidade 2, impacto 2). Defina para cada um causa, evento, consequência, proprietário, gatilho e resposta.",
    assessment: [
      "Pontuações qualitativas corretas: 20 e 4.",
      "O risco de maior pontuação recebe prioridade de monitoramento, sem alegação de probabilidade matemática.",
      "Cada resposta tem responsável e gatilho observável.",
      "O registro informa o risco residual."
    ],
    references: [
      "ISO 31000:2018 — Risk management — Guidelines.",
      "Project Management Institute. A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed., 2021."
    ]
  },
  {
    id: "pco-m11-a01",
    title: "Indicadores de prazo: comparar avanço previsto e realizado sem mascarar desvios",
    objective: "Calcular avanço físico e interpretar diferenças entre execução, prazo e custo em relatório de acompanhamento.",
    content: [
      "Indicadores só são comparáveis quando usam a mesma unidade e data de corte. Percentuais físicos podem ser ponderados pelo valor orçado dos serviços, por quantidade homogênea ou por marcos definidos; misturar critérios entre semanas torna a tendência enganosa.",
      "Em um pacote de 400 m², a linha de base previa 240 m² concluídos na data de corte. A inspeção aceita 200 m². O avanço previsto é 60% e o realizado é 50%; o desvio é de menos dez pontos percentuais, ou quarenta metros quadrados em relação ao plano.",
      "O desvio não informa sozinho a causa nem a data de término. É preciso consultar produtividade recente, saldo, disponibilidade de equipe e dependências. Um atraso físico pode coexistir com gasto acima do previsto; por isso, o relatório deve separar indicadores de produção e financeiros.",
      "Uma comunicação executiva útil registra referência da linha de base, data, avanço, causas verificadas, previsão atualizada, ações e responsáveis. Evite atribuir culpa sem evidência e não altere retrospectivamente o plano aprovado."
    ],
    caseStudy: "O painel exibe 60% porque soma quantidades planejadas, enquanto a inspeção confirmou 200 dos 400 m². O gestor corrige a legenda e passa a mostrar 60% previsto e 50% realizado, preservando a data de corte.",
    exercise: "Calcule avanço previsto e realizado do pacote e redija um relatório de até 150 palavras contendo o desvio, duas hipóteses de causa a verificar e os dados necessários para projetar a conclusão.",
    assessment: [
      "Avanço previsto: 60%.",
      "Avanço realizado: 50%.",
      "Desvio: menos 10 pontos percentuais ou menos 40 m².",
      "Hipóteses são identificadas como não confirmadas e não como fatos."
    ],
    references: [
      "Project Management Institute. Practice Standard for Scheduling, 3rd ed., 2019.",
      "ISO 21502:2020 — Project, programme and portfolio management — Guidance on project management."
    ]
  },
  {
    id: "pco-m12-a01",
    title: "Auditoria de fechamento: verificar entregas, pendências e rastreabilidade",
    objective: "Construir uma matriz de evidências de entrega que distinga serviço executado, aceito e encerrado contratualmente.",
    content: [
      "Encerrar fisicamente uma frente não significa encerrar a obrigação contratual. A auditoria de fechamento compara escopo aprovado, alterações, critérios de aceite, medições, inspeções, pendências e documentação de entrega. Cada item precisa de responsável e evidência identificável.",
      "Uma matriz simples usa colunas: pacote da EAP, critério de aceite, evidência, resultado, pendência, responsável e data de reinspeção. Por exemplo, o pacote 'impermeabilização do sanitário' não deve ser marcado como aceito apenas porque recebeu revestimento; é necessário localizar o registro do ensaio aplicável e a aprovação correspondente.",
      "Pendências devem ser classificadas por impacto. Uma falha de acabamento pode permitir aceite condicionado conforme contrato, enquanto ausência de evidência de segurança pode impedir uso. A decisão cabe aos responsáveis técnicos e contratuais competentes.",
      "O relatório final deve preservar versões de projeto, alterações aprovadas, manuais, registros de manutenção, garantias e lições aprendidas. Não inclua dados pessoais desnecessários em anexos compartilhados."
    ],
    caseStudy: "A reforma de uma escola termina visualmente no prazo, mas faltam relatório de ensaio, termo de recebimento de equipamentos e correção de três portas. O gerente não declara 100% de aceite; abre uma lista de pendências com evidências e responsáveis.",
    exercise: "Crie uma matriz de fechamento com cinco pacotes: instalações elétricas, impermeabilização, revestimentos, esquadrias e limpeza final. Para cada um, proponha critério de aceite, evidência, situação e ação de encerramento. Inclua duas pendências fictícias.",
    assessment: [
      "Todos os cinco pacotes possuem critérios e evidências identificáveis.",
      "As pendências não são registradas como aceites definitivos.",
      "Responsáveis e datas de reinspeção estão definidos.",
      "O relatório separa execução física de aceite e encerramento contratual."
    ],
    references: [
      "ISO 21502:2020 — Project, programme and portfolio management — Guidance on project management.",
      "Project Management Institute. A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed., 2021."
    ]
  }
];
