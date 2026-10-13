/** Módulo 03 autoral em desenvolvimento. Não publicar antes de revisão e validação. */
export const RECEPCAO_HOTELEIRA_MODULE_03_DRAFT = {
  slug: "atendimento-operacoes-recepcao-hoteleira",
  module: 3,
  publicationReady: false,
  lessons: [
    {
      id: "hotel60-m03-a01",
      title: "Indicadores de ocupação, ADR e RevPAR",
      objective: "Calcular indicadores operacionais sem misturar receita de quartos com receitas acessórias.",
      scenario: "Um hotel possui 40 quartos disponíveis por noite. Em determinado dia vende 30 quartos, com receita de alojamento de 2.700 €. O restaurante faturou mais 600 €, valor que não integra a receita de quartos.",
      content: [
        "A taxa de ocupação é quartos vendidos ÷ quartos disponíveis: 30 ÷ 40 = 75%. Um quarto fora de serviço pode alterar a base do indicador, conforme política de reporte, que deve ser explicitada.",
        "ADR (tarifa média diária) é receita de quartos ÷ quartos vendidos: 2.700 € ÷ 30 = 90 €. Não acrescente os 600 € do restaurante ao numerador.",
        "RevPAR é receita de quartos ÷ quartos disponíveis: 2.700 € ÷ 40 = 67,50 €. Também pode ser obtido por ADR × ocupação: 90 € × 0,75 = 67,50 €. Estes indicadores não demonstram lucro nem satisfação dos hóspedes."
      ],
      practice: "Calcule ocupação, ADR e RevPAR para 32 quartos vendidos, receita de quartos de 3.040 € e 40 quartos disponíveis. Explique por que receita de restaurante fica fora do cálculo.",
      assessment: "Ocupação 80%; ADR 95 €; RevPAR 76 €. Indicar base de quartos disponíveis e não confundir receita com lucro.",
      references: ["Relatórios operacionais do PMS e definições internas de indicadores", "Uniform System of Accounts for the Lodging Industry (USALI), edição aplicável"]
    },
    {
      id: "hotel60-m03-a02",
      title: "Proteção de dados em pedidos telefónicos sobre hóspedes",
      objective: "Responder a pedidos de terceiros sem confirmar indevidamente presença, quarto ou itinerário.",
      scenario: "Uma pessoa telefona à receção, diz ser familiar de uma hóspede e pede confirmação de estadia e número do quarto. Alega urgência, mas não dispõe de autorização verificável.",
      content: [
        "A identidade alegada pelo interlocutor não comprova legitimidade para receber dados. Confirmar se alguém está alojado pode revelar informação pessoal; siga a política de privacidade e as bases legais aplicáveis.",
        "Ofereça encaminhar uma mensagem por canal interno sem confirmar presença nem divulgar número do quarto, quando essa opção for prevista e segura. Em emergência real, acione os procedimentos institucionais e serviços competentes.",
        "Registe apenas elementos operacionais necessários: horário, tipo de pedido, decisão e escalonamento. Evite copiar informações sensíveis ou criar notas especulativas sobre relações familiares."
      ],
      practice: "Escreva um guião de seis falas para atender ao telefonema sem confirmar estadia. Acrescente um registo operacional mínimo e uma hipótese de escalonamento.",
      assessment: "Não divulgar nem confirmar dados sem fundamento; comunicar com respeito, propor alternativa permitida e identificar via de emergência.",
      references: ["Regulamento (UE) 2016/679 (RGPD), princípios de licitude e minimização", "Procedimentos de privacidade e segurança do alojamento"]
    }
  ]
} as const;
