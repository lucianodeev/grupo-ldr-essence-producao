-- Future-ready sponsored academic content architecture.
-- Deliberately contains no billing, checkout or Stripe integration.
create table if not exists public.academic_promotions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post','article','event','course','profile','palestra')),
  target_ref text not null,
  sponsor_label text not null default 'PATROCINADO' check (btrim(sponsor_label) <> ''),
  status text not null default 'draft' check (status in ('draft','scheduled','active','paused','ended','canceled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  approved_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_promotions_window_check check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists academic_promotions_active_idx
  on public.academic_promotions(status, starts_at, ends_at);
create index if not exists academic_promotions_target_idx
  on public.academic_promotions(target_type, target_ref);

alter table public.academic_promotions enable row level security;
revoke all on table public.academic_promotions from anon;
revoke insert, update, delete on table public.academic_promotions from authenticated;
grant select on table public.academic_promotions to authenticated;

drop policy if exists "academic promotions visible" on public.academic_promotions;
create policy "academic promotions visible"
  on public.academic_promotions
  for select
  to authenticated
  using (
    created_by = auth.uid()
    or (
      status = 'active'
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at > now())
    )
  );

comment on table public.academic_promotions is
'Future sponsored-content architecture for Rede Academica. No payment or Stripe integration. Visible sponsored content must render sponsor_label (default PATROCINADO).';
