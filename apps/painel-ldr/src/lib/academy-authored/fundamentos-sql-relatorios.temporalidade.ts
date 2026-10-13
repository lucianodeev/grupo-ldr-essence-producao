import type { SqlAuthoredLesson } from "./fundamentos-sql-relatorios.initial";

/** Módulo de temporalidade e confiabilidade de eventos — não publicado. */
export const SQL_RELATORIOS_TEMPORALIDADE: SqlAuthoredLesson[] = [
  {
    id: "sql60-m03-a02",
    title: "Fechamento mensal com fuso horário e intervalo semiaberto",
    objective: "Delimitar outubro em Lisboa sem perder eventos da última hora ou incluir novembro.",
    content: [
      "Uma coluna timestamptz armazena instantes. O mês civil depende do fuso escolhido para o relatório. Um instante em 31 de outubro às 23h30 UTC já pertence a novembro em Lisboa? Não: após a mudança para horário de inverno, Lisboa está em UTC+0 nessa data. A interpretação precisa respeitar a data da mudança.",
      "Use limites locais convertidos para instantes e o padrão >= início e < próximo início. Evite BETWEEN com um último segundo artificial, que perde frações de segundo.",
      "O filtro sobre criado_em sem aplicar função na coluna preserva a possibilidade de uso eficiente de um índice temporal."
    ],
    sql: "SELECT COUNT(*) AS pedidos_outubro FROM pedidos WHERE criado_em >= (TIMESTAMP '2026-10-01 00:00:00' AT TIME ZONE 'Europe/Lisbon') AND criado_em < (TIMESTAMP '2026-11-01 00:00:00' AT TIME ZONE 'Europe/Lisbon');",
    exercise: "Insira pedidos em 2026-09-30 23:30:00+00, 2026-10-31 23:30:00+00 e 2026-11-01 00:00:00+00. Verifique quais entram no mês civil de outubro em Lisboa.",
    expectedAnswer: "Em 30/09 às 23h30 UTC Lisboa está em UTC+1, portanto já é 01/10 e entra. Em 31/10 às 23h30 UTC Lisboa está em UTC+0 e entra. Em 01/11 à meia-noite UTC já é novembro e fica fora.",
    references: ["PostgreSQL Documentation — Date/Time Types", "PostgreSQL Documentation — Date/Time Functions and Operators"]
  },
  {
    id: "sql60-m03-a03",
    title: "Eventos duplicados: idempotência antes da contagem",
    objective: "Evitar que notificações repetidas inflem indicadores operacionais.",
    content: [
      "Integrações podem reenviar a mesma notificação após uma falha de confirmação. Número de mensagens recebidas não equivale a número de eventos de negócio únicos.",
      "A chave de idempotência precisa vir do contrato da integração, como id_evento. DISTINCT sobre todo o payload pode esconder alterações relevantes ou manter duplicatas semanticamente iguais.",
      "Escolha um registro canônico por chave e registre o critério, como primeira recepção. A política de atualização do estado financeiro requer regra adicional."
    ],
    sql: "WITH canonicos AS (SELECT id_evento, id_pedido, recebido_em, ROW_NUMBER() OVER (PARTITION BY id_evento ORDER BY recebido_em, id_registro) AS posicao FROM eventos_pagamento) SELECT id_pedido, COUNT(*) AS eventos_unicos FROM canonicos WHERE posicao=1 GROUP BY id_pedido;",
    exercise: "Crie uma tabela temporária eventos_pagamento com id_registro, id_evento, id_pedido e recebido_em. Insira três notificações do mesmo id_evento e outra de id_evento diferente; compare COUNT(*) com a consulta canônica.",
    expectedAnswer: "Quatro mensagens recebidas, dois eventos únicos. O critério de desempate é determinístico por recebido_em e id_registro.",
    references: ["PostgreSQL Documentation — Window Functions", "PostgreSQL Documentation — SELECT"]
  },
  {
    id: "sql60-m04-a01",
    title: "Ranking por cliente com ROW_NUMBER e desempate determinístico",
    objective: "Selecionar o pedido mais recente de cada cliente sem depender da ordem física das linhas.",
    content: [
      "ROW_NUMBER enumera linhas dentro de uma partição. Sem ORDER BY completo, empates podem gerar escolhas não determinísticas entre execuções.",
      "O identificador único do pedido serve como segundo critério de ordenação quando dois pedidos possuem o mesmo instante de criação.",
      "RANK e DENSE_RANK atendem a perguntas diferentes: preservam empates, enquanto ROW_NUMBER seleciona uma linha. A escolha depende do significado do relatório."
    ],
    sql: "WITH ordenados AS (SELECT id_cliente,id_pedido,criado_em,ROW_NUMBER() OVER (PARTITION BY id_cliente ORDER BY criado_em DESC,id_pedido DESC) AS ordem FROM pedidos) SELECT id_cliente,id_pedido,criado_em FROM ordenados WHERE ordem=1 ORDER BY id_cliente;",
    exercise: "Crie dois pedidos do mesmo cliente com criado_em idêntico e ids diferentes. Identifique qual a consulta seleciona e explique a necessidade do desempate.",
    expectedAnswer: "O maior id_pedido é escolhido quando criado_em empata. A regra deve ser documentada e pode ser alterada se a organização tiver outra definição de 'mais recente'.",
    references: ["PostgreSQL Documentation — Window Functions", "PostgreSQL Documentation — SELECT"]
  }
];
