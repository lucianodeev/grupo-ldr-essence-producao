import type { EditorialLesson } from "./types";

// Original teaching sequence, v1. Reading and assignment time are estimates, not certified hours.
export const RESEARCH_LESSONS: EditorialLesson[] = [
  {
    id: "research-01",
    minutes: 60,
    objectives: [
      "Distinguir opinião, observação e afirmação sustentada por evidência.",
      "Delimitar um objeto que possa ser investigado com recursos disponíveis.",
    ],
    sections: [
      {
        title: "Da curiosidade a um objeto investigável",
        paragraphs: [
          "Pesquisar começa por transformar uma inquietação num problema que possa ser examinado. Uma opinião expressa uma posição; uma observação descreve algo percebido; uma afirmação científica apresenta uma relação que pode ser confrontada com dados e argumentos explícitos. Estas categorias podem coexistir numa conversa, mas precisam de ser separadas no trabalho escrito. Dizer que uma formação é excelente não esclarece qual dimensão foi avaliada, por quem, em que condições ou mediante que critério.",
          "O objeto de estudo resulta de escolhas. Ao investigar permanência de alunos, é necessário definir o que conta como permanência: entrar na plataforma, realizar tarefas ou concluir um percurso? A mesma pessoa pode satisfazer um critério e falhar noutro. A definição operacional torna a escolha observável; não resolve, por si só, se ela representa adequadamente o conceito. Essa adequação precisa de ser argumentada.",
          "Uma investigação viável não exige uma pergunta grandiosa. Exige correspondência entre pergunta, acesso a informação, tempo e método. Antes de recolher dados, descreva a unidade de análise, o contexto, o período e as exclusões. Se apenas dispõe de registos administrativos, não prometa explicar a experiência subjetiva dos participantes. Se dispõe de entrevistas, não transforme frequências de falas em estimativas representativas de toda a população.",
        ],
      },
      {
        title: "Caderno de decisões",
        paragraphs: [
          "Mantenha um registo datado das decisões: definição inicial, alternativa considerada, motivo da escolha e consequência prevista. Quando a pergunta mudar, conserve a versão anterior. O caderno permite distinguir decisões planeadas de interpretações feitas depois de conhecer os resultados. Transparência não significa ausência de erro; significa tornar o percurso examinável.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: uma escola diz que a nova biblioteca melhorou a aprendizagem porque houve mais acessos. O número de acessos mede utilização, mas não demonstra aquisição de competências. Uma alternativa seria comparar tarefas equivalentes, com critérios de correção definidos antes da análise, reconhecendo diferenças entre turmas.",
    exercise:
      "Escolha uma afirmação sobre aprendizagem ou trabalho. Separe o juízo de valor da observação. Redija duas definições operacionais do conceito central e explique que informação cada uma perde. Entregue uma página com objeto, contexto, período e fonte viável.",
    assessment: {
      question: "Por que razão 200 acessos não demonstram, isoladamente, aprendizagem?",
      answer:
        "Porque utilização e aprendizagem são construtos diferentes. Falta uma medida de desempenho ou compreensão e um desenho que examine explicações alternativas.",
      criteria: [
        "Distingue construto de indicador.",
        "Identifica uma medida alternativa.",
        "Evita concluir causalidade com base no acesso.",
      ],
    },
    sourceIds: ["unesco"],
  },
  {
    id: "research-02",
    minutes: 75,
    objectives: [
      "Formular uma pergunta delimitada e compatível com uma fonte de dados.",
      "Identificar pressupostos embutidos na formulação do problema.",
    ],
    sections: [
      {
        title: "A pergunta determina o alcance da resposta",
        paragraphs: [
          "Um tema é um campo de interesse; um problema é uma dificuldade de conhecimento situada dentro dele. “Tecnologia na educação” é um tema. “Como descrevem os estudantes adultos as dificuldades de navegação na primeira semana de um curso?” é uma pergunta. A segunda formulação delimita participantes, fenómeno e período, sem antecipar se a experiência será positiva ou negativa.",
          "Perguntas descritivas procuram caracterizar; perguntas comparativas examinam diferenças; perguntas explicativas investigam mecanismos ou relações. Trocar um verbo altera as exigências de evidência. Perguntar quantos alunos abandonam exige uma definição de abandono e um denominador. Perguntar por que abandonam exige examinar razões e explicações concorrentes. Um levantamento de satisfação não responde automaticamente a ambas.",
          "A formulação deve evitar respostas pressupostas. “Por que a plataforma prejudica os alunos?” já assume prejuízo. “Que dificuldades e benefícios os alunos relatam?” admite resultados diferentes. Neutralidade da pergunta não elimina a posição do investigador: obriga a torná-la discutível. Registe expectativas e possíveis interesses antes de analisar os dados.",
          "Teste a pergunta em três planos. Conceptualmente, os termos são compreensíveis? Empiricamente, existe uma maneira de reunir informação relevante? Praticamente, o acesso é possível e aceitável? Uma pergunta pode ser interessante e ainda assim inviável neste projeto. Reduzir o contexto é uma decisão metodológica legítima quando as limitações são declaradas.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: uma equipa pretende estudar “o efeito da mentoria no sucesso”. Sucesso pode significar emprego, satisfação ou remuneração. A equipa escolhe investigar a experiência de cinco participantes sobre decisões de carreira. Essa escolha permite interpretar relatos; não permite estimar aumento salarial causado pela mentoria.",
    exercise:
      "Escreva uma pergunta descritiva e uma explicativa sobre o mesmo tema. Para cada uma, indique unidade de análise, informação necessária e uma explicação alternativa. Selecione a que poderá efetivamente responder em quatro semanas.",
    assessment: {
      question: "Qual é o problema de perguntar “como a mentoria garante emprego”?",
      answer:
        "A pergunta pressupõe uma garantia e uma relação causal. É necessário definir o resultado e permitir a possibilidade de ausência de efeito, além de justificar um desenho adequado.",
      criteria: [
        "Identifica a pressuposição.",
        "Define o resultado.",
        "Reformula sem prometer causalidade.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "research-03",
    minutes: 60,
    objectives: [
      "Construir objetivos verificáveis a partir da pergunta.",
      "Relacionar cada objetivo com um produto de análise.",
    ],
    sections: [
      {
        title: "Objetivos como compromissos verificáveis",
        paragraphs: [
          "O objetivo geral exprime o resultado intelectual principal que o trabalho pretende alcançar. Os específicos decompõem esse compromisso em operações necessárias. Não são uma lista de tarefas administrativas: “abrir um ficheiro” e “enviar questionários” podem integrar o plano de trabalho, mas não descrevem aquilo que se pretende conhecer.",
          "Verbos como descrever, comparar, classificar e interpretar podem ser adequados quando o objeto e o critério estão definidos. A escolha do verbo não torna um objetivo mensurável por magia. “Analisar o mundo digital” continua indeterminado. “Comparar as barreiras de navegação relatadas por iniciantes e utilizadores experientes” identifica grupos e dimensão comparável, embora ainda exija definir experiência e procedimento de análise.",
          "Construa uma matriz com quatro colunas: objetivo, informação, procedimento e evidência final. Se o objetivo é classificar dificuldades, a evidência final poderá ser uma tipologia acompanhada de exemplos e critérios de inclusão. Se é comparar grupos, deverá mostrar como os grupos foram constituídos e quais diferenças serão examinadas. Uma coluna vazia revela uma promessa que ainda não tem sustentação.",
          "A coerência também exige limites. Um objetivo que depende de dados inacessíveis deve ser revisto antes da recolha. Depois da análise, apresente o que foi alcançado e o que ficou por responder. Não converta resultados inesperados em objetivos supostamente definidos desde o início; apresente-os como explorações adicionais.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: um projeto promete avaliar a eficácia de um curso, mas só recolhe opiniões de três alunos. Os objetivos podem ser reformulados para descrever a experiência desses participantes e identificar sugestões de melhoria. A alteração reduz o alcance da conclusão e aumenta a correspondência com os dados.",
    exercise:
      "Crie uma matriz para três objetivos do seu projeto. Elimine tarefas que não produzam conhecimento e identifique uma evidência concreta para cada objetivo. Acrescente uma coluna com o principal limite de interpretação.",
    assessment: {
      question: "“Ler dez artigos” é um objetivo de aprendizagem científica suficiente?",
      answer:
        "É uma tarefa de execução. Um objetivo poderia ser comparar as definições de um conceito nesses artigos, explicitando critérios e divergências.",
      criteria: [
        "Separa tarefa de resultado intelectual.",
        "Propõe um produto observável.",
        "Relaciona o objetivo com a pergunta.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "research-04",
    minutes: 60,
    objectives: [
      "Distinguir hipótese testável de pergunta exploratória.",
      "Explicitar uma previsão e uma condição que a contrariaria.",
    ],
    sections: [
      {
        title: "Hipóteses sem confirmação antecipada",
        paragraphs: [
          "Uma hipótese propõe uma resposta provisória sobre uma relação ou diferença. Para ser útil no projeto, deve especificar conceitos e consequências observáveis. “Alunos motivados aprendem melhor” deixa em aberto como motivação e aprendizagem serão avaliadas, em que população e em que momento. A hipótese pode orientar o desenho, mas não deve funcionar como resultado obrigatório.",
          "Nem toda investigação precisa de hipóteses formais. Um estudo exploratório pode começar por perguntas abertas para compreender categorias ainda mal definidas. Forçar uma previsão numérica em entrevistas exploratórias pode empobrecer a escuta. Inversamente, declarar uma pesquisa exploratória depois de testar muitas relações e destacar apenas a mais favorável dificulta avaliar o percurso.",
          "Distingua análise planeada de análise gerada pelos dados. Ao observar uma associação inesperada, formule uma nova hipótese e indique que ela surgiu nessa fase. A observação pode ser valiosa, mas precisa de confirmação independente. O mesmo conjunto de dados que inspirou uma hipótese não lhe confere automaticamente a força de um teste planeado.",
          "Considere alternativas. Se alunos que participam mais obtêm melhores resultados, participação pode ajudar, mas experiência anterior, disponibilidade de tempo e seleção dos mais interessados também podem explicar a relação. A hipótese deve conviver com estas possibilidades. Uma conclusão responsável especifica o que os dados favorecem e aquilo que ainda não conseguem distinguir.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: depois de experimentar dez formas de agrupar alunos, um investigador encontra uma diferença entre horários. Antes de afirmar que o horário produz melhor aprendizagem, precisa de declarar as análises feitas e considerar composição dos grupos e acaso.",
    exercise:
      "Escreva uma hipótese sobre o seu objeto, defina dois indicadores e descreva um resultado que a contrariaria. Depois redija uma pergunta exploratória que exigiria outro procedimento.",
    assessment: {
      question: "Uma associação inesperada deve ser excluída do relatório?",
      answer:
        "Não. Deve ser apresentada como exploração, com as decisões e limitações relevantes, sem fingir que foi prevista.",
      criteria: [
        "Reconhece o valor exploratório.",
        "Distingue descoberta de confirmação.",
        "Explicita uma alternativa explicativa.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "research-05",
    minutes: 90,
    objectives: [
      "Justificar um desenho de investigação para uma pergunta delimitada.",
      "Explicitar amostragem, procedimento e limites de inferência.",
    ],
    sections: [
      {
        title: "Método é uma cadeia de decisões",
        paragraphs: [
          "A metodologia explica como a pergunta será examinada e por que esse percurso é adequado. Nomear uma abordagem como qualitativa ou quantitativa não substitui descrever o procedimento. Um leitor deve compreender quem ou o que foi estudado, como houve seleção, que informação foi recolhida e como ela foi analisada.",
          "Uma amostra de conveniência pode ser apropriada para explorar experiências locais, mas não se torna representativa por atingir um número aparentemente elevado. A representatividade depende da relação entre população, seleção e participação. Descreva também ausências: quem não pôde participar, quem recusou e quais registos ficaram indisponíveis, quando essa informação puder ser obtida de forma legítima.",
          "Na análise qualitativa, esclareça como segmentos foram selecionados, codificados e agrupados; apresente exemplos que sustentem as categorias e casos que as desafiem. Na análise quantitativa, defina variáveis, denominadores, tratamento de dados em falta e comparações previstas. Uma percentagem sem denominador ou uma categoria sem critério fragiliza a leitura.",
          "Um projeto misto exige integração. Entrevistas e questionários colocados lado a lado não constituem uma integração por si só. Explique que pergunta cada componente responde e como resultados convergentes ou divergentes serão interpretados. O desenho deve caber nos recursos reais. Uma abordagem simples, bem executada e com alcance explícito pode produzir um trabalho mais defensável do que uma combinação impossível de implementar.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: um curso tem 80 inscritos, 30 respostas a um questionário e 8 entrevistas voluntárias. O relatório deve distinguir os três denominadores e evitar atribuir as experiências dos oito entrevistados aos 80 inscritos.",
    exercise:
      "Produza um protocolo de uma página: participantes ou documentos, seleção, instrumento, etapas, análise, dados em falta e dois limites. Peça a alguém que descreva como o executaria; esclareça as ambiguidades encontradas.",
    assessment: {
      question: "Por que uma amostra de 500 voluntários pode ter viés de seleção?",
      answer:
        "Porque a decisão de participar pode estar relacionada com a experiência estudada. Aumentar o número não corrige automaticamente o mecanismo de seleção.",
      criteria: [
        "Explica o mecanismo de seleção.",
        "Separa tamanho de representatividade.",
        "Delimita a população à qual pode inferir.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "research-06",
    minutes: 90,
    objectives: [
      "Construir uma estratégia de procura reproduzível.",
      "Separar revisão narrativa de revisão sistemática.",
    ],
    sections: [
      {
        title: "Pesquisar literatura com rastreabilidade",
        paragraphs: [
          "Uma pesquisa bibliográfica precisa de um propósito. Pode mapear definições, localizar resultados empíricos ou comparar debates teóricos. Comece pelos conceitos da pergunta e liste sinónimos, traduções e termos mais amplos ou restritos. Combine grupos de conceitos e observe se os primeiros resultados correspondem ao fenómeno. A estratégia deve ser refinada com justificação, não apenas ampliada até encontrar uma conclusão desejada.",
          "Registe bases consultadas, data, expressão de procura e filtros. Guarde os critérios de inclusão e exclusão antes da triagem final. Um diário de procura permite atualizar o levantamento e compreender por que um texto entrou no corpus. Encontrar um artigo numa busca informal é diferente de demonstrar cobertura sistemática da literatura.",
          "Na seleção, leia além do título. Verifique desenho, população, contexto e resultado estudado. Artigos com palavras semelhantes podem investigar objetos distintos; textos com vocabulário diferente podem ser relevantes. A disponibilidade gratuita pode facilitar acesso, mas não deve ser confundida com qualidade metodológica. Registe limitações de acesso em vez de atribuir conteúdo a textos que não conseguiu consultar.",
          "O PRISMA 2020 orienta o relato de revisões sistemáticas. Usar o seu fluxograma não transforma automaticamente uma busca em revisão sistemática nem avalia o risco de viés dos estudos. Num trabalho introdutório, é legítimo apresentar uma revisão narrativa com estratégia explícita e limites assumidos, sem reivindicar exaustividade.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: uma pesquisa sobre abandono de cursos usa apenas “desistência”. Uma segunda procura com termos de permanência e evasão encontra trabalhos relevantes antes ausentes. O investigador conserva ambas as estratégias e explica a ampliação.",
    exercise:
      "Crie duas expressões de procura para a sua pergunta, execute-as numa base acessível e registe os primeiros dez resultados. Justifique inclusão ou exclusão de cada um sem usar apenas a concordância com a sua opinião.",
    assessment: {
      question: "Um fluxograma PRISMA comprova que os estudos incluídos têm boa qualidade?",
      answer:
        "Não. Relato transparente da seleção e avaliação metodológica dos estudos são tarefas distintas.",
      criteria: [
        "Distingue relato de avaliação.",
        "Identifica o tipo de revisão.",
        "Apresenta um registo reprodutível.",
      ],
    },
    sourceIds: ["prisma"],
  },
  {
    id: "research-07",
    minutes: 90,
    objectives: [
      "Extrair pergunta, método, resultados e limites de um artigo.",
      "Distinguir evidência apresentada de interpretação dos autores.",
    ],
    sections: [
      {
        title: "Ler um artigo como um argumento",
        paragraphs: [
          "A leitura crítica procura reconstruir a relação entre pergunta, dados e conclusão. Comece por identificar o que foi efetivamente investigado. O título pode anunciar um campo amplo, enquanto o método descreve um contexto muito restrito. Assinale a população, o período, os instrumentos e o resultado principal antes de aceitar a interpretação final.",
          "Separe três níveis no seu fichamento: informação do estudo, interpretação dos autores e avaliação própria. Uma frase como “a intervenção foi eficaz” pode resumir a discussão, mas a tabela de resultados pode mostrar apenas melhoria num indicador e ausência de comparação. Registe esta diferença sem atribuir fraude ou incompetência: uma crítica precisa de demonstrar o desajuste.",
          "Examine o denominador de percentagens, a quantidade de dados em falta e a consistência entre resumo e corpo do texto. Em estudos qualitativos, observe como as interpretações se apoiam no material, quais vozes aparecem e como os investigadores discutem a sua posição. Nenhum destes passos substitui uma avaliação especializada, mas todos ajudam a evitar uma leitura puramente promocional.",
          "A estrutura introdução, métodos, resultados e discussão é frequente em investigação original, como explica o ICMJE para manuscritos médicos; outros géneros usam estruturas diferentes. Não rejeite um ensaio teórico por não apresentar uma amostra. Avalie a coerência entre o género, a pergunta e a forma de argumentar. Também não use prestígio da revista como substituto da leitura.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: o resumo afirma “melhora do bem-estar”, mas o estudo recolheu uma única pergunta de satisfação imediatamente após uma aula. A conclusão pode descrever satisfação naquele momento; precisa de mais evidência para falar de mudança duradoura de bem-estar.",
    exercise:
      "Escolha um artigo integralmente acessível e produza um fichamento em três colunas: afirmação, evidência apresentada e limite. Inclua uma passagem que apoia a conclusão e outra que exige cautela.",
    assessment: {
      question: "Como criticar uma conclusão sem confundir discordância pessoal com avaliação?",
      answer:
        "Reconstruindo o argumento e demonstrando a relação entre método, evidência e alcance da conclusão, com critérios explícitos.",
      criteria: [
        "Localiza evidência no texto.",
        "Identifica o género do artigo.",
        "Justifica o limite apontado.",
      ],
    },
    sourceIds: ["icmje"],
  },
  {
    id: "research-08",
    minutes: 75,
    objectives: [
      "Organizar secções segundo a função argumentativa.",
      "Manter resultados separados de interpretações não sustentadas.",
    ],
    sections: [
      {
        title: "Estrutura que permite verificar o raciocínio",
        paragraphs: [
          "A estrutura de um trabalho serve o leitor. A introdução explica o problema e a sua relevância; o método torna o percurso examinável; os resultados apresentam o que foi encontrado; a discussão relaciona os achados com a pergunta, outras interpretações e limitações. Estes papéis ajudam a ordenar o argumento, mas devem ser adaptados ao género e às instruções da instituição.",
          "Planeie cada secção mediante uma pergunta funcional: o que se procura conhecer, como se procurou, o que se encontrou e o que isso permite concluir? Um parágrafo que responde a várias perguntas pode precisar de ser dividido. Um capítulo que apenas acumula citações pode precisar de uma tese organizadora. Antes de polir frases, verifique se cada parte faz avançar o problema.",
          "Nos resultados, use tabelas e exemplos quando reduzirem ambiguidade. Identifique unidades, categorias e denominadores. Uma tabela deve permitir compreender as comparações sem depender de adivinhar o código de uma coluna. Na discussão, não introduza novas observações como se já tivessem sido apresentadas e examinadas. Se uma explicação é especulativa, indique essa condição.",
          "A conclusão deve responder à pergunta dentro do alcance demonstrado. Pode reconhecer que o objetivo foi parcialmente alcançado ou que os dados não distinguiram explicações concorrentes. Recomendações práticas exigem uma ponte entre achado e decisão: que contexto permite aplicá-las, com que condições e quais incertezas permanecem? Uma recomendação enfática não compensa resultados frágeis.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: um relatório coloca relatos de estudantes na conclusão e apresenta recomendações na secção de método. Reorganizar pela função de cada trecho permite ao leitor verificar quais observações sustentam as recomendações.",
    exercise:
      "Crie um esqueleto do seu trabalho com cinco secções. Escreva a função de cada uma e associe uma evidência. Identifique uma informação que ainda não tem e que impede redigir a conclusão.",
    assessment: {
      question: "Uma conclusão deve sempre confirmar a hipótese inicial?",
      answer:
        "Não. Deve refletir os resultados e os limites do desenho, incluindo resultados incompatíveis com a previsão inicial.",
      criteria: [
        "Responde à pergunta.",
        "Evita dados novos na conclusão.",
        "Mantém o alcance proporcional à evidência.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "research-09",
    minutes: 60,
    objectives: [
      "Distinguir citação direta, paráfrase e síntese.",
      "Atribuir ideias sem distorcer o sentido da fonte.",
    ],
    sections: [
      {
        title: "Citar é assumir responsabilidade pela atribuição",
        paragraphs: [
          "Uma citação direta reproduz palavras e exige identificação clara do trecho conforme a norma adotada. Uma paráfrase reescreve uma ideia com estrutura própria, preserva o significado e continua a exigir atribuição. Uma síntese articula contributos de uma ou várias fontes em torno de uma questão. Trocar palavras por sinónimos não transforma uma cópia numa elaboração intelectual.",
          "Leia o contexto antes de extrair uma frase. Um autor pode apresentar uma posição para depois a criticar; citar apenas a posição como se fosse a sua tese produz uma atribuição falsa. No fichamento, guarde localização, contexto e função do trecho. Quando não consultou a obra original, identifique a fonte realmente lida e siga a regra institucional para citação secundária.",
          "A voz do investigador aparece ao selecionar, comparar e argumentar. Organize o parágrafo a partir de uma afirmação sua e mostre como as fontes a apoiam, limitam ou contradizem. Acumular nomes no fim de uma frase não demonstra que todos defendem exatamente a mesma ideia. Evite também atribuir consenso a uma única referência.",
          "Um verificador de similaridade pode ajudar a localizar correspondências, mas não decide sozinho se existe plágio. Termos técnicos, títulos e citações legítimas podem coincidir. A revisão humana precisa de examinar atribuição e dependência da estrutura original. O objetivo editorial é tornar as relações intelectuais claras, não reduzir artificialmente uma percentagem.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: uma aluna usa a conclusão de uma revisão como se tivesse lido os estudos originais. A correção consiste em atribuir a síntese à revisão consultada e procurar os originais se forem necessários para uma afirmação específica.",
    exercise:
      "Selecione um parágrafo de fonte acessível. Faça uma paráfrase sem olhar o original, compare o sentido e acrescente a referência. Depois escreva uma frase de análise própria que dialogue com essa ideia.",
    assessment: {
      question: "Alterar todos os adjetivos elimina a necessidade de referenciar uma ideia?",
      answer:
        "Não. A atribuição depende da origem da ideia e do argumento, não apenas das palavras utilizadas.",
      criteria: [
        "Preserva o sentido.",
        "Identifica a fonte realmente consultada.",
        "Distingue análise própria e ideia atribuída.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "research-10",
    minutes: 60,
    objectives: [
      "Conferir metadados de uma referência na fonte.",
      "Manter correspondência entre citações e lista bibliográfica.",
    ],
    sections: [
      {
        title: "Referências que outra pessoa consegue localizar",
        paragraphs: [
          "A referência bibliográfica identifica a fonte de forma suficientemente precisa para permitir a sua localização. O conjunto de elementos depende do tipo de documento e da norma exigida. Para artigos, confira autoria, título, periódico, ano e identificador quando existente. Para páginas institucionais, confira entidade responsável, título, endereço e informação temporal disponível. Não invente ano ou autoria quando a fonte não os fornece.",
          "Um DOI é um identificador, não uma garantia de qualidade. Abra o endereço e confirme que conduz ao trabalho citado. Erros de importação podem combinar o título de um artigo com os autores de outro. Gestores bibliográficos economizam trabalho, mas precisam de conferência. Faça uma revisão especialmente cuidadosa de acentos, nomes compostos, versões e traduções.",
          "Compare as citações no texto com a lista final nas duas direções. Toda fonte citada deve ser identificável na lista; a inclusão de uma obra não consultada apenas para ornamentar a bibliografia deve ser evitada. Se a instituição exigir uma bibliografia de leitura adicional, distinga-a das referências efetivamente utilizadas.",
          "Guarde uma ficha de proveniência: onde o documento foi obtido, que versão leu e que afirmação fundamenta. Isto facilita correções e atualizações. Em páginas que mudam ao longo do tempo, o acesso posterior pode não mostrar o mesmo conteúdo. Registe a data de consulta conforme a norma aplicada e preserve uma cópia apenas quando os direitos e as condições de acesso o permitirem.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: um gerador bibliográfico produz um DOI que abre outro artigo. A estudante retira o identificador incorreto, confere o documento no periódico e atualiza a referência. A aparência formal anterior não compensava o erro de identificação.",
    exercise:
      "Audite cinco referências do seu projeto. Abra cada uma, confirme os metadados e marque que afirmação sustenta. Liste inconsistências e corrija-as sem preencher informações desconhecidas por suposição.",
    assessment: {
      question:
        "O que fazer quando não consegue confirmar a existência de uma referência sugerida?",
      answer:
        "Não a usar como suporte. Procurar a fonte original ou substituí-la por uma referência autêntica e consultada que sustente a afirmação.",
      criteria: [
        "Verifica existência e metadados.",
        "Não inventa elementos ausentes.",
        "Associa a referência a uma afirmação concreta.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "research-11",
    minutes: 75,
    objectives: [
      "Identificar riscos éticos de um projeto antes da recolha.",
      "Distinguir transparência científica de exposição indevida de dados.",
    ],
    sections: [
      {
        title: "Ética incorporada ao desenho",
        paragraphs: [
          "A ética não começa quando se redige um termo. Começa ao decidir se a pergunta justifica envolver pessoas, que informação é necessária e que riscos a participação pode criar. Uma pergunta aparentemente inofensiva sobre trabalho pode expor conflitos ou relações de dependência. O investigador deve examinar o contexto e as exigências institucionais antes de iniciar a recolha.",
          "Considere voluntariedade, compreensão e possibilidade de recusa. Convidar os próprios subordinados ou alunos pode introduzir pressão, mesmo quando o convite diz que participar é opcional. Defina como reduzir essa pressão e quem terá acesso aos dados. Consentimento para participar não equivale automaticamente a autorização para publicar falas identificáveis ou partilhar os dados integralmente.",
          "Reduza a recolha ao necessário. Substituir o nome por um código pode não impedir identificação quando cargo, cidade e episódio singular aparecem juntos. A avaliação de risco deve considerar combinações de informação e pessoas que conhecem o contexto. Separe os meios de identificação do material de análise e estabeleça acesso, armazenamento e prazo de conservação segundo as regras aplicáveis ao projeto.",
          "A UNESCO apresenta abertura científica com limites para proteger direitos e confidencialidade. Transparência pode ser promovida por um protocolo, descrição de procedimentos e dados sintéticos, sem disponibilizar informação pessoal sensível. Esta aula não substitui apreciação ética institucional nem determina as obrigações jurídicas de uma jurisdição; essas verificações integram a preparação do estudo.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: uma entrevista usa pseudónimo, mas descreve o único diretor de uma escola de uma pequena cidade. O pseudónimo não elimina a possibilidade de reconhecimento. A equipa precisa de rever detalhes, finalidade e autorização antes de divulgar.",
    exercise:
      "Faça um mapa de riscos do seu projeto: pessoas afetadas, informação necessária, possibilidades de identificação e medidas de redução. Descreva uma alternativa com dados sintéticos para testar o instrumento sem envolver participantes reais.",
    assessment: {
      question: "Retirar o nome basta para tornar um relato anónimo?",
      answer:
        "Não. Detalhes indiretos e combinações de atributos podem permitir reidentificação, sobretudo a quem conhece o contexto.",
      criteria: [
        "Identifica dependência e voluntariedade.",
        "Reconhece identificação indireta.",
        "Propõe redução proporcional de dados.",
      ],
    },
    sourceIds: ["unesco"],
  },
  {
    id: "research-12",
    minutes: 120,
    objectives: [
      "Integrar pergunta, objetivos, método e fontes num projeto coerente.",
      "Rever um projeto com critérios e documentar alterações.",
    ],
    sections: [
      {
        title: "Do conjunto de peças a um projeto defensável",
        paragraphs: [
          "O projeto final deve permitir compreender o que será investigado, por que vale a pena e como será possível fazê-lo. Retome as decisões dos módulos anteriores. A pergunta deve corresponder aos objetivos; estes devem ser respondidos pelo método; o método deve respeitar os recursos e riscos identificados. Uma secção isoladamente bem escrita não corrige incoerência entre as partes.",
          "Entregue um documento com delimitação do problema, pergunta, objetivos, síntese de literatura consultada, desenho, procedimentos, plano de análise, riscos, cronograma e referências. Distinga decisões confirmadas de dependências ainda abertas. Se não obteve autorização de acesso, apresente um plano condicionado a essa autorização; não escreva como se a recolha já tivesse ocorrido.",
          "Faça uma revisão por rastreabilidade. Para cada objetivo, localize a evidência que poderá respondê-lo. Para cada instrumento, indique que parte da pergunta aborda. Para cada afirmação bibliográfica, localize a fonte lida. Para cada recomendação pretendida, pergunte se o desenho permite sustentá-la. Lacunas devem produzir revisão do projeto, não frases mais enfáticas.",
          "A avaliação proposta é formativa e deve resultar num plano de melhoria. Uma versão clara mas inviável precisa de reformulação; uma versão viável sem proteção adequada dos participantes também. O estudante pode solicitar leitura crítica de um colega, mas deve manter autoria e responsabilidade pelas escolhas. Registe o comentário recebido, a alteração realizada e a razão para aceitar ou recusar cada sugestão.",
        ],
      },
    ],
    caseStudy:
      "Caso fictício: o projeto final pretende demonstrar eficácia, mas prevê apenas entrevistar voluntários uma vez. A revisão identifica a incompatibilidade. A estudante reformula para compreender experiências e limita as conclusões ao contexto, sem inventar dados ou resultados.",
    exercise:
      "Entregue um projeto de 1500 a 2500 palavras, acompanhado da matriz de objetivos e de um histórico de pelo menos três revisões fundamentadas. Não recolha dados de pessoas para cumprir esta atividade; trabalhe no desenho e use exemplos explicitamente fictícios.",
    assessment: {
      question: "Que critérios decidem se o projeto está pronto para uma revisão por orientador?",
      answer:
        "Pergunta delimitada, objetivos verificáveis, método exequível, fontes localizáveis, riscos identificados e limitações explícitas. A revisão do orientador continua necessária; esta autoavaliação não confere aprovação institucional.",
      criteria: [
        "Pergunta e objetivos coerentes: 0–2 pontos.",
        "Método e análise adequados e viáveis: 0–2 pontos.",
        "Literatura efetivamente consultada e referenciada: 0–2 pontos.",
        "Riscos e limites explicitados: 0–2 pontos.",
        "Clareza e histórico de revisão: 0–2 pontos. Meta formativa: 8/10, sem zero em qualquer dimensão; rever as dimensões insuficientes.",
      ],
    },
    sourceIds: ["prisma", "icmje", "unesco"],
  },
];
