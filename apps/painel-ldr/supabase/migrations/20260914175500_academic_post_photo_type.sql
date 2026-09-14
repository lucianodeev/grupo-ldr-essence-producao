begin;

alter table public.academic_posts drop constraint if exists academic_posts_post_type_check;
alter table public.academic_posts add constraint academic_posts_post_type_check
  check (post_type in ('reflection','question','debate','study','recommendation','photo'));

commit;
