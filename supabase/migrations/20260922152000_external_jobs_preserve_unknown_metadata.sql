-- External public jobs must preserve unknown source metadata instead of inheriting
-- internal marketplace assumptions. Internal job defaults remain unchanged.
-- Prepared for review only; not applied automatically to production.

alter table public.career_jobs add column if not exists external_work_mode text;
alter table public.career_jobs add column if not exists external_contract_type text;
alter table public.career_jobs add column if not exists external_publication_language text;

comment on column public.career_jobs.external_work_mode is 'Source-provided work mode for external_public jobs; null means unknown.';
comment on column public.career_jobs.external_contract_type is 'Source-provided contract type for external_public jobs; null means unknown.';
comment on column public.career_jobs.external_publication_language is 'Source-provided publication language for external_public jobs; null means unknown.';
