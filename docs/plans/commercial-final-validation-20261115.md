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

## Preparação da validação protegida com Google real

Código verificado em `274afdfaec8f28578b70e9beffdbaf4b306bfa74`: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43731928961 . Os seis jobs passaram. A integração gratuita passou agora 11 verificações, incluindo confirmação pelo administrador real da aplicação, lease de sincronização persistido no PostgreSQL, evento simulado único, reagendamento, bloqueio de sincronização após reembolso e cancelamento com zero eventos restantes. O navegador autenticado também passou. Três testes adicionais validam leitura GET do cofre, destino fixo, autenticação do ciphertext e retenção de erros sem segredos.

Novo workflow manual: `.github/workflows/calendar-remote-safe-validation.yml`. Não executa em push ou PR. Exige `main`, ator proprietário, repositório público, confirmação literal `LDR_TEST_CALENDAR_ONLY` e o ambiente existente `ldr-backup`, preservando as suas proteções. Usa runner padrão e Supabase local descartável. Não há upload de artefactos ou configuração de serviços pagos.

Na execução remota autorizada, `remote-calendar-config.mjs` lê apenas `encrypted_value` e `granted_scopes` do refresh token através de um GET no projeto Supabase fixo. Desencripta em memória com a configuração já prevista no segredo protegido `LDR_BACKUP_APP_CONFIG_JSON`; não altera esse segredo. Não exporta a chave de produção do Supabase ou as chaves Stripe para os clientes locais. A disponibilidade e validade desse segredo só podem ser confirmadas na execução protegida; os testes de segurança usam dados sintéticos.

O calendário de destino é fixo: `e23f50c0bd5d6e0674959daa9ac822861319d9da464bfd6e17327eae3ea457a7@group.calendar.google.com`. A configuração deve identificá-lo como teste e distinguir o calendário de produção. O token deve permitir eventos e freebusy. A execução usa as funções reais do cliente Google e a saga da aplicação, mas remove o convidado do payload para não enviar convites. O banco, clientes, pedidos e confirmação financeira permanecem sintéticos e locais. O Stripe continua representado por fixture assinada nesse ciclo; a prova de Stripe remoto permanece a já documentada separadamente.

A limpeza só cancela o ID determinístico criado a partir do UUID novo desse teste, verifica zero eventos com o marcador do agendamento e encerra o banco sem preservar volumes. Falha de limpeza é reportada como `TEST_CALENDAR_CLEANUP_REQUIRED` com o ID do evento de teste, nunca como sucesso.

**Não executado remotamente nesta etapa.** O workflow novo ainda está apenas no PR #303. Para usar o cofre pela via protegida é necessário integrar o PR na main e aprovar/executar o workflow conforme a proteção existente. O Render publica automaticamente a main, portanto esse merge implica publicação e depende da aprovação expressa do proprietário. Tal publicação não aplica a migração financeira nem ativa as flags de novos pagamentos. A migração e ativação continuam como uma etapa posterior, após confirmar a validação remota.
