import type { SqlAuthoredLesson } from "./fundamentos-sql-relatorios.initial";

/** Conciliação, qualidade e projeto final: aulas autorais em revisão, não publicadas. */
export const SQL_RELATORIOS_FINAL: SqlAuthoredLesson[] = [
  {
    id: "sql60-m04-a02",
    title: "Reconciliação de pagamentos com saldo por pedido",
    objective: "Localizar divergências entre itens vendidos e pagamentos confirmados, sem duplicar totais.",
    content: [
      "Reconciliação exige definir duas medidas diferentes: valor bruto dos itens e valor efetivamente confirmado em pagamentos. Nenhuma delas, isoladamente, equivale a receita líquida contabilística.",
      "Somar itens e pagamentos depois de juntar ambas as tabelas de detalhe multiplica linhas. Agregue cada origem por pedido antes de comparar.",
      "O pedido 501 do laboratório possui itens de 30 e 70 e pagamentos confirmados de 40 e 60: diferença zero. O pedido 502 possui 120 em itens e 100 confirmados: diferença 20. O pedido 503 tem 50 em itens e apenas um pagamento pendente: diferença 50.",
      "Uma divergência é sinal para investigação, não prova de fraude. Descontos, reembolsos e pagamentos em prestações exigem modelagem adicional."
    ],
    sql: "WITH itens AS (SELECT id_pedido,SUM(quantidade*preco_unitario) total_itens FROM itens_pedido GROUP BY id_pedido), pagos AS (SELECT id_pedido,SUM(valor) total_pago FROM pagamentos WHERE status='confirmado' GROUP BY id_pedido) SELECT p.id_pedido,COALESCE(i.total_itens,0) AS total_itens,COALESCE(pg.total_pago,0) AS total_pago,COALESCE(i.total_itens,0)-COALESCE(pg.total_pago,0) AS diferenca FROM pedidos p LEFT JOIN itens i USING(id_pedido) LEFT JOIN pagos pg USING(id_pedido) WHERE p.status='concluido' AND COALESCE(i.total_itens,0)<>COALESCE(pg.total_pago,0) ORDER BY p.id_pedido;",
    exercise: "Execute a consulta e entregue tabela de divergências com causa provável, hipótese alternativa e ação de verificação para cada pedido.",
    expectedAnswer: "Pedido 502: diferença 20; pedido 503: diferença 50. O pagamento pendente de 503 não deve ser incluído no total confirmado.",
    references: ["PostgreSQL Documentation — WITH Queries", "PostgreSQL Documentation — Aggregate Functions"]
  },
  {
    id: "sql60-m04-a03",
    title: "Qualidade de dados com denominador e regras explícitas",
    objective: "Medir preenchimento de email e cidade, sem confundir completude com validade.",
    content: [
      "Completude é proporção de registos que possuem um campo preenchido segundo uma regra. Um email preenchido pode ser inválido ou não entregável; estas propriedades exigem verificações distintas.",
      "NULL e string vazia são formas diferentes de ausência. BTRIM remove espaços nas extremidades, permitindo tratar valores compostos apenas por espaços como não preenchidos.",
      "O laboratório contém quatro clientes: dois emails preenchidos, um NULL e um vazio; três cidades preenchidas e uma NULL. Portanto a completude de email é 50% e a ausência de cidade é 25%.",
      "Defina sempre o denominador e não trate um identificador técnico único como prova de que não existem pessoas duplicadas."
    ],
    sql: "SELECT COUNT(*) AS clientes,COUNT(*) FILTER(WHERE email IS NOT NULL AND BTRIM(email)<>'') AS emails_preenchidos,COUNT(*) FILTER(WHERE cidade IS NULL OR BTRIM(cidade)='') AS cidades_ausentes FROM clientes;",
    exercise: "Calcule as percentagens de completude de email e ausência de cidade. Acrescente um cliente com email contendo apenas espaços e descreva como as percentagens mudam.",
    expectedAnswer: "Antes: 2/4 = 50% de emails preenchidos e 1/4 = 25% de cidades ausentes. Com novo cliente de email só com espaços, o denominador passa a cinco e emails preenchidos continuam dois (40%). A taxa de cidade depende do valor inserido para esse novo cliente.",
    references: ["PostgreSQL Documentation — Aggregate Functions", "PostgreSQL Documentation — String Functions and Operators"]
  },
  {
    id: "sql60-m04-a04",
    title: "Projeto integrador: pacote de relatórios reproduzível",
    objective: "Entregar scripts, indicadores e verificações que possam ser reproduzidos por outro analista.",
    content: [
      "O projeto final reúne cinco capacidades: granularidade correta, filtros temporais de Lisboa, conciliação financeira, qualidade de dados e documentação de limitações.",
      "Construa uma base inteiramente sintética com pelo menos vinte pedidos, incluindo pedidos sem itens, cancelados, pagamentos pendentes e pagamentos parciais. Não use dados reais de clientes.",
      "Entregue script de criação e inserção, consultas parametrizáveis, resultados esperados e instruções para execução em PostgreSQL. Os resultados devem ser reprodutíveis em uma base limpa.",
      "Documente a diferença entre valor bruto de itens, valor confirmado de pagamentos e ticket médio de pedidos com itens. Inclua cenários de borda e testes de regressão.",
      "Rubrica de 100 pontos: correção SQL 25; granularidade 20; conciliação 20; tratamento de ausências 15; reprodutibilidade 10; documentação e limitações 10."
    ],
    sql: "WITH totais AS (SELECT p.id_pedido,SUM(i.quantidade*i.preco_unitario) AS total FROM pedidos p JOIN itens_pedido i USING(id_pedido) WHERE p.status='concluido' GROUP BY p.id_pedido) SELECT COUNT(*) AS pedidos_com_itens,SUM(total) AS valor_bruto,AVG(total) AS ticket_medio FROM totais;",
    exercise: "Entregue seis artefactos: schema e dados sintéticos, consultas, testes, relatório de conciliação, indicadores de qualidade e memória técnica. Justifique todos os filtros e denominadores.",
    expectedAnswer: "No laboratório-base, três pedidos concluídos têm itens; o valor bruto é 270 e o ticket médio é 90. Para a base expandida, os resultados dependem dos dados gerados e devem ser acompanhados de testes verificáveis.",
    references: ["PostgreSQL Documentation — SELECT", "PostgreSQL Documentation — WITH Queries", "PostgreSQL Documentation — Window Functions"]
  }
];
