# Agenda / mentorias / créditos / Google Calendar — candidato à publicação

11 de novembro de 2026. PR #273, branch `feat/central-empresas-ldr`.
**Sem autorização para merge, DDL/DML de produção ou deploy.**

## Implementação e invariantes

- Migração única: `apps/painel-ldr/supabase/migrations/20261111200311_agenda_calendar_credit_integration.sql`, criada pelo Supabase CLI. Os antigos drafts rollback-only permanecem como histórico; NÃO aplicar ambos.
- Funções invoker exclusivas de `service_role`; tabelas novas com RLS e sem grants aos papéis públicos. Backend mantém autenticação e autorização de staff e deriva o cliente da sessão.
- Trigger impede confirmação direta sem pagamento, titular/catalogo e saldo válidos. Um lock no pedido serializa confirmações; UNIQUE(order_id) na concessão real impede créditos duplicados.
- Reserva é mantida em reagendamentos e conclusões; cancelamento libera a reserva. Estados terminais não reabrem. Redução de concessão abaixo das reservas é rejeitada. O cliente apresenta o mesmo saldo reservado.
- Leitura das tabelas exclusivas passa por funções autenticadas do backend, inclusive a lista da agenda e seu histórico. O formulário de mentoria seleciona o agendamento explicitamente e confirma pelo backend; alterações de horário/estado em sessões vinculadas passam pela agenda canónica.
- Mentorias exigem vínculo explícito. Confirmação usa a mesma função de pagamento; mentorias gratuitas sem pedido/crédito continuam possíveis. Atualização/cancelamento espelha apenas a sessão vinculada por UUID, nunca por data ou número.
- RPCs de solicitação e reagendamento do cliente incluídas; pedido pago/posse/catalogo/créditos verificados em transação. Vinte solicitações simultâneas não criam vinte reservas pendentes.
- Integração protegida por `AGENDA_INTEGRATION_ENABLED=true`, desativada por padrão. Links de mentoria só são entregues com confirmação, vínculo/titular corretos, elegibilidade financeira e sincronização pronta. Nenhum segredo vai ao cliente.
- Calendar: ID determinístico por agendamento/geração, recuperação de POST perdido com 409 e PATCH, marcador privado, recriação após evento removido com geração persistida, timeout de 15s, erros curtos, 404/410 idempotentes, freeBusy falha fechada. Consulta de identidades evita esconder segundo evento coincidente com o próprio.
- Lease por agendamento e serialização das operações no mesmo calendário; release exige token válido/não expirado e rejeita sincronização de um horário alterado enquanto o Google respondia. Recuperação é acionada pelas ações de staff; não foi criado cron/serviço adicional.

## Evidência e limites

Os snapshots JSON são de metadados, extraídos em transações READ ONLY do projeto `sfrcsrzuoqdscflfuwik`; não contêm registros de clientes. O bootstrap reproduz colunas, enums, geração de coluna de auth.users, FKs, checks, índices, triggers e funções dependentes, políticas e grants de tabelas para os três papéis da API. Não reproduz o servidor GoTrue/PostgREST, identidades OAuth, papéis administrativos geridos ou todos os módulos do projeto. O PostgreSQL isolado é 17.6, a mesma versão observada na base real.

`node scripts/agenda/verify.mjs` executa o SQL definitivo e concorrência com conexões PostgreSQL independentes, usando apenas dados sintéticos. Só aceita PGHOST de loopback. Os três workflows agora executam esse caminho; antes, o workflow de concorrência usava funções simplificadas e os outros bootstraps omitiam NOT NULL/FKs reais.

Os testes Calendar com respostas simuladas não comprovam acesso OAuth nem comportamento do gateway real. A leitura de calendários do conector disponível falhou com **403 / notACalendarUser**. Este ambiente não tem `LOVABLE_API_KEY` nem `GOOGLE_CALENDAR_API_KEY`. Não foram criados eventos reais nem enviados convites.

## Pendências externas para teste Calendar real

1. Ativar Google Calendar na conta conectada e reconectar o conector com acesso de edição de eventos e leitura de disponibilidade; ou disponibilizar uma conexão de testes funcional do gateway usado pela aplicação.
2. Configurar `LOVABLE_API_KEY`, `GOOGLE_CALENDAR_API_KEY` somente no cofre/ambiente de testes, nunca em chat, git ou variáveis VITE_. Essas chaves são do gateway Lovable; uma conexão Calendar do ChatGPT não as substitui automaticamente.
3. Definir `GOOGLE_CALENDAR_ID` para um calendário de testes separado, com permissão de escrita para a identidade do gateway. Informar também um endereço de convidado de testes autorizado; nenhum cliente real.
4. Validar criar → repetir → reagendar → cancelar → repetir cancelamento, conferir um único evento ativo e sala Meet. Revogar temporariamente acesso para conferir erro seguro e repetir após restaurar acesso. Testar dois horários concorrentes no calendário de teste.

