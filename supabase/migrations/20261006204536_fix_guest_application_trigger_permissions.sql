-- Guest access exists only inside the existing application triggers.
grant insert on public.career_selection_journeys to anon;
grant select (application_id) on public.career_selection_journeys to anon;
create policy "Application trigger creates guest journey" on public.career_selection_journeys for insert to anon
with check (pg_trigger_depth() = 1 and status = 'in_preparation');
grant insert on public.career_journey_stages to anon;
grant select (journey_id, stage_key) on public.career_journey_stages to anon;
create policy "Application trigger seeds guest journey stages" on public.career_journey_stages for insert to anon
with check (pg_trigger_depth() = 2 and stage_key in ('preparation','knowledge_evidence','development','practical_validation','human_review','referral') and status in ('available','pending'));
create policy "Application trigger checks guest journey" on public.career_selection_journeys for select to anon using (pg_trigger_depth() = 1);
create policy "Application trigger checks guest stages" on public.career_journey_stages for select to anon using (pg_trigger_depth() = 2);
