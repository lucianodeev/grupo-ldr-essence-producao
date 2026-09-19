-- Harden B2B institutional MVP and add verifiable operational metrics.
-- Additive; review in preview before applying to production.
create or replace function public.academy_is_institution_staff(p_institution_id uuid)
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.academy_institution_members m where m.institution_id=p_institution_id and m.user_id=auth.uid() and m.status='active')
 or exists(select 1 from public.academy_institutions i where i.id=p_institution_id and i.owner_user_id=auth.uid());
$$;
revoke all on function public.academy_is_institution_staff(uuid) from public,anon;
grant execute on function public.academy_is_institution_staff(uuid) to authenticated,service_role;

create table if not exists public.academy_institution_events (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid not null references public.academy_institutions(id) on delete cascade,
 student_user_id uuid references auth.users(id) on delete cascade,
 event_type text not null check(event_type in ('student_linked','student_activated','journey_started','journey_completed','learning_activity_completed','career_opportunity_viewed','career_application_submitted','competency_evidence_recorded')),
 source text not null default 'academy',
 occurred_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists academy_institution_events_rollup_idx on public.academy_institution_events(institution_id,event_type,occurred_at desc);
alter table public.academy_institution_events enable row level security;
revoke all on public.academy_institution_events from anon;
grant select,insert on public.academy_institution_events to authenticated;
grant all on public.academy_institution_events to service_role;
create policy "academy_events_staff_read" on public.academy_institution_events for select to authenticated using(public.academy_is_institution_staff(institution_id) or student_user_id=auth.uid());
create policy "academy_events_self_insert" on public.academy_institution_events for insert to authenticated with check(student_user_id=auth.uid() and exists(select 1 from public.academy_institution_students s where s.institution_id=academy_institution_events.institution_id and s.student_user_id=auth.uid() and s.status in ('active','completed')));
comment on table public.academy_institution_events is 'Verifiable operational events only. Do not use as causal impact evidence or automated academic decision input.';

create or replace function public.academy_institution_metrics(p_institution_id uuid)
returns table(linked_students bigint,active_students bigint,open_signals bigint,high_attention_signals bigint,journeys_started bigint,journeys_completed bigint,career_applications bigint)
language sql stable security definer set search_path=public,pg_temp as $$
 select
 (select count(*) from public.academy_institution_students s where s.institution_id=p_institution_id),
 (select count(*) from public.academy_institution_students s where s.institution_id=p_institution_id and s.status='active'),
 (select count(*) from public.academy_student_attention_signals a where a.institution_id=p_institution_id and a.resolved_at is null),
 (select count(*) from public.academy_student_attention_signals a where a.institution_id=p_institution_id and a.resolved_at is null and a.severity='high_attention'),
 (select count(*) from public.academy_institution_events e where e.institution_id=p_institution_id and e.event_type='journey_started'),
 (select count(*) from public.academy_institution_events e where e.institution_id=p_institution_id and e.event_type='journey_completed'),
 (select count(*) from public.academy_institution_events e where e.institution_id=p_institution_id and e.event_type='career_application_submitted')
 where public.academy_is_institution_staff(p_institution_id);
$$;
revoke all on function public.academy_institution_metrics(uuid) from public,anon;
grant execute on function public.academy_institution_metrics(uuid) to authenticated,service_role;

-- Explicit negative-path checks for preview/staging:
-- 1. user from institution A cannot SELECT institution B students/events/signals.
-- 2. ordinary authenticated user without membership receives zero institutional rows.
-- 3. anon receives no table privileges.
-- 4. students may read only their own linkage/signals/events where policy permits.
