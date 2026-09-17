-- Academic Network: threaded replies for real-user comments on editorial posts.
-- Additive only. Existing comments remain roots with parent_comment_id = NULL.

alter table public.academic_editorial_user_comments
  add column if not exists parent_comment_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'academic_editorial_user_comments_parent_comment_id_fkey'
      and conrelid = 'public.academic_editorial_user_comments'::regclass
  ) then
    alter table public.academic_editorial_user_comments
      add constraint academic_editorial_user_comments_parent_comment_id_fkey
      foreign key (parent_comment_id)
      references public.academic_editorial_user_comments(id)
      on delete cascade;
  end if;
end $$;

create index if not exists academic_editorial_user_comments_parent_idx
  on public.academic_editorial_user_comments(parent_comment_id);
