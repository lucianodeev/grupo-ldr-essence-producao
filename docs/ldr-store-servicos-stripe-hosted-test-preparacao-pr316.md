# PR #316 — Preparação do E2E Stripe hospedado em ambiente isolado

Estado: **preparado, não executado**. Data: 2026-11-18. Escopo: branch `feat/ldr-store-servicos-20261117`, sem merge, deploy, pagamentos reais ou alteração de produção.

## Regras obrigatórias

1. Usar exclusivamente Stripe `livemode=false`, com `sk_test_...` e `whsec_...` de **endpoint de teste isolado**. Rejeitar `sk_live_`, `rk_live_`, `pk_live_` e qualquer sessão com `livemode=true`.
2. **Stripe Tax desativado** para estes ensaios (`automatic_tax.enabled=false`). Isto não substitui análise fiscal para produção.
3. Supabase Auth, PostgREST e PostgreSQL descartáveis, com contas e eBook sintéticos. Não apontar `SUPABASE_URL` para o projeto de produção.
4. Nunca imprimir segredos, tokens de autenticação, URLs de checkout com tokens ou dados pessoais em logs/artefactos. Não adicionar segredos a ficheiros versionados, comentários, PR ou screenshots.
5. Os títulos **Falar com Quem Feriu** e **Da Pobreza ao Primeiro Contrato** permanecem «Edição em revisão», sem checkout.

## Base existente confirmada

- `.github/workflows/enterprise-commercial-safe-checks.yml`, job `local-supabase`: sobe Supabase descartável, executa `scripts/agenda/free-supabase-integration.mjs` e `scripts/agenda/ldr-commerce-browser-e2e.mjs`, recolhe capturas e destrói o ambiente.
- `docs/ldr-store-servicos-e2e-pr316-20261118.md`: validação com **simulador Stripe**, não com Stripe hospedado.
- A ligação Stripe do ChatGPT confirma a conta `acct_1U28k7Klx2LyNGeB` em `livemode=false`; **essa autorização não fornece automaticamente** `sk_test_` ao runner GitHub.

## Preparação necessária antes de ativar novo job

- Criar um **environment GitHub Actions separado**, por exemplo `ldr-stripe-e2e-test`, com aprovação humana para acesso a segredos. Usar segredos apenas nesse environment, não como variáveis públicas nem em PRs de forks.
- Disponibilizar ao runner, por canal seguro, `STRIPE_SECRET_KEY_TEST` (chave restrita de teste, permissões mínimas) e `STRIPE_WEBHOOK_SECRET_TEST` (segredo do listener de teste isolado). Não copiar chaves reais ou de produção.
- Criar uma estratégia de entrega dos eventos Stripe **ao endpoint local**: preferencialmente `stripe listen --forward-to http://127.0.0.1:<porta>/<webhook>` num runner descartável, com segredo de assinatura correspondente ao listener; verificar o mecanismo de autenticação CLI e permissões antes de configurar. Não abrir webhook de produção.
- Confirmar as variáveis/rotas efetivas do servidor e do handler no código, os esquemas de pedidos e as transições de acesso antes de escrever o runner. Usar URLs de sucesso/cancelamento locais. Não usar o domínio oficial.
- Adicionar job **manual** `workflow_dispatch`, isolado dos workflows de PR e de produção; validar `livemode=false` em cada sessão e PaymentIntent antes de avançar. Abortá-lo se faltar qualquer segredo ou se a URL de Supabase não for loopback/ambiente descartável.

## Critérios de aceitação

| Fluxo | Evidência exigida |
| --- | --- |
| eBook €4,90 | Checkout Stripe de teste hospedado, sessão `cs_test_`, pagamento de teste confirmado, webhook de teste recebido e assinado, pedido pago, leitura autorizada apenas ao comprador |
| Idempotência | Retry não cria segundo pedido/sessão para a mesma tentativa; reentrega de webhook não duplica acesso |
| Reembolso | Reembolso integral **de teste** confirmado pela API Stripe, webhook processado, acesso revogado, evento atrasado não reativa leitura |
| Serviço €123,45 | Briefing, proposta, aprovação, checkout Stripe de teste, webhook, confirmação na Área Master e no cliente |
| Segurança | Outro utilizador não acede a pedidos, propostas, eBook ou briefing; logs não contêm segredos |
| Preservação | Nenhum pagamento real, merge, deploy, alteração de dados reais ou venda dos dois livros em revisão |

## Estado de execução

- [x] Acesso à conta Stripe de teste confirmado.
- [x] Stripe Tax desativado para esta validação por decisão do responsável.
- [x] Workflow local e evidência simulada inspecionados.
- [ ] Segredos de teste disponíveis no runner por canal seguro.
- [ ] Endpoint de webhook local/forwarder validado.
- [ ] Runner hospedado de teste implementado na branch e revisto.
- [ ] Fluxos reais de Stripe **em modo de teste** executados com evidências.
- [ ] Revisão final do PR.

**Não considerar o E2E hospedado aprovado até todos os itens pendentes terem evidência.**
