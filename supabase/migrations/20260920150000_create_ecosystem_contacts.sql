-- Central unica de suporte do Ecossistema LDR.
create table if not exists public.ecosystem_contacts (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique default ('LDR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text,
  subject text not null check (char_length(subject) between 2 and 100),
  message text not null check (char_length(message) between 5 and 4000),
  source_project text not null default 'LDR Ecosystem',
  source_url text,
  language text not null default 'pt' check (language in ('pt','en','fr','es')),
  status text not null default 'novo' check (status in ('novo','em_atendimento','aguardando_cliente','respondido','resolvido')),
  priority text not null default 'normal' check (priority in ('normal','alta')),
  wants_luciano boolean not null default false,
  consent_contact boolean not null default false check (consent_contact = true),
  response_due_at timestamptz not null default (now() + interval '7 days'),
  first_response_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ecosystem_contacts is 'Private inbound support and service requests for the LDR ecosystem. Public clients may insert only; no public read access.';

alter table public.ecosystem_contacts enable row level security;

revoke all on table public.ecosystem_contacts from anon, authenticated;
grant insert on table public.ecosystem_contacts to anon, authenticated;
grant select, update on table public.ecosystem_contacts to authenticated;

drop policy if exists ecosystem_contacts_public_insert on public.ecosystem_contacts;
create policy ecosystem_contacts_public_insert
on public.ecosystem_contacts
for insert
to anon, authenticated
with check (
  consent_contact = true
  and status = 'novo'
  and priority = 'normal'
  and first_response_at is null
  and resolved_at is null
);

drop policy if exists ecosystem_contacts_superadmin_select on public.ecosystem_contacts;
create policy ecosystem_contacts_superadmin_select
on public.ecosystem_contacts
for select
to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'superadmin'
  )
);

drop policy if exists ecosystem_contacts_superadmin_update on public.ecosystem_contacts;
create policy ecosystem_contacts_superadmin_update
on public.ecosystem_contacts
for update
to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'superadmin'
  )
)
with check (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'superadmin'
  )
);

create index if not exists ecosystem_contacts_status_created_idx
on public.ecosystem_contacts(status, created_at desc);
create index if not exists ecosystem_contacts_due_idx
on public.ecosystem_contacts(response_due_at)
where status not in ('respondido','resolvido');
