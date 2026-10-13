/** Curso livre em elaboração. Material autoral não publicado. */
export const CONSULTA_BELEZA_DRAFT = {
  slug: "consulta-segura-servicos-beleza",
  proposedHours: 60,
  publicationReady: false,
  lessons: [
    {
      id: "beauty60-m01-a01",
      title: "Consulta inicial e limites de atuação",
      objective: "Realizar entrevista profissional, identificar sinais de alerta e evitar alegações clínicas.",
      scenario: "Cliente solicita aplicação de produto cosmético numa zona com irritação visível e relata reação anterior a fragrância.",
      content: [
        "A entrevista recolhe finalidade do serviço, histórico relevante de reações e produtos utilizados, com linguagem clara e sem exigir informação clínica desnecessária.",
        "Irritação ativa e relato de reação prévia exigem prudência: não aplique o produto sobre pele comprometida, não diagnostique alergia e encaminhe para avaliação por profissional de saúde quando adequado.",
        "Consentimento para o serviço não elimina o dever de segurança. Registe a decisão de adiar o procedimento sem fotografias ou dados sensíveis desnecessários."
      ],
      practice: "Prepare cinco perguntas abertas, um roteiro de explicação para adiamento e uma ficha mínima de registo de decisão.",
      assessment: "Deve reconhecer sinais de alerta, respeitar limites profissionais, evitar diagnóstico e minimizar dados pessoais.",
      references: ["Regulamento (CE) n.º 1223/2009 relativo aos produtos cosméticos", "Regulamento (UE) 2016/679 (RGPD)"]
    },
    {
      id: "beauty60-m01-a02",
      title: "Rastreabilidade de cosméticos e resposta a incidente",
      objective: "Documentar produto e lote e gerir ocorrência sem ocultar informação.",
      scenario: "Após serviço, uma cliente comunica vermelhidão persistente. A equipa usou dois produtos com lotes diferentes.",
      content: [
        "Registe nome comercial, lote, validade ou período após abertura quando aplicável, data do serviço e profissional responsável. Rastreabilidade permite identificar exposições sem inventar uma causa.",
        "Interrompa novas aplicações do produto suspeito enquanto a situação é avaliada segundo o protocolo do estabelecimento. Oriente a pessoa a procurar cuidados de saúde quando os sintomas o justifiquem, sem prescrever tratamento.",
        "Preserve o registo do incidente e comunique aos responsáveis competentes conforme requisitos locais. Evite mensagens que prometam que o produto é inofensivo antes da análise."
      ],
      practice: "Crie uma ficha de incidente com campos mínimos, uma sequência de comunicação e uma lista de verificação de lote.",
      assessment: "A ficha deve conter identificação do produto, lote, cronologia, medidas tomadas e proteção da privacidade.",
      references: ["Regulamento (CE) n.º 1223/2009 relativo aos produtos cosméticos", "Procedimentos internos de segurança e rastreabilidade"]
    }
  ]
} as const;
