# Fundamentos de SQL para Relatórios — unidades autorais 10 a 12

**Formação livre de 60 horas em desenvolvimento.** Exemplos PostgreSQL, dados sintéticos, exercícios avaliáveis. A redação não comprova, isoladamente, horas de aprendizagem.

## Unidade 10 — Reconciliação: detectar diferença entre pedidos e pagamentos

**Objetivo:** produzir um relatório que identifique pedidos concluídos cujo total de itens difere do total confirmado em pagamentos.

**Modelo:** `pedidos(id_pedido,status)`, `itens_pedido(id_pedido,quantidade,preco_unitario)`, `pagamentos(id_pagamento,id_pedido,valor,status)`. Agregar cada relação separadamente evita multiplicação cartesiana de itens por pagamentos.

```sql
WITH itens AS (
 SELECT id_pedido, SUM(quantidade * preco_unitario) AS total_itens
 FROM itens_pedido GROUP BY id_pedido
), pagos AS (
 SELECT id_pedido, SUM(valor) AS total_pago
 FROM pagamentos WHERE status = 'confirmado'
 GROUP BY id_pedido
)
SELECT p.id_pedido,
       COALESCE(i.total_itens, 0) AS total_itens,
       COALESCE(pg.total_pago, 0) AS total_pago,
       COALESCE(i.total_itens, 0) - COALESCE(pg.total_pago, 0) AS diferenca
FROM pedidos p
LEFT JOIN itens i ON i.id_pedido = p.id_pedido
LEFT JOIN pagos pg ON pg.id_pedido = p.id_pedido
WHERE p.status = 'concluido'
  AND COALESCE(i.total_itens, 0) <> COALESCE(pg.total_pago, 0);
```

**Caso:** pedido 501 tem dois itens de R$ 30 e R$ 70 e dois pagamentos confirmados de R$ 40 e R$ 60; a diferença correta é zero. Uma junção direta das duas tabelas de detalhe poderia duplicar os totais e gerar números falsos. Pedido 502 possui R$ 120 em itens e R$ 100 pagos; diferença de R$ 20.

**Atividade:** simule os dois pedidos e acrescente pedido 503 concluído, com R$ 50 em itens e nenhum pagamento confirmado. Informe quais pedidos aparecem e por quê.

**Gabarito:** 502 com diferença 20; 503 com diferença 50. O pedido 501 não aparece. A política de negócio pode exigir tratar pedidos sem pagamento como pendência, e não como fraude.

**Referência:** PostgreSQL Documentation — WITH Queries; Aggregate Functions; Joined Tables.

## Unidade 11 — Indicadores de qualidade: cobertura, validade e unicidade

**Objetivo:** criar um painel de qualidade de dados com denominadores explícitos, evitando métricas que ocultem registros inválidos.

**Modelo:** `clientes(id_cliente,email,cidade)`. Para exercício, email vazio ou NULL é considerado não preenchido; esta regra não valida sintaxe nem comprova entregabilidade.

```sql
SELECT COUNT(*) AS total_clientes,
       COUNT(*) FILTER (
         WHERE email IS NOT NULL AND BTRIM(email) <> ''
       ) AS emails_preenchidos,
       COUNT(*) FILTER (
         WHERE cidade IS NULL OR BTRIM(cidade) = ''
       ) AS cidades_ausentes
FROM clientes;
```

**Cálculo:** com cinco clientes, quatro emails preenchidos e uma cidade ausente, a completude de email é 80% e a ausência de cidade é 20%. Se `id_cliente` for chave primária, unicidade do identificador é imposta pelo banco, mas isso não garante que uma pessoa real não possua dois cadastros.

**Atividade:** monte cinco linhas: três emails distintos preenchidos, um email vazio e um NULL; duas linhas sem cidade. Calcule completude de email e ausência de cidade, além de localizar emails repetidos usando `LOWER(BTRIM(email))`.

**Gabarito:** completude 3/5 = 60%; ausência de cidade 2/5 = 40%. A detecção de repetição deve excluir email NULL e vazio e documentar que normalização de maiúsculas/minúsculas não resolve todos os problemas de identidade.

**Referência:** PostgreSQL Documentation — Aggregate Functions; String Functions and Operators.

## Unidade 12 — Projeto integrador: relatório reproduzível e auditável

**Objetivo:** entregar um pacote de relatórios que outro analista consiga executar, conferir e explicar sem acesso ao autor original.

**Cenário:** uma loja fictícia quer saber quantos pedidos foram concluídos em outubro, qual receita bruta foi gerada, qual o ticket médio dos pedidos com itens e quantos pedidos concluídos não têm pagamento confirmado.

**Entrega obrigatória:**
1. Script de criação de tabelas e inserção de dados sintéticos com pelo menos 20 pedidos, incluindo cancelados, sem itens e com pagamentos parciais.
2. Consulta mensal com limites temporais explícitos e fuso de Lisboa.
3. Relatório de receita com pré-agregação de itens e reconciliação com pagamentos.
4. Ticket médio definido por pedido, não por linha de item.
5. Relatório de qualidade de dados com NULL, registros ausentes e possíveis duplicatas.
6. Documento com definições de métricas, resultados esperados, instruções de execução e limitações.

**Rubrica de 100 pontos:**
- 25: consultas corretas para os cenários de teste, inclusive bordas temporais.
- 20: granularidade correta, sem duplicação por JOIN.
- 20: reconciliação de pagamentos com diferenças justificadas.
- 15: tratamento documentado de NULL e registros sem correspondência.
- 10: scripts reproduzíveis, com dados sintéticos e resultados esperados.
- 10: clareza, limitações e apresentação técnica.

**Falhas impeditivas:** usar dados pessoais reais no repositório, declarar pagamentos não confirmados como receita recebida, ou entregar consultas não executáveis.

**Avaliação:** revisão humana do script e dos resultados; a simples entrega não equivale à conclusão automática do curso.

**Referências:** PostgreSQL Documentation — SELECT, WITH Queries, Date/Time Functions, Aggregate Functions, Window Functions; documentação oficial de SQL PostgreSQL vigente.

## Verificações pendentes
Executar as consultas em PostgreSQL real, construir gabaritos automatizados, completar as horas de estudo com laboratórios supervisionados e independentes, revisar acessibilidade, materiais de apoio e integração com o progresso do aluno. Não publicar o curso nesta etapa.
