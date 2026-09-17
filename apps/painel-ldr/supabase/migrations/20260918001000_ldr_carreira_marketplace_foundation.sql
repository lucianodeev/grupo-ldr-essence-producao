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


-- Free ATS foundation: recruitment stages, private company notes and auditable stage history.
create table if not exists public.career_recruitment_stages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.career_applications(id) on delete cascade,
  company_id uuid not null references public.career_companies(id) on delete cascade,
  stage text not null default 'new' check (stage in ('new','review','interview','final','selected','not_selected','withdrawn')),
  interview_at timestamptz,
  interview_mode text check (interview_mode is null or interview_mode in ('online','onsite')),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(application_id)
);

create table if not exists public.career_application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.career_applications(id) on delete cascade,
  company_id uuid not null references public.career_companies(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  note text not null check (char_length(note) between 1 and 3000),
  created_at timestamptz not null default now()
);

create table if not exists public.career_application_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.career_applications(id) on delete cascade,
  company_id uuid not null references public.career_companies(id) on delete cascade,
  event_type text not null check (event_type in ('application_received','stage_changed','interview_scheduled','selected','not_selected','withdrawn','process_closed')),
  from_stage text,
  to_stage text,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists career_recruitment_company_idx on public.career_recruitment_stages(company_id, stage, updated_at desc);
create index if not exists career_notes_application_idx on public.career_application_notes(application_id, created_at desc);
create index if not exists career_history_application_idx on public.career_application_history(application_id, created_at desc);

alter table public.career_recruitment_stages enable row level security;
alter table public.career_application_notes enable row level security;
alter table public.career_application_history enable row level security;

revoke all on public.career_recruitment_stages from anon, authenticated;
revoke all on public.career_application_notes from anon, authenticated;
revoke all on public.career_application_history from anon, authenticated;

grant select, insert, update on public.career_recruitment_stages to authenticated;
grant select, insert on public.career_application_notes to authenticated;
grant select on public.career_application_history to authenticated;

create policy career_recruitment_company_select on public.career_recruitment_stages for select to authenticated using (
  exists (select 1 from public.career_companies c where c.id=company_id and c.owner_user_id=(select auth.uid()))
);
create policy career_recruitment_company_insert on public.career_recruitment_stages for insert to authenticated with check (
  updated_by=(select auth.uid()) and exists (
    select 1 from public.career_applications a
    join public.career_jobs j on j.id=a.job_id
    join public.career_companies c on c.id=j.company_id
    where a.id=application_id and c.id=company_id and c.owner_user_id=(select auth.uid())
  )
);
create policy career_recruitment_company_update on public.career_recruitment_stages for update to authenticated using (
  exists (select 1 from public.career_companies c where c.id=company_id and c.owner_user_id=(select auth.uid()))
) with check (
  updated_by=(select auth.uid()) and exists (
    select 1 from public.career_applications a
    join public.career_jobs j on j.id=a.job_id
    where a.id=application_id and j.company_id=company_id
  )
);

create policy career_notes_company_select on public.career_application_notes for select to authenticated using (
  exists (select 1 from public.career_companies c where c.id=company_id and c.owner_user_id=(select auth.uid()))
);
create policy career_notes_company_insert on public.career_application_notes for insert to authenticated with check (
  author_user_id=(select auth.uid()) and exists (
    select 1 from public.career_applications a
    join public.career_jobs j on j.id=a.job_id
    join public.career_companies c on c.id=j.company_id
    where a.id=application_id and c.id=company_id and c.owner_user_id=(select auth.uid())
  )
);

create policy career_history_company_select on public.career_application_history for select to authenticated using (
  exists (select 1 from public.career_companies c where c.id=company_id and c.owner_user_id=(select auth.uid()))
);

-- Company access to applications is limited to applications received by its own jobs.
create policy career_applications_company_select on public.career_applications for select to authenticated using (
  exists (
    select 1 from public.career_jobs j
    join public.career_companies c on c.id=j.company_id
    where j.id=job_id and c.owner_user_id=(select auth.uid())
  )
);

-- Candidate-visible history is intentionally NOT granted. Internal notes/history remain company-private.


-- Candidate profile foundation for Part 2/7. Private by default; no public candidate directory.
create table if not exists public.career_candidate_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 120),
  professional_title text check (professional_title is null or char_length(professional_title) <= 160),
  professional_summary text check (professional_summary is null or char_length(professional_summary) <= 3000),
  country text not null check (char_length(country) between 2 and 100),
  city text,
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  availability text check (availability is null or availability in ('available','open','unavailable')),
  work_modes text[] not null default '{}',
  resume_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_candidate_work_modes check (work_modes <@ array['onsite','hybrid','remote','remote_international']::text[])
);

alter table public.career_candidate_profiles enable row level security;
revoke all on public.career_candidate_profiles from anon, authenticated;
grant select, insert, update on public.career_candidate_profiles to authenticated;

create policy career_candidate_profiles_owner_select on public.career_candidate_profiles
for select to authenticated using (user_id=(select auth.uid()));

create policy career_candidate_profiles_owner_insert on public.career_candidate_profiles
for insert to authenticated with check (user_id=(select auth.uid()));

create policy career_candidate_profiles_owner_update on public.career_candidate_profiles
for update to authenticated using (user_id=(select auth.uid()))
with check (user_id=(select auth.uid()));

