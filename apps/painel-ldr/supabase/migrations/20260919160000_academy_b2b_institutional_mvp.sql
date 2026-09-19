-- LDR Academy B2B institutional MVP foundation.
-- Additive only. Apply after RLS review and preview validation.
create table if not exists public.academy_institutions (
 id uuid primary key default gen_random_uuid(),
 owner_user_id uuid not null references auth.users(id) on delete restrict,
 name text not null check(char_length(name) between 2 and 180),
 country text, city text,
 status text not null default 'pilot' check(status in ('pilot','active','paused','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.academy_institution_members (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid not null references public.academy_institutions(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'viewer' check(role in ('owner','admin','coordinator','viewer')),
 status text not null default 'active' check(status in ('invited','active','disabled')),
 created_at timestamptz not null default now(),
 unique(institution_id,user_id)
);
create table if not exists public.academy_institution_students (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid not null references public.academy_institutions(id) on delete cascade,
 student_user_id uuid not null references auth.users(id) on delete cascade,
 external_student_ref text, course_label text,
 status text not null default 'active' check(status in ('invited','active','inactive','completed')),
 joined_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(institution_id,student_user_id)
);
create table if not exists public.academy_student_attention_signals (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid not null references public.academy_institutions(id) on delete cascade,
 student_user_id uuid not null references auth.users(id) on delete cascade,
 signal_type text not null check(signal_type in ('engagement','participation','learning_progress','career_progress','manual_follow_up')),
 severity text not null default 'info' check(severity in ('info','attention','high_attention')),
 title text not null check(char_length(title) between 1 and 180),
 rationale jsonb not null default '{}'::jsonb,
 source_type text not null default 'observed' check(source_type in ('observed','rule','manual')),
 observed_at timestamptz not null default now(), resolved_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists academy_institution_members_user_idx on public.academy_institution_members(user_id,institution_id);
create index if not exists academy_institution_students_institution_idx on public.academy_institution_students(institution_id,status);
create index if not exists academy_attention_institution_idx on public.academy_student_attention_signals(institution_id,severity,observed_at desc);
alter table public.academy_institutions enable row level security;
alter table public.academy_institution_members enable row level security;
alter table public.academy_institution_students enable row level security;
alter table public.academy_student_attention_signals enable row level security;
revoke all on public.academy_institutions,public.academy_institution_members,public.academy_institution_students,public.academy_student_attention_signals from anon;
grant select,insert,update on public.academy_institutions,public.academy_institution_members,public.academy_institution_students,public.academy_student_attention_signals to authenticated;
grant all on public.academy_institutions,public.academy_institution_members,public.academy_institution_students,public.academy_student_attention_signals to service_role;
create policy "academy_institutions_member_read" on public.academy_institutions for select to authenticated using(owner_user_id=(select auth.uid()) or exists(select 1 from public.academy_institution_members m where m.institution_id=id and m.user_id=(select auth.uid()) and m.status='active'));
create policy "academy_institutions_owner_insert" on public.academy_institutions for insert to authenticated with check(owner_user_id=(select auth.uid()));
create policy "academy_institutions_owner_update" on public.academy_institutions for update to authenticated using(owner_user_id=(select auth.uid())) with check(owner_user_id=(select auth.uid()));
create policy "academy_members_read" on public.academy_institution_members for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid())));
create policy "academy_members_owner_manage" on public.academy_institution_members for insert to authenticated with check(exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid())));
create policy "academy_members_owner_update" on public.academy_institution_members for update to authenticated using(exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))) with check(exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid())));
create policy "academy_students_staff_read" on public.academy_institution_students for select to authenticated using(student_user_id=(select auth.uid()) or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_institution_students.institution_id and m.user_id=(select auth.uid()) and m.status='active'));
create policy "academy_students_admin_insert" on public.academy_institution_students for insert to authenticated with check(exists(select 1 from public.academy_institution_members m where m.institution_id=academy_institution_students.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator')));
create policy "academy_students_admin_update" on public.academy_institution_students for update to authenticated using(exists(select 1 from public.academy_institution_members m where m.institution_id=academy_institution_students.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator'))) with check(exists(select 1 from public.academy_institution_members m where m.institution_id=academy_institution_students.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator')));
create policy "academy_signals_staff_read" on public.academy_student_attention_signals for select to authenticated using(student_user_id=(select auth.uid()) or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_student_attention_signals.institution_id and m.user_id=(select auth.uid()) and m.status='active'));
create policy "academy_signals_staff_insert" on public.academy_student_attention_signals for insert to authenticated with check(exists(select 1 from public.academy_institution_members m where m.institution_id=academy_student_attention_signals.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator')));
comment on table public.academy_student_attention_signals is 'Observed/rule/manual follow-up signals for human review. Not a predictive dropout model and not an automated academic decision system.';