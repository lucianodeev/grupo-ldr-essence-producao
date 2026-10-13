/** Módulo 04 autoral em elaboração. Não publicar antes de revisão técnica e editorial. */
export const RECEPCAO_HOTELEIRA_MODULE_04_DRAFT = {
  slug: "atendimento-operacoes-recepcao-hoteleira",
  module: 4,
  publicationReady: false,
  lessons: [
    {
      id: "hotel60-m04-a01",
      title: "Previsão de chegadas e planeamento de recursos no turno",
      objective: "Dimensionar o atendimento com base em procura prevista, duração do serviço e margem operacional.",
      scenario: "Entre as 15h e as 17h, estão previstas 24 chegadas. Cada check-in exige, em média, 8 minutos de trabalho efetivo na receção. Há duas pessoas disponíveis, cada uma com 120 minutos no intervalo.",
      content: [
        "A carga prevista é 24 × 8 = 192 minutos de atendimento. A capacidade teórica conjunta é 2 × 120 = 240 minutos; a utilização projetada é 192 ÷ 240 = 80%. A diferença de 48 minutos não garante ausência de filas.",
        "A média oculta variação entre chegadas e duração dos serviços. Concentração de hóspedes na mesma meia hora, pedidos de acessibilidade, divergências de reserva e interrupções podem gerar espera mesmo com capacidade total suficiente.",
        "Prepare lista de chegadas autorizada, identifique pendências antes do pico e estabeleça um plano de reforço ou escalonamento. Não reduza verificações de identidade, privacidade ou segurança para atingir uma meta de velocidade."
      ],
      practice: "Recalcule a utilização se a duração média subir para 10 minutos. Proponha um plano para o pico sem presumir que todos chegam uniformemente.",
      assessment: "Carga 240 minutos; utilização teórica 100%. A resposta deve reconhecer inexistência de folga, variabilidade de chegadas e necessidade de contingência.",
      references: ["Relatórios de chegadas e tempos de serviço do PMS", "Princípios de gestão de filas e capacidade operacional em hotelaria"]
    },
    {
      id: "hotel60-m04-a02",
      title: "Tratamento de reclamações com registo e resolução verificável",
      objective: "Organizar resposta a falhas de serviço sem prometer compensações não autorizadas.",
      scenario: "Um hóspede comunica ruído persistente durante a noite e afirma ter reportado o problema duas vezes, mas a passagem de turno não contém registo. Pede reembolso integral imediato.",
      content: [
        "Escute e reformule os factos relatados sem contestar a experiência da pessoa nem assumir culpa antes de verificar. Registe horários aproximados, canal de contacto e impacto comunicado, distinguindo relato de evidência confirmada.",
        "Verifique registos e condições disponíveis, ofereça medidas dentro da autonomia da receção e encaminhe pedidos de compensação segundo a política contratual. Não prometa reembolso integral se a decisão depender de aprovação.",
        "Acompanhe o caso com responsável, prazo de retorno e confirmação de que a medida foi comunicada. Uma reclamação encerrada administrativamente não significa necessariamente que a experiência do hóspede foi reparada."
      ],
      practice: "Redija resposta presencial de até 120 palavras, seguida de registo com cinco campos e uma sequência de escalonamento quando o gestor não estiver disponível.",
      assessment: "Deve reconhecer o problema relatado, não inventar registos, distinguir decisão autorizada de pedido pendente e estabelecer retorno verificável.",
      references: ["Política de reclamações e compensações do alojamento", "Procedimentos internos de passagem de turno e qualidade do serviço"]
    }
  ]
} as const;
