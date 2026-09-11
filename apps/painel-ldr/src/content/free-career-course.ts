export type FreeCareerLesson = {
  id: string;
  day: number;
  title: string;
  objective: string;
  readingMinutes: number;
  sections: Array<{ heading: string; body: string }>;
  reflection: string[];
  activity: string;
  deliverable: string;
};

export const FREE_CAREER_COURSE_TITLE = "Como Organizar sua Carreira e Dar o Próximo Passo Profissional";
export const FREE_CAREER_TOTAL_DAYS = 7;
export const FREE_CAREER_READING_ONLY = true;

export const FREE_CAREER_LESSONS: FreeCareerLesson[] = [
  {
    id:"dia-1-momento-profissional",day:1,title:"Onde você está hoje na sua carreira?",readingMinutes:18,
    objective:"Construir uma leitura objetiva do momento profissional atual antes de decidir o próximo passo.",
    sections:[
      {heading:"Começar pelo presente",body:"Planejar a carreira sem compreender o presente costuma produzir metas genéricas. Observe trabalho atual, responsabilidades, satisfação, aprendizado, renda, relações profissionais e perspectivas. O objetivo não é julgar sua trajetória, mas reunir informações para decidir com mais clareza."},
      {heading:"Ocupação não é necessariamente avanço",body:"Uma agenda cheia pode transmitir sensação de movimento sem gerar desenvolvimento. Avanço profissional envolve adquirir competências, ampliar responsabilidade, melhorar posicionamento, aproximar-se de objetivos ou construir condições para uma transição. Pergunte o que mudou de forma concreta nos últimos doze meses."},
      {heading:"Sinais de estagnação",body:"Repetição sem aprendizado, ausência de perspectiva, decisões sempre adiadas e permanência apenas por medo podem indicar necessidade de revisão. Isso não significa abandonar imediatamente um emprego. Significa reconhecer que a situação merece planejamento."},
      {heading:"Leitura equilibrada",body:"Registre também o que funciona. Experiência acumulada, contatos, estabilidade, conhecimentos e resultados são recursos para o próximo passo. Uma análise profissional útil considera dificuldades e ativos ao mesmo tempo."}
    ],
    reflection:["O que mais me satisfaz profissionalmente hoje?","O que mais me incomoda?","O que aprendi no último ano?","Se nada mudar pelos próximos dois anos, como me sentirei?"],
    activity:"Crie o Mapa do Meu Momento Profissional com quatro áreas: situação atual, pontos positivos, pontos de atenção e mudanças desejadas.",
    deliverable:"Mapa do Meu Momento Profissional preenchido."
  },
  {
    id:"dia-2-obstaculos",day:2,title:"O que está te impedindo de avançar?",readingMinutes:18,
    objective:"Separar obstáculos reais, obstáculos administráveis e decisões que estão sendo adiadas.",
    sections:[
      {heading:"Nomear antes de resolver",body:"Dizer apenas 'minha carreira não anda' mistura problemas diferentes. Falta de qualificação, pouca informação sobre o mercado, ausência de tempo, medo de mudança e dificuldade financeira exigem respostas distintas. Quanto mais específico o obstáculo, mais concreta pode ser a ação."},
      {heading:"Interno, externo e circunstancial",body:"Alguns obstáculos dependem principalmente de ação pessoal; outros dependem do mercado, da organização ou de recursos disponíveis. Há ainda situações temporárias. Classificar o problema evita assumir responsabilidade pelo que não se controla e evita atribuir ao ambiente aquilo que pode ser trabalhado."},
      {heading:"Procrastinação profissional",body:"Adiar currículo, candidatura, conversa, formação ou pesquisa pode manter a pessoa em uma situação conhecida. Em vez de esperar motivação perfeita, transforme a decisão em uma ação pequena, com data e critério de conclusão."},
      {heading:"Prioridade",body:"Tentar resolver tudo ao mesmo tempo dilui energia. Escolha os obstáculos que mais interferem no objetivo e sobre os quais existe alguma possibilidade de ação nas próximas semanas."}
    ],
    reflection:["Qual decisão profissional venho adiando?","O que depende de mim?","O que depende de terceiros?","Qual obstáculo teria maior impacto se fosse reduzido?"],
    activity:"Liste seus obstáculos e classifique cada um como controlável, parcialmente controlável ou externo. Depois escolha os três prioritários.",
    deliverable:"Lista dos três principais obstáculos e uma primeira ação para cada um."
  },
  {
    id:"dia-3-competencias",day:3,title:"Descubra as competências que você já possui",readingMinutes:20,
    objective:"Reconhecer competências com base em evidências e experiências, e não apenas em cargos ou diplomas.",
    sections:[
      {heading:"Competência é demonstrável",body:"Uma competência ganha força quando pode ser associada a uma situação, uma ação e um resultado. 'Sou organizado' é uma afirmação; organizar uma operação, cumprir prazos e reduzir falhas é uma evidência. Procure fatos da sua trajetória."},
      {heading:"Técnicas e comportamentais",body:"Conhecimentos de sistemas, idiomas, ferramentas e processos convivem com comunicação, negociação, colaboração, liderança, organização e adaptação. O valor profissional normalmente aparece na combinação dessas dimensões."},
      {heading:"Experiências transferíveis",body:"Competências desenvolvidas em um setor podem ser úteis em outro. Atendimento pode desenvolver comunicação e solução de problemas; vendas pode fortalecer negociação; trabalho autônomo pode desenvolver planejamento e relacionamento com clientes."},
      {heading:"Lacunas sem desvalorização",body:"Reconhecer uma lacuna não apaga o que você já sabe. Compare o repertório atual com as exigências do objetivo desejado e identifique quais competências precisam ser fortalecidas primeiro."}
    ],
    reflection:["Quais problemas profissionais consigo resolver bem?","Por quais resultados já fui reconhecido?","Que habilidade uso em contextos diferentes?","Qual competência preciso desenvolver para meu próximo passo?"],
    activity:"Monte um Inventário de Competências com competência, evidência, resultado e nível atual de domínio.",
    deliverable:"Inventário com pelo menos dez competências sustentadas por exemplos."
  },
  {
    id:"dia-4-objetivo",day:4,title:"Defina onde você quer chegar",readingMinutes:18,
    objective:"Transformar desejos amplos em um objetivo profissional que possa orientar decisões.",
    sections:[
      {heading:"Direção antes da velocidade",body:"Sem direção, muitas oportunidades parecem igualmente importantes. Um objetivo não precisa prever toda a carreira, mas precisa indicar qual mudança você busca agora: função, área, renda, responsabilidade, mercado, negócio ou desenvolvimento específico."},
      {heading:"Desejo e objetivo",body:"'Quero crescer' expressa intenção, mas não oferece critério de decisão. Um objetivo útil descreve resultado desejado, prazo aproximado e evidências que mostrarão progresso."},
      {heading:"Curto, médio e longo prazo",body:"O curto prazo organiza ações imediatas; o médio prazo conecta essas ações a uma mudança relevante; o longo prazo funciona como direção. Não transforme previsões distantes em obrigações rígidas: carreira também exige revisão."},
      {heading:"Critérios de escolha",body:"Renda, qualidade de vida, localização, aprendizado, estabilidade, autonomia e propósito podem ter pesos diferentes. Definir critérios reduz decisões baseadas apenas na urgência do momento."}
    ],
    reflection:["Qual mudança profissional mais importa agora?","Como saberei que avancei?","Qual prazo é realista?","Quais critérios não quero ignorar?"],
    activity:"Escreva um objetivo profissional principal e três indicadores simples que mostrem aproximação desse objetivo.",
    deliverable:"Objetivo profissional principal definido e mensurável."
  },
  {
    id:"dia-5-plano",day:5,title:"Transforme o objetivo em plano",readingMinutes:20,
    objective:"Converter o objetivo em etapas pequenas, priorizadas e acompanháveis.",
    sections:[
      {heading:"Do objetivo para as etapas",body:"Comece pelo resultado desejado e pergunte o que precisa existir antes dele. Uma transição pode exigir pesquisa, atualização de currículo, formação, networking e candidaturas. Organizar a sequência torna o objetivo menos abstrato."},
      {heading:"Ações sob seu controle",body:"Você não controla ser contratado, promovido ou escolhido. Controla, porém, preparação, número de candidaturas qualificadas, conversas realizadas, portfólio, estudo e acompanhamento. Planeje principalmente ações executáveis."},
      {heading:"Prazo e prioridade",body:"Toda ação importante precisa competir com outras demandas. Defina quando será feita, quanto tempo exige e o que pode ser reduzido ou reorganizado para abrir espaço."},
      {heading:"Revisar sem abandonar",body:"Um plano profissional é hipótese de trabalho, não contrato imutável. Acompanhe resultados, aprenda com respostas do mercado e ajuste estratégia sem perder de vista o objetivo."}
    ],
    reflection:["Qual é a primeira ação possível?","Que recurso preciso obter?","O que pode bloquear meu plano?","Quando vou revisar meu progresso?"],
    activity:"Crie um plano com ação, prazo, recurso necessário, evidência de conclusão e próxima revisão.",
    deliverable:"Plano de ação profissional com pelo menos cinco ações priorizadas."
  },
  {
    id:"dia-6-posicionamento",day:6,title:"Posicionamento profissional e oportunidades",readingMinutes:20,
    objective:"Comunicar com clareza o valor profissional e aumentar a capacidade de reconhecer e acessar oportunidades.",
    sections:[
      {heading:"Como você é compreendido",body:"Posicionamento profissional é a percepção construída a partir do que você sabe fazer, dos problemas que resolve, dos resultados que apresenta e da forma como comunica isso. Clareza facilita que outras pessoas entendam onde você pode contribuir."},
      {heading:"Currículo e presença digital",body:"Currículo e LinkedIn devem priorizar informações relevantes ao objetivo. Em vez de listar apenas tarefas, destaque contexto, responsabilidade e resultados quando houver evidência. Mantenha coerência entre apresentação e experiência real."},
      {heading:"Networking como relação",body:"Networking não é pedir emprego a desconhecidos. É cultivar relações profissionais, trocar informações, aprender sobre mercados e tornar sua atuação conhecida. Contato útil começa com contexto e respeito pelo tempo da outra pessoa."},
      {heading:"Oportunidades também são pesquisadas",body:"Não dependa apenas de vagas que chegam até você. Mapeie empresas, setores, profissionais, eventos, comunidades e competências em crescimento relacionadas ao objetivo definido."}
    ],
    reflection:["Como me apresento em trinta segundos?","Minha apresentação combina com meu objetivo?","Quem conhece meu trabalho?","Onde as oportunidades que busco costumam aparecer?"],
    activity:"Escreva uma apresentação profissional curta contendo quem você é profissionalmente, o que sabe fazer, evidência relevante e direção atual.",
    deliverable:"Apresentação profissional pronta para adaptar a conversas, perfil e networking."
  },
  {
    id:"dia-7-plano-30-dias",day:7,title:"Seu plano profissional para os próximos 30 dias",readingMinutes:20,
    objective:"Integrar diagnóstico, competências, objetivo, posicionamento e ações em um ciclo de execução de trinta dias.",
    sections:[
      {heading:"Transformar reflexão em movimento",body:"Os seis dias anteriores produziram informações. Agora é necessário selecionar o que realmente será executado. Um plano curto cria prazo suficiente para agir e proximidade suficiente para acompanhar."},
      {heading:"Quatro semanas com função",body:"Organize a primeira semana para preparação, a segunda para exposição e contatos, a terceira para continuidade e testes, e a quarta para avaliação e ajuste. Adapte a divisão ao seu objetivo, mantendo entregas observáveis."},
      {heading:"Indicadores simples",body:"Escolha poucos indicadores: ações concluídas, contatos realizados, candidaturas qualificadas, horas de estudo ou entregas de portfólio. Indicadores não garantem o resultado final, mas mostram se a estratégia está sendo executada."},
      {heading:"Próximo ciclo",body:"No dia trinta, compare o que planejou com o que realizou. Identifique resultados, obstáculos e aprendizados. Decida o que manter, interromper ou modificar no ciclo seguinte."}
    ],
    reflection:["Quais três prioridades terão maior impacto?","O que farei já na primeira semana?","Como acompanharei execução?","Qual decisão tomarei ao final dos 30 dias?"],
    activity:"Construa o Plano Profissional de 30 Dias reunindo diagnóstico, três obstáculos, competências-chave, objetivo, ações semanais, indicadores e data de revisão.",
    deliverable:"Projeto final: Plano Profissional de 30 Dias."
  }
];
