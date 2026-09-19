create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.academy_is_institution_owner(p_institution_id uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$ select exists(select 1 from public.academy_institutions i where i.id=p_institution_id and i.owner_user_id=auth.uid()) $$;

create or replace function private.academy_has_institution_role(p_institution_id uuid, p_roles text[] default null)
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$ select exists(select 1 from public.academy_institution_members m where m.institution_id=p_institution_id and m.user_id=auth.uid() and m.status='active' and (p_roles is null or m.role=any(p_roles))) $$;

revoke all on function private.academy_is_institution_owner(uuid) from public, anon;
revoke all on function private.academy_has_institution_role(uuid,text[]) from public, anon;
grant execute on function private.academy_is_institution_owner(uuid) to authenticated, service_role;
grant execute on function private.academy_has_institution_role(uuid,text[]) to authenticated, service_role;

alter policy academy_institutions_member_read on public.academy_institutions using(owner_user_id=auth.uid() or private.academy_has_institution_role(id,null));
alter policy academy_members_owner_manage on public.academy_institution_members with check(private.academy_is_institution_owner(institution_id));
alter policy academy_members_owner_update on public.academy_institution_members using(private.academy_is_institution_owner(institution_id)) with check(private.academy_is_institution_owner(institution_id));
alter policy academy_members_read on public.academy_institution_members using(user_id=auth.uid() or private.academy_is_institution_owner(institution_id));
alter policy academy_students_admin_insert on public.academy_institution_students with check(private.academy_is_institution_owner(institution_id) or private.academy_has_institution_role(institution_id,array['owner','admin','coordinator']));
alter policy academy_students_admin_update on public.academy_institution_students using(private.academy_is_institution_owner(institution_id) or private.academy_has_institution_role(institution_id,array['owner','admin','coordinator'])) with check(private.academy_is_institution_owner(institution_id) or private.academy_has_institution_role(institution_id,array['owner','admin','coordinator']));
alter policy academy_students_staff_read on public.academy_institution_students using(student_user_id=auth.uid() or private.academy_is_institution_owner(institution_id) or private.academy_has_institution_role(institution_id,null));
alter policy academy_signals_staff_insert on public.academy_student_attention_signals with check(private.academy_is_institution_owner(institution_id) or private.academy_has_institution_role(institution_id,array['owner','admin','coordinator']));
alter policy academy_signals_staff_read on public.academy_student_attention_signals using(student_user_id=auth.uid() or private.academy_is_institution_owner(institution_id) or private.academy_has_institution_role(institution_id,null));
alter policy academy_signals_staff_update on public.academy_student_attention_signals using(private.academy_is_institution_owner(institution_id) or private.academy_has_institution_role(institution_id,array['owner','admin','coordinator'])) with check(private.academy_is_institution_owner(institution_id) or private.academy_has_institution_role(institution_id,array['owner','admin','coordinator']));

drop function public.academy_has_institution_role(uuid,text[]);
drop function public.academy_is_institution_owner(uuid);
