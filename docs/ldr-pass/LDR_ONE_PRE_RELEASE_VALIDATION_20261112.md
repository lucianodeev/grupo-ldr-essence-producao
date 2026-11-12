# LDR ONE Business — verificação pré-homologação (12/11/2026)

> **NO-GO para cobranças e deploy de produção.** Documento de validação apenas. Não autoriza merge, mudanças no Stripe LIVE, mudança DNS, env vars ou envios comerciais.

## 1. Configuração Render / Stripe (read-only)
- Render principal: `srv-daqq2gfavr4c7394hb1g`, branch `main`, **autoDeploy=yes**. Merge dispararia publicação automática, portanto não integrar sem autorização expressa.
- Render sandbox: `srv-das6drvavr4c7397dflg`, branch `feat/ldr-one-sandbox-entitlements-20260927`, **autoDeploy=no**; não executa a branch deste PR.
- A ferramenta Render ligada não expõe leitura de variáveis de ambiente. **Não verificados:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LDR_ONE_LIVE_PRICE_BUSINESS_MONTHLY`, `LDR_ONE_LIVE_PRICE_BUSINESS_ANNUAL`, `CLIENT_PANEL_URL`. Não copiar nem revelar segredos.
- Stripe LIVE, conta ligada `acct_1U28k7Klx2LyNGeB`: produto `prod_VLP6jMZqqIHjH0` ativo; preços EUR 19,90 mensal e EUR 199 anual ativos, metadados `minimum_seats=5`.
- **Divergência Brasil:** preços recorrentes BRL deste mesmo produto possuem `minimum_seats=2` nos metadados Stripe LIVE, enquanto o PR aplica mínimo de 5 a EU e BR. Exige decisão operacional e correção Stripe separadamente autorizada.
- Webhook Stripe LIVE habilitado `we_1UKiZVKlx2LyNGeBoOC1b8lX` entrega em `https://ldrrhestrategia.com/api/stripe/webhook`; o domínio definitivo aprovado é `https://ldrecossistema.online`. Não foi possível comprovar encaminhamento nem entrega assinada nesse endpoint.
- Webhook assina `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.payment_failed`, `charge.refunded`; **não consta** `invoice.payment_succeeded` nem `invoice.payment_failed` apesar de o handler os tratar. Revisar eventos de renovação antes do LIVE.
- Stripe Billing Portal: nenhuma configuração retornada. A nova interface do PR realiza cancelamento direto mas não substitui contrato, faturação nem canais de suporte.

## 2. Testes seguros
- GitHub Actions `43189195282`: testes mock, build da aplicação e PostgreSQL temporário foram aprovados.
- PostgreSQL real de CI: cinco lugares, atribuições, cancelamento/revogação e rollback foram aprovados; não acessou produção.
- **Não realizado:** fluxo REAL Stripe TEST assinado → Render sandbox → banco isolado durável → 5 logins de colaboradores → expiração/cancelamento. O conector Stripe disponível expõe apenas uma conta LIVE; não há contexto TEST acessível. O sandbox Render antigo não é o PR atual.
- Não disparar pagamentos LIVE, simular assinatura na base de produção ou usar segredos LIVE no sandbox.

## 3. Faturação e operação
- Stripe Tax: configuração da conta ativa, com sede em Portugal; isso **não comprova** registo fiscal válido para todas as jurisdições nem tratamento IVA B2B.
- Confirmar: entidade emitente, identificação fiscal, regras IVA para empresas de Portugal/Brasil/UE, emissão e entrega de fatura, condições e política de cancelamento/reembolso, emails institucionais de suporte, catálogo efetivamente incluído e SLA de ativação.
- Exibir de forma inequívoca: mínimo cinco colaboradores, preço unitário, periodicidade, total antes de aceitar pagamento, impostos aplicáveis e acesso até expiração.

## 4. PR / publicação
- PR #278 permanece Draft; nenhuma alteração integrada ou publicada.
- A implementação do cancelamento com confirmação do utilizador, autenticação, Stripe e persistência passou testes com mocks; o fluxo completo não foi validado LIVE.
- **Go/no-go:** só retirar Draft, aprovar merge e permitir deploy com autorização expressa depois da prova dos pontos 1–3.

## Próximas ações autorizáveis
1. Validar valores/IDs de ambiente **sem expor segredos** na conta Render correta.
2. Preparar e executar teste integrado isolado com Stripe TEST e PostgreSQL durável acessível (sem tocar LIVE).
3. Configurar a entrega definitiva de eventos do Stripe (endpoint, eventos de renovação e segredo), somente mediante autorização separada.
4. Aprovar política de cobrança/faturação, catálogo, suporte e confirmação final de PR e deploy.


