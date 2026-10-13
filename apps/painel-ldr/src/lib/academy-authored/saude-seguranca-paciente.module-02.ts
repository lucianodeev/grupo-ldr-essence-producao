/** Módulo 02 autoral em revisão; material educacional, não protocolo clínico. Não publicar. */
export const SEGURANCA_PACIENTE_MODULE_02_DRAFT = {
  slug: "seguranca-paciente-comunicacao-equipes",
  module: 2,
  publicationReady: false,
  lessons: [
    {
      id: "saude60-m02-a01",
      title: "Identificação segura e comunicação de resultados críticos",
      objective: "Aplicar barreiras de comunicação e identificação em simulações não clínicas.",
      scenario: "Durante a passagem de turno, chegam resultados de dois pacientes com nomes semelhantes. Um resultado foi assinalado como crítico pelo laboratório, mas a equipa receptora está ocupada.",
      content: [
        "Identificação segura depende de identificadores aprovados pela instituição e verificação ativa, nunca apenas do número do quarto ou da semelhança de nomes. Em caso de discrepância, interrompa o fluxo e siga o protocolo institucional.",
        "Resultados críticos requerem encaminhamento conforme regras locais, com identificação de emissor, destinatário, horário e confirmação de recebimento. Uma mensagem enviada sem confirmação não equivale a comunicação concluída.",
        "A técnica de leitura de retorno (read-back), quando prevista no protocolo, ajuda a verificar informações de alto risco. Não interprete resultados nem proponha tratamento fora da competência e da cadeia assistencial."
      ],
      practice: "Crie uma simulação de passagem de informação com dois identificadores institucionais, destinatário responsável, registo de hora e confirmação; inclua um cenário de falha.",
      assessment: "O exercício deve prevenir troca de pacientes, demonstrar circuito de escalonamento e não depender de identificadores improvisados.",
      references: ["World Health Organization, Patient Safety Curriculum Guide: Multi-professional Edition", "Protocolos institucionais de identificação e comunicação de resultados críticos"]
    },
    {
      id: "saude60-m02-a02",
      title: "Análise de incidente com foco em sistemas e aprendizagem",
      objective: "Separar factos, fatores contribuintes e ações verificáveis numa revisão de incidente.",
      scenario: "Uma equipa quase administra um medicamento ao paciente errado, mas a verificação final impede o erro. O relato inicial atribui o episódio apenas a 'desatenção'.",
      content: [
        "Um quase incidente merece aprendizagem porque revela vulnerabilidades antes de ocorrer dano. Reconstrua cronologia factual e preserve confidencialidade e cultura justa, sem assumir culpa individual como explicação suficiente.",
        "Explore fatores do sistema: apresentação semelhante de embalagens, interrupções, desenho do processo, carga de trabalho, identificação e disponibilidade de dupla verificação quando exigida.",
        "Defina ações proporcionais com responsável, prazo e indicador de eficácia. 'Ter mais atenção' não é, isoladamente, uma barreira verificável. A análise educacional não substitui investigação institucional nem obrigações legais de notificação."
      ],
      practice: "Produza matriz de incidente com factos conhecidos, lacunas, três hipóteses sistémicas e duas ações mensuráveis; indique como avaliar eficácia em 30 dias.",
      assessment: "Diferenciar facto de hipótese, evitar culpabilização precipitada, proteger dados e definir medidas acompanháveis.",
      references: ["World Health Organization, Patient Safety Incident Reporting and Learning Systems: Technical Report and Guidance", "Política institucional de gestão de incidentes e cultura de segurança"]
    }
  ]
} as const;
