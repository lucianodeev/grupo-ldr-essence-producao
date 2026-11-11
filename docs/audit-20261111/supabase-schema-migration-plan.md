# Plano de migração — agenda, mentoria e entregas (11/11/2026)

**Estado: PROPOSTA PARA REVISÃO. NÃO EXECUTAR EM PRODUÇÃO.**

## Evidência verificada (consultas SQL somente leitura)

Projeto configurado no Render, confirmado pelo proprietário: `sfrcsrzuoqdscflfuwik`.

- `public.appointments` ausente.
- `public.mentorship_sessions` possui `meeting_url`, `scheduled_at`, `status`, `mentorship_id`, mas **não** possui `appointment_id` ou `confirmed_at`.
- `public.s8_sessions` não possui `appointment_id` ou `meeting_url`.
- `public.deliveries` possui `needs_client_approval`, `approved_at` e `status` do enum `delivery_status`.
- As RPCs `confirm_appointment_tx` e `confirm_mentorship_session_tx` não foram encontradas em `public`.

## Bloqueadores de segurança e compatibilidade

1. Levantar dependências completas de `appointments`, `appointment_events`, `appointment_calendar_sync`, créditos, encomendas e regras RLS antes de criar tabelas.
2. Rever a semântica de `confirm_appointment_tx`: lock por pedido, consumo idempotente de créditos, pagamento confirmado, associação ao cliente, prevenção de duplicações e concorrência.
3. Para mentoria, não fazer associação por número de sessão ou horário; usar FK explícita e única para `appointment_id`, com validação do mesmo cliente e pedido. Dados existentes devem ser migrados apenas quando a correspondência for inequívoca.
4. Cancelamento de Google Meet deve limpar o link canónico e qualquer espelho vinculado na **mesma transação**; se não for possível garantir, manter o link do cliente oculto.
5. `s8_sessions` pode representar notas de acompanhamento, não espelho de calendário: confirmar modelo de negócio antes de acrescentar colunas.
6. RLS em todas as novas tabelas públicas; não usar `SECURITY DEFINER` como atalho. Conferir permissões das RPCs e isolamento de dados entre clientes.
7. Validar enum de entregas e o significado de `entregue` (entregue vs aprovado) e `em_revisao` (revisão interna vs ajuste solicitado). Não alterar valores persistidos sem aprovação.

## Plano de execução seguro

1. Inventariar schema, FKs, triggers, políticas e definições de RPC no projeto correto (somente leitura).
2. Preparar migração versionada com SQL explícito, backfill conservador e rollback documentado; não criar tabela `appointments` isoladamente.
3. Executar em base de teste/cópia sanitizada, validar RLS, transações, pagamento, cancelamento, concorrência e regressões.
4. Atualizar tipos gerados e código no PR #273; confirmar build/typecheck/CI.
5. Submeter diff e plano de rollback para aprovação expressa antes de aplicar no Supabase de produção ou fazer merge/deploy.

## Estado das correções atuais

- Portal de mentoria mantém `meeting_url: null` por segurança; funcionalidade ainda não restaurada.
- Limpeza de agendamento atua apenas em `appointments`, tabela atualmente ausente: não declarar concluída.
- Entregas: commit `43e3fa3` adicionou guarda de atualização elegível antes dos eventos; requer testes de integração.
