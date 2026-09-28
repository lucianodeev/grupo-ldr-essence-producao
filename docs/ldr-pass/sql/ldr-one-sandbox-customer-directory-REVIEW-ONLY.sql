-- Dedicated isolated Render PostgreSQL ONLY. Review before applying.
-- Never apply to production or existing shared Supabase projects.
create table if not exists public.ldr_one_sandbox_customer_members (
 user_id uuid primary key,
 customer_id uuid not null,
 verified boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists ldr_one_sandbox_customer_members_customer_id_idx
 on public.ldr_one_sandbox_customer_members(customer_id);
-- No automatic customer enrollment: only an authenticated, trusted sandbox
-- provisioning process may insert or verify membership.
