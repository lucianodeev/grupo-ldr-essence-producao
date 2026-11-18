# PR #316 — Preparação do E2E Stripe hospedado em ambiente isolado

Estado: **runner local preparado, ensaio hospedado pendente**. Data: 2026-11-18. Escopo: branch `feat/ldr-store-servicos-20261117`, sem merge, deploy, pagamentos reais ou alteração de produção.

## Regras obrigatórias

1. Usar exclusivamente Stripe `livemode=false`, com `rk_test_...` ou `sk_test_...` e assinatura de **listener de teste isolado**. Rejeitar `sk_live_`, `rk_live_`, `pk_live_` e qualquer sessão com `livemode=true`.
2. **Stripe Tax desativado** para estes ensaios (`automatic_tax.enabled=false`). Isto não substitui análise fiscal para produção.
3. Supabase Auth, PostgREST e PostgreSQL descartáveis, com contas e eBook sintéticos. Não apontar `SUPABASE_URL` para o projeto de produção.
4. Nunca imprimir segredos, tokens de autenticação, URLs de checkout com tokens ou dados pessoais em logs/artefactos. Não adicionar segredos a ficheiros versionados, comentários, PR ou screenshots.
5. Os títulos **Falar com Quem Feriu** e **Da Pobreza ao Primeiro Contrato** permanecem «Edição em revisão», sem checkout.

## Base existente confirmada

- `.github/workflows/enterprise-commercial-safe-checks.yml`, job `local-supabase`: sobe Supabase descartável, executa `scripts/agenda/free-supabase-integration.mjs` e `scripts/agenda/ldr-commerce-browser-e2e.mjs`, recolhe capturas e destrói o ambiente.
- `docs/ldr-store-servicos-e2e-pr316-20261118.md`: validação com **simulador Stripe**, não com Stripe hospedado.
- A ligação Stripe do ChatGPT confirma a conta `acct_1U28k7Klx2LyNGeB` em `livemode=false`; **essa autorização não fornece automaticamente** uma chave de teste ao processo local ou ao runner GitHub.

## Execução hospedada em estação local

Instale Docker, Supabase CLI 2.122.1 e Stripe CLI oficiais, use Node.js 22 e execute a partir da raiz da branch. Disponibilize uma chave de API de teste da conta `acct_1U28k7Klx2LyNGeB` ao terminal por um canal de segredos. Use uma chave restrita com permissões de leitura da conta e dos PaymentIntents, criação de Checkout Sessions e reembolsos e acesso ao listener da Stripe CLI, se a configuração da conta permitir. O script extrai o segredo da sessão do listener para memória e encaminha apenas eventos dos dois pedidos sintéticos. Não é preciso pré-cadastrar um endpoint público ou fornecer um segundo segredo para esse percurso.

```bash
git switch feat/ldr-store-servicos-20261117
git pull --ff-only
npm ci --no-audit --no-fund
read -rsp 'Chave Stripe de teste: ' STRIPE_SECRET_KEY_TEST; printf '\n'
STRIPE_SECRET_KEY_TEST="$STRIPE_SECRET_KEY_TEST" bash scripts/agenda/run-stripe-hosted-e2e.sh
unset STRIPE_SECRET_KEY_TEST
```

Quando Chromium abrir a página hospedada, confirme a indicação de modo de teste e use o cartão de teste Stripe `4242 4242 4242 4242`, validade futura e CVC de teste. Repita para a proposta. O runner aguarda os webhooks assinados, valida os PaymentIntents, solicita o reembolso de teste do eBook, reenvia os mesmos eventos assinados e compara a Biblioteca e a Área Master com o banco descartável. O cenário com um identificador distinto de evento atrasado é exercitado pela suíte de simulação. Consulte a [orientação sobre testes do Checkout](https://docs.stripe.com/automated-testing) e os [cartões de teste](https://docs.stripe.com/testing#cards).

## Pré-validação opcional no GitHub Actions

O environment `ldr-stripe-e2e-test` exige aprovação de `lucianodeev` e limita a execução à branch do PR. A pré-validação exige os dois segredos de teste cadastrados nesse environment. O executor local obtém a sua própria assinatura efémera pela Stripe CLI. Como o workflow dedicado ainda só existe na branch, a chamada com esta ref parte do workflow Enterprise commercial safe checks, já registado em main. A pré-validação verifica formato e loopback, sem aceder à Stripe.

```bash
gh workflow run enterprise-commercial-safe-checks.yml \
  --repo lucianodeev/grupo-ldr-essence-producao \
  --ref feat/ldr-store-servicos-20261117 -f hosted-stripe-preflight=true
```

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
- [x] Environment GitHub criado e protegido, sem segredos no momento da criação.
- [ ] Chave de teste disponibilizada por canal seguro ao processo local.
- [ ] Endpoint de webhook local/forwarder validado.
- [x] Runner local preparado para Checkout hospedado com Stripe CLI.
- [ ] Fluxos reais de Stripe **em modo de teste** executados com evidências.
- [ ] Revisão final do PR.

**Não considerar o E2E hospedado aprovado até todos os itens pendentes terem evidência.**
