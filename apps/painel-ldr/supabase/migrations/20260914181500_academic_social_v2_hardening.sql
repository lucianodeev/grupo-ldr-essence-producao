begin;

-- Defend username integrity even against direct API writes.
alter table public.academic_profiles drop constraint if exists academic_profiles_username_format_check;
alter table public.academic_profiles add constraint academic_profiles_username_format_check
  check (username is null or (char_length(username) between 3 and 30 and username = lower(username) and username ~ '^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$'));

-- PostgreSQL unique constraints treat NULLs as distinct, so use partial indexes
-- for the two mutually-exclusive challenge entry target types.
create unique index if not exists academic_challenge_entries_unique_post
  on public.academic_challenge_entries(challenge_id,user_id,post_id)
  where entry_type='post' and post_id is not null;
create unique index if not exists academic_challenge_entries_unique_article
  on public.academic_challenge_entries(challenge_id,user_id,article_id)
  where entry_type='article' and article_id is not null;

-- The social server signs public academic media after checking content visibility.
-- Direct Storage reads remain limited to the owner's namespace.
drop policy if exists academic_network_storage_read on storage.objects;
create policy academic_network_storage_read on storage.objects
  for select to authenticated
  using (bucket_id='academic-network' and (storage.foldername(name))[1]=auth.uid()::text);

commit;
