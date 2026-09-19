create table public.ldr_experience_projects (
 id uuid primary key default gen_random_uuid(),
 owner_user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 180),
 description text,
 modality text not null check (modality in ('simulation','educational_challenge','paid_microproject','sponsored_project')),
 status text not null default 'draft' check (status in ('draft','open','in_progress','completed','cancelled')),
 organization_name text,
 compensation_type text not null default 'none' check (compensation_type in ('none','fixed','sponsored')),
 compensation_amount numeric(12,2),
 currency text,
 starts_at timestamptz,
 ends_at timestamptz,
 is_public boolean not null default false,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check ((compensation_type='none' and compensation_amount is null) or (compensation_type<>'none' and compensation_amount is not null and compensation_amount>=0)),
 check (currency is null or currency ~ '^[A-Z]{3}$')
);
create table public.ldr_experience_participants (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.ldr_experience_projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 participation_role text not null default 'participant' check (participation_role in ('participant','mentor','reviewer','coordinator')),
 status text not null default 'invited' check (status in ('invited','active','completed','withdrawn','removed')),
 joined_at timestamptz, completed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(project_id,user_id)
);
create table public.ldr_experience_challenges (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.ldr_experience_projects(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 180),
 brief text, competency_keys text[] not null default '{}',
 position integer not null default 1 check(position>0),
 status text not null default 'draft' check(status in ('draft','open','completed','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(project_id,position)
);
create index ldr_experience_projects_owner_idx on public.ldr_experience_projects(owner_user_id);
create index ldr_experience_participants_user_idx on public.ldr_experience_participants(user_id);
create index ldr_experience_challenges_project_idx on public.ldr_experience_challenges(project_id);
alter table public.ldr_experience_projects enable row level security;
alter table public.ldr_experience_participants enable row level security;
alter table public.ldr_experience_challenges enable row level security;
revoke all on public.ldr_experience_projects,public.ldr_experience_participants,public.ldr_experience_challenges from anon;
grant select,insert,update,delete on public.ldr_experience_projects,public.ldr_experience_participants,public.ldr_experience_challenges to authenticated;
grant all on public.ldr_experience_projects,public.ldr_experience_participants,public.ldr_experience_challenges to service_role;
create policy "experience_projects_owner_all" on public.ldr_experience_projects for all to authenticated using ((select auth.uid())=owner_user_id) with check ((select auth.uid())=owner_user_id);
create policy "experience_projects_participant_read" on public.ldr_experience_projects for select to authenticated using (exists(select 1 from public.ldr_experience_participants p where p.project_id=id and p.user_id=(select auth.uid())));
create policy "experience_participants_owner_manage" on public.ldr_experience_participants for all to authenticated using (exists(select 1 from public.ldr_experience_projects p where p.id=project_id and p.owner_user_id=(select auth.uid()))) with check (exists(select 1 from public.ldr_experience_projects p where p.id=project_id and p.owner_user_id=(select auth.uid())));
create policy "experience_participants_read_project" on public.ldr_experience_participants for select to authenticated using (user_id=(select auth.uid()) or exists(select 1 from public.ldr_experience_projects p where p.id=project_id and p.owner_user_id=(select auth.uid())));
create policy "experience_challenges_owner_manage" on public.ldr_experience_challenges for all to authenticated using (exists(select 1 from public.ldr_experience_projects p where p.id=project_id and p.owner_user_id=(select auth.uid()))) with check (exists(select 1 from public.ldr_experience_projects p where p.id=project_id and p.owner_user_id=(select auth.uid())));
create policy "experience_challenges_participant_read" on public.ldr_experience_challenges for select to authenticated using (exists(select 1 from public.ldr_experience_participants ep where ep.project_id=project_id and ep.user_id=(select auth.uid())));
comment on table public.ldr_experience_projects is 'LDR Empresa-Escola projects. Educational and paid modalities are explicitly separated; payment processing is not implemented here.';