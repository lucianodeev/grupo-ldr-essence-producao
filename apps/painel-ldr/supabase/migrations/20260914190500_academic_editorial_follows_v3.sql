-- Social V3 follow support for transparent editorial profiles.
create table if not exists public.academic_editorial_follows (
  editorial_profile_id uuid not null references public.academic_editorial_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(editorial_profile_id,user_id)
);

alter table public.academic_editorial_follows enable row level security;

drop policy if exists academic_editorial_follows_own_select on public.academic_editorial_follows;
create policy academic_editorial_follows_own_select on public.academic_editorial_follows for select to authenticated using(user_id=auth.uid());
drop policy if exists academic_editorial_follows_own_insert on public.academic_editorial_follows;
create policy academic_editorial_follows_own_insert on public.academic_editorial_follows for insert to authenticated with check(user_id=auth.uid());
drop policy if exists academic_editorial_follows_own_delete on public.academic_editorial_follows;
create policy academic_editorial_follows_own_delete on public.academic_editorial_follows for delete to authenticated using(user_id=auth.uid());

grant select,insert,delete on public.academic_editorial_follows to authenticated;
revoke all on public.academic_editorial_follows from anon;
create index if not exists academic_editorial_follows_user_idx on public.academic_editorial_follows(user_id,created_at desc);