## Backup, restauração e publicação (produção não executada)

Responsável: operador autorizado. Janela: definida pelo proprietário. Registrar SHA aprovado, horário UTC, contagem de tabelas e migrações antes de começar.

1. Obter autorização específica para backup de dados e execução em produção. Usar ferramenta pg_dump 17 compatível; credencial por PGSERVICE/PGPASSFILE protegido, sem URL contendo senha em logs/comandos compartilhados.
2. Com acesso de leitura: `pg_dump --dbname=service=ldr_production --format=custom --file=ldr-pre-agenda.dump`. Exportar separadamente os papéis necessários sem senhas. Guardar o dump cifrado fora do git, com acesso restrito e checksum SHA256; não anexar a esta PR.
3. Restaurar o dump num PostgreSQL isolado autorizado: `pg_restore --exit-on-error --single-transaction --no-owner --dbname=service=ldr_restore_test ldr-pre-agenda.dump`. Comparar contagens, constraints, funções, políticas, integridade de pedidos/créditos e histórico. Registrar tempo de restauração. Esse ensaio com o dump integral **depende de acesso de backup/infraestrutura e ainda não foi executado**; o ensaio local agora cobre tanto a reversão como backup custom e restauração integral do banco isolado com dados sintéticos (20 tabelas, 494 definições, 485 grants e estado da sequência). Isso não equivale à restauração de um dump integral de produção.
4. Verificar drift de schema desde os snapshots. Somente após aprovação: aplicar exclusivamente a migração versionada em transação. Não usar db push indiscriminado: há migrações históricas não reconciliadas com o projeto.
5. Confirmar seis RPCs, triggers, grants, RLS, FK explícita e checks; manter a flag desativada. Verificar advisors em modo leitura, sem corrigir achados de outros módulos nesta publicação.
6. Após autorização de merge/publicação: Render `ldr-ecossistema-validacao`, serviço `srv-daqq2gfavr4c7394hb1g`, usa `main`, autoDeploy ligado. Um merge em main pode iniciar publicação; coordenar esse passo como deploy. Não mudar branch do serviço. Domínio público: `https://ldrecossistema.online`.
7. Ativar flag somente depois da migração e do teste Calendar autorizado. Smoke com contas sintéticas; conferir saldo, pagamento, mentoria gratuita, link oculto em erro e cancelamento/reagendamento. Monitorar erros/leases e eventos duplicados.

## Reversão e segurança

- Antes de usar: `agenda-preactivation-rollback.sql` remove exclusivamente os objetos novos e se recusa a executar se houver dados/vínculos. Testado num banco descartável, incluindo recusa de perda de dados e reaplicação da migração.
- Após uso: desativar flag, bloquear novas operações, guardar estado de banco/eventos e fazer correção compensatória revisada. Não DROP automático, não restaurar dump sobre outras alterações sem avaliação/aprovação.
- Registrar a reversão com nova migração; não reescrever histórico publicado. Restaurar a versão anterior do app com autorização; manter dados novos para reconciliação.
- Checklist: service_role somente no servidor; OAuth somente no gateway; sem notas/preços/documentos no evento; privilégio mínimo; URLs de reunião validadas no backend; callbacks autenticados; RLS/grants verificados; convidados de testes explícitos; nenhuma modificação remota de produção durante a validação.

**Estado: candidato validado em PostgreSQL isolado. Não liberado para produção enquanto faltarem teste Calendar real e ensaio de restauração do backup integral, além da autorização final.**

## Ensaio local de backup/restauração executado

`pg_dump`/`pg_restore` 17.11 contra PostgreSQL 17.6 descartável. Resultado: arquivo custom restaurado em um segundo banco vazio; conteúdo e contagens de 20 tabelas, RLS, 494 definições (colunas, enums, triggers, constraints, índices, políticas e funções), 485 grants de schema/tabela/função e sequência comparados. As restrições de acesso público e o vínculo mentoria/agendamento também passaram após a restauração. O arquivo e os bancos temporários são removidos no final. Nenhuma leitura de dados de produção.

Reprodução com binários locais de PostgreSQL 17 e o pacote Node `pg` já instalado:

```bash
AGENDA_POSTGRES_BIN=/caminho/engine17/bin \
AGENDA_POSTGRES_CLIENT_BIN=/caminho/client17/bin \
AGENDA_PG_PACKAGE=/caminho/pgtools/package.json \
AGENDA_VERIFY_BACKUP=true node scripts/agenda/run-isolated.mjs
```

O runner cria o cluster, executa os 31 controlos anteriores, faz dump/restore num banco novo e remove o ambiente temporário. O script recusa host remoto, DATABASE_URL, PGSERVICE ou PGHOSTADDR. O ensaio com arquivo real de produção continua reservado à janela e ao acesso autorizados.
