/** Módulo 03 autoral em elaboração; não integrar ao catálogo antes da revisão. */
export const APIS_REST_TESTES_MODULE_03_DRAFT = {
  slug: "desenvolvimento-apis-rest-com-testes",
  module: 3,
  publicationReady: false,
  lessons: [
    {
      id: "api120-m03-a01",
      title: "Validação de entradas e contratos de erro consistentes",
      objective: "Distinguir erro de formato, erro semântico e conflito de estado em APIs.",
      scenario: "Uma API recebe POST /reservas com data inválida, número de hóspedes negativo ou quarto já ocupado. A interface precisa apresentar erros específicos sem expor detalhes internos.",
      content: [
        "Valide tipos, formatos, limites e regras de negócio no servidor. Um JSON malformado é diferente de um corpo bem formado com valores que violam o contrato; documente se usa 400 ou 422 para o segundo caso e mantenha consistência.",
        "O estado 409 Conflict pode representar conflito com o estado atual do recurso, como indisponibilidade concorrente, desde que o contrato explique o significado. Não devolva stack traces, SQL ou dados pessoais nas mensagens públicas.",
        "Um corpo padronizado baseado em Problem Details pode incluir type, title, status, detail e instance, com identificador de correlação não sensível. Campos inválidos podem ser descritos por extensão documentada; nunca confie no texto de erro como mecanismo de segurança."
      ],
      practice: "Desenhe três respostas de erro para JSON inválido, hóspedes negativos e quarto indisponível. Escreva testes que confirmem status, estrutura estável e ausência de informação sensível.",
      assessment: "Diferenciar sintaxe, validação semântica e conflito; respostas coerentes com o contrato e sem vazamento de detalhes internos.",
      references: ["RFC 9457 — Problem Details for HTTP APIs", "RFC 9110 — HTTP Semantics", "OWASP API Security Top 10 (2023)"]
    },
    {
      id: "api120-m03-a02",
      title: "Limitação de pedidos e testes de resiliência",
      objective: "Projetar proteção contra abuso sem penalizar indevidamente utilizadores legítimos.",
      scenario: "Um endpoint de pesquisa recebe picos de 500 pedidos por minuto de um cliente, enquanto outros clientes precisam continuar a consultar disponibilidade.",
      content: [
        "Defina limites por identidade autenticada ou chave de API e, quando pertinente, por IP com cautela para redes partilhadas. O limite deve considerar custo da operação e capacidade real; não há um valor universal seguro.",
        "Quando o limite é excedido, 429 Too Many Requests comunica a restrição. O cabeçalho Retry-After pode indicar quando tentar novamente; documente janela, política de repetição e respostas esperadas.",
        "Teste rajadas, concorrência, reinício de contadores, isolamento entre clientes e proteção de operações custosas. O cliente deve aplicar espera progressiva com aleatoriedade quando apropriado, sem criar ciclos agressivos de repetição."
      ],
      practice: "Especifique limite didático de 60 pedidos por minuto por cliente e cinco testes: 60 aceites, 61.º rejeitado, isolamento entre clientes, Retry-After e recuperação após a janela.",
      assessment: "Demonstrar 429, política explícita, testes determinísticos com relógio controlado e ausência de bloqueio cruzado indevido.",
      references: ["RFC 6585 — Additional HTTP Status Codes (429)", "RFC 9110 — HTTP Semantics (Retry-After)", "OWASP API Security Top 10 (2023), unrestricted resource consumption"]
    }
  ]
} as const;
