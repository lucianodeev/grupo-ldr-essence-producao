import type { SqlAuthoredLesson } from "./fundamentos-sql-relatorios.initial";

/** Conteúdo autoral adicional, não publicado. */
export const SQL_RELATORIOS_AGREGACOES: SqlAuthoredLesson[] = [
  {
    id: "sql60-m02-a02",
    title: "HAVING: selecionar grupos sem descartar itens válidos",
    objective: "Separar condições aplicadas a linhas das condições aplicadas aos grupos agregados.",
    content: [
      "WHERE atua antes da agregação; HAVING seleciona os grupos depois de calculada a soma. Confundir essas etapas modifica a população do indicador.",
      "Uma cidade com itens de 400, 350 e 300 totaliza 1.050, embora nenhum item isolado alcance 1.000. Um WHERE no preço de item excluiria toda a cidade.",
      "O cálculo abaixo mede valor bruto de itens de pedidos concluídos. Devoluções, descontos e impostos não estão modelados e precisam ser declarados como limitações."
    ],
    sql: "SELECT c.cidade, SUM(i.quantidade*i.preco_unitario) AS valor_bruto FROM clientes c JOIN pedidos p ON p.id_cliente=c.id_cliente JOIN itens_pedido i ON i.id_pedido=p.id_pedido WHERE p.status='concluido' GROUP BY c.cidade HAVING SUM(i.quantidade*i.preco_unitario)>=100 ORDER BY valor_bruto DESC;",
    exercise: "No laboratório, execute a consulta com limite de 100 e explique por que a cidade Porto aparece. Altere o limite para 150 e compare.",
    expectedAnswer: "Porto soma 150 (pedido 501 de 100 e 503 de 50), Lisboa soma 120. Com limite 100, ambas aparecem; com limite 150, apenas Porto aparece.",
    references: ["PostgreSQL Documentation — SELECT", "PostgreSQL Documentation — Aggregate Functions"]
  },
  {
    id: "sql60-m02-a03",
    title: "LEFT JOIN: preservar clientes sem pedidos concluídos",
    objective: "Aplicar filtros na condição de junção para não excluir clientes com zero ocorrências.",
    content: [
      "Uma junção externa preserva todas as linhas da tabela à esquerda, mesmo quando não existe correspondência na direita.",
      "Colocar p.status='concluido' em WHERE remove clientes sem pedidos concluídos, pois a expressão sobre a linha ausente não é verdadeira.",
      "COUNT(p.id_pedido) conta apenas correspondências; COUNT(*) contaria a linha preservada e produziria um falso pedido."
    ],
    sql: "SELECT c.id_cliente, COUNT(p.id_pedido) AS pedidos_concluidos FROM clientes c LEFT JOIN pedidos p ON p.id_cliente=c.id_cliente AND p.status='concluido' GROUP BY c.id_cliente ORDER BY c.id_cliente;",
    exercise: "Execute a consulta com os quatro clientes sintéticos. Adicione um quinto cliente sem pedidos e compare COUNT(*) e COUNT(p.id_pedido).",
    expectedAnswer: "Antes da inclusão: clientes 1,2,3,4 têm respectivamente 1,1,1,1 pedidos concluídos. O novo cliente terá zero por COUNT(p.id_pedido), mas uma linha preservada por COUNT(*).",
    references: ["PostgreSQL Documentation — Table Expressions: Joined Tables", "PostgreSQL Documentation — Aggregate Functions"]
  },
  {
    id: "sql60-m03-a01",
    title: "Ticket médio: unidade de análise é o pedido",
    objective: "Calcular a média do valor total por pedido sem enviesar o resultado pelo número de itens.",
    content: [
      "AVG sobre preços de itens não calcula ticket médio: pedidos com mais linhas ganham peso indevido.",
      "Primeiro some quantidade vezes preço por pedido, depois calcule AVG dos totais por pedido. Informe se pedidos sem itens foram excluídos.",
      "No laboratório, pedidos concluídos com itens totalizam 100, 120 e 50. A média por pedido é 90, não a média dos quatro preços de linhas de itens."
    ],
    sql: "WITH totais AS (SELECT p.id_pedido,SUM(i.quantidade*i.preco_unitario) AS valor FROM pedidos p JOIN itens_pedido i USING(id_pedido) WHERE p.status='concluido' GROUP BY p.id_pedido) SELECT COUNT(*) AS pedidos_com_itens, SUM(valor) AS receita_bruta, AVG(valor) AS ticket_medio FROM totais;",
    exercise: "Explique por que o pedido 505 não participa do ticket e proponha indicador separado de pedidos concluídos sem itens.",
    expectedAnswer: "Três pedidos com itens; receita bruta 270 e ticket médio 90. O pedido 505 não tem linha em itens_pedido, portanto não entra no INNER JOIN. O indicador complementar conta pedidos concluídos sem correspondência em itens.",
    references: ["PostgreSQL Documentation — WITH Queries", "PostgreSQL Documentation — Aggregate Functions"]
  }
];
