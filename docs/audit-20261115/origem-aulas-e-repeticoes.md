# Auditoria de origem das aulas e repetição — 15/11/2026

## Fontes efetivamente localizadas
- Supabase `public.training_programs`: 40 programas publicados; 39 sem registos em `training_modules`; `training_materials` vazia.
- GitHub `src/lib/new-professional-formations.catalog.ts`: define módulos/títulos, carga horária e número declarado de aulas para formações profissionais; **metadados não comprovam 144 aulas redigidas**.
- GitHub `src/routes/_clientarea.cliente.cursos.assinatura.$slug.tsx`: lê `academy-subscription-courses.catalog` e apresenta pontos de estudo, atividade e materiais; acesso verificado por `clientLibraryCourseEntitlement`.
- GitHub `src/routes/_clientarea.cliente.cursos.academy.$slug.tsx`: lê `academy-free-courses.catalog`, mas o corpo de cada módulo é composto por três parágrafos fixos, reutilizados em todos os módulos; apenas o nome do módulo muda. **Repetição editorial confirmada por inspeção do código.**

## Evidência de repetição
Na rota gratuita `_clientarea.cliente.cursos.academy.$slug.tsx`, o texto começa com `Este módulo apresenta os conceitos centrais de` seguido de `c.modules[index]`; os parágrafos seguintes iniciam `Estude o tema de forma crítica` e `Como atividade, produza um resumo estruturado`. A atividade é genérica e não avalia conteúdo específico do módulo. O botão de conclusão existe, mas isso não demonstra aprendizagem efetiva.

## Risco adicional observado
O progresso nos cursos de assinatura é guardado localmente em `localStorage` e enviado ao servidor com `clientSaveProgress`; falhas do envio são ignoradas com `.catch(()=>{})`. A experiência pode mostrar progresso local sem confirmação de persistência no servidor. Validar antes de alterar.

## Ações propostas
1. Substituir gradualmente os três parágrafos genéricos por lições específicas e revisadas por curso, com referências e atividades avaliáveis; não inventar formação clínica ou certificações.
2. Exibir claramente **programa/ementa** versus **aulas completas** nos catálogos e páginas de venda.
3. Auditar conteúdo real dos eBooks (capítulos, repetição, extensão, legibilidade) antes de declarar produtos prontos.
4. Adicionar testes para progressos, permissões e certificados e verificar a fonte real de cada curso.

**Nenhuma alteração de conteúdo comercial ou de dados foi realizada nesta etapa.**
