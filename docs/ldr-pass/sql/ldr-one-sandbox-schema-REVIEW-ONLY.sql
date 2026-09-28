-- REVIEW ONLY. Do not apply to production or any shared Supabase project.
-- Apply only after a dedicated sandbox project is identified and ownership verified.
-- This schema is additive; it does not alter Library, editorial or LDR PASS tables.
create table if not exists public.ldr_one_sandbox_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  user_id uuid not null,
  plan text not null check (plan in ('individual','business')),
  billing_cycle text not null check (billing_cycle in ('monthly','annual')),
  seats integer not null check (
    (plan = 'individual' and seats = 1)
    or (plan = 'business' and seats between 5 and 10000)
  ),
  status text not null default 'pending' check (status in (
    'pending','active','trialing','past_due','canceled','unpaid','paused','incomplete','incomplete_expired'
  )),
  stripe_checkout_session_id text unique,
  stripe_subscription_id text unique,
  last_stripe_event_created bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ldr_one_sandbox_stripe_events (
  stripe_event_id text primary key,
  stripe_event_created bigint not null,
  subscription_id uuid not null references public.ldr_one_sandbox_subscriptions(id),
  event_type text not null,
  processed_at timestamptz not null default now()
);
create table if not exists public.ldr_one_sandbox_seat_assignments (
  subscription_id uuid not null references public.ldr_one_sandbox_subscriptions(id),
  user_id uuid not null,
  assigned_at timestamptz not null default now(),
  primary key (subscription_id, user_id)
);
create unique index if not exists ldr_one_sandbox_seat_single_owner
  on public.ldr_one_sandbox_seat_assignments (user_id, subscription_id);
alter table public.ldr_one_sandbox_subscriptions enable row level security;
alter table public.ldr_one_sandbox_stripe_events enable row level security;
alter table public.ldr_one_sandbox_seat_assignments enable row level security;
-- No browser-facing policies intentionally: access is server-only with
-- authenticated customer ownership checks, never service-role credentials in UI.
-- Webhook implementation must atomically lock subscription, verify signed test event,
-- reject stale event.created, enforce account ownership and seat limits, insert event
-- idempotently, then update subscription in one transaction.
-- Do not run this schema without reviewing actual customer/user UUID types,
-- foreign keys, RLS/service-role permissions and isolated database connection.

-- Idempotent upgrade for existing isolated databases (CREATE TABLE does not update constraints).
alter table public.ldr_one_sandbox_subscriptions
  drop constraint if exists ldr_one_sandbox_subscriptions_status_check;
alter table public.ldr_one_sandbox_subscriptions
  add constraint ldr_one_sandbox_subscriptions_status_check check
  (status in ('pending','active','trialing','past_due','canceled','unpaid','paused','incomplete','incomplete_expired'));
