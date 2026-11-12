# Validação local — 11/11/2026

Escopo: inspeção estática do SQL de proposta, **sem PostgreSQL, Docker, Supabase local nem execução de DDL**.

Arquivo: `docs/audit-20261111/agenda-migration-draft.sql`.

## Verificações satisfeitas (5/8)
- BEGIN + ROLLBACK presentes.
- RLS habilitado na nova tabela appointments.
- FK explícita mentorship_sessions.appointment_id.
- Índice único parcial para vínculo de sessão.
- Sem GRANT público a anon/authenticated.

## Pendências (3/8)
- Tabela appointment_calendar_sync ainda não definida.
- RPC confirm_appointment_tx ainda não definida.
- RPC claim_calendar_sync ainda não definida (release_calendar_sync também necessária).

## Bloqueios adicionais encontrados na inspeção do código
- agenda-admin.server.ts exige também appointment_events, confirm_mentorship_session_tx.
- calendar-sync.server.ts usa lease token e persistência do Google event ID: não criar RPC sem especificação de concorrência e política de compensação.
- SQL não foi executado contra PostgreSQL: resultado não comprova sintaxe SQL, compatibilidade de tipos ou funcionamento transacional.

## Critério de saída
Implementar schema e RPCs completos em migração versionada, rodar testes de integração em PostgreSQL isolado, rever RLS e autorização, então solicitar aprovação explícita para qualquer alteração de produção.
