/**
 * Curso livre de SQL: primeiras unidades autorais, ainda NÃO publicáveis.
 * Não registra slug, não altera catálogo, progresso, pagamentos ou certificados.
 */
export interface SqlAuthoredLesson {
  id: string;
  title: string;
  objective: string;
  content: string[];
  sql: string;
  exercise: string;
  expectedAnswer: string;
  references: string[];
}

export const SQL_RELATORIOS_AUTHORED_DRAFT: SqlAuthoredLesson[] = [
  {
    id: "sql60-m01-a01",
    title: "Granularidade: contar pedidos em vez de linhas de itens",
    objective: "Distinguir a unidade de análise da linha física produzida por uma junção.",
    content: [
      "Um pedido pode ter muitos itens. Após unir pedidos e itens, COUNT(*) mede linhas de itens, não necessariamente pedidos. Defina o denominador antes de escrever a consulta.",
      "Considerando apenas os pedidos 501 e 502 do laboratório, o primeiro tem dois itens e o segundo tem um: COUNT(*) após o JOIN retorna três linhas e COUNT(DISTINCT p.id_pedido) retorna dois pedidos. No conjunto completo, inclua também os itens do pedido 503.",
      "Um INNER JOIN também elimina pedidos sem itens. Para contar todos os pedidos concluídos, consulte a tabela pedidos diretamente, com o filtro de status."
    ],
    sql: "SELECT COUNT(DISTINCT p.id_pedido) AS pedidos_com_itens FROM pedidos p JOIN itens_pedido i ON i.id_pedido = p.id_pedido WHERE p.status = 'concluido';",
    exercise: "Compare a contagem de pedidos concluídos diretamente na tabela pedidos com a contagem de pedidos concluídos que possuem itens. Explique a diferença no laboratório de teste.",
    expectedAnswer: "No laboratório, há quatro pedidos concluídos (501, 502, 503 e 505), mas apenas três possuem itens (501, 502 e 503).",
    references: ["PostgreSQL Documentation — SELECT", "PostgreSQL Documentation — Table Expressions"]
  },
  {
    id: "sql60-m01-a02",
    title: "Ausência de informação: NULL, zero e pagamentos pendentes",
    objective: "Interpretar agregações com NULL sem confundir valor desconhecido com valor zero.",
    content: [
      "COUNT(*) conta linhas; COUNT(valor) ignora valores NULL; SUM(valor) também ignora NULL. Uma coluna sem preenchimento não prova que o valor é zero.",
      "Uma confirmação financeira deve ser identificada pelo estado da transação, não apenas por valor positivo. Um pagamento pendente de 50 não integra o montante confirmado.",
      "COALESCE pode ser adequado para exibição e comparação após explicitar a regra de negócio, mas não deve substituir a preservação do dado original."
    ],
    sql: "SELECT COUNT(*) AS registros, COUNT(valor) AS valores_conhecidos, SUM(valor) FILTER (WHERE status = 'confirmado') AS total_confirmado FROM pagamentos;",
    exercise: "No laboratório, calcule a soma confirmada e explique por que o pagamento pendente do pedido 503 não deve ser tratado como recebido.",
    expectedAnswer: "Há quatro registros de pagamento, todos com valor conhecido; o total confirmado é 200 (40 + 60 + 100). O valor 50 está pendente.",
    references: ["PostgreSQL Documentation — Aggregate Functions", "PostgreSQL Documentation — Comparison Functions and Operators"]
  },
  {
    id: "sql60-m02-a01",
    title: "Reconciliação sem multiplicar pagamentos por itens",
    objective: "Agregar itens e pagamentos separadamente antes de conciliar totais por pedido.",
    content: [
      "Se um pedido possui dois itens e dois pagamentos, a junção direta dos dois detalhes gera quatro linhas. Somar valores após essa junção infla a receita e o montante pago.",
      "A solução é agregar itens por id_pedido, agregar pagamentos confirmados pelo mesmo identificador e só então relacionar os dois resultados com pedidos.",
      "No laboratório, o pedido 501 tem total de itens 100 e pagamentos confirmados 100; o pedido 502 tem itens 120 e pagamentos confirmados 100. A diferença de 20 deve aparecer no relatório."
    ],
    sql: "WITH itens AS (SELECT id_pedido, SUM(quantidade * preco_unitario) AS total FROM itens_pedido GROUP BY id_pedido), pagos AS (SELECT id_pedido, SUM(valor) AS total FROM pagamentos WHERE status = 'confirmado' GROUP BY id_pedido) SELECT p.id_pedido, COALESCE(i.total,0) - COALESCE(pg.total,0) AS diferenca FROM pedidos p LEFT JOIN itens i USING (id_pedido) LEFT JOIN pagos pg USING (id_pedido) WHERE p.status = 'concluido' AND COALESCE(i.total,0) <> COALESCE(pg.total,0);",
    exercise: "Execute a conciliação do laboratório e identifique os pedidos com divergência. Explique por que o pedido 505 não entra no total de itens.",
    expectedAnswer: "Divergências: pedido 502 = 20 e pedido 503 = 50. O pedido 505 não possui itens e aparece com diferença zero; a ausência de itens deve ser monitorada por indicador próprio.",
    references: ["PostgreSQL Documentation — WITH Queries", "PostgreSQL Documentation — Joined Tables"]
  }
];

export const SQL_RELATORIOS_DRAFT_STATUS = {
  slug: "fundamentos-sql-relatorios",
  plannedHours: 60,
  language: "pt",
  authoredLessons: SQL_RELATORIOS_AUTHORED_DRAFT.length,
  publicationReady: false,
  editorialReviewRequired: true,
  sqlExecutionVerified: false
} as const;
