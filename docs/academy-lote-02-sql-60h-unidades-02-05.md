# Fundamentos de SQL para Relatórios — unidades autorais 02 a 05

**Curso livre de 60 horas, em desenvolvimento.** Conteúdo original para PostgreSQL com dados sintéticos. Estas unidades não constituem, isoladamente, as 60 horas.

## Unidade 02 — NULL não significa zero

**Competência:** distinguir ausência de valor, valor zero e linha inexistente em indicadores.

**Base:** a tabela `pagamentos(id_pagamento, id_pedido, valor, data_confirmacao)` contém os seguintes valores: pedido 201, valor 100, confirmado; pedido 202, valor 0, confirmado; pedido 203, valor NULL, sem confirmação. A soma ignora NULL; `COUNT(valor)` contabiliza dois valores conhecidos; `COUNT(*)` contabiliza três linhas.

```sql
SELECT
  COUNT(*) AS linhas,
  COUNT(valor) AS valores_conhecidos,
  COUNT(*) - COUNT(valor) AS valores_ausentes,
  SUM(valor) AS soma_valores_conhecidos
FROM pagamentos;
```

**Interpretação:** o resultado é 3, 2, 1 e 100. Não substituir NULL por zero sem regra de negócio: isso faria uma cobrança sem informação parecer um pagamento gratuito. A confirmação do pagamento deve ser medida por `data_confirmacao IS NOT NULL`, e não pelo valor positivo.

**Exercício:** acrescente uma quarta linha com valor 50 e confirmação ausente. Calcule novamente as quatro colunas e responda quantos pagamentos estão confirmados. **Correção:** 4 linhas, 3 valores conhecidos, 1 ausente, soma 150; confirmados continuam 2, porque a quarta linha não tem data de confirmação.

**Referência:** PostgreSQL Documentation — Aggregate Functions; Comparison Functions and Operators (IS NULL).

## Unidade 03 — HAVING filtra grupos, WHERE filtra linhas

**Competência:** calcular o total de vendas por cidade sem excluir prematuramente linhas necessárias à agregação.

**Base:** `pedidos(id_pedido,id_cliente,status)`, `clientes(id_cliente,cidade)` e `itens_pedido(id_pedido,quantidade,preco_unitario)`. Para analisar apenas pedidos concluídos, `WHERE` filtra pedidos antes de agrupar. Para selecionar cidades cujo valor total seja ao menos 1.000, `HAVING` filtra o resultado agregado.

```sql
SELECT c.cidade,
       SUM(i.quantidade * i.preco_unitario) AS receita
FROM pedidos p
JOIN clientes c ON c.id_cliente = p.id_cliente
JOIN itens_pedido i ON i.id_pedido = p.id_pedido
WHERE p.status = 'concluido'
GROUP BY c.cidade
HAVING SUM(i.quantidade * i.preco_unitario) >= 1000
ORDER BY receita DESC;
```

**Ponto crítico:** `WHERE i.preco_unitario >= 1000` seria incorreto: excluiria itens baratos que, somados, podem ultrapassar o limite. Também é necessário definir se descontos, impostos e devoluções integram a métrica; o exemplo mede apenas valor bruto de itens.

**Exercício:** uma cidade tem itens de 400, 350 e 300 em pedidos concluídos; outra tem itens de 700 e 200. Qual cidade aparece? **Correção:** a primeira soma 1.050 e aparece; a segunda soma 900 e não aparece. Uma venda cancelada de 500 na segunda cidade não altera o resultado.

**Referência:** PostgreSQL Documentation — SELECT; Tutorial: Aggregate Functions.

## Unidade 04 — LEFT JOIN e clientes sem pedidos

**Competência:** construir uma lista de clientes incluindo aqueles sem qualquer pedido, sem transformar acidentalmente LEFT JOIN em INNER JOIN.

```sql
SELECT c.id_cliente, c.nome_ficticio,
       COUNT(p.id_pedido) AS pedidos_concluidos
FROM clientes c
LEFT JOIN pedidos p
  ON p.id_cliente = c.id_cliente
 AND p.status = 'concluido'
GROUP BY c.id_cliente, c.nome_ficticio
ORDER BY c.id_cliente;
```

**Explicação:** o filtro de status dentro de `ON` preserva clientes sem pedidos concluídos; eles aparecem com contagem zero. Se `p.status = 'concluido'` for movido para `WHERE`, a condição elimina linhas em que `p.status` é NULL, retirando esses clientes da lista. `COUNT(p.id_pedido)` ignora a linha sem pedido, enquanto `COUNT(*)` contaria a linha produzida pelo LEFT JOIN.

**Exercício:** cadastre três clientes: A com dois pedidos concluídos, B com um cancelado e C sem pedidos. Execute a consulta e explique as contagens. **Correção:** A=2, B=0, C=0; os três clientes devem aparecer.

**Referência:** PostgreSQL Documentation — Table Expressions: Joined Tables.

## Unidade 05 — Média de ticket sem duplicar pedidos

**Competência:** calcular ticket médio por pedido concluído a partir de itens, evitando média por linha de item.

**Definição adotada:** ticket médio = receita bruta dos itens dos pedidos concluídos com pelo menos um item / quantidade desses pedidos. Pedidos sem itens ficam fora da métrica e devem ser reportados separadamente.

```sql
WITH totais_por_pedido AS (
  SELECT p.id_pedido,
         SUM(i.quantidade * i.preco_unitario) AS total_pedido
  FROM pedidos p
  JOIN itens_pedido i ON i.id_pedido = p.id_pedido
  WHERE p.status = 'concluido'
  GROUP BY p.id_pedido
)
SELECT COUNT(*) AS pedidos_com_itens,
       SUM(total_pedido) AS receita_bruta,
       AVG(total_pedido) AS ticket_medio
FROM totais_por_pedido;
```

**Caso:** pedido 301 tem dois itens de 20 e 80; pedido 302 tem um item de 200. A média por linha de item seria 100, mas a média por pedido é 150, pois os totais são 100 e 200. Se houver pedido concluído sem itens, ele não entra na CTE e essa exclusão deve ser declarada.

**Exercício:** adicione um terceiro pedido com itens de 50 e 100. Determine receita, número de pedidos e ticket médio. **Correção:** receita 450, três pedidos e ticket médio 150. Justifique por que `AVG(i.preco_unitario)` não mede o indicador.

**Referências:** PostgreSQL Documentation — WITH Queries (Common Table Expressions); Aggregate Functions.

## Critérios transversais de avaliação
Cada entrega precisa conter consulta executável, dados sintéticos de teste, resultado esperado, definição da métrica, explicação do comportamento com NULL e casos sem correspondência quando aplicável. Uma consulta sintaticamente válida, mas que mede outra população, não atende ao objetivo.
