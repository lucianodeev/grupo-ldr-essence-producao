-- Prevent recursive RLS evaluation across institutional tables.
-- Helper functions run with the function owner's privileges and expose booleans only.
create or replace function public.academy_is_institution_owner(p_institution_id uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$ select exists(select 1 from public.academy_institutions i where i.id=p_institution_id and i.owner_user_id=auth.uid()) $$;

create or replace function public.academy_has_institution_role(p_institution_id uuid, p_roles text[] default null)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$ select exists(select 1 from public.academy_institution_members m where m.institution_id=p_institution_id and m.user_id=auth.uid() and m.status='active' and (p_roles is null or m.role=any(p_roles))) $$;

revoke all on function public.academy_is_institution_owner(uuid) from public,anon;
revoke all on function public.academy_has_institution_role(uuid,text[]) from public,anon;
grant execute on function public.academy_is_institution_owner(uuid) to authenticated;
grant execute on function public.academy_has_institution_role(uuid,text[]) to authenticated;

drop policy if exists "academy_institutions_member_read" on public.academy_institutions;
create policy "academy_institutions_member_read" on public.academy_institutions for select to authenticated
using(owner_user_id=auth.uid() or public.academy_has_institution_role(id,null));

drop policy if exists "academy_members_read" on public.academy_institution_members;
create policy "academy_members_read" on public.academy_institution_members for select to authenticated
using(user_id=auth.uid() or public.academy_is_institution_owner(institution_id));

drop policy if exists "academy_members_owner_manage" on public.academy_institution_members;
create policy "academy_members_owner_manage" on public.academy_institution_members for insert to authenticated
with check(public.academy_is_institution_owner(institution_id));

drop policy if exists "academy_members_owner_update" on public.academy_institution_members;
create policy "academy_members_owner_update" on public.academy_institution_members for update to authenticated
using(public.academy_is_institution_owner(institution_id))
with check(public.academy_is_institution_owner(institution_id));

drop policy if exists "academy_students_staff_read" on public.academy_institution_students;
create policy "academy_students_staff_read" on public.academy_institution_students for select to authenticated
using(student_user_id=auth.uid() or public.academy_is_institution_owner(institution_id) or public.academy_has_institution_role(institution_id,null));

drop policy if exists "academy_students_admin_insert" on public.academy_institution_students;
create policy "academy_students_admin_insert" on public.academy_institution_students for insert to authenticated
with check(public.academy_is_institution_owner(institution_id) or public.academy_has_institution_role(institution_id,array['owner','admin','coordinator']));

drop policy if exists "academy_students_admin_update" on public.academy_institution_students;
create policy "academy_students_admin_update" on public.academy_institution_students for update to authenticated
using(public.academy_is_institution_owner(institution_id) or public.academy_has_institution_role(institution_id,array['owner','admin','coordinator']))
with check(public.academy_is_institution_owner(institution_id) or public.academy_has_institution_role(institution_id,array['owner','admin','coordinator']));

drop policy if exists "academy_signals_staff_read" on public.academy_student_attention_signals;
create policy "academy_signals_staff_read" on public.academy_student_attention_signals for select to authenticated
using(student_user_id=auth.uid() or public.academy_is_institution_owner(institution_id) or public.academy_has_institution_role(institution_id,null));

drop policy if exists "academy_signals_staff_insert" on public.academy_student_attention_signals;
create policy "academy_signals_staff_insert" on public.academy_student_attention_signals for insert to authenticated
with check(public.academy_is_institution_owner(institution_id) or public.academy_has_institution_role(institution_id,array['owner','admin','coordinator']));

drop policy if exists "academy_signals_staff_update" on public.academy_student_attention_signals;
create policy "academy_signals_staff_update" on public.academy_student_attention_signals for update to authenticated
using(public.academy_is_institution_owner(institution_id) or public.academy_has_institution_role(institution_id,array['owner','admin','coordinator']))
with check(public.academy_is_institution_owner(institution_id) or public.academy_has_institution_role(institution_id,array['owner','admin','coordinator']));
