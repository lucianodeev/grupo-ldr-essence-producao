-- LDR Academy: projeto integrador sintético com 24 pedidos.
-- Executar APENAS em PostgreSQL de laboratório. Tudo é revertido no final.
BEGIN;
CREATE TEMP TABLE academy_clientes(id_cliente integer PRIMARY KEY,cidade text,email text);
CREATE TEMP TABLE academy_pedidos(id_pedido integer PRIMARY KEY,id_cliente integer REFERENCES academy_clientes,criado_em timestamptz NOT NULL,status text NOT NULL);
CREATE TEMP TABLE academy_itens(id_item integer PRIMARY KEY,id_pedido integer REFERENCES academy_pedidos,quantidade numeric NOT NULL,preco_unitario numeric NOT NULL);
CREATE TEMP TABLE academy_pagamentos(id_pagamento integer PRIMARY KEY,id_pedido integer REFERENCES academy_pedidos,valor numeric NOT NULL,status text NOT NULL);
INSERT INTO academy_clientes VALUES
(1,'Porto','a@example.invalid'),(2,'Lisboa',NULL),(3,'Porto',''),(4,NULL,'d@example.invalid'),(5,'Braga','e@example.invalid'),(6,'Coimbra',NULL);
INSERT INTO academy_pedidos
SELECT n,1+((n-1001)%6),
 TIMESTAMPTZ '2026-10-01 12:00:00+00'+(n-1001)*INTERVAL '1 day',
 CASE WHEN n IN (1004,1012,1020) THEN 'cancelado' ELSE 'concluido' END
FROM generate_series(1001,1024) n;
-- 20 pedidos concluídos com itens, um concluído sem itens e três cancelados.
INSERT INTO academy_itens
SELECT n-1000,n,1,10*(1+((n-1001)%5))
FROM generate_series(1001,1024) n
WHERE n<>1024;
-- Segundo item nos pedidos múltiplos de 5; teste contra multiplicação de linhas.
INSERT INTO academy_itens
SELECT 100+n-1000,n,1,5
FROM generate_series(1001,1024) n WHERE n%5=0;
-- Um pagamento confirmado por pedido concluído com itens,
-- exceto 1002 (parcial) e 1003 (pendente).
INSERT INTO academy_pagamentos
SELECT n-1000,n,
  CASE WHEN n=1002 THEN 10 ELSE 10*(1+((n-1001)%5))+
  CASE WHEN n%5=0 THEN 5 ELSE 0 END END,
  CASE WHEN n=1003 THEN 'pendente' ELSE 'confirmado' END
FROM generate_series(1001,1023) n
WHERE n NOT IN (1004,1012,1020);
DO $$
DECLARE pedidos integer; concluidos integer; sem_itens integer; diferencas integer;
BEGIN
 SELECT COUNT(*),COUNT(*) FILTER(WHERE status='concluido') INTO pedidos,concluidos FROM academy_pedidos;
 IF pedidos<>24 OR concluidos<>21 THEN RAISE EXCEPTION 'contagens erradas: % / %',pedidos,concluidos; END IF;
 SELECT COUNT(*) INTO sem_itens FROM academy_pedidos p
 WHERE p.status='concluido' AND NOT EXISTS(SELECT 1 FROM academy_itens i WHERE i.id_pedido=p.id_pedido);
 IF sem_itens<>1 THEN RAISE EXCEPTION 'pedidos sem itens: %',sem_itens; END IF;
 WITH itens AS (
 SELECT id_pedido,SUM(quantidade*preco_unitario) AS valor FROM academy_itens GROUP BY id_pedido
 ), pagos AS (
 SELECT id_pedido,SUM(valor) AS valor FROM academy_pagamentos WHERE status='confirmado' GROUP BY id_pedido
 )
 SELECT COUNT(*) INTO diferencas FROM academy_pedidos p
 LEFT JOIN itens i USING(id_pedido) LEFT JOIN pagos pg USING(id_pedido)
 WHERE p.status='concluido' AND COALESCE(i.valor,0)<>COALESCE(pg.valor,0);
 IF diferencas<>2 THEN RAISE EXCEPTION 'divergencias: %, esperado 2',diferencas; END IF;
END $$;
-- Relatório de conciliação para comparação manual com o gabarito.
WITH itens AS (SELECT id_pedido,SUM(quantidade*preco_unitario) AS valor FROM academy_itens GROUP BY id_pedido),
pagos AS (SELECT id_pedido,SUM(valor) AS valor FROM academy_pagamentos WHERE status='confirmado' GROUP BY id_pedido)
SELECT p.id_pedido,COALESCE(i.valor,0) AS itens,COALESCE(pg.valor,0) AS pagos,
 COALESCE(i.valor,0)-COALESCE(pg.valor,0) AS diferenca
FROM academy_pedidos p LEFT JOIN itens i USING(id_pedido) LEFT JOIN pagos pg USING(id_pedido)
WHERE p.status='concluido' AND COALESCE(i.valor,0)<>COALESCE(pg.valor,0)
ORDER BY p.id_pedido;
ROLLBACK;
