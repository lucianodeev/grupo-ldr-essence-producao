/** Curso livre em elaboração: desenvolvimento de APIs REST. Não publicar. */
export const APIS_REST_TESTES_DRAFT = {
  slug: "desenvolvimento-apis-rest-com-testes",
  proposedHours: 120,
  publicationReady: false,
  lessons: [
    {
      id: "api120-m01-a01",
      title: "Contrato HTTP: idempotência e criação de recursos",
      objective: "Diferenciar GET, POST e PUT e documentar comportamento observável de uma API.",
      scenario: "Uma aplicação de reservas sofre reenvios por falhas de rede; a mesma criação pode chegar duas vezes ao servidor.",
      content: [
        "GET deve ser seguro e idempotente; PUT é idempotente em termos de efeito pretendido sobre o recurso; POST não é necessariamente idempotente. Repetir um POST de criação pode produzir reservas duplicadas.",
        "Para criação com POST, uma chave de idempotência validada e armazenada com escopo adequado permite responder ao reenvio com o resultado original, sem criar um segundo recurso. É necessário definir validade da chave, conflito de payload e isolamento por utilizador.",
        "Respostas devem distinguir validação falhada (400 ou 422, conforme contrato), falta de autenticação (401), proibição (403), conflito de estado (409) e criação bem-sucedida (201 com Location quando apropriado)."
      ],
      practice: "Desenhe contrato de POST /reservas com cabeçalho Idempotency-Key, corpo JSON, resposta 201, resposta de repetição e conflito de chave com payload diferente.",
      assessment: "O contrato deve evitar duplicações, limitar a chave ao contexto de autorização, documentar reenvio e cobrir conflito sem divulgar dados de outros clientes.",
      references: ["RFC 9110 — HTTP Semantics", "OWASP API Security Top 10 (2023)"]
    },
    {
      id: "api120-m01-a02",
      title: "Testes de autorização por objeto",
      objective: "Detectar acesso indevido a recursos de outro utilizador, independentemente da autenticação.",
      scenario: "Dois clientes autenticados, A e B, possuem reservas diferentes. A tenta GET /reservas/{id-de-B}.",
      content: [
        "Autenticação responde quem faz o pedido; autorização por objeto responde se essa pessoa pode aceder à reserva solicitada. Um token válido não concede acesso a todos os identificadores.",
        "A consulta ao armazenamento deve aplicar a restrição do utilizador ou organização no servidor, não apenas ocultar botões na interface. Não confiar no id de proprietário enviado pelo cliente.",
        "Um teste automatizado deve criar dois utilizadores e recursos isolados, verificar acesso próprio, rejeitar acesso cruzado e garantir que a resposta não contém campos sensíveis."
      ],
      practice: "Escreva quatro casos de teste: leitura própria, leitura alheia, alteração alheia e recurso inexistente. Defina o estado HTTP esperado conforme política de não divulgação.",
      assessment: "Todos os acessos cruzados devem ser bloqueados no servidor; é aceitável 403 ou 404 conforme política documentada, sem fuga de dados.",
      references: ["OWASP API Security Top 10 (2023), API1: Broken Object Level Authorization", "RFC 9110 — HTTP Semantics"]
    }
  ]
} as const;
