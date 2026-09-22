-- Evolução aditiva do LDR Carreira para vagas públicas externas.
-- Não cria um segundo portal de vagas e não executa coleta externa por si só.
-- A ingestão deve respeitar os termos da fonte, manter rastreabilidade e passar por validação antes de publicar.

alter table public.career_jobs add column if not exists source_type text not null default 'internal'
  check (source_type in ('internal','external_public'));
alter table public.career_jobs add column if not exists source_name text;
alter table public.career_jobs add column if not exists source_url text;
alter table public.career_jobs add column if not exists external_reference text;
alter table public.career_jobs add column if not exists external_apply_url text;
alter table public.career_jobs add column if not exists source_published_at timestamptz;
alter table public.career_jobs add column if not exists source_checked_at timestamptz;
alter table public.career_jobs add column if not exists source_expires_at timestamptz;
alter table public.career_jobs add column if not exists source_active boolean not null default true;

create unique index if not exists career_jobs_external_source_reference_uidx
  on public.career_jobs(source_name,external_reference)
  where source_type='external_public' and external_reference is not null;

create unique index if not exists career_jobs_external_source_url_uidx
  on public.career_jobs(source_url)
  where source_type='external_public' and source_url is not null;

create index if not exists career_jobs_source_active_idx
  on public.career_jobs(source_type,source_active,source_checked_at desc);

comment on column public.career_jobs.source_type is 'internal = publicada no ecossistema; external_public = descoberta em fonte pública externa.';
comment on column public.career_jobs.source_url is 'URL pública canônica da fonte original para rastreabilidade.';
comment on column public.career_jobs.external_apply_url is 'URL de candidatura da fonte original quando a candidatura não ocorre no ecossistema.';
comment on column public.career_jobs.source_checked_at is 'Última verificação conhecida de disponibilidade na fonte.';
