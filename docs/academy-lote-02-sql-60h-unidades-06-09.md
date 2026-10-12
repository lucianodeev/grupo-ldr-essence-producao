# Fundamentos de SQL para Relatórios — unidades autorais 06 a 09

**Formação livre de 60 horas, material em elaboração.** Dialeto: PostgreSQL. Exercícios utilizam exclusivamente dados sintéticos. Estas quatro unidades não representam uma carga horária já cumprida.

## Unidade 06 — Datas, fuso horário e limites de períodos

**Competência:** produzir totais mensais reproduzíveis sem excluir registros do último dia ou confundir horário local com UTC.

**Contexto:** `pedidos(id_pedido, criado_em timestamptz, status)` registra instantes absolutos. O relatório de outubro de 2026 deve usar o calendário de Lisboa, não o calendário da sessão SQL.

```sql
SELECT COUNT(*) AS pedidos_outubro_lisboa
FROM pedidos
WHERE status = 'concluido'
  AND criado_em >= TIMESTAMP '2026-10-01 00:00:00' AT TIME ZONE 'Europe/Lisbon'
  AND criado_em <  TIMESTAMP '2026-11-01 00:00:00' AT TIME ZONE 'Europe/Lisbon';
```

**Explicação:** o intervalo é fechado no início e aberto no fim. Isso evita inventar um último milissegundo do mês e respeita a mudança de horário de verão de outubro. Uma filtragem por `criado_em::date` depende do fuso horário da sessão e pode classificar incorretamente registros próximos à meia-noite.

**Atividade:** teste três pedidos concluídos com instantes UTC `2026-09-30 23:30:00+00`, `2026-10-31 23:30:00+00` e `2026-11-01 00:30:00+00`. Determine quais entram em outubro no fuso de Lisboa. **Correção:** o primeiro entra (00:30 de 1/10 em Lisboa), o segundo entra (23:30 de 31/10 em Lisboa) e o terceiro não entra (00:30 de 1/11 em Lisboa). Confirme a conversão com `AT TIME ZONE`.

**Referências:** PostgreSQL Documentation — Date/Time Types; Date/Time Functions and Operators.

## Unidade 07 — Duplicatas operacionais e chaves de negócio

**Competência:** identificar duplicações de eventos sem apagar transações legítimas.

**Cenário:** `eventos_pagamento(id_evento, id_pagamento, tipo_evento, criado_em)` pode receber a mesma notificação de confirmação mais de uma vez. `id_evento` é chave técnica única, mas não impede dois eventos `confirmado` para o mesmo pagamento.

```sql
SELECT id_pagamento, COUNT(*) AS notificacoes_confirmacao
FROM eventos_pagamento
WHERE tipo_evento = 'confirmado'
GROUP BY id_pagamento
HAVING COUNT(*) > 1;
```

**Limite:** duas notificações não são necessariamente dois pagamentos. Antes de deduplicar, verificar o identificador de transação do provedor, histórico de reprocessamento e regras de idempotência. `DISTINCT` aplicado ao relatório final pode esconder defeitos de integração.

**Atividade:** insira confirmações para pagamentos 401, 402 e 403, sendo duas notificações para 401, uma para 402 e três para 403. Quantos pagamentos distintos têm confirmação e quantas notificações existem? **Correção:** três pagamentos e seis notificações; a consulta de duplicação lista 401 e 403.

**Referências:** PostgreSQL Documentation — GROUP BY; Unique Constraints; INSERT ... ON CONFLICT.

## Unidade 08 — Funções de janela e ranking sem perda de detalhe

**Competência:** calcular classificação por cidade preservando cada linha agregada e distinguindo `RANK` de `ROW_NUMBER`.

**Cenário:** uma tabela de vendas já consolidada por cidade e mês, `receita_cidade_mes(cidade, mes, receita)`, contém três cidades em outubro com receitas de 900, 900 e 700.

```sql
SELECT cidade, mes, receita,
       RANK() OVER (PARTITION BY mes ORDER BY receita DESC) AS posicao,
       ROW_NUMBER() OVER (PARTITION BY mes ORDER BY receita DESC, cidade) AS ordem_unica
FROM receita_cidade_mes
WHERE mes = DATE '2026-10-01'
ORDER BY receita DESC, cidade;
```

**Interpretação:** ambas as cidades com receita 900 recebem posição 1 pelo `RANK`; a cidade com 700 recebe posição 3. `ROW_NUMBER` atribui 1, 2 e 3, usando cidade como desempate estável. Uma classificação com empates não deve ser confundida com uma lista de posições exclusivas.

**Atividade:** acrescente uma quarta cidade com receita 500. Informe `RANK` e `ROW_NUMBER` de todas as linhas e explique qual coluna usar para premiar todos os primeiros colocados. **Correção:** `RANK` resulta 1,1,3,4; `ROW_NUMBER` resulta 1,2,3,4; para premiar empates, usar `RANK`.

**Referências:** PostgreSQL Documentation — Window Functions; SELECT.

## Unidade 09 — Plano de execução e índices sem prometer desempenho

**Competência:** interpretar um plano básico de execução e formular hipótese de melhoria testável.

**Cenário:** o relatório filtra pedidos por status e intervalo temporal. Antes de criar um índice, verificar quantidade de linhas, seletividade do filtro, distribuição dos valores e custo de manutenção do índice.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id_pedido
FROM pedidos
WHERE status = 'concluido'
  AND criado_em >= TIMESTAMPTZ '2026-10-01 00:00:00+00'
  AND criado_em < TIMESTAMPTZ '2026-11-01 00:00:00+00';
```

**Hipótese:** um índice parcial em `criado_em` para pedidos concluídos pode ajudar se o filtro selecionar pequena parte de uma tabela grande. Não é garantido: o otimizador pode preferir leitura sequencial em tabela pequena, e o índice adiciona custo de escrita e armazenamento.

```sql
CREATE INDEX idx_pedidos_concluidos_data
ON pedidos (criado_em)
WHERE status = 'concluido';
```

**Cuidado:** `EXPLAIN ANALYZE` executa a consulta; neste exemplo é um SELECT, mas em operações de escrita exigiria precauções adicionais. Criar índices apenas em ambiente autorizado de laboratório.

**Atividade:** registre tempo de execução, tipo de varredura e leituras de buffer antes e depois do índice em base de teste. **Correção:** não existe tempo esperado universal; a entrega deve trazer medições, tamanho da amostra, ambiente, diferenças observadas e decisão justificada de manter ou remover o índice.

**Referências:** PostgreSQL Documentation — Using EXPLAIN; Indexes; Partial Indexes.

## Controle editorial
Os exercícios devem ser executados em PostgreSQL antes da publicação; conferir resultados com dados de teste e revisar tradução, acessibilidade, segurança e direitos de uso. Não disponibilizar certificado por mera leitura desta documentação.
