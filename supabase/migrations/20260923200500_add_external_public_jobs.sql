alter table public.career_jobs
  add column if not exists listing_origin text not null default 'internal',
  add column if not exists external_source_name text,
  add column if not exists external_source_url text,
  add column if not exists external_apply_url text,
  add column if not exists external_checked_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'career_jobs_listing_origin_check'
      and conrelid = 'public.career_jobs'::regclass
  ) then
    alter table public.career_jobs
      add constraint career_jobs_listing_origin_check
      check (listing_origin in ('internal','external_public'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'career_jobs_external_urls_check'
      and conrelid = 'public.career_jobs'::regclass
  ) then
    alter table public.career_jobs
      add constraint career_jobs_external_urls_check
      check (
        (external_source_url is null or external_source_url ~* '^https?://')
        and (external_apply_url is null or external_apply_url ~* '^https?://')
      );
  end if;
end $$;
