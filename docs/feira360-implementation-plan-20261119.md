# FEIRA 360 — plano de implementação (19/11/2026)

## Estado
Branch isolada `feat/feira360-marketplace-20261119`. Nenhuma publicação autorizada.

## Arquitetura confirmada
Monorepo npm com aplicação `apps/painel-ldr`; React 19, TanStack Router/Start, TypeScript, Supabase e Vite. Confirmar rotas existentes antes de criar `/feira360`.

## MVP
1. Vitrine pública em `/feira360`: pesquisa, filtros por categoria, localidade e modalidade.
2. Perfis `/feira360/p/$slug` com serviços, preços e pedidos de orçamento.
3. Cadastro de prestador em estado pendente, aprovação Master e moderação.
4. Pedidos de orçamento com identificador de origem, consentimento e estados.
5. Painel parceiro com acesso apenas aos seus pedidos; Master com auditoria.
6. Comissões configuráveis, padrão proposto 15%, apenas registo até conciliação e contrato.
7. Entrada «Encontrar serviços» na homepage existente.

## Regras
Não usar parceiros fictícios em produção. Não ativar cobranças, Stripe Connect ou transferências sem validação contratual/fiscal. Aplicar RLS, validação no servidor, proteção antispam, RGPD e controlo de permissões. Não alterar fluxos Academy/Loja/PR #316.

## Etapas para o Work
Inspecionar árvore de rotas, schema e padrões UI; implementar incrementalmente; criar migrações reversíveis; testes de autorização e E2E; build, typecheck, regressões; abrir PR em draft com evidências. Não fazer merge nem deploy.
