/** Conteúdo autoral em elaboração: recepção hoteleira. Não publicar no catálogo. */
export const RECEPCAO_HOTELEIRA_DRAFT = {
  slug: "atendimento-operacoes-recepcao-hoteleira",
  proposedHours: 60,
  publicationReady: false,
  lessons: [
    {
      id: "hotel60-m01-a01",
      title: "Check-in com divergência entre reserva e documento",
      objective: "Confirmar identidade, ocupação e condições de reserva sem expor dados de hóspedes.",
      scenario: "Uma reserva de dois adultos foi feita para um quarto individual. O acompanhante chega antes do titular e pede a chave. A recepção está com fila e o quarto ainda não foi libertado pela limpeza.",
      content: [
        "Antes de entregar a chave, confirme os critérios de identificação e autorização definidos pelo estabelecimento e pela legislação local. O número da reserva, isoladamente, não autoriza divulgar dados nem entregar acesso.",
        "Verifique no PMS a categoria reservada, ocupação máxima, titular, estado do quarto e política de alterações. Não transforme um pedido de upgrade em confirmação de disponibilidade sem consultar inventário e preço.",
        "Explique o impedimento de forma neutra, ofereça guarda de bagagem se disponível e registe apenas os dados necessários à operação. Não diga em voz alta o número do quarto nem dados de outro hóspede."
      ],
      practice: "Redija um diálogo de oito intervenções entre recepcionista e acompanhante. Prepare uma nota operacional sem dados sensíveis e uma sequência de cinco verificações antes da entrega da chave.",
      assessment: "A resposta deve recusar entrega de chave sem autorização, confirmar capacidade e inventário, comunicar prazo sem promessa infundada, preservar privacidade e documentar a decisão.",
      references: ["Regulamento (UE) 2016/679 (RGPD), princípios de minimização e segurança", "Políticas de alojamento e de identificação aplicáveis ao estabelecimento"]
    },
    {
      id: "hotel60-m01-a02",
      title: "Overbooking: realojamento e registo de incidente",
      objective: "Conduzir uma ocorrência de indisponibilidade sem atribuir culpa ao hóspede.",
      scenario: "Às 22h chega uma família com reserva confirmada, mas o PMS indica ocupação total por erro de sincronização de inventário.",
      content: [
        "Confirme a reserva e o inventário real antes de anunciar indisponibilidade. Diferencie falha de canal, erro operacional e reserva não garantida; a causa determina o registo, não a obrigação de tratar o hóspede com respeito.",
        "Acione a chefia e a política de realojamento, compare alternativas adequadas e explique custos e transporte segundo as condições contratuais aplicáveis. Não prometa compensação fora da sua autorização.",
        "Documente hora, canal, decisão, pessoa responsável e solução aceite. Não partilhe informação de outros hóspedes para justificar a falha."
      ],
      practice: "Produza um plano de contingência de 15 minutos com árvore de decisão, mensagem ao hóspede e registo de incidente com dados fictícios.",
      assessment: "O plano deve priorizar verificação, escalonamento, solução segura, informação transparente e trilho de auditoria.",
      references: ["Condições contratuais de reserva do estabelecimento", "Regulamento (UE) 2016/679 (RGPD)"]
    }
  ]
} as const;
