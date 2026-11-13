# Agenda LDR — evidências de 13 de novembro de 2026

## Estado atual
A agenda permanece desativada. Nenhuma migração da agenda foi aplicada ao Supabase principal. Não houve cobrança, contratação de plano pago nem remoção de dados existentes.

## Backup comprovado — execução 41
- Execução: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43394363515
- Commit: c2b7882b2518409bf1f5ec99eda03fb9788059b7. PR 292 integrado.
- Snapshot PostgreSQL somente de leitura; exportação oficial pg_dump e papéis sem senhas.
- Arquivo GnuPG decifrado e hashes comparados antes da restauração.
- 251 tabelas e 12 sequências recuperadas em contentor sem rede, portas ou mounts; cron/pg_net impedidos de executar operações externas.
- Contagens e hashes de linhas, esquema, RLS, políticas, ACLs, proprietários e sequências comparados integralmente.
- 24 objetos reais de 8 buckets recuperados na API oficial Storage isolada: 96 verificações de conteúdo/acesso, incluindo público/privado, anónimo, outro utilizador e proprietário. Metadados e inventário completo preservados.
- As 35 variáveis Render foram transferidas com autorização para LDR_BACKUP_APP_CONFIG_JSON, somente no ambiente protegido ldr-backup. Valores nunca publicados em logs, Git ou chat; área de transferência limpa.
- Configuração Render cifrada e recuperada com hashes idênticos. A chave recuperada decifrou o token Calendar recuperado.
- Migração da agenda aplicada somente no clone; as 24 verificações SQL da versão então vigente passaram.
- Backup guardado: https://chatgpt.com/library?file_id=libfile_2f8177c00d0c8191977017a539ce4f68&account_id=personal
- ZIP LDR_Backup_Cifrado_2026-11-13_43394363515.zip; SHA256 5462600e97c45a17d992ad21597af17520f528dcf64029b963d0bbf46a0f5512.
- SHA256 do GPG: eef51d9e60f5cac8c382f16cf6c5f8b42117c587a81d1f83bb3936c0b8639d0c.

## Google Calendar — teste real aprovado
Endpoint administrativo /api/integrations/google-calendar/validate. Resultado observado:

```json
{"ok":true,"checks":["availability_read","create_and_readback","conflict_and_own_event","duplicate_prevention","reschedule_same_identity","cancel_and_readback","idempotent_cancel_and_zero_remaining"],"cleanupComplete":true}
```

Evento técnico privado de cinco minutos, sem convidados ou dados de clientes, cancelado completamente. Zero evento técnico restante. Após o teste GOOGLE_CALENDAR_VALIDATION_ENABLED voltou a false no deploy dep-dbrbs0k9v7es73c4sus0; AGENDA_INTEGRATION_ENABLED permaneceu false.

## Pagamento para créditos — dependência corrigida
A função antiga de crédito existia, mas não havia gatilho de pagamento. PR 293 integrado no commit aa10316349ed867eaed87ccedb8e36fbf55de66e, com [skip render].

- Futuras confirmações de pagamento confiáveis concedem uma sessão ou as sessões do pacote uma única vez.
- Utilizadores comuns não podem marcar o próprio pedido como pago; mantém-se a confirmação manual por Master ativo e a confirmação pelo backend.
- Nenhum histórico de pedidos foi recalculado ou apagado.
- Handler Stripe passou a tratar sucesso/falha de pagamentos assíncronos.
- Execução 43402406959: 31 cenários SQL originais (incluindo disputas de 20 ligações e rollback que recusa apagar agendamentos com dados), 31 cenários no esquema de dependências e sete testes do handler real com base simulada e assinatura sintética.
- Build 43402410272 aprovado. Os testes sintéticos de webhook não equivalem a checkout/cobrança ou entrega externa real.

## Ensaio 42 — recuperação aprovada, teste adicional bloqueado
https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43402717917

Banco, RLS/ACLs, Storage, configuração Render e token Calendar foram recuperados e comparados novamente. A migração foi aplicada no clone e os testes passaram até o teste negativo de confirmação anónima. O ensaio terminou sem sucesso e sem publicar novo backup como aprovado.

