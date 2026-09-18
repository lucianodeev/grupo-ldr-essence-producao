-- LDR Carreira Marketplace — base de empresas e vagas.
-- Preparado nesta branch para revisão. NÃO aplicado automaticamente no Supabase produção.
-- Aplicar somente após validação do preview, revisão de RLS e autorização explícita.

create table if not exists public.career_companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  responsible_name text,
  professional_email text,
  website text,
  country text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.career_companies add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table public.career_companies add column if not exists responsible_name text;
alter table public.career_companies add column if not exists professional_email text;
alter table public.career_companies add column if not exists website text;
alter table public.career_companies add column if not exists country text;
alter table public.career_companies add column if not exists city text;
alter table public.career_companies add column if not exists created_at timestamptz not null default now();
alter table public.career_companies add column if not exists updated_at timestamptz not null default now();

create table if not exists public.career_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.career_companies(id) on delete cascade,
  title text not null,
  category text,
  description text,
  responsibilities text,
  requirements text,
  contract_type text not null default 'employment',
  country text,
  city text,
  work_mode text not null default 'remote',
  publication_language text not null default 'pt',
  required_languages text[] not null default '{}',
  salary_currency char(3),
  salary_min numeric,
  salary_max numeric,
  salary_period text,
  status text not null default 'pending_review',
  published_at timestamptz,
  closed_at timestamptz,
  close_reason text,
  freelance_project_type text,
  timezone text,
  expected_start_date date,
  estimated_duration text,
  availability_details text,
  estimated_workload text,
  accessibility_inclusive boolean not null default false,
  accessibility_designated_disability boolean not null default false,
  accessibility_features text[] not null default '{}',
  accessibility_details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.career_jobs add column if not exists company_id uuid references public.career_companies(id) on delete cascade;
alter table public.career_jobs add column if not exists title text;
alter table public.career_jobs add column if not exists category text;
alter table public.career_jobs add column if not exists description text;
alter table public.career_jobs add column if not exists responsibilities text;
alter table public.career_jobs add column if not exists requirements text;
alter table public.career_jobs add column if not exists contract_type text not null default 'employment';
alter table public.career_jobs add column if not exists country text;
alter table public.career_jobs add column if not exists city text;
alter table public.career_jobs add column if not exists work_mode text not null default 'remote';
alter table public.career_jobs add column if not exists publication_language text not null default 'pt';
alter table public.career_jobs add column if not exists required_languages text[] not null default '{}';
alter table public.career_jobs add column if not exists salary_currency char(3);
alter table public.career_jobs add column if not exists salary_min numeric;
alter table public.career_jobs add column if not exists salary_max numeric;
alter table public.career_jobs add column if not exists salary_period text;
alter table public.career_jobs add column if not exists status text not null default 'pending_review';
alter table public.career_jobs add column if not exists published_at timestamptz;
alter table public.career_jobs add column if not exists closed_at timestamptz;
alter table public.career_jobs add column if not exists close_reason text;
alter table public.career_jobs add column if not exists freelance_project_type text;
alter table public.career_jobs add column if not exists timezone text;
alter table public.career_jobs add column if not exists expected_start_date date;
alter table public.career_jobs add column if not exists estimated_duration text;
alter table public.career_jobs add column if not exists availability_details text;
alter table public.career_jobs add column if not exists estimated_workload text;
alter table public.career_jobs add column if not exists accessibility_inclusive boolean not null default false;
alter table public.career_jobs add column if not exists accessibility_designated_disability boolean not null default false;
alter table public.career_jobs add column if not exists accessibility_features text[] not null default '{}';
alter table public.career_jobs add column if not exists accessibility_details text;
alter table public.career_jobs add column if not exists created_at timestamptz not null default now();
alter table public.career_jobs add column if not exists updated_at timestamptz not null default now();

create index if not exists career_companies_owner_user_id_idx on public.career_companies(owner_user_id);
create index if not exists career_jobs_company_id_idx on public.career_jobs(company_id);
create index if not exists career_jobs_status_idx on public.career_jobs(status);
create index if not exists career_jobs_published_at_idx on public.career_jobs(published_at desc);

alter table public.career_companies enable row level security;
alter table public.career_jobs enable row level security;

grant select, insert, update on public.career_companies to authenticated;
grant select on public.career_jobs to anon, authenticated;
grant insert, update on public.career_jobs to authenticated;

drop policy if exists "Career companies owner select" on public.career_companies;
create policy "Career companies owner select"
on public.career_companies
for select
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists "Career companies owner insert" on public.career_companies;
create policy "Career companies owner insert"
on public.career_companies
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "Career companies owner update" on public.career_companies;
create policy "Career companies owner update"
on public.career_companies
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Published career jobs are public" on public.career_jobs;
create policy "Published career jobs are public"
on public.career_jobs
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Company owners can read own jobs" on public.career_jobs;
create policy "Company owners can read own jobs"
on public.career_jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.career_companies c
    where c.id = career_jobs.company_id
      and c.owner_user_id = auth.uid()
  )
);

drop policy if exists "Company owners can insert own jobs" on public.career_jobs;
create policy "Company owners can insert own jobs"
on public.career_jobs
for insert
to authenticated
with check (
  status in ('draft','pending_review')
  and exists (
    select 1
    from public.career_companies c
    where c.id = career_jobs.company_id
      and c.owner_user_id = auth.uid()
  )
);

drop policy if exists "Company owners can update own non published jobs" on public.career_jobs;
create policy "Company owners can update own non published jobs"
on public.career_jobs
for update
to authenticated
using (
  exists (
    select 1
    from public.career_companies c
    where c.id = career_jobs.company_id
      and c.owner_user_id = auth.uid()
  )
)
with check (
  status in ('draft','pending_review','paused','closed')
  and exists (
    select 1
    from public.career_companies c
    where c.id = career_jobs.company_id
      and c.owner_user_id = auth.uid()
  )
);
