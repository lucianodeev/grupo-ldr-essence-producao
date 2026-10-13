# Lote 02 — Curso livre: Fundamentos de SQL para Relatórios (60 horas)

**Estado:** currículo e matriz de atividades para revisão. Não está publicado, nem equivale a aulas completas.

## Identidade
- Área: Tecnologia e Dados
- Público: iniciantes que precisam consultar dados operacionais com SQL
- Pré-requisitos: leitura de tabelas e aritmética básica
- Resultado: produzir relatório SQL reproduzível, com métricas conferidas e sem exposição indevida de dados
- Limites: não concede certificação de administrador de banco de dados nem acesso a dados reais de terceiros

## Matriz de 60 horas

| Módulo | Horas | Aprendizagem e entregáveis |
| --- | ---: | --- |
| 1. Modelo relacional e consultas seguras | 14 | 4h leitura guiada, 5h laboratório SELECT/WHERE/ORDER BY, 3h exercícios com gabarito, 2h revisão |
| 2. Agregações e qualidade dos indicadores | 16 | 4h teoria, 7h laboratório GROUP BY/HAVING/NULL, 3h análise de erros, 2h avaliação |
| 3. JOIN, granularidade e consistência | 16 | 4h teoria, 7h laboratório de relacionamentos, 3h auditoria de duplicação, 2h avaliação |
| 4. Relatório integrado e documentação | 14 | 3h estudo de casos, 7h projeto, 2h testes de conferência, 2h apresentação e revisão |
| **Total** | **60** | **Carga horária planejada, não ainda validada por aulas publicadas** |

## Cenário didático próprio
Uma loja fictícia registra clientes, pedidos e itens de pedido. Os exemplos usam dados inteiramente sintéticos.

Tabelas:
- clientes(id_cliente, nome_ficticio, cidade)
- pedidos(id_pedido, id_cliente, data_pedido, status)
- itens_pedido(id_item, id_pedido, quantidade, preco_unitario)

## Unidade autoral 01 — Contar pedidos sem multiplicar linhas

**Objetivo verificável:** explicar por que uma junção entre pedidos e itens pode inflar a contagem de pedidos e produzir uma consulta que preserve a granularidade correta.

**Exemplo:** o pedido 101 contém dois itens e o pedido 102 contém três. Após unir pedidos a itens_pedido, o resultado tem cinco linhas, mas somente dois pedidos distintos. `COUNT(*)` conta cinco linhas; `COUNT(DISTINCT p.id_pedido)` conta dois pedidos.

```sql
SELECT
  COUNT(DISTINCT p.id_pedido) AS total_pedidos
FROM pedidos AS p
JOIN itens_pedido AS i ON i.id_pedido = p.id_pedido
WHERE p.status = 'concluido';
```

**Discussão técnica:** a junção interna exclui pedidos sem itens. Se o objetivo for contar todos os pedidos concluídos, inclusive os ainda sem itens, a consulta deve partir somente da tabela pedidos. Escolher JOIN não é um detalhe de sintaxe: é uma decisão sobre a população medida.

```sql
SELECT COUNT(*) AS total_pedidos_concluidos
FROM pedidos
WHERE status = 'concluido';
```

**Atividade:** crie um conjunto de teste com três pedidos concluídos, dos quais um não possui itens. Os outros têm dois e três itens. Execute as duas consultas e explique a diferença entre os resultados. Acrescente um pedido cancelado para verificar o filtro de status.

**Critérios de avaliação:**
1. Identifica corretamente cinco linhas de itens, dois pedidos concluídos com itens e três pedidos concluídos totais.
2. Justifica a escolha da tabela base conforme a definição do indicador.
3. Demonstra que o pedido cancelado não entra no resultado.
4. Documenta o significado de 'pedido concluído' e a data de referência.

**Referências para consulta:** PostgreSQL Documentation, capítulos `SELECT`, `Aggregate Functions` e `Table Expressions`; ISO/IEC 9075 (SQL), consultar edição aplicável.

## Avaliação integradora prevista
Entregar três consultas de relatório (pedidos por mês, faturamento por cidade e ticket médio), conjunto de testes com pedidos sem itens e cancelados, dicionário de métricas e uma nota sobre limitações de dados. A rubrica deve avaliar correção, granularidade, tratamento de NULL, rastreabilidade e clareza.

## Portão de publicação
Faltam as demais unidades didáticas, exercícios resolvidos, testes de execução, revisão editorial, tradução e integração à área do aluno. Não ativar no catálogo até conclusão.
