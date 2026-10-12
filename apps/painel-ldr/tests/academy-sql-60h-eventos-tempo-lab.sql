-- LDR Academy: extensão do laboratório SQL para eventos, empates e datas.
-- Executar em banco de laboratório isolado, depois de criar as tabelas temporárias
-- de academy-sql-60h-lab.sql (antes de seu ROLLBACK), ou executar este script
-- de forma independente como abaixo. Não requer dados pessoais reais.
BEGIN;
CREATE TEMP TABLE eventos_pagamento (
  id_registro integer PRIMARY KEY,
  id_evento text NOT NULL,
  id_pedido integer NOT NULL,
  recebido_em timestamptz NOT NULL
);
INSERT INTO eventos_pagamento VALUES
  (1,'evt-501-confirmado',501,'2026-10-02 10:00+00'),
  (2,'evt-501-confirmado',501,'2026-10-02 10:01+00'),
  (3,'evt-501-confirmado',501,'2026-10-02 10:02+00'),
  (4,'evt-502-confirmado',502,'2026-10-03 10:00+00');
DO $$
DECLARE recebidas integer; unicas integer;
BEGIN
  SELECT COUNT(*) INTO recebidas FROM eventos_pagamento;
  WITH canonicos AS (
    SELECT id_evento, ROW_NUMBER() OVER
      (PARTITION BY id_evento ORDER BY recebido_em,id_registro) AS posicao
    FROM eventos_pagamento
  )
  SELECT COUNT(*) INTO unicas FROM canonicos WHERE posicao=1;
  IF recebidas<>4 OR unicas<>2 THEN
    RAISE EXCEPTION 'eventos: recebidas %, unicas %; esperado 4 e 2',recebidas,unicas;
  END IF;
END $$;

CREATE TEMP TABLE pedidos_temporais (
  id_pedido integer PRIMARY KEY,
  id_cliente integer NOT NULL,
  criado_em timestamptz NOT NULL
);
INSERT INTO pedidos_temporais VALUES
 (601,1,'2026-09-30 23:30:00+00'),
 (602,1,'2026-10-31 23:30:00+00'),
 (603,2,'2026-11-01 00:00:00+00'),
 (604,3,'2026-10-05 10:00:00+00'),
 (605,3,'2026-10-05 10:00:00+00');
DO $$
DECLARE ids integer[]; escolhido integer;
BEGIN
  SELECT ARRAY_AGG(id_pedido ORDER BY id_pedido) INTO ids
  FROM pedidos_temporais
  WHERE criado_em >= (TIMESTAMP '2026-10-01 00:00:00' AT TIME ZONE 'Europe/Lisbon')
    AND criado_em < (TIMESTAMP '2026-11-01 00:00:00' AT TIME ZONE 'Europe/Lisbon');
  IF ids<>ARRAY[601,602,604,605] THEN
    RAISE EXCEPTION 'intervalo mensal incorreto: %',ids;
  END IF;
  WITH ordenados AS (
    SELECT id_pedido,ROW_NUMBER() OVER
      (PARTITION BY id_cliente ORDER BY criado_em DESC,id_pedido DESC) AS posicao
    FROM pedidos_temporais
  )
  SELECT id_pedido INTO escolhido FROM ordenados
  WHERE posicao=1 AND id_pedido IN (604,605);
  IF escolhido<>605 THEN
    RAISE EXCEPTION 'desempate incorreto: %, esperado 605',escolhido;
  END IF;
END $$;
ROLLBACK;
