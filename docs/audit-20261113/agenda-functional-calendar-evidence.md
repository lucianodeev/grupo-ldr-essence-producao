# Agenda LDR — evidências de 13 de novembro de 2026 (07:40 UTC)

## Resultado
O banco de dados foi recuperado e comparado integralmente. A migração passou no clone e as 24 verificações funcionais de pagamentos/créditos, permissões e concorrência passaram sobre esse banco recuperado. O Google Calendar passou separadamente no teste real pela aplicação. **A liberação de produção continua fechada**: a recuperação integral dos componentes externos e do serviço Storage ainda não foi comprovada.

## Código e ensaios
- PR #291 integrado: https://github.com/lucianodeev/grupo-ldr-essence-producao/pull/291
- Commit: `efc5f9cc64b9e460aa76b549a3f189e7748dd7aa`.
- Preparação sem credenciais: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43386047721 — 28 testes de segurança/guardas, cifragem/decifragem e restauração sintética, 24 verificações SQL.
- Recuperação real: https://github.com/lucianodeev/grupo-ldr-essence-producao/actions/runs/43386610876 — sucesso, job `131756860605`, fim 07:40:18 UTC.
- O commit de ferramentas incluiu `[skip render]`; evento Render `commit_ignored` em 07:32:30 UTC confirmou que o merge não publicou a aplicação.

## Banco recuperado
- Origem exportada por snapshot somente de leitura.
- 251 tabelas e 12 sequências; contagens e SHA256 das linhas, esquema, RLS, políticas, ACLs, proprietários e sequências comparados.
- Arquivo GnuPG decifrado antes da restauração; hashes conferidos.
- Restauração em contentor descartável, sem rede, portas ou mounts; cron e pg_net sem execução externa.
- Migração `20261111200311_agenda_calendar_credit_integration.sql` aplicada somente no clone.
- 24 verificações SQL passaram depois da comparação. Incluem pedidos não pagos e reembolsados, cliente/catálogo incorretos, confirmação idempotente, crédito insuficiente, proteção contra escrita direta, cancelamento/reagendamento, mentoria, RLS e seis RPCs exclusivas de service_role.
- Três disputas de 20 conexões PostgreSQL independentes: confirmação de um crédito, claim de lease e pedido de agendamento; cada uma permitiu exatamente um vencedor.
- Fixtures com UUIDs/referências aleatórios. Não houve bootstrap substituindo o esquema recuperado, TRUNCATE ou DELETE de registos recuperados.
- São testes de regras SQL de pagamento; não executam cobranças nem comprovam webhooks/checkout externos.

## Backup descarregado e guardado
- Artefato GitHub: `14018923702`, `ldr-encrypted-recovery-43386610876`, 20.066.912 bytes.
- ZIP: `LDR_Backup_Cifrado_2026-11-13_43386610876.zip`.
- SHA256 ZIP: `4de95bdd8299ba453bea33b7c35393e4ae063cb2c8e3649960b5f66e002e6762`.
- SHA256 GPG: `3824328cf9ee23f6d6fc445256e0a6d2773afe210156ee306975be3ee5e16dd4`.
- Os dois hashes foram comparados depois do download.
- Cópia preservada: https://chatgpt.com/library?file_id=libfile_40132520558c8191bda1e33d412162ec&account_id=personal
- ZIP contém somente recovery.tar.gpg e verification.json. Nenhuma credencial ou dump em claro foi publicado.

## Google Calendar — execução real pela aplicação
Endpoint administrativo: `/api/integrations/google-calendar/validate`.
Resultado observado depois do login administrativo:
```json
{"ok":true,"checks":["availability_read","create_and_readback","conflict_and_own_event","duplicate_prevention","reschedule_same_identity","cancel_and_readback","idempotent_cancel_and_zero_remaining"],"cleanupComplete":true}
```
- Calendário e calendário de testes configurados coincidem.
- Evento técnico privado, cinco minutos, sem convidados ou dados de clientes.
- Criação/leitura, conflito/exclusão do próprio evento, duplicação, reagendamento mantendo identidade, cancelamento e segunda remoção idempotente passaram.
- Zero evento técnico restante confirmado pelo próprio teste.
- Validação temporária ativada no deploy Render `dep-dbrbod5g1s2s7381emlg`, live em 07:30:55 UTC.
- Depois do sucesso, a variável GOOGLE_CALENDAR_VALIDATION_ENABLED voltou a false; deploy `dep-dbrbs0k9v7es73c4sus0`, live em 07:38:31 UTC.
- AGENDA_INTEGRATION_ENABLED permaneceu false.
- O verification.json do backup mantém live_google_calendar_tests como pendente porque o workflow não recebe esta evidência externa; este relatório registra separadamente o resultado real, sem adulterar o artefato assinado pelos hashes.

## Produção e limites
Consulta posterior ao ensaio: appointments continua ausente, 41 pedidos, zero linhas session_credits. A migração principal e a ativação da agenda não foram executadas.
Serviço Render continua no plano free. Nenhum plano, orçamento ou recurso pago foi contratado.

Pendências efetivas:
1. Preservar e comprovar recuperação das configurações/chaves externas (incluindo a chave que decifra o refresh token Calendar); o sucesso do Calendar no runtime atual não demonstra recuperação após perda desse runtime.
2. Restaurar os 24 objetos/8 buckets num serviço Storage isolado, validar acesso/políticas e comparar os conteúdos. O backup recupera os bytes e o banco recupera metadados/políticas; isso ainda não é um teste do serviço Storage.
3. Completar validação de checkout/webhooks em modo de testes caso exigida para liberação de pagamentos externos.

Somente depois dessas provas revisar a migração de produção e ativar a agenda. Não confundir banco recuperável com backup integral do projeto já concluído.