## Stripe TEST: primeira sessão real de checkout (verificação adicional)
- O conector Stripe foi reconectado ao ambiente **TEST** (`livemode=false`) da conta `acct_1U28k7Klx2LyNGeB`.
- Produtos TEST ativos: Business `prod_VKuOYWvxCLofRL`; preço mensal `price_1UKEZQKlx2LyNGeB97DEKLBT` (1.990 cêntimos por colaborador).
- Criada uma sessão Stripe Checkout **TEST** para cinco colaboradores: `cs_test_a080d5C4hQPJAtpJvVuVy50yQ4JoyAbUQNxXL9dKqHHl3QvM60FiscPF8I`.
- Recuperação via Stripe API confirmou: `livemode=false`, `mode=subscription`, `status=open`, `payment_status=unpaid`, `amount_total=9950` EUR cents (€99,50), `subscription=null`.
- **Nenhuma cobrança ou subscrição criada.** A sessão foi criada diretamente pela API TEST para verificar a configuração Stripe, não pelo checkout autenticado da aplicação: **não** atesta integração com a base de dados do LDR nem entrega webhook.
- Stripe TEST tem webhook habilitado `we_1UK6O3Klx2LyNGeBxSmTtynH` com destino `https://ldr-one-stripe-sandbox.onrender.com/stripe/test-webhook`. A API TEST devolveu zero eventos até à consulta.
- O Render sandbox mantém o deploy de 28/09/2026, autoDeploy desligado, sem logs recentes; não há ramo isolado Supabase para o projecto LDR, e o conector não permite ler os segredos Render.
- Próxima prova exigida para o GO: transação **TEST** autenticada *dentro do aplicativo*, webhook Stripe TEST assinado entregue ao Render, persistência efetiva e atribuição/revogação de cinco acessos em banco segregado. Exige garantir banco segregado e variáveis TEST sem interferir na produção.


## Base de dados isolada gratuita — execução de 12/11/2026
- Organização Neon **Luciano** confirmada em plano `free`. Criado projeto **`ldr-one-homologacao-isolada`** (`cool-wave-53666235`), Frankfurt, PostgreSQL 17, sem criar plano pago nem tocar em projetos anteriores.
- Base exclusiva `ldr_one_sandbox_db` na branch `br-falling-bonus-b97dgjmr`. Foram aplicadas sete instruções do esquema de homologação do repositório: três tabelas, índice e RLS. Nenhuma tabela de produção importada.
- Verificações SQL na nova base confirmaram as três tabelas `ldr_one_sandbox_subscriptions`, `ldr_one_sandbox_stripe_events`, `ldr_one_sandbox_seat_assignments`, RLS ativo nas três e zero políticas de acesso público; regra CHECK Business exige 5 a 10.000 colaboradores.
- Teste transacional **diretamente no Neon real**: inscrição fictícia Business (5), cinco atribuições, evento fictício, alteração de estado para `canceled`, rollback protegido e rejeição de quatro lugares. Executado com sucesso. Consulta posterior: **0 assinaturas, 0 colaboradores, 0 eventos**.
- Configurado **somente** `DATABASE_URL` no Render `srv-das6drvavr4c7397dflg`, por ligação segura Neon → Render, merge de variável existente; URL validada previamente para Neon e nome `ldr_one_sandbox_db`, sem imprimir credenciais. Não foram alterados outros serviços.
- Render desencadeou apenas deploy sandbox `dep-dbqp1v5g1s2s73f0eud0`, concluído em `live` a 12/11/2026 10:14:39 UTC, commit `73a2316ce62a703e229983795ff7af61cca0dda5`. Logs confirmam build, arranque Node e disponibilidade pública.
- **Limitação importante:** startup deste serviço é `node .output/server/index.mjs`; o recetor exclusivo do webhook de testes é o script independente `scripts/ldr-one-stripe-test-webhook.mjs`. Esta etapa **não comprova** que `/stripe/test-webhook` responde corretamente ou que persiste eventos. Persistência de eventos está protegida pela flag `LDR_ONE_SANDBOX_PERSIST_EVENTS=yes`, que **não foi ativada**.
- Não foram alterados `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, recursos LIVE, env de produção, deploy de produção ou contas de clientes.
- **Próximo gate:** confirmar execução do recetor Stripe TEST (ou disponibilizar serviço/rota própria), assinatura `whsec_test` correspondente, `sk_test` validada, entrega de evento assinado e persistência/entitlements de cinco colaboradores de ponta a ponta antes do GO.
