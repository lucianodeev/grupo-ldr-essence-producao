-- Social V3 onboarding preferences. Own-user only; no automatic follows.
create table if not exists public.academic_network_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interests text[] not null default '{}',
  onboarding_completed boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.academic_network_preferences enable row level security;
drop policy if exists academic_network_preferences_own_select on public.academic_network_preferences;
create policy academic_network_preferences_own_select on public.academic_network_preferences for select to authenticated using(user_id=auth.uid());
drop policy if exists academic_network_preferences_own_insert on public.academic_network_preferences;
create policy academic_network_preferences_own_insert on public.academic_network_preferences for insert to authenticated with check(user_id=auth.uid());
drop policy if exists academic_network_preferences_own_update on public.academic_network_preferences;
create policy academic_network_preferences_own_update on public.academic_network_preferences for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update on public.academic_network_preferences to authenticated;
revoke all on public.academic_network_preferences from anon;
