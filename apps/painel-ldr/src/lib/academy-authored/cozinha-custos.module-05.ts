/** Módulo 05 autoral em elaboração. Não publicar sem revisão técnica de segurança alimentar. */
export const COZINHA_CUSTOS_MODULE_05_DRAFT = {
  slug: "boas-praticas-controle-custos-cozinhas",
  module: 5,
  publicationReady: false,
  lessons: [
    {
      id: "gas120-m05-a01",
      title: "Gestão de alergénios e informação verificável ao consumidor",
      objective: "Construir um circuito de consulta e comunicação de alergénios sem prometer ausência de contaminação cruzada.",
      scenario: "Uma cliente pergunta se um prato de massa contém leite e frutos de casca rija. A ficha de receita lista queijo, mas a equipa substituiu recentemente o molho e não atualizou a ficha técnica.",
      content: [
        "A resposta não deve basear-se apenas na memória da equipa. Consulte receita atualizada, fichas de ingredientes e fornecedores, incluindo componentes compostos, substituições e informação sobre alergénios aplicável à jurisdição.",
        "Distinguir ingrediente intencional de possibilidade de contacto cruzado é essencial. A ausência de um alergénio na lista de ingredientes não comprova que o prato esteja livre dele; confirme processos, utensílios e limitações reais da cozinha antes de comunicar.",
        "Quando a informação não puder ser verificada, não afirme que o prato é seguro para a cliente. Escale ao responsável, proponha alternativas apenas se forem verificáveis e registe correção da ficha e comunicação da alteração à equipa."
      ],
      practice: "Prepare uma matriz fictícia de quatro ingredientes, seus alergénios declarados, fonte documental, data de verificação e decisão de comunicação. Escreva resposta transparente quando não houver confirmação suficiente.",
      assessment: "Identificar leite no queijo; não inventar presença ou ausência de frutos de casca rija no molho desconhecido; reconhecer contacto cruzado e necessidade de validação.",
      references: ["Regulamento (UE) n.º 1169/2011 relativo à informação sobre os géneros alimentícios, incluindo anexo II", "Fichas técnicas de ingredientes e procedimentos de gestão de alergénios do estabelecimento"]
    },
    {
      id: "gas120-m05-a02",
      title: "Análise de desperdício por etapa e custo recuperável",
      objective: "Separar perdas de preparação, excedentes de produção e devoluções, estimando custo sem presumir reaproveitamento alimentar.",
      scenario: "Durante uma semana, uma cozinha regista 8 kg de aparas de preparação a 3 €/kg, 12 refeições excedentes com custo variável de 4,50 € cada e 5 refeições devolvidas com custo variável de 4,50 € cada. Não existem dados sobre segurança ou destino das sobras.",
      content: [
        "Classifique as perdas pela origem antes de somar custos: preparação 8 × 3 = 24 €; excedentes 12 × 4,50 = 54 €; devoluções 5 × 4,50 = 22,50 €. O custo variável associado aos três grupos é 100,50 € na semana, sem incluir trabalho, energia ou custos de descarte.",
        "A mesma refeição não deve ser contada como excedente e devolução. Registe unidade, causa observável, responsável e evidência para evitar dupla contagem; custo de ingrediente não é igual a receita perdida.",
        "Uma intervenção pode reduzir aparas com melhor padronização de cortes, excedentes com ajuste de lotes e devoluções com análise de causas. Não presuma que resíduos ou sobras possam ser servidos novamente: qualquer destino depende de segurança alimentar, regras locais e validação do responsável."
      ],
      practice: "Simule redução de 25% apenas nos excedentes: calcule refeições e custo evitados, mantendo as outras perdas. Proponha um indicador semanal por etapa e uma verificação de qualidade.",
      assessment: "Redução de 3 refeições excedentes e 13,50 € de custo variável; custo remanescente 87,00 €. Distinguir estimativa económica de autorização de reaproveitamento e não duplicar perdas.",
      references: ["Registos internos de produção, desperdício e custos variáveis", "Regulamento (CE) n.º 852/2004 e plano HACCP do estabelecimento", "Orientações locais de prevenção do desperdício alimentar"]
    }
  ]
} as const;
