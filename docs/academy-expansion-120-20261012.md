# LDR Academy — Expansão de 120 novas formações

Status: planejamento aprovado; nenhuma nova formação publicada por este documento.

## Meta por área
| Área | Novas formações |
|---|---:|
| Construção Civil | 30 |
| Tecnologia e Programação | 30 |
| Beleza | 10 |
| Hotelaria | 10 |
| Gastronomia | 10 |
| Educação | 10 |
| Saúde | 10 |
| Psicanálise e Terapias | 10 |
| **Total** | **120** |

## Regras de implementação
- São **120 novas formações**, além das já existentes; não contar formações antigas como entregas novas.
- Consultar `apps/painel-ldr/src/lib/academy-professional-formations.catalog.ts` e catálogos importados antes de criar slugs; não duplicar identificadores ou temas.
- Não substituir cursos existentes, alterar Stripe, autenticação, tabelas, RLS ou assinaturas.
- Cada formação: 600h, currículo específico e verificável, módulos, aulas substantivas, atividades, bibliografia, avaliação, projeto final, material de áudio e imagens com direitos adequados, e traduções PT/EN/FR/ES quando exigidas pela interface.
- Cursos pagos vinculados à assinatura LDR ONE; gratuitos existentes permanecem gratuitos.
- Implementar em lotes pequenos e revisáveis, em branch separada, com PR; testes de build, rotas públicas, área do aluno, direitos de acesso, e navegação antes de merge.
- Publicação apenas pelo serviço Render `ldr-ecossistema-validacao`, após aprovação dos testes.
- Não marcar curso como concluído com base apenas em metadados de catálogo. Confirmar conteúdo e funcionamento.
- A contagem-base de 30 formações únicas no catálogo central é um retrato de código, não prova de publicação ou de completude.

## Progresso
| Fase | Estado |
|---|---|
| Branch isolada | Criada |
| Inventário do catálogo central | 30 identificadores únicos previamente identificados |
| Revisão de sobreposição temática | Pendente |
| Produção dos 120 cursos | Pendente |
| Testes completos | Pendente |
| Deploy Render | Pendente |
