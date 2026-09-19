-- LDR Academy B2B institutional MVP RLS hardening.
-- Additive follow-up to the foundation migration. Validate before production.

-- Owners must be able to operate their institution even before an explicit member row exists.
drop policy if exists "academy_students_staff_read" on public.academy_institution_students;
create policy "academy_students_staff_read" on public.academy_institution_students
for select to authenticated using (
 student_user_id=(select auth.uid())
 or exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))
 or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_institution_students.institution_id and m.user_id=(select auth.uid()) and m.status='active')
);

drop policy if exists "academy_students_admin_insert" on public.academy_institution_students;
create policy "academy_students_admin_insert" on public.academy_institution_students
for insert to authenticated with check (
 exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))
 or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_institution_students.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator'))
);

drop policy if exists "academy_students_admin_update" on public.academy_institution_students;
create policy "academy_students_admin_update" on public.academy_institution_students
for update to authenticated using (
 exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))
 or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_institution_students.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator'))
) with check (
 exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))
 or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_institution_students.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator'))
);

drop policy if exists "academy_signals_staff_read" on public.academy_student_attention_signals;
create policy "academy_signals_staff_read" on public.academy_student_attention_signals
for select to authenticated using (
 student_user_id=(select auth.uid())
 or exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))
 or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_student_attention_signals.institution_id and m.user_id=(select auth.uid()) and m.status='active')
);

drop policy if exists "academy_signals_staff_insert" on public.academy_student_attention_signals;
create policy "academy_signals_staff_insert" on public.academy_student_attention_signals
for insert to authenticated with check (
 exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))
 or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_student_attention_signals.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator'))
);

create policy "academy_signals_staff_update" on public.academy_student_attention_signals
for update to authenticated using (
 exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))
 or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_student_attention_signals.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator'))
) with check (
 exists(select 1 from public.academy_institutions i where i.id=institution_id and i.owner_user_id=(select auth.uid()))
 or exists(select 1 from public.academy_institution_members m where m.institution_id=academy_student_attention_signals.institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('owner','admin','coordinator'))
);
