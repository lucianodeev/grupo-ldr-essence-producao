/** Módulo 05 autoral em elaboração. Rascunho não publicado; carga horária ainda não comprovada. */
export const RECEPCAO_HOTELEIRA_MODULE_05_DRAFT = {
  slug: "atendimento-operacoes-recepcao-hoteleira",
  module: 5,
  publicationReady: false,
  lessons: [
    {
      id: "hotel60-m05-a01",
      title: "Conciliação de reservas de canais distintos e prevenção de duplicidades",
      objective: "Reconstruir a origem de reservas e resolver inconsistências documentais sem eliminar registos indevidamente.",
      scenario: "Um hóspede apresenta confirmação de uma plataforma externa para duas noites. O PMS mostra duas reservas com nomes semelhantes, uma pré-paga e outra com pagamento pendente; o número de confirmação externa aparece apenas em uma delas.",
      content: [
        "Antes de modificar a reserva, compare identificador da plataforma, datas, tipologia, ocupantes autorizados, condições tarifárias e estado de pagamento. Nomes semelhantes não demonstram que as reservas sejam duplicadas.",
        "Reconstrua a cadeia de comunicação entre plataforma, channel manager e PMS com horários e estados de sincronização. Não cancele, una ou cobre reservas por suposição; encaminhe decisões contratuais ou financeiras a quem tenha autorização.",
        "Registe a divergência, o responsável pela verificação e a confirmação do canal externo. Proteja dados de outros hóspedes e mantenha trilha de auditoria para eventual contestação."
      ],
      practice: "Monte matriz comparativa de duas reservas fictícias com oito campos e indique três evidências necessárias antes de classificar uma duplicidade.",
      assessment: "Deve evitar cancelamento precipitado, distinguir coincidência nominal de identificador contratual, verificar pagamentos e documentar decisão autorizada.",
      references: ["Procedimentos do PMS e channel manager utilizados pelo alojamento", "Termos contratuais e regras de alteração dos canais de distribuição"]
    },
    {
      id: "hotel60-m05-a02",
      title: "Relatório de passagem de turno com pendências e prioridades",
      objective: "Produzir uma passagem de turno acionável, verificável e proporcional em dados pessoais.",
      scenario: "O turno termina com três situações: uma chave eletrónica avariada ainda sem confirmação de reparação, uma chegada tardia autorizada e um pedido de fatura corrigida que depende do departamento financeiro.",
      content: [
        "Estruture cada pendência com identificador interno, estado, ação já tomada, próximo responsável, prazo e critério de conclusão. 'Resolver amanhã' não identifica ação nem permite responsabilização operacional.",
        "Classifique urgência segundo impacto e regras internas: problemas que afetam acesso ou segurança exigem escalonamento apropriado; pedidos administrativos podem seguir fluxo com prazo comunicado. Não transforme prioridade em diagnóstico de risco sem informação suficiente.",
        "Na passagem de turno, confirme receção e compreensão das pendências, preserve rastreabilidade e evite detalhes pessoais desnecessários. Um registo encerrado exige evidência de conclusão ou transferência explícita de responsabilidade."
      ],
      practice: "Crie relatório de passagem de turno com três linhas e colunas de prioridade, responsável, próximo passo, prazo e confirmação de recebimento. Simule uma pendência que permanece aberta.",
      assessment: "Distinguir aberto, encaminhado e concluído; atribuir responsável e prazo, proteger dados e exigir confirmação de receção.",
      references: ["Procedimentos internos de operação e segurança da receção", "Política de documentação e retenção de dados do alojamento"]
    }
  ]
} as const;
