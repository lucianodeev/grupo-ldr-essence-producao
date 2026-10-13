/** Módulo 04 autoral em elaboração. Não integrar no catálogo antes de testes. */
export const APIS_REST_TESTES_MODULE_04_DRAFT = {
  slug: "desenvolvimento-apis-rest-com-testes",
  module: 4,
  publicationReady: false,
  lessons: [
    {
      id: "api120-m04-a01",
      title: "Testes de integração com transações e isolamento de dados",
      objective: "Projetar testes repetíveis que comprovem persistência, autorização e limpeza entre execuções.",
      scenario: "Uma API de reservas passa nos testes unitários, mas duas execuções consecutivas de testes de integração falham porque a segunda encontra reservas criadas pela primeira.",
      content: [
        "Um teste unitário com repositório simulado não comprova restrições, índices ou comportamento transacional da base real. Para validar persistência, execute cenários contra uma base de testes isolada, com esquema e migrações compatíveis com a aplicação.",
        "Prepare dados por teste e assegure limpeza determinística: transação com rollback quando compatível com o ciclo da aplicação, ou criação e eliminação explícitas num ambiente dedicado. Não execute rotinas destrutivas sobre produção.",
        "Teste criação, leitura, atualização e rejeição de acesso cruzado com identidades distintas. Evite depender da ordem de execução, do relógio real ou de identificadores fixos partilhados; use dados controlados e verifique efeitos na base."
      ],
      practice: "Desenhe uma suíte de quatro testes de integração para POST e GET /reservas, incluindo uma tentativa de leitura por outro utilizador e repetição da suíte sem resíduos.",
      assessment: "Deve incluir ambiente isolado, preparação de dados, verificação de persistência, autorização por objeto e estratégia de limpeza reexecutável.",
      references: ["OWASP API Security Top 10 (2023), Broken Object Level Authorization", "Documentação PostgreSQL sobre transações e rollback", "Princípios de testes de integração e isolamento de fixtures"]
    },
    {
      id: "api120-m04-a02",
      title: "Contratos de webhooks e processamento tolerante a reentregas",
      objective: "Distinguir autenticação da origem, deduplicação de eventos e processamento fiável.",
      scenario: "Um serviço externo envia o evento pagamento.confirmado para uma API. A primeira tentativa demora a responder e o fornecedor reenvia o mesmo evento duas vezes; a aplicação não pode atribuir três créditos ao cliente.",
      content: [
        "Verifique a autenticidade do webhook segundo o contrato do fornecedor, por exemplo assinatura sobre o corpo bruto com segredo protegido e validação temporal quando prevista. Não confie apenas num campo de origem enviado no JSON.",
        "Guarde um identificador estável do evento e imponha unicidade no armazenamento. A verificação de duplicação e o efeito de negócio precisam de atomicidade adequada; uma consulta seguida de escrita sem proteção pode falhar sob concorrência.",
        "Reconheça rapidamente eventos válidos após registo durável e processe tarefas demoradas de forma assíncrona quando a arquitetura permitir. Planeie retentativas, falhas transitórias, eventos fora de ordem e reconciliação; entrega repetida não significa processamento repetido."
      ],
      practice: "Desenhe cinco casos de teste: assinatura inválida, evento novo, reentrega idêntica, duas entregas concorrentes e falha após registo durável. Especifique o resultado de créditos em cada cenário.",
      assessment: "Rejeitar origem não autenticada, garantir no máximo um crédito lógico por evento, suportar retentativas e distinguir aceitação de processamento concluído.",
      references: ["OWASP Webhook Security Guidelines e recomendações de autenticação de mensagens", "Documentação PostgreSQL: restrições UNIQUE e transações", "Documentação de webhooks do fornecedor integrado"]
    }
  ]
} as const;
