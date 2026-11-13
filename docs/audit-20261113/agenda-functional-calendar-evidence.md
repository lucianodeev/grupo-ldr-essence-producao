# Agenda LDR — evidências de 13 de novembro de 2026

## Estado atual — atualizado em 13/11/2026 às 17:54 de Bruxelas
A agenda está ativada em produção. Migração 20261111200311 aplicada depois do backup 44 recuperado e validado. Webhook Stripe live habilitado após os testes do receptor; deploy Render dep-dbrk07jtqb8s73epfta0 em estado live. Não houve cobrança, contratação de plano pago nem remoção de dados existentes.

As secções abaixo preservam a cronologia; estados anteriores de desativação/pendência foram superados pelas evidências finais ao fim deste documento.

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

## Preparação automática concluída — ainda não executada
PR 295 integrado no commit 5cabfbd6732e757f0fde018f6fde54fa97d7a9cb, preservando histórico e com [skip render]. CI 43423606042 e build 43423609582 aprovados no head 835e2668a8a5d71c64c41cfdcdc8dbdcb91cf57c. Dez testes do handler (sete financeiros originais e três de isolamento da receção sandbox) e seis testes de guardas/cifragem do bootstrap passaram.

Workflow: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/workflows/ldr-stripe-controlled-setup.yml . O formulário está preparado em main, action=prepare, confirmação do projeto preenchida. Zero execuções observadas; Run workflow ainda não foi submetido. Não foi criado webhook nem chave Stripe nova, não se alteraram variáveis Render e não se aplicou migração de produção.

A próxima submissão cria uma nova credencial de assinatura em produção e um webhook dedicado inicialmente desativado. A execução pelo navegador aguarda confirmação específica dessa criação de acesso. A chave será entregue apenas em configuração cifrada e configurada no serviço Render já autorizado. Nenhuma cobrança, plano pago ou eliminação de endpoint/dados existentes faz parte dessa operação.

## Execução autorizada — webhook e entrega real sandbox
Após autorização específica do proprietário para criar os webhooks e guardar as chaves no Render/backup protegido:

- Workflow 43424792670, sucesso: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43424792670 . Criou webhook live dedicado we_1UbJXAKlx2LyNGeBUmx7dgJo, inicialmente desativado; não alterou endpoints preexistentes. Zero cobranças.
- Handoff RSA-OAEP-SHA256/AES-256-GCM decifrado em ficheiro privado, sem valores no chat/logs. Patch GPG decifrado no job e comparado exatamente antes do upload.
- Cópia cifrada guardada: https://chatgpt.com/library?file_id=libfile_8584bd1eb01c8191a2a3f28894e671a6&account_id=personal . ZIP SHA256 9e5ad171a996c64295872a468b3654871c30e35c66811744d4491a11556b894c; patch GPG SHA256 fed067f3e7eeca847d1eb863c421e7746c8990714a43d9b8deb8c91007e450ce.
- Receptor no Render publicado com agenda desativada, deploy dep-dbrg3uc9v7es73cg8oug, live 12:28:40 UTC. Incluiu nova chave de produção e validação sandbox temporária com expiração e nonce privado.
- Webhook TEST we_1UbJXKKlx2LyNGeBi4V5U0wT criado via conector, apenas customer.created. Fixture cus_VcYjNY0V26TQqY em modo de testes, sem dados de contacto/cartão ou pagamento.
- Evento real do Stripe evt_1UbJc9Klx2LyNGeBzJvNWnZn, livemode=false, pending_webhooks=0, metadata de validação coincidente. Recebido em stripe_webhook_events como ldr_validation:evt_1UbJc9Klx2LyNGeBzJvNWnZn, tipo ldr_validation.customer.created, às 12:29:58 UTC. Não executou ramos financeiros.
- Webhook TEST desativado após sucesso. Flag de validação desligada e chave/nonce/expiração temporários esvaziados no Render; deploy dep-dbrg6hc9v7es73cggl40 live 12:34:16 UTC. AGENDA_INTEGRATION_ENABLED continua false.
- stripe_webhook_events: RLS ativo, INSERT negado a anon/authenticated, política ALL false para os dois papéis. Nenhuma função pública SECURITY DEFINER executável por estes papéis foi encontrada a escrever payment_status em orders.

A atualização da configuração de backup foi submetida pela interface. O campo Last updated continuou a mostrar o horário anterior; não foi usado como prova de atualização. Uma tentativa de repetir a preparação Stripe para conferir o arquivo foi rejeitada pela revisão automática por risco de duplicação e NÃO foi executada. O formulário foi cancelado. Optou-se por novo backup somente de leitura e pela validação posterior exclusivamente do webhook já criado, sem nova criação.

A migração e a ativação ainda estavam pendentes naquele momento; foram concluídas conforme as etapas finais seguintes.


