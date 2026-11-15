# Validação comercial complementar — 15/11/2026

A homepage do PR #301 foi publicada no domínio oficial pelo commit 231149eec7d41fb4d654341469b85f83cd2f2dd0. Esta etapa continua em PR separado porque #301 já está integrado. A branch de testes não altera configurações ou dados de produção.

## Resultado verificado

- 187 regressões da aplicação passaram; 48 testes do handler Stripe e transporte/saga Calendar passaram; 11 verificações SQL em PostgreSQL WASM isolado passaram.
- TypeScript antes e depois da compilação e build Render passaram; cinco páginas empresariais HTTP, 16 assets e 30 destinos internos passaram sem submissão de formulários.
- PostgreSQL real no GitHub Actions: proteção financeira de propostas, RLS, créditos, agenda e concorrência aprovados.
- Chromium em 390px e 1280px: homepage sem overflow horizontal, proposta gratuita com tecnologia/IA selecionada, Academy preservada e proposta privada redirecionada ao login com retorno correto. Nenhuma exceção de browser. Capturas no artefacto `commercial-desktop-mobile` da execução 43727281383. O runner visual foi fixado em Ubuntu 24.04 porque o Playwright escolhido não suporta Ubuntu 26.04.

## Stripe remoto, exclusivamente sandbox

Criado um sandbox temporário independente da conta de produção, com expiração em 22/11/2026. Nenhuma chave de produção foi trocada. Nenhum cartão real foi usado.

- Checkout remoto: valor correto, modo de teste, repetição idempotente e expiração confirmados.
- Fixture oficial Stripe realizou pagamento de teste; cartão `pm_card_chargeDeclined` foi recusado; reembolso de teste confirmado.
- CLI recebeu quatro tipos de evento remoto e as assinaturas foram verificadas: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`.
- O evento de conclusão remoto, com corpo e assinatura originais, foi processado pelo handler real da aplicação com adaptador de banco isolado. A repetição não confirmou o pagamento duas vezes. Isso não substitui a jornada autenticada com Supabase de homologação.
- O transporte real `hostedServiceCheckout` foi executado contra Stripe, sem simulação de fetch, com valor, moeda, metadados, validade e idempotência verificados no provedor. A sessão foi expirada na limpeza.
- Corrigida a validação para aceitar a chave temporária `rkcs_test_` fornecida pelo sandbox oficial. Prefixos temporários live, públicos e desconhecidos continuam recusados. Chaves live/test existentes continuam válidas; a resposta do provedor deve corresponder ao modo da chave.

Scripts reproduzíveis: `scripts/agenda/stripe-sandbox-smoke.py` e `scripts/agenda/stripe-sandbox-provider.mjs`. Recebem configuração explícita do sandbox. Segredos e capturas brutas permanecem fora do repositório e não devem ser enviados aos artefactos de CI. O teste de smoke recebe eventos numa porta aleatória em loopback e encerra o listener ao terminar. Pagamentos de teste realizados foram reembolsados; sessões abertas verificadas foram expiradas. O histórico do provedor é conservado.

## Bloqueios para conclusão integral e ativação

1. Supabase conectado só possui a branch principal. A proteção `ldr_enterprise_quote_checkout_ready()` ainda não existe em produção, como confirmado por consulta somente de leitura. A jornada autenticada completa Master → cliente → Stripe → créditos → Calendar exige um backend isolado com Auth e dados sintéticos. Provisionar uma branch hospedada pode implicar custo e requer decisão informada antes da criação.
2. Calendar: testes de transporte, saga, propriedade, créditos e concorrência aprovados; não foi executado novo ciclo remoto via OAuth nesta etapa. O backend de homologação precisa ter apenas o calendário exclusivo de testes configurado. Nenhum evento ou flag da agenda de produção foi alterado.
3. Só depois da homologação autenticada completa: aplicar a migração financeira em produção e ativar explicitamente os novos fluxos de propostas/projetos, com revisão do catálogo elegível. Não houve alterações de preços ou assinaturas LDR ONE.
4. Reembolso integral bloqueia novos horários; o cancelamento de um evento já confirmado usa a operação administrativa existente. Não foi implementada remoção automática do evento apenas por receber reembolso.

Não declarar "100% concluído" enquanto esses pontos permanecerem. Os testes demonstram os comportamentos exercitados; não constituem garantia de ausência de qualquer falha futura.