Causa confirmada em leitura no banco principal: anon não pode executar is_superadmin(uuid), enquanto authenticated pode. A nova guarda consultava essa função antes de rejeitar anon. O esquema sintético anterior não reproduzia essa restrição. A produção permaneceu inalterada.

## Correção e alternativa sem login Stripe
PR 294 integrado no commit 845c5b01eb694056cf86a2c2286f1fbf3d1377d9, preservando histórico e com [skip render]. Evento Render commit_ignored evt-dbrfitp42hec73biqsd0 confirmou ausência de publicação.

- Guarda rejeita anon e outros papéis não confiáveis antes da consulta Master; não amplia permissões.
- Fixture reproduz a restrição real de anon e a permissão explícita de authenticated.
- Execução 43420001863 aprovada: 40 testes de segurança/configuração/guardas, roundtrip cifrado, 31 verificações SQL no esquema de dependências, Storage sintético, 31 verificações SQL originais e sete testes do handler webhook.
- Build 43420005402 aprovado.
- Cinco testes adicionais validam a auditoria Stripe: conta divergente, eventos incompletos, endpoint desativado/modo divergente, paginação e ausência de segredos em erros/resultados.
- A auditoria usa apenas GET /v1/account e GET /v1/webhook_endpoints em api.stripe.com com a configuração já protegida. Sem redirecionamentos autenticados, cobranças, alterações Stripe ou publicação de respostas/chaves. Confirma modo, conta esperada e endpoint/eventos; mantém delivery_verified=false até haver prova de entrega externa.
- O conector Stripe disponível mostra apenas modo de testes; a auditoria protegida consulta o modo da configuração efetivamente exportada do Render.

## Limites do backup e da liberação
A prova cobre integralmente o banco PostgreSQL, bytes do Storage e configuração Render capturada. Não afirma recuperação de todos os componentes geridos do projeto Supabase, incluindo configuração Auth/Realtime e código/segredos externos das Edge Functions. production_gate e project_backup_complete continuam false no artefato; não foram adulterados.

Consulta de produção após as correções: appointments ausente; 41 pedidos; zero session_credits. session_credits e as duas tabelas privadas de OAuth têm RLS ativo e SELECT negado a anon/authenticated. O serviço Render continua free.

## Ensaio 43 — concluído com sucesso
https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43420267390

Concluído às 12:59 de Bruxelas, em 13/11/2026. Banco, 24 objetos/8 buckets, 96 verificações Storage, configurações Render e chave/token Calendar recuperados e comparados novamente. A migração corrigida passou no clone, incluindo as 31 verificações funcionais SQL. A restrição real de anon foi reproduzida e o teste passou; Master ativo autenticado também passou.

- Backup guardado: https://chatgpt.com/library?file_id=libfile_0971c182b9c0819186b6e7830bc1f5d7&account_id=personal
- ZIP: LDR_Backup_Cifrado_2026-11-13_43420267390.zip, 20.068.923 bytes.
- SHA256 ZIP: 2d33f16240b2e82e05f004a44bc1b565d53534d1891cfdc7da331d216b380ff4.
- SHA256 GPG: 0725e0d1863efa7facecd821c863c0fd488d81ee94f57e49cb583bd0132e279f.
- Os dois hashes foram conferidos depois do download; ZIP contém apenas GPG e verification.json.

A consulta oficial Stripe, somente de leitura, confirmou mode=live e account_matches_expected=true. endpoint_enabled=false e configuration_ready=false: nenhum webhook ativo corresponde aos endereços atuais verificados. signing_secret_present=true não comprova ligação correta a um endpoint. Nenhuma cobrança ou alteração Stripe foi feita por esse ensaio.

Histórico agregado da tabela stripe_webhook_events: um checkout.session.completed e um charge.refunded em setembro; 57 checkout.session.expired, último em 15/10/2026. Isso não prova entrega ao endereço atual.

## Próxima correção preparada
PR 295: https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/295 . Prepara um webhook dedicado inicialmente desativado, transferência exclusivamente cifrada da nova configuração e um teste real de receção com customer.created em modo sandbox, sem operações financeiras. O ramo de validação exige assinatura distinta, nonce e expiração curta e nunca executa pedidos/créditos. A ativação do webhook exige prova da receção sandbox, esquema da agenda instalado e testes de assinatura/idempotência no receptor. A publicação da agenda continua condicionada aos resultados.
