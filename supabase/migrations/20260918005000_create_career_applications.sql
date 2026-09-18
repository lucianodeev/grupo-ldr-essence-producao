-- LDR Carreira Marketplace — candidaturas por vaga.
-- Preparado nesta branch para revisão. NÃO aplicado automaticamente no Supabase produção.
-- Aplicar somente após validação do preview, revisão de RLS e autorização explícita.

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.career_jobs(id) on delete cascade,
  candidate_name text not null,
  candidate_email text not null,
  candidate_phone text,
  candidate_location text,
  profile_url text,
  summary text not null,
  accessibility_needs text,
  communication_preference text,
  share_accessibility_with_company boolean not null default false,
  allow_ldr_accessibility_support boolean not null default false,
  status text not null default 'submitted',
  company_note text,
  rejection_reason text,
  triaged_by uuid references auth.users(id) on delete set null,
  triaged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_applications_status_check check (
    status in ('submitted','received','in_review','interview','finalist','rejected','hired','archived')
  )
);

create index if not exists career_applications_job_id_idx on public.career_applications(job_id);
create index if not exists career_applications_status_idx on public.career_applications(status);
create index if not exists career_applications_candidate_email_idx on public.career_applications(lower(candidate_email));
create index if not exists career_applications_created_at_idx on public.career_applications(created_at desc);

create or replace function public.set_career_applications_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  if new.status is distinct from old.status then
    new.triaged_at = coalesce(new.triaged_at, now());
    new.triaged_by = coalesce(new.triaged_by, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_career_applications_updated_at on public.career_applications;
create trigger trg_career_applications_updated_at
before update on public.career_applications
for each row execute function public.set_career_applications_updated_at();

alter table public.career_applications enable row level security;

grant insert on public.career_applications to anon, authenticated;
grant select, update on public.career_applications to authenticated;

-- Envio público de candidatura. A validação de dados obrigatórios também acontece no front-end.
drop policy if exists "Public can submit career applications" on public.career_applications;
create policy "Public can submit career applications"
on public.career_applications
for insert
to anon, authenticated
with check (
  candidate_name is not null
  and candidate_email is not null
  and summary is not null
);

-- Empresas autenticadas visualizam somente candidaturas das suas próprias vagas.
drop policy if exists "Company owners can read own career applications" on public.career_applications;
create policy "Company owners can read own career applications"
on public.career_applications
for select
to authenticated
using (
  exists (
    select 1
    from public.career_jobs j
    join public.career_companies c on c.id = j.company_id
    where j.id = career_applications.job_id
      and c.owner_user_id = auth.uid()
  )
);

-- Empresas autenticadas podem atualizar somente status/notas das suas próprias candidaturas.
drop policy if exists "Company owners can triage own career applications" on public.career_applications;
create policy "Company owners can triage own career applications"
on public.career_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.career_jobs j
    join public.career_companies c on c.id = j.company_id
    where j.id = career_applications.job_id
      and c.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.career_jobs j
    join public.career_companies c on c.id = j.company_id
    where j.id = career_applications.job_id
      and c.owner_user_id = auth.uid()
  )
);
