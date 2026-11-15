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

1. O bloqueio de infraestrutura paga foi removido com Supabase local descartável no GitHub Actions. A branch hospedada paga é opcional e não foi criada. A proteção `ldr_enterprise_quote_checkout_ready()` ainda não foi aplicada em produção. O ciclo remoto conjunto Stripe + Google Calendar continua separado da validação integrada local descrita abaixo.
2. Calendar: testes de transporte, saga, propriedade, créditos e concorrência aprovados; não foi executado novo ciclo remoto via OAuth nesta etapa. O backend de homologação precisa ter apenas o calendário exclusivo de testes configurado. Nenhum evento ou flag da agenda de produção foi alterado.
3. Só depois da homologação autenticada completa: aplicar a migração financeira em produção e ativar explicitamente os novos fluxos de propostas/projetos, com revisão do catálogo elegível. Não houve alterações de preços ou assinaturas LDR ONE.
4. Reembolso integral bloqueia novos horários; o cancelamento de um evento já confirmado usa a operação administrativa existente. Não foi implementada remoção automática do evento apenas por receber reembolso.

Não declarar "100% concluído" enquanto esses pontos permanecerem. Os testes demonstram os comportamentos exercitados; não constituem garantia de ausência de qualquer falha futura.

## Alternativa gratuita implementada e aprovada

Código validado: `6306df0c836cd9d86f39d0d40ca677e36874d715`. Execução: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43730209003 — seis jobs aprovados: aplicação, build, visual, PostgreSQL de propostas, PostgreSQL de agenda e Supabase local integrado. Não houve nova publicação ou alteração de ambiente em produção.

O repositório é público e usa runner padrão Ubuntu 24.04. O job `local-supabase` não usa segredos da conta hospedada, não executa link/push para projetos e não cria recursos pagos. O CLI 2.122.1 inicia Auth, Data API, PostgreSQL e gateway local em Docker. Apenas metadados de esquema são reutilizados; todas as identidades, contactos, propostas e eventos financeiros são sintéticos. A carga preserva os objetos nativos do Auth e usa o proprietário do container apenas para preparar o esquema descartável; os pedidos testados usam os respetivos JWT e permissões reais.

Nove verificações integradas aprovadas: esquema e proteção financeira; autenticação por senha com JWT e recusa de identidade não confirmada; permissão Master via Auth/RLS; solicitação pública gratuita; preparação/aprovação/notificação/visibilidade por cliente; aceite/preço do servidor/bloqueio de cobrança forjada e agenda não paga; handler assinado/créditos únicos; agendamento e reagendamento por dono; reembolso bloqueando novos pedidos de horário. O banco, a API REST, os JWT, as funções da aplicação e os RPC são reais nesse ambiente local. O transporte Stripe e o evento financeiro dessa jornada são fixtures de teste, claramente separados dos testes remotos Stripe documentados acima.

O job também compila a aplicação apontada apenas para o backend local e executa Chromium em 390px. Usa o endpoint HTTP real `/api/auth/session-sync` e os cookies emitidos pela aplicação: visitante redirecionado ao login, sessão inválida rejeitada, Master vê o contacto privado, cliente vê a própria proposta e outro cliente não a vê. Nenhuma exceção do navegador. A sessão local por senha não equivale a testar login Google OAuth. Não há submissão de checkout nem chamada a Google Calendar nesse teste de interface.

Segredos e sessões locais não são enviados a artefactos. No fim, `supabase stop --no-backup` passou e removeu containers e volumes. Não é preciso contratar uma branch Supabase para repetir estes testes. Permanecem a validação remota conjunta com Calendar e a aprovação para aplicar a migração/ativar os fluxos novos em produção.
