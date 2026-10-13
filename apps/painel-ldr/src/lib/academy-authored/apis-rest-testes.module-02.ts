/** Módulo 02 autoral, ainda em revisão. Não integrar no catálogo público. */
export const APIS_REST_TESTES_MODULE_02_DRAFT = {
  slug: "desenvolvimento-apis-rest-com-testes",
  module: 2,
  publicationReady: false,
  lessons: [
    {
      id: "api120-m02-a01",
      title: "Paginação por cursor e estabilidade de resultados",
      objective: "Projetar listagem consistente de recursos quando novas linhas são inseridas entre pedidos.",
      scenario: "Uma API devolve as dez reservas mais recentes. Enquanto o cliente carrega a segunda página, chegam três novas reservas; com OFFSET, há risco de repetição ou omissão.",
      content: [
        "Paginação com OFFSET e LIMIT depende da posição dos registos. Inserções entre pedidos podem deslocar linhas e causar duplicações ou omissões, especialmente quando a ordenação não é estável.",
        "Defina ordenação total, por exemplo created_at DESC, id DESC. Um cursor com último par (created_at, id) permite consultar a página seguinte usando (created_at, id) < (:last_created_at, :last_id), respeitando a mesma ordenação.",
        "O cursor deve ser opaco para o cliente e, quando incluir filtros ou dados sensíveis, protegido contra adulteração. Documente limites de tamanho de página, política de expiração e comportamento quando o recurso é removido."
      ],
      practice: "Desenhe GET /reservas?limit=10&cursor=... com JSON de resposta, nextCursor e casos de teste para três inserções concorrentes e timestamps iguais.",
      assessment: "A solução deve usar ordenação determinística com desempate por ID, não expor informação sensível no cursor e documentar consistência.",
      references: ["RFC 9110 — HTTP Semantics", "Documentação PostgreSQL: comparação de linhas e ordenação ORDER BY"]
    },
    {
      id: "api120-m02-a02",
      title: "Concorrência otimista com ETag e If-Match",
      objective: "Evitar sobrescrita silenciosa de alterações concorrentes.",
      scenario: "Duas pessoas abrem a mesma reserva na versão 7. A primeira altera a data; a segunda tenta alterar o número de hóspedes usando dados antigos.",
      content: [
        "A API pode fornecer ETag forte associada à versão do recurso. Uma atualização com If-Match exige que a versão atual corresponda à versão vista pelo cliente; caso contrário, deve rejeitar a operação, evitando perda de atualização.",
        "Para uma atualização condicionada, o estado 412 Precondition Failed indica que a pré-condição falhou. A política pode exigir pré-condição, respondendo 428 Precondition Required quando If-Match está ausente.",
        "A verificação da versão e a escrita precisam ser atómicas no armazenamento. Validar a versão apenas na aplicação e depois atualizar sem condição ainda permite corrida entre pedidos."
      ],
      practice: "Escreva um contrato de PATCH /reservas/{id} com ETag inicial, If-Match, cenário de sucesso, falha 412 e teste de dois clientes concorrentes.",
      assessment: "O teste deve garantir que apenas uma alteração baseada na versão 7 seja aceite e que a segunda não sobrescreva dados sem reconciliação.",
      references: ["RFC 9110 — HTTP Semantics, conditional requests", "RFC 6585 — Additional HTTP Status Codes (428)"]
    }
  ]
} as const;
