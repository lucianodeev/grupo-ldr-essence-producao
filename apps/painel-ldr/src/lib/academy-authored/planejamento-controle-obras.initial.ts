/**
 * Conteúdo autoral inicial para formação livre em Planejamento e Controle de Obras.
 * Material em revisão editorial; não está registrado no catálogo nem publicado.
 * Cada unidade possui conteúdo próprio, exercício e critério de correção.
 */
export type AcademyAuthoredLesson = {
  id: string;
  title: string;
  objective: string;
  content: string[];
  caseStudy: string;
  exercise: string;
  assessment: string[];
  references: string[];
};

export const PLANEJAMENTO_CONTROLE_OBRAS_INITIAL_LESSONS: AcademyAuthoredLesson[] = [
  {
    id: "pco-m01-a01",
    title: "Da demanda do cliente à linha de base do empreendimento",
    objective: "Separar necessidades do contratante, requisitos verificáveis, entregáveis e restrições de execução antes de montar o cronograma.",
    content: [
      "Uma obra não começa com uma lista de tarefas: começa com a definição do que será entregue e de quais condições tornam a entrega aceitável. A solicitação 'reformar uma loja em oito semanas' ainda não informa metragem, funcionamento durante a obra, padrão de acabamento, restrições do condomínio ou licenças. Cada lacuna pode alterar prazo, custo e sequência executiva.",
      "A declaração de escopo deve identificar entregáveis mensuráveis. Por exemplo, 'instalar 85 m² de piso cerâmico com rodapé' é verificável; 'modernizar o ambiente' não é. Requisitos de desempenho e critérios de aceitação devem ser registrados em conjunto com o responsável pela aprovação, evitando que decisões informais virem mudanças não rastreadas.",
      "A linha de base reúne escopo, prazo e custo aprovados em determinada versão. Alterações posteriores devem registrar motivo, impacto, responsável pela decisão e nova versão. A linha de base não impede mudanças; permite medir o desvio entre o plano acordado e a execução real.",
      "Premissas são condições adotadas para planejar, como disponibilidade do imóvel em horário comercial. Restrições são limites impostos, como proibição de ruído após as 18h. Riscos são eventos incertos, como atraso na entrega do revestimento importado. Misturar essas categorias prejudica a análise do plano."
    ],
    caseStudy: "Uma loja de 120 m² será reformada sem interromper o atendimento aos sábados. O proprietário exige abertura integral em 60 dias, mas o projeto executivo de climatização ainda não foi aprovado. O planejador registra a aprovação do projeto como dependência, define áreas de isolamento por fase e não assume o prazo como garantido antes de avaliar o caminho crítico.",
    exercise: "Redija uma declaração de escopo para a reforma: identifique cinco entregáveis mensuráveis, três exclusões, duas premissas, três restrições, dois riscos e um critério de aceite por entregável. Diferencie explicitamente informação confirmada de hipótese.",
    assessment: [
      "Os cinco entregáveis podem ser inspecionados objetivamente.",
      "Premissas, restrições e riscos não foram confundidos.",
      "A dependência do projeto de climatização aparece no planejamento.",
      "Cada critério de aceite corresponde ao respectivo entregável."
    ],
    references: [
      "Project Management Institute. A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed., 2021.",
      "ISO 21502:2020. Project, programme and portfolio management — Guidance on project management."
    ]
  },
  {
    id: "pco-m01-a02",
    title: "Estrutura analítica: decompor entregas sem confundir com calendário",
    objective: "Construir uma EAP orientada a entregáveis e explicar a diferença entre pacote de trabalho e atividade de cronograma.",
    content: [
      "A Estrutura Analítica do Projeto (EAP) organiza o escopo em componentes menores até chegar a pacotes de trabalho que possam ser estimados, atribuídos e controlados. Ela responde 'o que será entregue', não 'em que dia será executado'. O cronograma é construído depois, com atividades, durações e dependências.",
      "Em uma reforma, o componente 'instalações elétricas' pode ser decomposto em infraestrutura, lançamento de cabos, quadros e testes. Já 'aguardar a liberação da concessionária' é uma dependência de programação, não um produto físico da instalação. Essa distinção evita uma EAP que seja apenas uma lista cronológica.",
      "Um dicionário da EAP documenta para cada pacote sua descrição, limites, critérios de aceite, responsáveis e interfaces. Se o pacote 'revestimento de piso' não especifica preparação do substrato, surgirá disputa sobre quem executa o nivelamento. Interfaces mal definidas produzem lacunas ou dupla contratação.",
      "A regra dos 100% orienta a decomposição: os níveis inferiores devem representar integralmente o escopo do elemento superior, sem adicionar trabalho fora do escopo. A granularidade adequada é a que permite estimativa e controle proporcionais ao risco, sem multiplicar tarefas irrelevantes."
    ],
    caseStudy: "O orçamento de uma escola inclui 'adequação de sanitários', mas não indica demolição, impermeabilização, louças, metais ou ensaios. A equipe transforma a rubrica em pacotes separados e registra o teste de estanqueidade como critério de aceite da impermeabilização, evitando encerramento prematuro.",
    exercise: "Crie uma EAP de três níveis para a adequação de dois sanitários. Inclua pelo menos oito pacotes de trabalho e produza o dicionário de dois pacotes, com fronteiras, responsável e critério de aceite.",
    assessment: [
      "A EAP cobre integralmente o escopo proposto, sem sobreposições.",
      "Os pacotes descrevem entregas e não apenas verbos de execução.",
      "As interfaces entre impermeabilização e revestimentos estão explícitas.",
      "O dicionário permite verificar conclusão sem interpretação subjetiva."
    ],
    references: [
      "Project Management Institute. Practice Standard for Work Breakdown Structures, 3rd ed., 2019.",
      "ISO 21502:2020. Project, programme and portfolio management — Guidance on project management."
    ]
  },
  {
    id: "pco-m01-a03",
    title: "Registro de premissas e mudanças: evitar que decisões se percam",
    objective: "Implantar um registro de decisões com histórico de versões e análise explícita de impactos em escopo, prazo e custo.",
    content: [
      "Decisões verbais em obra podem modificar recursos, sequência e critérios de aceite sem deixar evidência. Um registro mínimo identifica data, solicitação, origem, justificativa, elementos afetados, alternativas, impactos estimados, decisão, aprovador e versão da linha de base.",
      "Uma solicitação de substituir revestimento pode parecer neutra no orçamento unitário, mas exigir outro prazo de fornecimento, nova argamassa, tempo de cura ou reforço de preparação. A avaliação de mudança deve considerar custo total e efeitos sobre atividades sucessoras, não apenas a diferença de preço do material.",
      "O controle de versão distingue a previsão aprovada da previsão corrente. Se o cronograma original terminava no dia 60 e a mudança aprovada acrescenta cinco dias, relatórios posteriores devem mostrar ambos os marcos e a justificativa, em vez de apagar a previsão inicial.",
      "Não se deve executar uma alteração de segurança ou de projeto sem a aprovação técnica exigida. O registro administrativo apoia a rastreabilidade, mas não substitui análise de engenheiro, arquiteto ou profissional legalmente responsável quando aplicável."
    ],
    caseStudy: "No dia 18 de uma reforma, o cliente solicita trocar o piso especificado por outro com entrega prevista em 21 dias. O instalador poderia começar no dia 25 pelo plano original. A equipe documenta alternativas: manter o material, escolher um equivalente disponível ou aprovar reprogramação; cada opção recebe análise de custo e prazo.",
    exercise: "Preencha uma solicitação de mudança para o caso, com três alternativas, efeitos sobre a atividade de instalação, impacto sobre o marco de entrega, responsáveis pela aprovação e identificação da nova versão do plano.",
    assessment: [
      "A solicitação distingue fato confirmado de prazo de entrega ainda não comprovado.",
      "As três alternativas apresentam efeitos rastreáveis sobre prazo e custo.",
      "A decisão inclui aprovador e data.",
      "A versão original do plano continua acessível para comparação."
    ],
    references: [
      "Project Management Institute. A Guide to the Project Management Body of Knowledge (PMBOK Guide), 7th ed., 2021.",
      "ISO 21502:2020. Project, programme and portfolio management — Guidance on project management."
    ]
  }
];
