# Curso livre: Fundamentos de SQL para Relatórios — matriz de atividades (60h)

**Estado:** planejamento de carga horária para revisão, não comprovação de horas realizadas. Os materiais existentes ainda não suportam, por si só, esta carga; cada atividade abaixo deve ser disponibilizada e avaliada antes de divulgação como curso completo.

## Distribuição verificável de atividades

| Módulo | Conteúdo guiado | Leitura técnica | Laboratório | Exercícios e correção | Projeto/avaliação | Total |
|---|---:|---:|---:|---:|---:|---:|
| 1. Granularidade e ausências | 3h | 2h | 5h | 3h | 1h | **14h** |
| 2. Junções e agregações | 3h | 2h | 6h | 4h | 1h | **16h** |
| 3. Temporalidade e eventos | 3h | 2h | 6h | 3h | 2h | **16h** |
| 4. Auditoria e entrega | 2h | 2h | 4h | 2h | 4h | **14h** |
| **Total** | **11h** | **8h** | **21h** | **12h** | **8h** | **60h** |

## Entregáveis e critérios de evidência

1. **Módulo 1:** planilha de resultados esperados para contagem de pedidos, distinção entre NULL/zero e análise de pedidos sem itens; script executável com pelo menos cinco verificações automatizadas.
2. **Módulo 2:** relatório por cidade com HAVING, preservação de clientes com LEFT JOIN, conciliação de pagamentos e teste de granularidade; comparação documentada de consultas erradas e corrigidas.
3. **Módulo 3:** três cenários de fronteira temporal em Europe/Lisbon, base sintética com eventos reenviados, ranking com empate e explicação de decisões de negócio; evidências de testes.
4. **Módulo 4:** projeto com pelo menos vinte pedidos fictícios, documentação de denominadores, métricas de qualidade, reconciliação, script reproduzível, rubrica de 100 pontos e revisão de limitações.

**Aprovação editorial:** nenhum item acima pode ser contado como atividade já entregue só porque aparece nesta matriz. Requer material didático suficiente, instruções executáveis, gabarito validado e mecanismo de registro da conclusão.

## Problemas detectados para correção

- A aula `sql60-m02-a03` afirma que todos os quatro clientes têm um pedido concluído: no laboratório, o cliente 4 tem o pedido **505** concluído, mas o 504 está cancelado; a afirmação é correta. Ao inserir um quinto cliente, o exemplo exige registro de teste adicional.
- A aula `sql60-m03-a02` usa `eventos_pagamento`, que não faz parte do laboratório-base. O exercício orienta a criação da tabela; a entrega final deverá fornecer script de extensão executável.
- A aula `sql60-m03-a03` pressupõe empates temporais; o laboratório-base não os fornece. Adicionar caso de teste específico.
- A aula `sql60-m04-a04` exige base com vinte pedidos; o laboratório atual tem apenas cinco. Produzir laboratório de projeto próprio.
- As 12 aulas estruturadas ainda exigem revisão de suficiência didática, bibliografia detalhada, acessibilidade, traduções e testes de SQL.

## Portões antes de publicação

- [ ] Scripts PostgreSQL executados com resultado documentado
- [ ] Exercícios por módulo testados e avaliáveis
- [ ] Projeto integrador com base sintética de 20+ pedidos
- [ ] Carga horária sustentada por materiais e atividades efetivos
- [ ] Revisão editorial e referências verificadas
- [ ] Integração à biblioteca, permissões, progresso e certificado testados
- [ ] Traduções e mídias acessíveis revisadas
- [ ] Aprovação para publicação no Render
