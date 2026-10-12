/** Material introdutório de reflexão em psicanálise; não habilita exercício profissional. Não publicar. */
export const ESCUTA_PSICANALITICA_DRAFT = {
  slug: "escuta-etica-entrevista-psicanalitica",
  proposedHours: 60,
  publicationReady: false,
  lessons: [
    {
      id: "psi60-m01-a01",
      title: "Demanda, queixa e hipótese de trabalho",
      objective: "Diferenciar o relato inicial da pessoa de interpretações precipitadas do profissional.",
      scenario: "Uma pessoa inicia a entrevista dizendo: 'Quero que me diga como deixar de sentir ansiedade antes das reuniões'.",
      content: [
        "A queixa descreve o sofrimento relatado; a demanda envolve o pedido dirigido ao profissional e pode mudar ao longo das entrevistas. Uma hipótese de escuta não é diagnóstico estabelecido.",
        "Perguntas abertas como 'O que costuma acontecer antes dessas reuniões?' permitem situar o relato sem sugerir causalidade. Evite prometer eliminação de sintomas ou atribuir sentido inconsciente como facto.",
        "Esclareça enquadramento, confidencialidade e limites do serviço, incluindo regras de encaminhamento quando a necessidade ultrapassa a competência ou o contexto de atendimento."
      ],
      practice: "Escreva uma abertura de entrevista com quatro perguntas não indutivas e identifique três frases que constituiriam interpretações prematuras.",
      assessment: "A resposta deve separar fala da pessoa, observação do entrevistador e hipótese provisória, com limites éticos explícitos.",
      references: ["Freud, S. (1912), Recomendações aos médicos que exercem a psicanálise", "Normas éticas e legislação profissional aplicáveis no local de exercício"]
    },
    {
      id: "psi60-m01-a02",
      title: "Sigilo, supervisão e comunicação de limites",
      objective: "Explicar privacidade e limites de confidencialidade de modo compreensível.",
      scenario: "Um familiar contacta o profissional e pede confirmação de que outra pessoa iniciou acompanhamento.",
      content: [
        "A própria confirmação de que alguém é atendido pode revelar informação sensível. Sem base legítima e autorização adequada, não partilhe existência, conteúdo ou frequência de sessões.",
        "A supervisão e a discussão de casos devem observar regras éticas, anonimização e minimização. Alterar apenas o nome pode não impedir reidentificação por detalhes raros.",
        "Explique no início do acompanhamento os limites legais e éticos do sigilo, os canais de contacto e a gestão de situações urgentes, conforme a jurisdição e a habilitação do profissional."
      ],
      practice: "Redija uma resposta breve ao familiar sem confirmar atendimento e uma nota informativa de confidencialidade para a primeira entrevista.",
      assessment: "Não pode confirmar o vínculo terapêutico; deve manter linguagem respeitosa, orientar canais adequados e reconhecer limites legais.",
      references: ["Regulamento (UE) 2016/679 (RGPD), quando aplicável", "Referenciais éticos da associação profissional competente"]
    }
  ]
} as const;
