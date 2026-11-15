import type { EditorialLesson } from "./types";
// A written introductory sequence. Does not assess listening or certify CEFR A1.
export const ENGLISH_LESSONS: EditorialLesson[] = [
  {
    id: "english-01",
    minutes: 60,
    objectives: [
      "Apresentar nome, origem e ocupação em quatro frases simples.",
      "Pedir repetição quando não compreender uma informação.",
    ],
    sections: [
      {
        title: "Apresentar-se e manter a conversa possível",
        paragraphs: [
          "Uma apresentação curta permite iniciar contacto sem precisar de dominar todas as palavras. Observe este diálogo original: “Hello, I’m Sofia. What’s your name?” — “I’m Bruno. Nice to meet you.” — “Nice to meet you too.” A expressão I’m corresponde a I am. Ao dizer o nome, não traduza literalmente a estrutura portuguesa “eu tenho o nome”: use I’m Sofia ou My name is Sofia. What’s é a contração de what is.",
          "Acrescente uma informação de cada vez: “I’m from Brazil. I live in Brussels. I’m a student.” From indica origem neste contexto; in situa a cidade de residência. Compare “I’m Brazilian” com “I’m from Brazil”: a primeira usa uma nacionalidade, a segunda o nome do país. Em inglês, nomes de países, nacionalidades e línguas começam com maiúscula. A profissão singular costuma precisar de artigo: “I’m a teacher”, “I’m an engineer”. A escolha entre a e an depende do som que segue, não apenas da letra.",
          "Não tente esconder a incompreensão. “Sorry, could you repeat that, please?” pede repetição; “Could you speak more slowly, please?” pede uma fala mais lenta. São expressões de apoio que podem ser aprendidas como unidades antes de estudar a sua estrutura completa. Uma conversa inicial bem-sucedida também inclui reparar uma falha, confirmar um nome e dizer que não entendeu.",
          "O texto escrito não ensina, por si só, os sons de uma língua. Ler uma palavra com a pronúncia do português pode produzir diferenças importantes. Esta edição não inclui áudio nem avaliação de pronúncia; a atividade de gravação serve para comparar fluência e clareza ao longo do tempo, sem atribuir uma classificação fonética automática.",
        ],
      },
    ],
    caseStudy:
      "Situação fictícia: numa receção, Sofia ouve um nome que não reconhece. Em vez de responder a uma pergunta diferente, diz “Sorry, could you repeat your name, please?” e confirma “Bruno?” antes de continuar.",
    exercise:
      "Escreva uma apresentação com nome, origem, residência e ocupação usando dados fictícios. Construa um diálogo de seis falas com saudação, pergunta pelo nome e pedido de repetição. Grave a leitura se desejar, sem publicar dados pessoais.",
    assessment: {
      question: "Como corrigir “I am from Brazilian. I am student”?",
      answer:
        "“I am from Brazil. I am a student.” Também é possível dizer “I am Brazilian”. Brazil é o país; Brazilian é a nacionalidade. Student, como ocupação singular neste uso, precisa de artigo.",
      criteria: [
        "Distingue país e nacionalidade.",
        "Usa a/an em profissão singular.",
        "Inclui uma estratégia de reparação.",
      ],
    },
    sourceIds: ["cefr"],
  },
  {
    id: "english-02",
    minutes: 75,
    objectives: [
      "Construir afirmações, negativas e perguntas com be.",
      "Responder a perguntas simples sobre identidade e localização.",
    ],
    sections: [
      {
        title: "O verbo be: identidade, estado e localização",
        paragraphs: [
          "O verbo be pode corresponder a ser ou estar, conforme o contexto. No presente, as formas são I am, you are, he is, she is, it is, we are e they are. Compare “She is a designer” com “She is at the office”. A primeira frase informa uma ocupação; a segunda localiza a pessoa. A tradução depende da função da frase, não de escolher uma única palavra portuguesa para be.",
          "Para negar, acrescente not depois do verbo: “I am not available”, “They are not here”. Na conversa e em muitos textos informais surgem contrações: isn’t e aren’t. Para perguntar, coloque a forma de be antes do sujeito: “Are you available?” e “Is the meeting online?” Não acrescente do a estas perguntas. “Do you are available?” mistura dois padrões diferentes.",
          "Perguntas de sim ou não podem receber respostas curtas: “Yes, I am”, “No, I’m not”, “Yes, she is”, “No, she isn’t”. Não contraia o verbo no fim de uma resposta afirmativa curta: use “Yes, I am”, em vez de “Yes, I’m”. Para pedir informação específica, use uma palavra interrogativa: “Where is the station?” ou “What is your name?” A informação procurada orienta a palavra escolhida.",
          "Os pronomes substituem nomes já identificados. They pode referir um grupo e também uma pessoa em usos singulares contemporâneos; nesta atividade, pratique primeiro a referência ao grupo para consolidar a concordância. It pode retomar uma coisa, situação ou animal quando o contexto o permite. Verifique sempre a quem ou a quê cada pronome se refere para evitar frases gramaticais mas ambíguas.",
        ],
      },
    ],
    caseStudy:
      "Situação fictícia: uma reunião mudou de sala. “Is the meeting in room three?” — “No, it isn’t. It is online.” A resposta corrige a localização sem alterar o assunto da pergunta.",
    exercise:
      "Transforme estas frases em negativa e pergunta: “The office is open”; “You are early”; “They are students”. Depois escreva quatro respostas curtas, duas afirmativas e duas negativas, com sujeitos diferentes.",
    assessment: {
      question: "Complete a pergunta e a resposta: “___ she at the office?” — “No, she ___.”",
      answer:
        "“Is she at the office?” — “No, she isn’t.” A forma is antecede she na pergunta; a negativa inclui not, aqui contraído.",
      criteria: [
        "Seleciona am/is/are pelo sujeito.",
        "Inverte verbo e sujeito na pergunta.",
        "Usa not sem acrescentar do.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "english-03",
    minutes: 90,
    objectives: [
      "Descrever uma rotina simples no presente.",
      "Construir perguntas e negativas com do e does.",
    ],
    sections: [
      {
        title: "Falar de rotinas sem transportar a gramática do português",
        paragraphs: [
          "O presente simples permite descrever hábitos e situações geralmente verdadeiras. “I work in a café” informa uma ocupação ou situação habitual; “I start at eight” apresenta um horário recorrente. Com he, she e it, muitos verbos recebem s: “She works in a café”. Algumas formas mudam mais: “He studies”, “She goes”, “It has”. Observe a palavra completa e não apenas uma regra isolada.",
          "Nas negativas, use don’t com I, you, we e they, e doesn’t com he, she e it. O verbo principal regressa à forma de base: “She doesn’t work on Sundays”. A marca de terceira pessoa já está no auxiliar does, por isso “doesn’t works” está incorreto. Nas perguntas, o padrão é semelhante: “Do you work here?” e “Does she work here?” Não combine este auxiliar com be no padrão aprendido na aula anterior.",
          "As perguntas sobre horários colocam a informação interrogativa antes do auxiliar: “What time do you start?” — “I start at nine.” Use at para uma hora e on para um dia: at nine, on Monday. Expressões como every day e usually ajudam a indicar frequência. A posição de usually antes do verbo principal aparece em “I usually start at nine”. Estas expressões não precisam de ser acrescentadas a todas as frases para que o contexto seja habitual.",
          "O vocabulário pode ser praticado por conjuntos funcionais: breakfast, lunch e dinner para refeições; open e close para horários de lojas; buy e pay para compras. Escreva frases que correspondam a ações compreensíveis. Traduzir uma lista de palavras não equivale a conseguir fazer uma pergunta ou compreender uma resposta.",
        ],
      },
    ],
    caseStudy:
      "Situação fictícia: um cliente pergunta “Does the shop open on Sunday?” e recebe “No, it doesn’t. It opens on Monday.” O s aparece em opens na afirmação, mas não em open depois de does.",
    exercise:
      "Escreva uma rotina fictícia de seis frases. Reescreva três usando she. Construa duas perguntas sobre dias e duas sobre horários. Inclua uma negativa com doesn’t e confira se o verbo seguinte está na forma de base.",
    assessment: {
      question: "Corrija “Does he starts at eight?” e “She don’t work here”.",
      answer:
        "“Does he start at eight?” e “She doesn’t work here.” Does concentra a marca de terceira pessoa; o verbo principal permanece na base.",
      criteria: [
        "Usa a terceira pessoa na afirmação.",
        "Seleciona do/does pelo sujeito.",
        "Mantém verbo de base depois do auxiliar.",
      ],
    },
    sourceIds: ["british-present"],
  },
  {
    id: "english-04",
    minutes: 90,
    objectives: [
      "Pedir informação e fazer um pedido cortês em situações de viagem.",
      "Confirmar preço, local e necessidade de ajuda com frases curtas.",
    ],
    sections: [
      {
        title: "Pedidos claros em restaurante, hotel e transporte",
        paragraphs: [
          "Num restaurante, “I’d like a coffee, please” faz um pedido; “Can I have the menu, please?” pede o menu. I’d like funciona aqui como uma expressão de cortesia. Não precisa de dominar todos os usos de would para começar a utilizá-la. “I want” é gramatical, mas pode soar demasiado direto em algumas situações de atendimento. A intenção comunica-se também pelo tom e pelo contexto.",
          "Num hotel, “I have a reservation” introduz a situação. Em seguida, “My name is…” identifica a reserva. Para procurar um local, use “Where is the reception?” ou “Where is the station?” Para preço, “How much is the ticket?” procura um valor; para saída, “What time does the train leave?” procura um horário. Note que a pergunta sobre o comboio recupera does, estudado na aula de rotina.",
          "Quando recebe uma informação importante, confirme o elemento decisivo: “Platform two?” ou “Twenty euros?” A confirmação curta ajuda a evitar um erro mesmo com vocabulário limitado. Peça informação por escrito quando necessário: “Could you write it down, please?” Não invente uma compreensão para terminar a conversa mais depressa. A comunicação inclui gerir a própria incerteza.",
          "Para solicitar ajuda, uma frase simples pode ser suficiente para iniciar o contacto: “I need help” ou “Please call an ambulance”. Estas expressões são prática linguística, não um protocolo de primeiros socorros. A plataforma não simula avaliação de emergência. Numa situação real, o atendimento local deve orientar os passos e a comunicação deve dar prioridade à localização e ao problema imediato.",
        ],
      },
    ],
    caseStudy:
      "Situação fictícia: Lara ouve um preço, mas não sabe se entendeu quinze ou cinquenta. Pergunta “Could you write the price down, please?” e só confirma a compra depois de compreender o valor.",
    exercise:
      "Escreva três diálogos de quatro falas: pedir uma refeição, confirmar uma reserva e perguntar por uma plataforma. Em cada diálogo, inclua uma confirmação ou um pedido de esclarecimento, sem repetir a mesma sequência.",
    assessment: {
      question:
        "Que pergunta escolhe para saber o preço de um bilhete e que pergunta escolhe para saber a hora da partida?",
      answer:
        "“How much is the ticket?” procura o preço. “What time does the train leave?” procura o horário. A palavra interrogativa deve corresponder à informação necessária.",
      criteria: [
        "Escolhe a pergunta adequada ao dado.",
        "Inclui um pedido cortês.",
        "Confirma informação ambígua.",
      ],
    },
    sourceIds: [],
  },
  {
    id: "english-05",
    minutes: 90,
    objectives: [
      "Redigir uma mensagem profissional breve com pedido e informação essencial.",
      "Integrar apresentação, disponibilidade e confirmação num diálogo escrito.",
    ],
    sections: [
      {
        title: "Primeiro contacto profissional e revisão integrada",
        paragraphs: [
          "Uma mensagem profissional inicial não precisa de ser longa. Precisa de identificar o assunto, dizer o que se pretende e facilitar uma resposta. Exemplo original: “Hello Ana, my name is Daniel. I’m interested in the assistant role. Is the position still available? Thank you, Daniel.” A mensagem apresenta a pessoa e contém uma pergunta concreta. Não acrescente experiência ou qualificações fictícias numa candidatura real.",
          "Para disponibilidade, escreva “I’m available on Tuesday” ou “I can meet at ten”. Can introduz aqui possibilidade ou capacidade, seguido do verbo de base: can meet, can start, can help. Não escreva “can to meet”. Uma frase como “Can you confirm the time, please?” permite concluir com um pedido claro. Antes de enviar, confira se o dia, a hora e o fuso são compreensíveis para quem recebe.",
          "Revise a diferença entre be e os verbos de rotina. “Are you available?” usa be; “Do you work on Tuesdays?” usa do com work. “She is available” não precisa de s adicional; “She works on Tuesdays” precisa da forma works. A revisão deve partir da função da frase: identificar, localizar, descrever hábito ou pedir informação. Memorizar respostas sem perceber a função reduz a capacidade de adaptar a mensagem.",
          "O projeto final desta sequência avalia escrita e leitura introdutórias. O nível A1 do Quadro Europeu envolve capacidades comunicativas mais amplas, incluindo interação; esta sequência escrita não demonstra sozinha domínio global desse nível. Use o resultado para identificar o que já consegue fazer e o que precisa de praticar com áudio, conversação e acompanhamento apropriado.",
        ],
      },
    ],
    caseStudy:
      "Situação fictícia: Daniel aceita uma entrevista às dez, mas a empresa está noutro país. A mensagem “Can you confirm the time zone, please?” evita assumir que ambas as partes usam a mesma hora local.",
    exercise:
      "Produza uma mensagem de 40 a 60 palavras para pedir informação sobre uma vaga fictícia. Acrescente um diálogo de oito falas que inclua apresentação, rotina, disponibilidade e confirmação de hora. Reveja com os critérios antes de consultar a resposta.",
    assessment: {
      question: "Como corrigir “I can to meet on Tuesday. Do you are available?”?",
      answer:
        "“I can meet on Tuesday. Are you available?” Can é seguido da base meet, sem to. A pergunta com be usa are antes de you, sem do.",
      criteria: [
        "Comunica identidade e finalidade: 0–2.",
        "Forma perguntas compreensíveis: 0–2.",
        "Usa be e presente simples adequadamente: 0–2.",
        "Indica disponibilidade e confirma informação: 0–2.",
        "Mantém mensagem clara e cortês: 0–2. Meta formativa: 8/10; rever qualquer dimensão com zero.",
      ],
    },
    sourceIds: ["cefr"],
  },
];