-- Resume bucket remains private. Storage object access is scoped to a top-level folder named with auth.uid().
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('career-resumes','career-resumes',false,5242880,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create policy career_resume_owner_insert on storage.objects for insert to authenticated
with check (bucket_id='career-resumes' and (storage.foldername(name))[1]=(select auth.uid())::text);

create policy career_resume_owner_select on storage.objects for select to authenticated
using (bucket_id='career-resumes' and (storage.foldername(name))[1]=(select auth.uid())::text);

create policy career_resume_owner_update on storage.objects for update to authenticated
using (bucket_id='career-resumes' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='career-resumes' and (storage.foldername(name))[1]=(select auth.uid())::text);

create policy career_resume_owner_delete on storage.objects for delete to authenticated
using (bucket_id='career-resumes' and (storage.foldername(name))[1]=(select auth.uid())::text);


-- Part 3 moderation hardening. Publication/rejection remains an administrative action.
create or replace function public.career_admin_set_job_status(p_job_id uuid, p_status text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_status not in ('published','rejected') then
    raise exception 'invalid moderation status';
  end if;
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  update public.career_jobs
     set status=p_status,
         published_at=case when p_status='published' then coalesce(published_at,now()) else published_at end,
         updated_at=now()
   where id=p_job_id and status='pending_review';
  if not found then raise exception 'job is not pending review'; end if;
end;
$$;
revoke all on function public.career_admin_set_job_status(uuid,text) from public, anon;
grant execute on function public.career_admin_set_job_status(uuid,text) to authenticated;

-- Explicit admin visibility for moderation queue; company-owner policies remain separate.
create policy career_jobs_admin_select on public.career_jobs
for select to authenticated using (public.is_admin());

-- Prevent direct client UPDATE into moderation-only states even when an existing owner policy is broadened later.
create or replace function public.career_jobs_block_owner_moderation()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.status in ('published','rejected') and old.status is distinct from new.status then
   if not public.is_admin() then raise exception 'moderation status requires admin'; end if;
 end if;
 return new;
end; $$;
drop trigger if exists career_jobs_block_owner_moderation_trigger on public.career_jobs;
create trigger career_jobs_block_owner_moderation_trigger
before update on public.career_jobs for each row execute function public.career_jobs_block_owner_moderation();


-- Part 4 ATS hardening: stage rows cannot be reassigned across companies/applications.
drop policy if exists career_recruitment_company_update on public.career_recruitment_stages;
create policy career_recruitment_company_update on public.career_recruitment_stages
for update to authenticated
using (
 exists (
  select 1 from public.career_companies c
  join public.career_jobs j on j.company_id=c.id
  join public.career_applications a on a.job_id=j.id
  where c.id=career_recruitment_stages.company_id
    and a.id=career_recruitment_stages.application_id
    and c.owner_user_id=(select auth.uid())
 )
)
with check (
 exists (
  select 1 from public.career_companies c
  join public.career_jobs j on j.company_id=c.id
  join public.career_applications a on a.job_id=j.id
  where c.id=career_recruitment_stages.company_id
    and a.id=career_recruitment_stages.application_id
    and c.owner_user_id=(select auth.uid())
 )
);

alter table public.career_jobs add column if not exists close_reason text
 check (close_reason is null or close_reason in ('filled','process_closed','cancelled'));

-- Company closes only its own job; publication remains moderation-only.
create policy career_jobs_owner_close on public.career_jobs
for update to authenticated
using (
 exists(select 1 from public.career_companies c where c.id=career_jobs.company_id and c.owner_user_id=(select auth.uid()))
)
with check (
 status in ('draft','pending_review','paused','closed')
 and exists(select 1 from public.career_companies c where c.id=career_jobs.company_id and c.owner_user_id=(select auth.uid()))
);


-- Part 4 auditable ATS history generated by the database, not arbitrary frontend writes.
create or replace function public.career_log_stage_change()
returns trigger language plpgsql security invoker set search_path='' as $$
declare evt text;
begin
 evt:=case new.stage when 'selected' then 'selected' when 'not_selected' then 'not_selected'
      when 'withdrawn' then 'withdrawn' when 'interview' then 'interview_scheduled'
      else 'stage_changed' end;
 insert into public.career_application_history(application_id,company_id,event_type,from_stage,to_stage,actor_user_id)
 values(new.application_id,new.company_id,evt,case when tg_op='UPDATE' then old.stage else null end,new.stage,(select auth.uid()));
 return new;
end; $$;
drop trigger if exists career_log_stage_change_trigger on public.career_recruitment_stages;
create trigger career_log_stage_change_trigger after insert or update of stage,interview_at,interview_mode
on public.career_recruitment_stages for each row execute function public.career_log_stage_change();

-- Candidate may see only a deliberately safe status projection through a security-invoker view.
create or replace view public.career_my_applications
with (security_invoker=true) as
select a.id,a.candidate_user_id,a.created_at,j.title,j.status as job_status,c.name as company_name,
       coalesce(s.stage,'new') as application_stage,s.updated_at
from public.career_applications a
join public.career_jobs j on j.id=a.job_id
join public.career_companies c on c.id=j.company_id
left join public.career_recruitment_stages s on s.application_id=a.id
where a.candidate_user_id=(select auth.uid());
revoke all on public.career_my_applications from anon,authenticated;
grant select on public.career_my_applications to authenticated;


-- Additive freelancer opportunity metadata. Existing employment/ATS records remain unchanged.
alter table public.career_jobs add column if not exists freelance_project_type text
 check (freelance_project_type is null or freelance_project_type in ('one_off','recurring'));
alter table public.career_jobs add column if not exists timezone text;
alter table public.career_jobs add column if not exists expected_start_date date;
alter table public.career_jobs add column if not exists estimated_duration text;
alter table public.career_jobs add column if not exists availability_details text;
alter table public.career_jobs add column if not exists estimated_workload text;

-- Keep freelancer as a job/application flow, not a marketplace service offer.
comment on column public.career_jobs.freelance_project_type is
'Optional metadata for freelancer job opportunities handled through the existing moderated ATS.';
