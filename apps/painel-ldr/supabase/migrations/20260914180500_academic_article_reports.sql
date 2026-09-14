begin;

alter table public.academic_reports add column if not exists article_id uuid references public.academic_articles(id) on delete cascade;
alter table public.academic_reports drop constraint if exists academic_reports_check;
alter table public.academic_reports add constraint academic_reports_check
  check (((post_id is not null)::int + (comment_id is not null)::int + (article_id is not null)::int) = 1);
create index if not exists academic_reports_article_idx on public.academic_reports(article_id,status,created_at desc) where article_id is not null;

commit;
