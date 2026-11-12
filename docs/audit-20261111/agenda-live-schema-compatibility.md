# Agenda — compatibilidade com schema Supabase real (leitura apenas)

Data: 2026-11-11. Projeto: `sfrcsrzuoqdscflfuwik`. Branch: `feat/central-empresas-ldr`.
Fonte: consulta de `information_schema.columns` em produção, **somente SELECT**, sem dados de clientes.

## Confirmado
- `public.orders`: `id uuid`, `customer_id uuid` (nullable), `catalog_key text` (nullable), `payment_status payment_status` (NOT NULL). Valores e regras de pagamento ainda devem ser testados no staging.
- `public.session_credits`: `id uuid`, `order_id uuid` NOT NULL, `customer_id uuid` nullable, `catalog_key text` nullable, `granted integer` NOT NULL, `source text` NOT NULL.
- `public.mentorship_sessions`: `id uuid`, `mentorship_id uuid` NOT NULL, `title text` NOT NULL, `session_number smallint`, `scheduled_at timestamptz`, `duration_minutes integer` NOT NULL, `meeting_url text`, `status session_status`, `updated_at timestamptz`.
- `appointments`, `appointment_events` e `appointment_calendar_sync` não apareceram na consulta de colunas: migração não aplicada.

## Compatibilidade e riscos
- Os campos referenciados pelas quatro RPCs propostas estão presentes nas tabelas existentes. Os dois novos campos de `mentorship_sessions` ainda exigem migração.
- A simulação do GitHub usa tabelas simplificadas. Antes da publicação, executar integração com cópia fiel do schema e roles, incluindo constraints, índices, triggers e grants.
- `orders.customer_id`, `orders.catalog_key`, `session_credits.customer_id` e `session_credits.catalog_key` aceitam NULL; a função de confirmação deve rejeitar vínculos ambíguos e os testes precisam cobrir isso.
- A função de créditos exige `payment_status='pago'`, não valida reembolso posterior e não mantém ledger imutável; revisão de regras de cancelamento, remarcação e reembolso continua pendente.
- `confirm_mentorship_session_tx` não verifica créditos/pagamento, por design; validar se este fluxo deve ou não consumir crédito.
- Não há autorização para aplicar DDL, merge, publicação ou alterar dados reais.

## Próximos gates
1. Confirmar logs do workflow de permissões SQL e testes negativos.
2. Executar testes completos em staging com schema fiel ao projeto.
3. Verificar advisors Supabase e autorização backend/feature flags.
4. Preparar migração versionada, backup/restauração e plano de reversão.
5. Pedir autorização **específica** antes de qualquer mudança em produção.
