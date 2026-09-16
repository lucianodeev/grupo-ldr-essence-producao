-- Additive support for threaded replies in Rede Acadêmica comments.
-- Legacy comments remain root comments because parent_comment_id is nullable.

alter table public.academic_comments
  add column if not exists parent_comment_id uuid null references public.academic_comments(id) on delete cascade;

create index if not exists academic_comments_parent_comment_id_idx
  on public.academic_comments(parent_comment_id);

create index if not exists academic_comments_post_parent_created_idx
  on public.academic_comments(post_id, parent_comment_id, created_at);

comment on column public.academic_comments.parent_comment_id is
  'Optional parent comment for threaded replies. NULL preserves legacy root comments.';
