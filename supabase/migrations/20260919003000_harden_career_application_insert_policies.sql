-- Harden public/authenticated application submission. Policies are permissive (OR),
-- so anonymous submission must not also apply to authenticated users.
drop policy if exists "Public can submit career applications" on public.career_applications;
drop policy if exists "Anonymous candidates can submit career applications" on public.career_applications;
drop policy if exists "Authenticated candidates can submit own career applications" on public.career_applications;

create policy "Anonymous candidates can submit career applications"
on public.career_applications for insert to anon
with check (
  candidate_user_id is null and status = 'submitted'
  and company_note is null and rejection_reason is null and triaged_by is null and triaged_at is null
  and nullif(btrim(candidate_name), '') is not null
  and nullif(btrim(candidate_email), '') is not null
  and nullif(btrim(summary), '') is not null
  and claim_token_hash ~ '^[0-9a-f]{64}$'
  and exists (select 1 from public.career_jobs j where j.id = career_applications.job_id and j.status = 'published')
);

create policy "Authenticated candidates can submit own career applications"
on public.career_applications for insert to authenticated
with check (
  candidate_user_id = (select auth.uid()) and status = 'submitted'
  and company_note is null and rejection_reason is null and triaged_by is null and triaged_at is null
  and claim_token_hash is null
  and nullif(btrim(candidate_name), '') is not null
  and nullif(btrim(candidate_email), '') is not null
  and nullif(btrim(summary), '') is not null
  and exists (select 1 from public.career_jobs j where j.id = career_applications.job_id and j.status = 'published')
);