## Backup 44 — última recuperação antes da migração
- Execução aprovada: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43427122622 . Commit 5cabfbd6732e757f0fde018f6fde54fa97d7a9cb.
- 251 tabelas, 12 sequências; comparação de dados, esquema, RLS, políticas, ACLs e proprietários em ambiente isolado. Todos os 31 testes SQL funcionais passaram sobre o clone recuperado.
- Storage: 24 objetos reais, 8 buckets, 96 verificações de conteúdo e permissões; inventário preservado. Configuração Render cifrada/recuperada; chave recuperada decifra token Calendar recuperado.
- Cópia durável: https://chatgpt.com/library?file_id=libfile_cbadf2c10d148191ab239b00f85e5ebb&account_id=personal
- ZIP: LDR_Backup_Cifrado_2026-11-13_43427122622.zip, 20.069.019 bytes, SHA256 1c44f4da553ea7d8b5d383930690822f012cce06625cca6e5eb1b5ab03723d6b.
- GPG SHA256 0fec6723583e14e584b76ad33f714a71d0903b64736aefe98b71671a1197778d. Hashes conferidos após download.
- A configuração com a nova chave Stripe também tem o patch GPG independente já guardado (execução 43424792670). A interface GitHub não confirmou a atualização do segredo APP_CONFIG; não afirmar que essa cópia foi atualizada. Para recuperar a configuração nova, aplicar o patch cifrado documentado acima ao backup. Não reutilizar automaticamente a chave antiga.
- Limite explícito: banco completo, bytes Storage e configuração Render capturada; não é uma recuperação integral de configurações geridas Auth/Realtime, código/segredos das Edge Functions ou de outros provedores. production_gate/project_backup_complete do artefato permanecem false, sem adulteração. As provas operacionais Google/Stripe são separadas.

## Migração de produção — aplicada após recuperação comprovada
- Aplicada às 12:51:19 UTC pelo mecanismo oficial Supabase, arquivo apps/painel-ldr/supabase/migrations/20261111200311_agenda_calendar_credit_integration.sql, blob b50162e98a4a09c963a5483f5da9d5be8f624ccc.
- Histórico confirmado como version=20261111200311, name=agenda_calendar_credit_integration. Apenas a nova entrada de histórico gerada pela aplicação foi alinhada ao identificador canónico do arquivo.
- Sem DROP/TRUNCATE/DELETE de dados existentes e sem recalcular créditos históricos. A comparação realizada imediatamente antes/depois preservou as cinco tabelas de negócio verificadas; contagens finais: customers=69, orders=41, session_credits=0, mentorships=0, mentorship_sessions=0, appointments=0.
- appointments, appointment_events, appointment_calendar_sync e session_credits: RLS ativo, SELECT negado a anon/authenticated e permitido a service_role. Operações são mediadas pelo backend com sessão e autorização. Seis RPCs transacionais restringidas ao service_role; emissor privado sem EXECUTE público.
- Gatilhos orders ldr_paid_order_transition_guard e ldr_issue_paid_order_session_credits presentes e ativos (tgenabled=O). Testes negativos de acesso anon/authenticated passaram; RPC sem agendamento recusada em transação revertida.
- Pagamentos/créditos: 31 cenários SQL no clone recuperado e 10 testes de handler aprovado no CI; incluem pagamento não confirmado/reembolso recusado, crédito único/pacote, concorrência e idempotência. Não houve cobrança financeira real em produção.

## Stripe — verificação direta e ativação do endpoint existente
- A execução GitHub enable 43429098211 falhou com details_withheld; não identifica a guarda específica. A hipótese de configuração protegida antiga não foi convertida em certeza.
- Não se repetiu prepare nem se criou outro endpoint. Após diagnóstico, executou-se exclusivamente a função enable do bootstrap versionado em main via API oficial Stripe, com a configuração nova já recuperada e cifrada. Rotas Stripe limitadas a /v1/account e ao webhook existente; zero chamadas financeiras.
- Em 13/11/2026 às 16:51:22 UTC, conta esperada conferida, endpoint dedicado live inicialmente disabled, recibo real sandbox confirmado por REST 200, esquema appointments confirmado por REST 200.
- Receptor: assinatura inválida HTTP 400; assinatura live correta HTTP 200/received=true; repetição do mesmo evento HTTP 200/duplicate=true. Evento técnico ldr.integration_probe sem cliente, pedido ou pagamento; nenhum ramo financeiro executado.
- Só depois foi atualizado disabled=false no endpoint we_1UbJXAKlx2LyNGeBUmx7dgJo; resposta status=enabled. Seis eventos configurados conferidos. Endpoint de testes permanece desativado; validação temporária permanece desligada, sem chave/nonce/expiração temporários ativos.
- Resultado: endpoint_enabled=true, account_matches_expected=true, real_sandbox_delivery_verified=true, live_receiver_signature_verified=true, duplicate_prevention_verified=true, invalid_signature_rejected=true, charges_created=0.

## Publicação e conferência final
- Alteração Render limitada a AGENDA_INTEGRATION_ENABLED=true, merge de variáveis (replace=false), serviço srv-daqq2gfavr4c7394hb1g no workspace tea-daqpr6nf3r2c73bnaijg. Plano free preservado.
- Deploy dep-dbrk07jtqb8s73epfta0: commit 5cabfbd6732e757f0fde018f6fde54fa97d7a9cb, início 16:51:42 UTC, live 16:54:08 UTC. Mesma versão de código previamente validada; nenhuma migração reaplicada.
- Interface profissional autenticada como proprietário/superadmin: https://ldrecossistema.online/painel-profissional/agenda abriu com o estado vazio correto. Formulário Novo agendamento abriu; foi fechado sem submeter, sem criar dados de teste em produção.
- Interface do cliente: https://ldrecossistema.online/cliente/agenda abriu e informou que não há pedido pago elegível nesta conta; nenhum link Meet indevido foi exibido. Zero agendamentos e créditos é o estado real, não indisponibilidade técnica.
- Google Calendar: sete verificações reais anteriores aprovadas, evento técnico cancelado sem remanescentes; validação temporária desligada. Criação de evento de cliente depende de pedido elegível e confirmação da equipa.
- Limite da prova: não foi feita uma compra/cobrança real nem um novo agendamento de cliente em produção. Validação financeira foi no clone/simulador de handler; entrega externa real Stripe foi sandbox não financeira.
