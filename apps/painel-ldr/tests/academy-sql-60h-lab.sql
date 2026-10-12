-- LDR Academy: laboratório isolado, dados inteiramente fictícios.
-- Execute somente num banco de laboratório; transação revertida ao final.
BEGIN;
CREATE TEMP TABLE clientes (id_cliente integer PRIMARY KEY, nome_ficticio text NOT NULL, cidade text, email text);
CREATE TEMP TABLE pedidos (id_pedido integer PRIMARY KEY, id_cliente integer REFERENCES clientes, criado_em timestamptz NOT NULL, status text NOT NULL);
CREATE TEMP TABLE itens_pedido (id_item integer PRIMARY KEY, id_pedido integer REFERENCES pedidos, quantidade numeric NOT NULL, preco_unitario numeric NOT NULL);
CREATE TEMP TABLE pagamentos (id_pagamento integer PRIMARY KEY, id_pedido integer REFERENCES pedidos, valor numeric, status text NOT NULL);
INSERT INTO clientes VALUES
 (1,'Cliente A','Porto','a@example.invalid'),(2,'Cliente B','Lisboa',NULL),
 (3,'Cliente C','Porto',''),(4,'Cliente D',NULL,'d@example.invalid');
INSERT INTO pedidos VALUES
 (501,1,'2026-10-02 10:00:00+00','concluido'),
 (502,2,'2026-10-03 10:00:00+00','concluido'),
 (503,3,'2026-10-04 10:00:00+00','concluido'),
 (504,4,'2026-10-05 10:00:00+00','cancelado'),
 (505,4,'2026-10-06 10:00:00+00','concluido');
INSERT INTO itens_pedido VALUES
 (1,501,1,30),(2,501,1,70),(3,502,1,120),(4,503,1,50),(5,504,1,999);
INSERT INTO pagamentos VALUES
 (1,501,40,'confirmado'),(2,501,60,'confirmado'),
 (3,502,100,'confirmado'),(4,503,50,'pendente');
DO $$
DECLARE actual integer;
BEGIN
 SELECT COUNT(*) INTO actual FROM pedidos WHERE status='concluido';
 IF actual <> 4 THEN RAISE EXCEPTION 'pedidos concluidos: %, esperado 4', actual; END IF;
 SELECT COUNT(*) INTO actual FROM clientes c LEFT JOIN pedidos p
 ON p.id_cliente=c.id_cliente AND p.status='concluido'
 WHERE p.id_pedido IS NULL;
 IF actual <> 0 THEN RAISE EXCEPTION 'cliente sem pedido concluido: %, esperado 0', actual; END IF;
END $$;
-- Pré-agregação evita multiplicação de linhas ao cruzar itens e pagamentos.
DO $$
DECLARE mismatches integer; diff_total numeric; ticket numeric;
BEGIN
 WITH itens AS (
  SELECT i.id_pedido,SUM(i.quantidade*i.preco_unitario) total FROM itens_pedido i GROUP BY i.id_pedido
 ), pagos AS (
  SELECT p.id_pedido,SUM(p.valor) total FROM pagamentos p WHERE p.status='confirmado' GROUP BY p.id_pedido
 ), conciliacao AS (
  SELECT o.id_pedido,COALESCE(i.total,0)-COALESCE(p.total,0) diferenca
  FROM pedidos o LEFT JOIN itens i USING(id_pedido) LEFT JOIN pagos p USING(id_pedido)
  WHERE o.status='concluido'
 )
 SELECT COUNT(*) FILTER(WHERE diferenca<>0),SUM(diferenca) FILTER(WHERE diferenca<>0)
 INTO mismatches,diff_total FROM conciliacao;
 IF mismatches <> 2 OR diff_total <> 70 THEN
  RAISE EXCEPTION 'conciliacao incorreta: % linhas, diferenca %', mismatches,diff_total;
 END IF;
 SELECT AVG(total) INTO ticket FROM (
  SELECT i.id_pedido,SUM(i.quantidade*i.preco_unitario) total
  FROM itens_pedido i JOIN pedidos p USING(id_pedido)
  WHERE p.status='concluido' GROUP BY i.id_pedido
 ) s;
 IF ticket <> 90 THEN RAISE EXCEPTION 'ticket medio: %, esperado 90',ticket; END IF;
END $$;
ROLLBACK;
