-- Persist signed Stripe webhook events so retries are idempotent across all flows.
-- With RLS enabled and no client policies, access remains restricted to the server service role.
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  created_at timestamptz not null default now()
);

comment on table public.stripe_webhook_events is
  'Signed Stripe events processed by the server; the primary key prevents duplicate financial effects.';

alter table public.stripe_webhook_events enable row level security;

create index if not exists stripe_webhook_events_created_at_idx
  on public.stripe_webhook_events (created_at desc);
