import { createHash } from "node:crypto";
import type { AcademyPracticeGuide } from "@/lib/academy-reading-editions";

// Server-only snapshot of the editorial source. Publication authorization applies to
// the derived optional practice guide, not to draft approval flags or certified hours.
const sourceProgramme = {
  "schema": "ldr-estimated-learning-programme-v1",
  "id": "customer-service-60h-estimated-v1",
  "title": "Atendimento ao Cliente com Humanização e Resultado — percurso prático de 60 horas estimadas",
  "slug": "atendimento-ao-cliente-com-humanizacao-e-resultado",
  "productKey": "curso_assinatura_atendimento_ao_cliente_com_humanizacao_e_resultado",
  "locale": "pt",
  "status": "draft",
  "published": false,
  "activationEligible": false,
  "estimatedHours": 60,
  "validatedHours": null,
  "certificate": false,
  "approval": null,
  "review": {
    "pedagogy": false,
    "editorial": false,
    "rights": false,
    "accessibility": false,
    "workload": false,
    "reader": false
  },
  "authorship": {
    "proposedEditorialResponsible": "Luciano Rodrigues Almeida",
    "credit": "Organização e responsabilidade editorial proposta: Luciano Rodrigues Almeida. Conteúdo desenvolvido com apoio de inteligência artificial.",
    "humanCreativeContributionRecorded": false,
    "humanContentAcceptanceRecorded": false,
    "note": "O pedido de desenvolvimento não equivale a revisão humana já realizada, parecer profissional ou declaração de autoria integral. Identificação a confirmar pelo responsável antes de publicação."
  },
  "workloadPolicy": {
    "basis": "Carga de aprendizagem estimada por atividades e entregáveis; não são 60 horas de vídeo ou leitura contínua.",
    "timing": "As durações orientam planeamento, não são espera obrigatória, tempo mínimo de permanência ou prova de conclusão. Pausas e dificuldades de acesso não contam como tempo de aprendizagem.",
    "counting": "Uma atividade pertence a uma única categoria. Projeto é construção incremental distinta dos exercícios; síntese de estudo é distinta da correção avaliada. Não reutilizar a mesma entrega para duplicar horas.",
    "validation": "Registar tempo ativo observado, dificuldades e entregáveis em pilotagem; rever a estimativa quando houver evidência. Nenhum tempo observado foi recolhido.",
    "adaptation": "Permitir texto, áudio com transcrição ou formato acessível equivalente; ajustar duração individual sem penalizar velocidade de leitura."
  },
  "distributionMinutes": {
    "study": 720,
    "practice": 1080,
    "case": 720,
    "project": 840,
    "assessment": 240
  },
  "pilot": {
    "status": "not-applied",
    "participants": [],
    "observations": [],
    "validatedHours": null,
    "fields": [
      "participantPseudonym",
      "activityId",
      "activeMinutes",
      "completedDeliverable",
      "difficulty",
      "accessibilityBarrier",
      "revisionNeeded"
    ],
    "privacy": "Só pseudónimos locais e dados mínimos; não recolher dados reais de clientes, credenciais ou informação financeira."
  },
  "project": {
    "brief": "Construir e defender um procedimento de atendimento para o centro fictício Aurora usando os dados da unidade 6 e instrumentos testados nas unidades 1–5. O projeto integra, mas não repete como novas horas, as entregas anteriores.",
    "deliverables": [
      "Índice de competências e evidências",
      "Ficha de incidente versionada",
      "Matriz de prioridade e escalonamento",
      "Mensagens por estado e competência",
      "Registo de causa e plano de teste",
      "Calendário de acompanhamento",
      "Resolução cronológica e contrafactual Aurora",
      "Defesa e diário final de alterações"
    ],
    "rubric": [
      {
        "criterion": "Diagnóstico e cronologia",
        "maxPoints": 20,
        "evidence": "Distingue relato, hipótese, confirmação e informação posterior."
      },
      {
        "criterion": "Prioridade e competência",
        "maxPoints": 15,
        "evidence": "Justifica impacto, capacidade e destino sem inventar recursos."
      },
      {
        "criterion": "Comunicação e privacidade",
        "maxPoints": 20,
        "evidence": "Mensagens específicas, dados mínimos e ausência de promessa sem suporte."
      },
      {
        "criterion": "Consequências e finanças",
        "maxPoints": 20,
        "evidence": "Separa acesso, atividade perdida, pedido, autorização e execução."
      },
      {
        "criterion": "Acompanhamento e indicadores",
        "maxPoints": 15,
        "evidence": "Compromissos de retorno e denominadores corretos; silêncio não é satisfação."
      },
      {
        "criterion": "Prevenção e limites",
        "maxPoints": 10,
        "evidence": "Teste ligado à causa, evidência de versão e limites de generalização."
      }
    ],
    "proposedPassScore": 80,
    "criticalErrors": [
      "Solicitar senha ou código de autenticação.",
      "Inventar autorização ou execução de reembolso.",
      "Garantir vaga não confirmada.",
      "Inferir satisfação pelo silêncio.",
      "Substituir análise legal por política fictícia."
    ],
    "decision": "Rubrica e limiar propostos. Avaliação humana e correção de erros críticos necessárias; sem aprovação ou certificado automático."
  },
  "finalQuestions": [
    {
      "question": "Quando o pagamento de Nuno passa de relato a confirmação?",
      "key": "Às 14:05, pela financeira; antes disso era relato."
    },
    {
      "question": "Às 13:50 a causa está demonstrada?",
      "key": "Não; há três relatos e impacto coletivo, sem causa confirmada."
    },
    {
      "question": "O teste das 14:25 prova que Nuno entrou?",
      "key": "Não; a confirmação dele só chega às 14:32."
    },
    {
      "question": "A entrada recupera a atividade perdida?",
      "key": "Não; consequência pedagógica permanece separada."
    },
    {
      "question": "O pedido das 15:10 foi autorizado?",
      "key": "Não; apenas receção do pedido foi confirmada."
    },
    {
      "question": "Existe vaga confirmada na nova sessão?",
      "key": "Não; só a existência da sessão foi confirmada."
    },
    {
      "question": "O silêncio dispensa o retorno combinado?",
      "key": "Não; é preciso atualizar antes do compromisso das 10:00 mesmo sem decisão."
    },
    {
      "question": "Que prova o contrafactual de teste falhado e acesso relatado?",
      "key": "Há divergência a investigar; conservar as duas evidências, sem concluir causa ou correção geral."
    }
  ],
  "modules": [
    {
      "id": "1",
      "title": "Diagnóstico verificável e privacidade",
      "outcomes": [
        "Separar relato, evidência, hipótese e decisão em quatro momentos.",
        "Solicitar apenas informação que altera a próxima ação."
      ],
      "baseReading": {
        "path": "docs/audit-20261115/course-development/customer-service/unit-01-diagnostico-do-pedido.md",
        "sha256": "83d267231732fa4a3966b2ec17922324a6053a53c17c04132040249ac4208f4f"
      },
      "casePacket": {
        "contexto": "Núcleo fictício Horizonte; todos os nomes, pedidos e regras são inventados. O formando trabalha sem acesso a pagamentos e não pode alterar permissões.",
        "regra": "Conta autenticada identifica o pedido. É proibido pedir senha, código de autenticação ou número completo de cartão. Identificador do pedido pode ser usado no canal interno. Só faturação confirma recebimento e só suporte altera autorização.",
        "eventos": [
          {
            "hora": "09:00",
            "origem": "cliente",
            "conteudo": "Joana relata pagamento ontem e erro «inscrição não localizada» no curso Mapa."
          },
          {
            "hora": "09:08",
            "origem": "sistema",
            "conteudo": "Conta autenticada; pedido H17 criado; estado financeiro não disponível ao atendente."
          },
          {
            "hora": "09:20",
            "origem": "faturação",
            "conteudo": "Pedido H17 consta como pago."
          },
          {
            "hora": "09:35",
            "origem": "suporte",
            "conteudo": "Produto do pedido é Mapa A; Joana tenta abrir Mapa B. Não existe decisão de troca."
          }
        ],
        "mensagemInadequada": "O pagamento deve ter falhado. Envie a senha e o cartão para eu trocar o curso hoje."
      },
      "activities": [
        {
          "id": "U1-E",
          "category": "study",
          "title": "Estudo ativo e síntese",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Marque, na unidade de base, as quatro camadas do relato; escreva uma paráfrase e um exemplo original para cada uma.",
              "minutes": 20
            },
            {
              "instruction": "Construa quatro fotografias de H17 sem transportar para as 09:00 o conhecimento das 09:35.",
              "minutes": 30
            },
            {
              "instruction": "Compare duas respostas próprias: uma que reconhece impacto e outra que promete troca. Explique por que a segunda excede a competência.",
              "minutes": 35
            },
            {
              "instruction": "Redija um mapa de decisão com dado mínimo, finalidade, equipa competente e ponto em que é necessário parar.",
              "minutes": 35
            }
          ],
          "submissionFields": [
            "Anotações referenciadas à unidade de base",
            "Síntese original e comparação de alternativas"
          ],
          "acceptanceCriteria": [
            "Cada afirmação deve apontar para passagem da leitura ou dado do caso.",
            "Separar princípio de atendimento e regra meramente convencional do exercício."
          ],
          "facilitatorKey": [
            "Às 09:00 o pagamento é relato, não falha confirmada; às 09:20 é confirmação de faturação; às 09:35 há diferença entre produtos, sem autorização de troca."
          ]
        },
        {
          "id": "U1-P",
          "category": "practice",
          "title": "Oficinas de aplicação",
          "estimatedMinutes": 180,
          "steps": [
            {
              "instruction": "Preencha 16 células: facto, relato, hipótese e pendência em cada um dos quatro horários; assinale quando uma hipótese foi afastada.",
              "minutes": 60
            },
            {
              "instruction": "Reescreva a mensagem inadequada em até 110 palavras; prepare uma alternativa de até 50 palavras e justifique três exclusões de dados.",
              "minutes": 60
            },
            {
              "instruction": "Produza transferência para suporte e retorno para Joana: inclua produto comprado, produto tentado, decisão solicitada e ausência de troca autorizada.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Linha temporal H17 com 16 células",
            "Duas respostas e justificativa de minimização",
            "Nota interna e resposta externa"
          ],
          "acceptanceCriteria": [
            "Entregar raciocínio e artefacto, não apenas resposta final.",
            "Identificar informação ausente e autoridade necessária sem a inventar."
          ],
          "facilitatorKey": [
            "Às 09:00 o pagamento é relato, não falha confirmada; às 09:20 é confirmação de faturação; às 09:35 há diferença entre produtos, sem autorização de troca.",
            "Senha e cartão são desnecessários e proibidos pelas regras do exercício. A resposta pode reconhecer o impacto e encaminhar conferência; não prometer troca.",
            "No contrafactual, a divergência de produto desaparece: não há causa conhecida e suporte deve investigar a autorização."
          ]
        },
        {
          "id": "U1-C",
          "category": "case",
          "title": "Comparação e contrafactual",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Elabore a árvore H17 com ramos: pagamento confirmado ou não consultável; produto coincidente ou diferente. Em cada folha diga quem decide e qual conclusão continua proibida.",
              "minutes": 60
            },
            {
              "instruction": "Altere apenas o evento das 09:35 para «produto coincidente; causa desconhecida». Refaça o encaminhamento e compare exatamente as conclusões que deixam de ser sustentadas.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Árvore original e contrafactual",
            "Quadro de premissas alteradas e conclusões preservadas"
          ],
          "acceptanceCriteria": [
            "Alterar apenas a premissa indicada.",
            "Explicitar hipótese, evidência e limite em cada ramo da análise."
          ],
          "facilitatorKey": [
            "Senha e cartão são desnecessários e proibidos pelas regras do exercício. A resposta pode reconhecer o impacto e encaminhar conferência; não prometer troca.",
            "No contrafactual, a divergência de produto desaparece: não há causa conhecida e suporte deve investigar a autorização."
          ]
        },
        {
          "id": "U1-J",
          "category": "project",
          "title": "Construção incremental do projeto",
          "estimatedMinutes": 140,
          "steps": [
            {
              "instruction": "Crie a primeira versão da ficha de incidente que será reutilizada no projeto final; cada campo deve ter finalidade e exemplo H17.",
              "minutes": 70
            },
            {
              "instruction": "Faça um ensaio de utilização com os quatro snapshots; registe campos ambíguos, corrija a ficha e explique as alterações num diário de versão.",
              "minutes": 70
            }
          ],
          "submissionFields": [
            "Ficha de incidente v1/v2 e diário",
            "Diário de versão: problema, correção e evidência"
          ],
          "acceptanceCriteria": [
            "Instrumento aplicável aos dados fictícios fornecidos.",
            "Preservar versões e justificar decisões operacionais."
          ],
          "facilitatorKey": [
            "No contrafactual, a divergência de produto desaparece: não há causa conhecida e suporte deve investigar a autorização.",
            "A ficha deve manter facto, origem, horário, responsável, próxima ação e pendência. Não há modelo de estilo único."
          ]
        },
        {
          "id": "U1-A",
          "category": "assessment",
          "title": "Avaliação e revisão fundamentada",
          "estimatedMinutes": 40,
          "steps": [
            {
              "instruction": "Sem consultar a ficha pronta, classifique cinco afirmações criadas por si a partir do caso e dê evidência horária para cada decisão.",
              "minutes": 20
            },
            {
              "instruction": "Compare a resposta com a chave; corrija cada inferência indevida e entregue a primeira versão e a versão revista.",
              "minutes": 20
            }
          ],
          "submissionFields": [
            "Autoavaliação com correções",
            "Primeira entrega e entrega corrigida"
          ],
          "acceptanceCriteria": [
            "Não apagar a primeira resposta ao rever.",
            "Erros críticos exigem correção e nova avaliação humana; nenhum estado é aprovado pelo tempo decorrido."
          ],
          "facilitatorKey": [
            "Às 09:00 o pagamento é relato, não falha confirmada; às 09:20 é confirmação de faturação; às 09:35 há diferença entre produtos, sem autorização de troca.",
            "Senha e cartão são desnecessários e proibidos pelas regras do exercício. A resposta pode reconhecer o impacto e encaminhar conferência; não prometer troca.",
            "No contrafactual, a divergência de produto desaparece: não há causa conhecida e suporte deve investigar a autorização."
          ]
        }
      ]
    },
    {
      "id": "2",
      "title": "Prioridade, capacidade e encaminhamento",
      "outcomes": [
        "Ordenar uma fila por impacto e limite temporal justificado.",
        "Distinguir espera, tempo de tratamento e prazo de retorno."
      ],
      "baseReading": {
        "path": "docs/audit-20261115/course-development/customer-service/unit-02-priorizacao-e-encaminhamento.md",
        "sha256": "e1d0100bbcbdac097f3d75be9750013e7d279a79e18d0444052ed62cd76c48c8"
      },
      "casePacket": {
        "contexto": "Central fictícia Lume, às 09:00; um agente trata um pedido de cada vez, sem interrupção. Todos chegaram às 09:00. Não há informação de risco físico.",
        "regras": "Neste exercício: prioridade 1 para serviço coletivo indisponível com sessão em curso; prioridade 2 para prazo operacional até 10:00; prioridade 3 para restante. Dentro da mesma classe, menor prazo primeiro. Não são regras reais de emergência. Suporte confirma causa; operador organiza fila e retorno.",
        "fila": [
          {
            "id": "Q1",
            "pessoas": 1,
            "situacao": "corrigir nome em comprovativo",
            "prazo": "17:00",
            "tratamentoMin": 10
          },
          {
            "id": "Q2",
            "pessoas": 12,
            "situacao": "sessão das 09:00 sem som para todos",
            "prazo": "09:30",
            "tratamentoMin": 20
          },
          {
            "id": "Q3",
            "pessoas": 1,
            "situacao": "submeter inscrição já paga",
            "prazo": "09:45",
            "tratamentoMin": 15
          },
          {
            "id": "Q4",
            "pessoas": 1,
            "situacao": "saber data de nova edição",
            "prazo": "18:00",
            "tratamentoMin": 5
          }
        ],
        "mudanca": "Às 09:10 a técnica informa que Q2 poderá precisar de mais 30 minutos além dos 20 previstos. Não há outro agente disponível."
      },
      "activities": [
        {
          "id": "U2-E",
          "category": "study",
          "title": "Estudo ativo e síntese",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Extraia da leitura a diferença entre impacto, urgência e pressão emocional; formule exemplos em que cada dimensão varia isoladamente.",
              "minutes": 20
            },
            {
              "instruction": "Explique a regra fictícia da fila sem a apresentar como política universal; identifique a ausência de dados de segurança.",
              "minutes": 30
            },
            {
              "instruction": "Desenhe a primeira sequência com início, fim, espera e margem até ao prazo; confira as unidades de tempo.",
              "minutes": 35
            },
            {
              "instruction": "Estude a mudança das 09:10 e escreva uma atualização que distinga previsão de garantia.",
              "minutes": 35
            }
          ],
          "submissionFields": [
            "Anotações referenciadas à unidade de base",
            "Síntese original e comparação de alternativas"
          ],
          "acceptanceCriteria": [
            "Cada afirmação deve apontar para passagem da leitura ou dado do caso.",
            "Separar princípio de atendimento e regra meramente convencional do exercício."
          ],
          "facilitatorKey": [
            "Agenda inicial: Q2 09:00–09:20, Q3 09:20–09:35, Q1 09:35–09:45, Q4 09:45–09:50; esperas 0,20,35,45 minutos nessa ordem."
          ]
        },
        {
          "id": "U2-P",
          "category": "practice",
          "title": "Oficinas de aplicação",
          "estimatedMinutes": 180,
          "steps": [
            {
              "instruction": "Classifique Q1–Q4 e construa a agenda inicial; calcule espera e margem até ao prazo de cada pedido.",
              "minutes": 60
            },
            {
              "instruction": "Replaneie com Q2 a ocupar 50 minutos no total; identifique o prazo perdido e escreva um pedido de decisão ao coordenador.",
              "minutes": 60
            },
            {
              "instruction": "Redija quatro mensagens de retorno proporcionais à informação, sem divulgar outros clientes ou prometer que o prazo será cumprido.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Agenda e cálculo de espera/margem",
            "Agenda revista e escalonamento",
            "Quatro mensagens de retorno"
          ],
          "acceptanceCriteria": [
            "Entregar raciocínio e artefacto, não apenas resposta final.",
            "Identificar informação ausente e autoridade necessária sem a inventar."
          ],
          "facilitatorKey": [
            "Agenda inicial: Q2 09:00–09:20, Q3 09:20–09:35, Q1 09:35–09:45, Q4 09:45–09:50; esperas 0,20,35,45 minutos nessa ordem.",
            "Q2 estendido termina 09:50; Q3 termina 10:05, vinte minutos depois do prazo 09:45. Escalonar não cria capacidade.",
            "Por identificador, Q2 termina 09:30 e Q3 09:45. Com segundo agente às 09:15, Q3 termina 09:30. Não supor agente ou habilitação ausentes."
          ]
        },
        {
          "id": "U2-C",
          "category": "case",
          "title": "Comparação e contrafactual",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Compare a política proposta com atendimento por ordem de identificador Q1,Q2,Q3,Q4: calcule a diferença no fim de Q2 e Q3 e explicite quem fica em desvantagem.",
              "minutes": 60
            },
            {
              "instruction": "Agora adicione um segundo agente habilitado às 09:15 exclusivamente para Q3; refaça o cenário alterado e explique a condição que permite recuperar esse prazo.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Comparação de políticas",
            "Quadro de premissas alteradas e conclusões preservadas"
          ],
          "acceptanceCriteria": [
            "Alterar apenas a premissa indicada.",
            "Explicitar hipótese, evidência e limite em cada ramo da análise."
          ],
          "facilitatorKey": [
            "Q2 estendido termina 09:50; Q3 termina 10:05, vinte minutos depois do prazo 09:45. Escalonar não cria capacidade.",
            "Por identificador, Q2 termina 09:30 e Q3 09:45. Com segundo agente às 09:15, Q3 termina 09:30. Não supor agente ou habilitação ausentes."
          ]
        },
        {
          "id": "U2-J",
          "category": "project",
          "title": "Construção incremental do projeto",
          "estimatedMinutes": 140,
          "steps": [
            {
              "instruction": "Acrescente à ficha do projeto uma matriz de prioridade com critérios e regra de desempate; inclua campo para previsão revista.",
              "minutes": 70
            },
            {
              "instruction": "Teste a matriz com a fila e o segundo agente; escreva um mecanismo de escalonamento quando a capacidade não basta.",
              "minutes": 70
            }
          ],
          "submissionFields": [
            "Matriz de prioridade v1/v2",
            "Diário de versão: problema, correção e evidência"
          ],
          "acceptanceCriteria": [
            "Instrumento aplicável aos dados fictícios fornecidos.",
            "Preservar versões e justificar decisões operacionais."
          ],
          "facilitatorKey": [
            "Por identificador, Q2 termina 09:30 e Q3 09:45. Com segundo agente às 09:15, Q3 termina 09:30. Não supor agente ou habilitação ausentes.",
            "A ficha deve manter facto, origem, horário, responsável, próxima ação e pendência. Não há modelo de estilo único."
          ]
        },
        {
          "id": "U2-A",
          "category": "assessment",
          "title": "Avaliação e revisão fundamentada",
          "estimatedMinutes": 40,
          "steps": [
            {
              "instruction": "Resolva novamente a sequência alterada sem ver a agenda anterior; indique espera, fim e violação de prazo de Q3.",
              "minutes": 20
            },
            {
              "instruction": "Audite as mensagens: retire garantias e troque-as por compromisso verificável de atualização com responsável.",
              "minutes": 20
            }
          ],
          "submissionFields": [
            "Correção dos cálculos",
            "Primeira entrega e entrega corrigida"
          ],
          "acceptanceCriteria": [
            "Não apagar a primeira resposta ao rever.",
            "Erros críticos exigem correção e nova avaliação humana; nenhum estado é aprovado pelo tempo decorrido."
          ],
          "facilitatorKey": [
            "Agenda inicial: Q2 09:00–09:20, Q3 09:20–09:35, Q1 09:35–09:45, Q4 09:45–09:50; esperas 0,20,35,45 minutos nessa ordem.",
            "Q2 estendido termina 09:50; Q3 termina 10:05, vinte minutos depois do prazo 09:45. Escalonar não cria capacidade.",
            "Por identificador, Q2 termina 09:30 e Q3 09:45. Com segundo agente às 09:15, Q3 termina 09:30. Não supor agente ou habilitação ausentes."
          ]
        }
      ]
    },
    {
      "id": "3",
      "title": "Decisões difíceis, alternativas e reembolso",
      "outcomes": [
        "Comunicar decisão autorizada sem transformar política fictícia em regra jurídica.",
        "Separar pedido recebido, decisão financeira e pagamento concluído."
      ],
      "baseReading": {
        "path": "docs/audit-20261115/course-development/customer-service/unit-03-negativas-reembolsos-alternativas.md",
        "sha256": "4f3ec8dd5dba3e97e4d77697fb736c5efe27cd5418d05969d844feb8cbd8c3e8"
      },
      "casePacket": {
        "contexto": "Loja fictícia Cedro; o caso não fixa país nem direitos legais e não permite concluir elegibilidade jurídica. Não usar em operações reais.",
        "regrasInternasDeTreino": [
          "Atendente pode registar pedido e consultar recibo interno; só financeira decide reembolso.",
          "Coordenação pode oferecer uma remarcação sem custo se existir vaga confirmada.",
          "Se o pedido depender de direitos do consumidor, condições da compra ou exceção, encaminhar análise; a política interna não elimina direitos legais."
        ],
        "pedidos": [
          {
            "id": "R1",
            "precoEUR": 90,
            "estado": "pagamento confirmado; cliente pede reembolso; decisão ausente; vaga alternativa não confirmada"
          },
          {
            "id": "R2",
            "precoEUR": 60,
            "estado": "financeira autoriza devolução de 30 EUR; não há comprovativo de pagamento da devolução"
          },
          {
            "id": "R3",
            "precoEUR": 120,
            "estado": "coordenação confirma vaga na terça-feira às 15:00; cliente ainda não aceitou; nenhuma decisão de reembolso"
          }
        ],
        "textoInadequado": "Nunca damos reembolso. Já devolvemos 30 e a sua remarcação está garantida."
      },
      "activities": [
        {
          "id": "U3-E",
          "category": "study",
          "title": "Estudo ativo e síntese",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Identifique na leitura as condições necessárias para comunicar recusa, alternativa e devolução; ligue cada condição a uma autoridade.",
              "minutes": 20
            },
            {
              "instruction": "Separe nos três pedidos o valor pago, valor autorizado e valor comprovadamente devolvido; «não fornecido» não significa zero.",
              "minutes": 30
            },
            {
              "instruction": "Elabore uma lista de documentos que faltam para analisar direitos; explique por que não se pode inventar a jurisdição.",
              "minutes": 35
            },
            {
              "instruction": "Compare linguagem que reconhece impacto com linguagem que encerra indevidamente a análise jurídica.",
              "minutes": 35
            }
          ],
          "submissionFields": [
            "Anotações referenciadas à unidade de base",
            "Síntese original e comparação de alternativas"
          ],
          "acceptanceCriteria": [
            "Cada afirmação deve apontar para passagem da leitura ou dado do caso.",
            "Separar princípio de atendimento e regra meramente convencional do exercício."
          ],
          "facilitatorKey": [
            "Só a autorização de 30 EUR em R2 está confirmada; execução não fornecida. R1 continua em análise. R3 tem vaga confirmada, mas não aceitação nem remarcação concluída."
          ]
        },
        {
          "id": "U3-P",
          "category": "practice",
          "title": "Oficinas de aplicação",
          "estimatedMinutes": 180,
          "steps": [
            {
              "instruction": "Escreva três respostas distintas para R1, R2 e R3 com até 120 palavras cada e uma próxima ação verificável.",
              "minutes": 60
            },
            {
              "instruction": "Preencha um registo financeiro de treino: pago, solicitado, autorizado, executado e evidência; marque expressamente valores desconhecidos.",
              "minutes": 60
            },
            {
              "instruction": "Repare o texto inadequado, associando cada afirmação ao pedido correto e substituindo absolutos por estado comprovado.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Três respostas com próximos passos",
            "Registo de cinco estados financeiros",
            "Texto reparado com evidências"
          ],
          "acceptanceCriteria": [
            "Entregar raciocínio e artefacto, não apenas resposta final.",
            "Identificar informação ausente e autoridade necessária sem a inventar."
          ],
          "facilitatorKey": [
            "Só a autorização de 30 EUR em R2 está confirmada; execução não fornecida. R1 continua em análise. R3 tem vaga confirmada, mas não aceitação nem remarcação concluída.",
            "Não somar valores de execução desconhecidos como zero. Não declarar saldo devedor definitivo, prazo bancário ou direito legal sem dados.",
            "R3 pode recusar a alternativa; a recusa não demonstra que reembolso é devido ou proibido. Pedido precisa da análise competente."
          ]
        },
        {
          "id": "U3-C",
          "category": "case",
          "title": "Comparação e contrafactual",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Uma nova mensagem diz que R2 foi «processado», sem comprovativo ou definição do estado. Prepare duas interpretações e uma pergunta que desambigue a execução financeira.",
              "minutes": 60
            },
            {
              "instruction": "Agora o cliente de R3 recusa a terça-feira: reavalie a solução sem converter a recusa numa perda de direitos ou inventar aprovação financeira.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Análise de ambiguidade e recusa",
            "Quadro de premissas alteradas e conclusões preservadas"
          ],
          "acceptanceCriteria": [
            "Alterar apenas a premissa indicada.",
            "Explicitar hipótese, evidência e limite em cada ramo da análise."
          ],
          "facilitatorKey": [
            "Não somar valores de execução desconhecidos como zero. Não declarar saldo devedor definitivo, prazo bancário ou direito legal sem dados.",
            "R3 pode recusar a alternativa; a recusa não demonstra que reembolso é devido ou proibido. Pedido precisa da análise competente."
          ]
        },
        {
          "id": "U3-J",
          "category": "project",
          "title": "Construção incremental do projeto",
          "estimatedMinutes": 140,
          "steps": [
            {
              "instruction": "Desenvolva três modelos separados: pedido em análise, decisão autorizada e execução confirmada. Inclua campos que impeçam confusão entre estados.",
              "minutes": 70
            },
            {
              "instruction": "Simule a revisão dos modelos com R1–R3 e acrescente um caminho para análise contratual/jurídica sem preencher legislação fictícia.",
              "minutes": 70
            }
          ],
          "submissionFields": [
            "Modelos de comunicação versionados",
            "Diário de versão: problema, correção e evidência"
          ],
          "acceptanceCriteria": [
            "Instrumento aplicável aos dados fictícios fornecidos.",
            "Preservar versões e justificar decisões operacionais."
          ],
          "facilitatorKey": [
            "R3 pode recusar a alternativa; a recusa não demonstra que reembolso é devido ou proibido. Pedido precisa da análise competente.",
            "A ficha deve manter facto, origem, horário, responsável, próxima ação e pendência. Não há modelo de estilo único."
          ]
        },
        {
          "id": "U3-A",
          "category": "assessment",
          "title": "Avaliação e revisão fundamentada",
          "estimatedMinutes": 40,
          "steps": [
            {
              "instruction": "Classifique cinco frases: R1 aprovado; R2 pago ao cliente; R2 autorizado em 30; R3 vaga disponível; R3 remarcado. Justifique cada classificação.",
              "minutes": 20
            },
            {
              "instruction": "Revise as respostas e identifique um limite de competência em cada uma; preserve versões para avaliação.",
              "minutes": 20
            }
          ],
          "submissionFields": [
            "Classificação de cinco frases",
            "Primeira entrega e entrega corrigida"
          ],
          "acceptanceCriteria": [
            "Não apagar a primeira resposta ao rever.",
            "Erros críticos exigem correção e nova avaliação humana; nenhum estado é aprovado pelo tempo decorrido."
          ],
          "facilitatorKey": [
            "Só a autorização de 30 EUR em R2 está confirmada; execução não fornecida. R1 continua em análise. R3 tem vaga confirmada, mas não aceitação nem remarcação concluída.",
            "Não somar valores de execução desconhecidos como zero. Não declarar saldo devedor definitivo, prazo bancário ou direito legal sem dados.",
            "R3 pode recusar a alternativa; a recusa não demonstra que reembolso é devido ou proibido. Pedido precisa da análise competente."
          ]
        }
      ]
    },
    {
      "id": "4",
      "title": "Reclamações, causa e prevenção",
      "outcomes": [
        "Contar incidentes únicos sem confundir mensagens e falhas.",
        "Testar uma hipótese de causa com evidência e medida comparável."
      ],
      "baseReading": {
        "path": "docs/audit-20261115/course-development/customer-service/unit-04-reclamacoes-causas-prevencao.md",
        "sha256": "43e8e7ec38040e5ab73124e2368e7cb78725c9f4b6393f59b55300a6c832e9a9"
      },
      "casePacket": {
        "contexto": "Plataforma fictícia Ponte; dois períodos de sete dias, com definição fixa: incidente é um pedido único com bloqueio de autorização confirmado por suporte. Mensagens de um mesmo pedido não são incidentes novos.",
        "periodos": [
          {
            "id": "A",
            "pedidosTotais": 100,
            "registos": [
              {
                "pedido": "A1",
                "mensagens": 3,
                "confirmado": true
              },
              {
                "pedido": "A2",
                "mensagens": 2,
                "confirmado": true
              },
              {
                "pedido": "A2",
                "mensagens": 1,
                "confirmado": true
              },
              {
                "pedido": "A3",
                "mensagens": 2,
                "confirmado": false
              }
            ]
          },
          {
            "id": "B",
            "pedidosTotais": 80,
            "registos": [
              {
                "pedido": "B1",
                "mensagens": 1,
                "confirmado": true
              },
              {
                "pedido": "B2",
                "mensagens": 2,
                "confirmado": false
              },
              {
                "pedido": "B3",
                "mensagens": 1,
                "confirmado": false
              },
              {
                "pedido": "B4",
                "mensagens": 1,
                "confirmado": false
              }
            ]
          }
        ],
        "testeTecnico": "Suporte reproduziu o erro em conta do plano Azul; a permissão estava ausente após a atualização. Após corrigir, essa conta abriu a unidade. Nenhum outro plano foi testado.",
        "mudanca": "Entre A e B houve correção e também redução do volume e mudança de clientes; não há grupo de comparação."
      },
      "activities": [
        {
          "id": "U4-E",
          "category": "study",
          "title": "Estudo ativo e síntese",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Identifique as diferenças entre relato, incidente confirmado, padrão e causa; faça um glossário aplicado a Ponte.",
              "minutes": 20
            },
            {
              "instruction": "Defina chave de deduplicação e denominador antes de calcular; explique o efeito da linha repetida A2.",
              "minutes": 30
            },
            {
              "instruction": "Compare a evidência técnica de uma conta com uma alegação sobre todos os planos; localize o salto indevido.",
              "minutes": 35
            },
            {
              "instruction": "Desenhe uma ação preventiva e um indicador que possam falhar e produzir informação útil, sem prometer risco zero.",
              "minutes": 35
            }
          ],
          "submissionFields": [
            "Anotações referenciadas à unidade de base",
            "Síntese original e comparação de alternativas"
          ],
          "acceptanceCriteria": [
            "Cada afirmação deve apontar para passagem da leitura ou dado do caso.",
            "Separar princípio de atendimento e regra meramente convencional do exercício."
          ],
          "facilitatorKey": [
            "A tem 8 mensagens e 2 incidentes confirmados únicos em 100 pedidos: 2%. B tem 5 mensagens e 1 incidente em 80: 1,25%."
          ]
        },
        {
          "id": "U4-P",
          "category": "practice",
          "title": "Oficinas de aplicação",
          "estimatedMinutes": 180,
          "steps": [
            {
              "instruction": "Conserve todas as mensagens e deduplique apenas os identificadores ao contar incidentes confirmados; calcule taxas por pedidos totais.",
              "minutes": 60
            },
            {
              "instruction": "Faça uma árvore com três hipóteses: permissão, pagamento e navegação. Para cada uma, proponha teste e resultado que a contrariaria.",
              "minutes": 60
            },
            {
              "instruction": "Escreva relatório de até 350 palavras com evidência observada, alcance do teste e duas explicações alternativas para a diferença A/B.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Tabela deduplicada e memória de cálculo",
            "Árvore de hipóteses com testes",
            "Relatório com limites"
          ],
          "acceptanceCriteria": [
            "Entregar raciocínio e artefacto, não apenas resposta final.",
            "Identificar informação ausente e autoridade necessária sem a inventar."
          ],
          "facilitatorKey": [
            "A tem 8 mensagens e 2 incidentes confirmados únicos em 100 pedidos: 2%. B tem 5 mensagens e 1 incidente em 80: 1,25%.",
            "Contagem caiu 50%; taxa caiu 0,75 ponto percentual, ou 37,5% em termos relativos. A comparação não isola efeito causal da correção.",
            "O teste sustenta o mecanismo na conta Azul observada. Não prova comportamento de Verde/Ouro, prevenção definitiva ou inexistência de outras causas."
          ]
        },
        {
          "id": "U4-C",
          "category": "case",
          "title": "Comparação e contrafactual",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Confronte a frase «a correção reduziu o problema em 50%»: confira a contagem absoluta, a variação da taxa e a ausência de inferência causal controlada.",
              "minutes": 60
            },
            {
              "instruction": "Proponha matriz de teste para planos Azul, Verde e Ouro, com acesso permitido e negado; detalhe condições, resultado esperado e limite de generalização.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Matriz de seis testes de autorização",
            "Quadro de premissas alteradas e conclusões preservadas"
          ],
          "acceptanceCriteria": [
            "Alterar apenas a premissa indicada.",
            "Explicitar hipótese, evidência e limite em cada ramo da análise."
          ],
          "facilitatorKey": [
            "Contagem caiu 50%; taxa caiu 0,75 ponto percentual, ou 37,5% em termos relativos. A comparação não isola efeito causal da correção.",
            "O teste sustenta o mecanismo na conta Azul observada. Não prova comportamento de Verde/Ouro, prevenção definitiva ou inexistência de outras causas."
          ]
        },
        {
          "id": "U4-J",
          "category": "project",
          "title": "Construção incremental do projeto",
          "estimatedMinutes": 140,
          "steps": [
            {
              "instruction": "Acrescente ao projeto um registo de causa com ligação a teste, conta sintética e resultado esperado; não usar contas reais.",
              "minutes": 70
            },
            {
              "instruction": "Escreva plano de prevenção com responsável proposto, condições de aceitação, acompanhamento de recorrência e regra para reabrir.",
              "minutes": 70
            }
          ],
          "submissionFields": [
            "Plano preventivo e reabertura",
            "Diário de versão: problema, correção e evidência"
          ],
          "acceptanceCriteria": [
            "Instrumento aplicável aos dados fictícios fornecidos.",
            "Preservar versões e justificar decisões operacionais."
          ],
          "facilitatorKey": [
            "O teste sustenta o mecanismo na conta Azul observada. Não prova comportamento de Verde/Ouro, prevenção definitiva ou inexistência de outras causas.",
            "A ficha deve manter facto, origem, horário, responsável, próxima ação e pendência. Não há modelo de estilo único."
          ]
        },
        {
          "id": "U4-A",
          "category": "assessment",
          "title": "Avaliação e revisão fundamentada",
          "estimatedMinutes": 40,
          "steps": [
            {
              "instruction": "Calcule novamente taxas e diferenças sem consultar a tabela resolvida; identifique por que três linhas confirmadas em A não significam três incidentes.",
              "minutes": 20
            },
            {
              "instruction": "Audite o relatório e retire qualquer conclusão causal ou cobertura de planos não demonstrada; justifique as alterações.",
              "minutes": 20
            }
          ],
          "submissionFields": [
            "Auditoria de inferências",
            "Primeira entrega e entrega corrigida"
          ],
          "acceptanceCriteria": [
            "Não apagar a primeira resposta ao rever.",
            "Erros críticos exigem correção e nova avaliação humana; nenhum estado é aprovado pelo tempo decorrido."
          ],
          "facilitatorKey": [
            "A tem 8 mensagens e 2 incidentes confirmados únicos em 100 pedidos: 2%. B tem 5 mensagens e 1 incidente em 80: 1,25%.",
            "Contagem caiu 50%; taxa caiu 0,75 ponto percentual, ou 37,5% em termos relativos. A comparação não isola efeito causal da correção.",
            "O teste sustenta o mecanismo na conta Azul observada. Não prova comportamento de Verde/Ouro, prevenção definitiva ou inexistência de outras causas."
          ]
        }
      ]
    },
    {
      "id": "5",
      "title": "Recuperação da confiança e acompanhamento",
      "outcomes": [
        "Gerir pendências com responsáveis e retornos explícitos.",
        "Distinguir restabelecimento técnico, consequência e opinião do cliente."
      ],
      "baseReading": {
        "path": "docs/audit-20261115/course-development/customer-service/unit-05-recuperacao-confianca-acompanhamento.md",
        "sha256": "a54b8817f2b3c7f1c5b7f7aee97c38646890a02d88c370059ba9a9296260a398"
      },
      "casePacket": {
        "contexto": "Serviço fictício Vértice, dez casos encerrados tecnicamente numa semana. Satisfação foi perguntada uma vez, de forma opcional, sem insistência.",
        "amostra": {
          "casos": 10,
          "respostas": 4,
          "satisfeitosEntreRespostas": 3,
          "naoSatisfeitosEntreRespostas": 1,
          "semResposta": 6
        },
        "casoV8": [
          {
            "momento": "segunda 10:00",
            "estado": "falha de acesso confirmada; Sara perdeu sessão; suporte assume incidente"
          },
          {
            "momento": "segunda 11:00",
            "estado": "Sara confirma acesso restaurado; coordenação assume análise da sessão perdida; retorno combinado terça 12:00"
          },
          {
            "momento": "terça 11:30",
            "estado": "coordenação ainda sem decisão; atendente pode enviar atualização, não aprovar reposição"
          },
          {
            "momento": "terça 12:10",
            "estado": "não foi enviada atualização; Sara pergunta por resposta"
          },
          {
            "momento": "quarta 09:00",
            "estado": "coordenação oferece sessão sexta 16:00; Sara ainda não respondeu"
          }
        ],
        "regra": "Registar um compromisso de retorno não é garantir decisão. Não encerrar consequência pendente pelo silêncio. Não condicionar suporte a responder questionário."
      },
      "activities": [
        {
          "id": "U5-E",
          "category": "study",
          "title": "Estudo ativo e síntese",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Releia o conceito de fecho por dimensões e transforme-o numa ficha com incidente, consequência e opinião separados.",
              "minutes": 20
            },
            {
              "instruction": "Reconstrua o compromisso de terça 12:00 e distinga o prazo de retorno do prazo da decisão pedagógica.",
              "minutes": 30
            },
            {
              "instruction": "Analise a amostra de satisfação: defina respondentes, universo e informação ausente antes de calcular.",
              "minutes": 35
            },
            {
              "instruction": "Escreva princípios de contacto proporcionais ao caso, com preferência de canal e sem pressão para avaliar.",
              "minutes": 35
            }
          ],
          "submissionFields": [
            "Anotações referenciadas à unidade de base",
            "Síntese original e comparação de alternativas"
          ],
          "acceptanceCriteria": [
            "Cada afirmação deve apontar para passagem da leitura ou dado do caso.",
            "Separar princípio de atendimento e regra meramente convencional do exercício."
          ],
          "facilitatorKey": [
            "Taxa de resposta 4/10 = 40%; satisfação entre respondentes 3/4 = 75%. Três declarações positivas representam 30% dos dez casos, sem estimar opinião dos restantes."
          ]
        },
        {
          "id": "U5-P",
          "category": "practice",
          "title": "Oficinas de aplicação",
          "estimatedMinutes": 180,
          "steps": [
            {
              "instruction": "Produza o quadro de V8 nos cinco momentos com responsável, próximo retorno e evidência; não retroceda o conhecimento.",
              "minutes": 60
            },
            {
              "instruction": "Escreva a atualização preventiva de terça 11:30, o reconhecimento do atraso às 12:10 e a oferta ainda não aceite na quarta.",
              "minutes": 60
            },
            {
              "instruction": "Calcule taxa de resposta e satisfação entre respondentes; redija uma legenda que não atribua opinião às seis pessoas ausentes.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Quadro de cinco snapshots",
            "Três mensagens de acompanhamento",
            "Indicadores com denominadores"
          ],
          "acceptanceCriteria": [
            "Entregar raciocínio e artefacto, não apenas resposta final.",
            "Identificar informação ausente e autoridade necessária sem a inventar."
          ],
          "facilitatorKey": [
            "Taxa de resposta 4/10 = 40%; satisfação entre respondentes 3/4 = 75%. Três declarações positivas representam 30% dos dez casos, sem estimar opinião dos restantes.",
            "Às 11:30 deve haver atualização antes do retorno combinado; às 12:10 o compromisso já falhou, mesmo que a decisão ainda possa continuar pendente.",
            "Acesso restaurado não repara automaticamente a sessão perdida. Na quarta há oferta, não reposição aceite; silêncio não é satisfação."
          ]
        },
        {
          "id": "U5-C",
          "category": "case",
          "title": "Comparação e contrafactual",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Compare encerramento automático pelo silêncio com fecho técnico e pendência pedagógica separada; mostre como cada política altera o registo sem alterar os factos.",
              "minutes": 60
            },
            {
              "instruction": "Sara responde que não pode sexta: prepare encaminhamento e opção de contacto, preservando a ausência de nova solução confirmada.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Comparação de políticas de fecho",
            "Quadro de premissas alteradas e conclusões preservadas"
          ],
          "acceptanceCriteria": [
            "Alterar apenas a premissa indicada.",
            "Explicitar hipótese, evidência e limite em cada ramo da análise."
          ],
          "facilitatorKey": [
            "Às 11:30 deve haver atualização antes do retorno combinado; às 12:10 o compromisso já falhou, mesmo que a decisão ainda possa continuar pendente.",
            "Acesso restaurado não repara automaticamente a sessão perdida. Na quarta há oferta, não reposição aceite; silêncio não é satisfação."
          ]
        },
        {
          "id": "U5-J",
          "category": "project",
          "title": "Construção incremental do projeto",
          "estimatedMinutes": 140,
          "steps": [
            {
              "instruction": "Adicione ao projeto um calendário de retornos e uma regra de aviso antes do vencimento mesmo sem decisão.",
              "minutes": 70
            },
            {
              "instruction": "Teste o formulário com V8 e a amostra; corrija campos que convertam silêncio em satisfação ou oferta em aceitação.",
              "minutes": 70
            }
          ],
          "submissionFields": [
            "Calendário e formulário v1/v2",
            "Diário de versão: problema, correção e evidência"
          ],
          "acceptanceCriteria": [
            "Instrumento aplicável aos dados fictícios fornecidos.",
            "Preservar versões e justificar decisões operacionais."
          ],
          "facilitatorKey": [
            "Acesso restaurado não repara automaticamente a sessão perdida. Na quarta há oferta, não reposição aceite; silêncio não é satisfação.",
            "A ficha deve manter facto, origem, horário, responsável, próxima ação e pendência. Não há modelo de estilo único."
          ]
        },
        {
          "id": "U5-A",
          "category": "assessment",
          "title": "Avaliação e revisão fundamentada",
          "estimatedMinutes": 40,
          "steps": [
            {
              "instruction": "Reconstrua de memória os três denominadores: casos, respondentes e satisfeitos; explique o que pode e o que não pode afirmar.",
              "minutes": 20
            },
            {
              "instruction": "Revise a mensagem de atraso e o quadro de estados; entregue a diferença entre compromisso e resultado.",
              "minutes": 20
            }
          ],
          "submissionFields": [
            "Autoavaliação e correções",
            "Primeira entrega e entrega corrigida"
          ],
          "acceptanceCriteria": [
            "Não apagar a primeira resposta ao rever.",
            "Erros críticos exigem correção e nova avaliação humana; nenhum estado é aprovado pelo tempo decorrido."
          ],
          "facilitatorKey": [
            "Taxa de resposta 4/10 = 40%; satisfação entre respondentes 3/4 = 75%. Três declarações positivas representam 30% dos dez casos, sem estimar opinião dos restantes.",
            "Às 11:30 deve haver atualização antes do retorno combinado; às 12:10 o compromisso já falhou, mesmo que a decisão ainda possa continuar pendente.",
            "Acesso restaurado não repara automaticamente a sessão perdida. Na quarta há oferta, não reposição aceite; silêncio não é satisfação."
          ]
        }
      ]
    },
    {
      "id": "6",
      "title": "Simulação integral e defesa do projeto",
      "outcomes": [
        "Aplicar diagnóstico, prioridade, decisão competente e prevenção num incidente completo.",
        "Defender um procedimento com evidências, lacunas e critérios de reabertura."
      ],
      "baseReading": {
        "path": "docs/audit-20261115/course-development/customer-service/unit-06-simulacao-integral-avaliacao.md",
        "sha256": "ee8b33b506426f6b6f671e06679afaa8969e4c40f001eec4ddb5d5e49e3bf354"
      },
      "casePacket": {
        "contexto": "Centro fictício Aurora; sessão de treino marcada para 14:00–15:00. Não confundir com qualquer programa real. Nomes e regras são sintéticos.",
        "limites": "Atendente não consulta dados bancários nem autoriza devoluções. Técnica altera permissões; financeira confirma pagamento e decide valores; coordenação analisa recuperação da aprendizagem. Não há direito ou política financeira definidos neste caso.",
        "eventos": [
          {
            "hora": "13:40",
            "facto": "Nuno relata ter pago 120 EUR e não ver a sala. Conta está autenticada; pagamento ainda não consultado."
          },
          {
            "hora": "13:50",
            "facto": "Outras duas contas têm erro igual; sessão começa em dez minutos. Não há causa confirmada."
          },
          {
            "hora": "14:05",
            "facto": "Financeira confirma pagamento de Nuno em 120 EUR."
          },
          {
            "hora": "14:12",
            "facto": "Técnica reproduz bloqueio em conta de teste do plano Verde; regra de autorização ausente."
          },
          {
            "hora": "14:25",
            "facto": "Técnica corrige e verifica entrada de conta de teste. Nuno ainda não confirmou acesso."
          },
          {
            "hora": "14:32",
            "facto": "Nuno confirma entrada e relata atividade inicial perdida; coordenação ainda sem decisão."
          },
          {
            "hora": "15:10",
            "facto": "Nuno pede devolução de 120 EUR. Financeira apenas confirma receção."
          },
          {
            "hora": "16:00",
            "facto": "Coordenação confirma nova sessão em três dias, mas não confirmou vaga. Atendente combina retorno para amanhã às 10:00."
          },
          {
            "hora": "dia seguinte 09:45",
            "facto": "Ainda não há decisão financeira nem confirmação de vaga. Cliente não enviou novas mensagens."
          }
        ],
        "contrafactual": "Depois da entrega inicial, alterar apenas 14:25 para «conta de teste continua bloqueada após tentativa de correção»; manter todos os eventos posteriores e registar a divergência entre teste e relato do cliente, sem apagar qualquer um."
      },
      "activities": [
        {
          "id": "U6-E",
          "category": "study",
          "title": "Estudo ativo e síntese",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Reveja as seis unidades e elabore índice que ligue cada competência a uma evidência produzida durante o curso.",
              "minutes": 20
            },
            {
              "instruction": "Anote os nove momentos de Aurora com o que era conhecido e o que seria anacrónico afirmar.",
              "minutes": 30
            },
            {
              "instruction": "Compare incidente, consequência pedagógica, pedido financeiro e satisfação; escreva critérios separados de estado.",
              "minutes": 35
            },
            {
              "instruction": "Planeie a defesa do procedimento e indique três lacunas que exigem decisão humana competente.",
              "minutes": 35
            }
          ],
          "submissionFields": [
            "Anotações referenciadas à unidade de base",
            "Síntese original e comparação de alternativas"
          ],
          "acceptanceCriteria": [
            "Cada afirmação deve apontar para passagem da leitura ou dado do caso.",
            "Separar princípio de atendimento e regra meramente convencional do exercício."
          ],
          "facilitatorKey": [
            "Antes de 14:05 os 120 EUR são relato; depois são confirmação financeira. Às 14:25 só existe teste técnico positivo; confirmação de Nuno vem 14:32."
          ]
        },
        {
          "id": "U6-P",
          "category": "practice",
          "title": "Oficinas de aplicação",
          "estimatedMinutes": 180,
          "steps": [
            {
              "instruction": "Prepare triagem das 13:40, escalonamento das 13:50 e transferência das 14:05, com destinatários e pedidos distintos.",
              "minutes": 60
            },
            {
              "instruction": "Escreva atualizações às 14:25, 14:32 e no dia seguinte 09:45, distinguindo teste, relato e pendência.",
              "minutes": 60
            },
            {
              "instruction": "Construa registo final de quatro dimensões e um teste preventivo ligado à permissão Verde; não invente vaga, devolução ou satisfação.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Triagem, escalonamento e transferência",
            "Três atualizações proporcionais",
            "Registo em quatro dimensões e teste"
          ],
          "acceptanceCriteria": [
            "Entregar raciocínio e artefacto, não apenas resposta final.",
            "Identificar informação ausente e autoridade necessária sem a inventar."
          ],
          "facilitatorKey": [
            "Antes de 14:05 os 120 EUR são relato; depois são confirmação financeira. Às 14:25 só existe teste técnico positivo; confirmação de Nuno vem 14:32.",
            "Às 16:00 há sessão futura sem vaga. O retorno do dia seguinte deve ocorrer mesmo sem decisão. Nenhum reembolso foi autorizado ou executado.",
            "No contrafactual, a conta de teste falhou e Nuno relata entrada: conservar ambos e investigar diferença de conta, condição ou momento. Não chamar a divergência de mentira nem provar correção geral."
          ]
        },
        {
          "id": "U6-C",
          "category": "case",
          "title": "Comparação e contrafactual",
          "estimatedMinutes": 120,
          "steps": [
            {
              "instruction": "Aplique o contrafactual sem reescrever a cronologia: explique por que teste falhado e acesso relatado podem coexistir e que verificação é necessária.",
              "minutes": 60
            },
            {
              "instruction": "Compare o procedimento antes e depois do contrafactual; identifique cada mensagem, estado e teste que deve ser revisto e cada conclusão que permanece igual.",
              "minutes": 60
            }
          ],
          "submissionFields": [
            "Análise contrafactual versionada",
            "Quadro de premissas alteradas e conclusões preservadas"
          ],
          "acceptanceCriteria": [
            "Alterar apenas a premissa indicada.",
            "Explicitar hipótese, evidência e limite em cada ramo da análise."
          ],
          "facilitatorKey": [
            "Às 16:00 há sessão futura sem vaga. O retorno do dia seguinte deve ocorrer mesmo sem decisão. Nenhum reembolso foi autorizado ou executado.",
            "No contrafactual, a conta de teste falhou e Nuno relata entrada: conservar ambos e investigar diferença de conta, condição ou momento. Não chamar a divergência de mentira nem provar correção geral."
          ]
        },
        {
          "id": "U6-J",
          "category": "project",
          "title": "Construção incremental do projeto",
          "estimatedMinutes": 140,
          "steps": [
            {
              "instruction": "Consolide num dossiê os instrumentos das unidades 1–5 e o caso Aurora. Resolva incoerências de nomes, prazos e responsabilidades; mantenha diário de alterações.",
              "minutes": 70
            },
            {
              "instruction": "Faça defesa escrita ou áudio de 6–8 minutos com transcrição ou notas equivalentes; use o restante tempo para preparação, confronto com rubrica e uma revisão fundamentada.",
              "minutes": 70
            }
          ],
          "submissionFields": [
            "Dossiê final e defesa acessível",
            "Diário de versão: problema, correção e evidência"
          ],
          "acceptanceCriteria": [
            "Instrumento aplicável aos dados fictícios fornecidos.",
            "Preservar versões e justificar decisões operacionais."
          ],
          "facilitatorKey": [
            "No contrafactual, a conta de teste falhou e Nuno relata entrada: conservar ambos e investigar diferença de conta, condição ou momento. Não chamar a divergência de mentira nem provar correção geral.",
            "A ficha deve manter facto, origem, horário, responsável, próxima ação e pendência. Não há modelo de estilo único."
          ]
        },
        {
          "id": "U6-A",
          "category": "assessment",
          "title": "Avaliação e revisão fundamentada",
          "estimatedMinutes": 40,
          "steps": [
            {
              "instruction": "Realize a verificação final de oito questões sem consultar o gabarito; justifique respostas por horário e equipa.",
              "minutes": 20
            },
            {
              "instruction": "Confronte as respostas com a chave, corrija erros e apresente declaração de lacunas. O resultado permanece proposta de avaliação, sem certificado automático.",
              "minutes": 20
            }
          ],
          "submissionFields": [
            "Oito respostas e revisão final",
            "Primeira entrega e entrega corrigida"
          ],
          "acceptanceCriteria": [
            "Não apagar a primeira resposta ao rever.",
            "Erros críticos exigem correção e nova avaliação humana; nenhum estado é aprovado pelo tempo decorrido."
          ],
          "facilitatorKey": [
            "Antes de 14:05 os 120 EUR são relato; depois são confirmação financeira. Às 14:25 só existe teste técnico positivo; confirmação de Nuno vem 14:32.",
            "Às 16:00 há sessão futura sem vaga. O retorno do dia seguinte deve ocorrer mesmo sem decisão. Nenhum reembolso foi autorizado ou executado.",
            "No contrafactual, a conta de teste falhou e Nuno relata entrada: conservar ambos e investigar diferença de conta, condição ou momento. Não chamar a divergência de mentira nem provar correção geral."
          ]
        }
      ]
    }
  ],
  "releaseLimits": [
    "Nova versão editorial separada da edição de leitura publicada.",
    "Sem alteração de catálogo, planos, Stripe, progresso, certificados, base de dados ou produção.",
    "Requer decisão editorial sobre oferta, direitos, acessibilidade e evidência da estimativa antes de anunciar 60 horas como oferta disponível.",
    "Não declara reconhecimento académico, qualificação regulamentada ou validação externa."
  ]
};
const sha = (value: string) => createHash("sha256").update(value).digest("hex");
function labels(value: unknown, trail: string[] = []): string[] {
  if (value === null) return [trail.join(" — ") + ": não fornecido"];
  if (Array.isArray(value)) return value.flatMap((item, i) => labels(item, [...trail, String(i + 1)]));
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
    labels(item, [...trail, key.replace(/([a-z])([A-Z])/g, "$1 $2")]));
  return [trail.join(" — ") + ": " + String(value)];
}
export const CUSTOMER_SERVICE_PRACTICE_GUIDE: AcademyPracticeGuide = {
  schema: "ldr-academy-practice-guide-v1",
  programmeId: sourceProgramme.id,
  slug: sourceProgramme.slug,
  productKey: sourceProgramme.productKey,
  sourceProgrammeSha256: sha(JSON.stringify(sourceProgramme)),
  estimatedMinutes: 3600, validatedHours: null, certificate: false,
  publication: {
    kind: "owner-authorized-estimated-practice",
    authorizedBy: "Luciano Rodrigues Almeida",
    authorizedAt: "2026-11-16",
    instruction: "Faca o que falta para publica e publica online",
  },
  reviewDisclosure: "Revisão interna assistida por IA. Estimativa de planeamento, sem pilotagem de duração, parecer profissional externo ou horas certificadas.",
  modules: sourceProgramme.modules.map(module => {
    const parts = [
      "## " + module.title,
      "Percurso opcional de estudo autónomo: 60 horas estimadas no conjunto das seis unidades, incluindo estudo ativo, prática, casos, projeto e revisão. Não são 60 horas de vídeo ou leitura contínua. Sem certificado.",
      "Responsabilidade editorial: Luciano Rodrigues Almeida. Conteúdo desenvolvido com apoio de inteligência artificial.",
      ...Object.values(sourceProgramme.workloadPolicy),
      "### Objetivos", ...module.outcomes,
      "### Dados fictícios do laboratório", ...labels(module.casePacket),
      ...module.activities.flatMap(activity => [
        "### " + activity.id + " — " + activity.title,
        "Tempo de planeamento: " + activity.estimatedMinutes + " minutos; adapte ao seu ritmo. Não há tempo mínimo obrigatório.",
        ...activity.steps.map((step, index) => (index + 1) + ". " + step.instruction + " — previsão: " + step.minutes + " min."),
        "**Entregáveis**", ...activity.submissionFields, "**Critérios de autoavaliação**", ...activity.acceptanceCriteria,
      ]),
    ];
    if (module.id === "6") parts.push(
      "### Projeto final", sourceProgramme.project.brief, ...sourceProgramme.project.deliverables,
      "### Rubrica de autoavaliação",
      ...sourceProgramme.project.rubric.map(row => row.criterion + ": até " + row.maxPoints + " pontos. " + row.evidence),
      "Referência proposta: 80/100, com correção de todos os erros críticos. Não gera aprovação ou certificado automático.",
      ...sourceProgramme.project.criticalErrors,
      "### Verificação final", ...sourceProgramme.finalQuestions.map((question, index) => (index + 1) + ". " + question.question)
    );
    parts.push("### Como utilizar", "Consulte a leitura da unidade acima, produza os entregáveis e reveja as decisões com base nos dados fornecidos. A leitura de base inclui exemplos e autoavaliações; este percurso não é um exame controlado.",
      "As respostas e os tempos não são enviados nem gravados automaticamente. Não utilize dados reais de clientes. A navegação preserva o progresso do currículo histórico.",
      "Revisão interna assistida por IA; sem validação externa de duração ou eficácia. As regras dos casos são fictícias e não substituem decisões profissionais ou condições contratuais aplicáveis.");
    const body = parts.join("\n\n");
    return { id: module.id, title: module.title, estimatedMinutes: module.activities.reduce((sum, activity) => sum + activity.estimatedMinutes, 0), body, sha256: sha(body) };
  }),
};
