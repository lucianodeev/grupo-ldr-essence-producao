-- LDR Carreira marketplace foundation. Preview branch only; apply only after explicit production authorization.
create table if not exists public.career_companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 160),
  responsible_name text not null check (char_length(responsible_name) between 2 and 120),
  professional_email text not null check (professional_email = lower(professional_email)),
  website text,
  country text not null check (char_length(country) between 2 and 100),
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.career_companies(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  category text not null check (char_length(category) between 2 and 100),
  description text not null check (char_length(description) between 80 and 8000),
  responsibilities text not null check (char_length(responsibilities) between 20 and 6000),
  requirements text not null check (char_length(requirements) between 20 and 6000),
  contract_type text not null check (contract_type in ('employment','internship','trainee','freelance','temporary','other')),
  country text not null check (char_length(country) between 2 and 100),
  city text,
  work_mode text not null check (work_mode in ('onsite','hybrid','remote','remote_international')),
  publication_language text not null check (publication_language in ('pt','en','fr','es')),
  required_languages text[] not null default '{}',
  salary_currency char(3),
  salary_min numeric check (salary_min is null or salary_min >= 0),
  salary_max numeric check (salary_max is null or salary_max >= 0),
  salary_period text check (salary_period is null or salary_period in ('hour','day','week','month','year','project')),
  status text not null default 'pending_review' check (status in ('draft','pending_review','published','paused','closed','rejected')),
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_jobs_salary_range check (salary_min is null or salary_max is null or salary_min <= salary_max)
);

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.career_jobs(id) on delete restrict,
  candidate_user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email = lower(email)),
  phone text,
  country text not null check (char_length(country) between 2 and 100),
  city text,
  cover_message text check (cover_message is null or char_length(cover_message) <= 4000),
  resume_path text,
  consent boolean not null check (consent = true),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists career_jobs_public_idx on public.career_jobs(status, published_at desc);
create index if not exists career_jobs_company_idx on public.career_jobs(company_id, created_at desc);
create index if not exists career_applications_job_idx on public.career_applications(job_id, created_at desc);

alter table public.career_companies enable row level security;
alter table public.career_jobs enable row level security;
alter table public.career_applications enable row level security;

revoke all on public.career_companies from anon, authenticated;
revoke all on public.career_jobs from anon, authenticated;
revoke all on public.career_applications from anon, authenticated;
grant select on public.career_jobs to anon, authenticated;

create policy career_jobs_public_read on public.career_jobs for select to anon, authenticated using (status = 'published');

-- Authenticated ownership policies are intentionally narrow. Anonymous submissions must go through a validated server endpoint.
grant select, insert, update on public.career_companies to authenticated;
create policy career_companies_owner_select on public.career_companies for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy career_companies_owner_insert on public.career_companies for insert to authenticated with check ((select auth.uid()) = owner_user_id);
create policy career_companies_owner_update on public.career_companies for update to authenticated using ((select auth.uid()) = owner_user_id) with check ((select auth.uid()) = owner_user_id);

grant insert, update on public.career_jobs to authenticated;
create policy career_jobs_owner_insert on public.career_jobs for insert to authenticated with check (
  status in ('draft','pending_review') and exists (select 1 from public.career_companies c where c.id=company_id and c.owner_user_id=(select auth.uid()))
);
create policy career_jobs_owner_update on public.career_jobs for update to authenticated using (
  exists (select 1 from public.career_companies c where c.id=company_id and c.owner_user_id=(select auth.uid()))
) with check (
  status in ('draft','pending_review','paused','closed') and exists (select 1 from public.career_companies c where c.id=company_id and c.owner_user_id=(select auth.uid()))
);

grant insert on public.career_applications to authenticated;
create policy career_applications_candidate_insert on public.career_applications for insert to authenticated with check (
  candidate_user_id=(select auth.uid()) and consent=true and exists (select 1 from public.career_jobs j where j.id=job_id and j.status='published')
);
grant select on public.career_applications to authenticated;
create policy career_applications_candidate_select on public.career_applications for select to authenticated using (candidate_user_id=(select auth.uid()));
