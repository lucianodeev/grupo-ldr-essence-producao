create table if not exists public.personal_library_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  original_file_name text not null,
  storage_path text not null unique,
  file_size bigint not null check (file_size > 0 and file_size <= 52428800),
  mime_type text not null default 'application/pdf' check (mime_type = 'application/pdf'),
  category text not null default 'Outros',
  author text,
  publication_year integer,
  notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists personal_library_files_user_created_idx
  on public.personal_library_files(user_id, created_at desc);
create index if not exists personal_library_files_user_category_idx
  on public.personal_library_files(user_id, category);

alter table public.personal_library_files enable row level security;

drop policy if exists personal_library_select_own on public.personal_library_files;
create policy personal_library_select_own on public.personal_library_files
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists personal_library_insert_own on public.personal_library_files;
create policy personal_library_insert_own on public.personal_library_files
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists personal_library_update_own on public.personal_library_files;
create policy personal_library_update_own on public.personal_library_files
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists personal_library_delete_own on public.personal_library_files;
create policy personal_library_delete_own on public.personal_library_files
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.personal_library_files to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('personal-library-private', 'personal-library-private', false, 52428800, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists personal_library_storage_select_own on storage.objects;
create policy personal_library_storage_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'personal-library-private' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists personal_library_storage_insert_own on storage.objects;
create policy personal_library_storage_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'personal-library-private' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists personal_library_storage_delete_own on storage.objects;
create policy personal_library_storage_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'personal-library-private' and (storage.foldername(name))[1] = auth.uid()::text);
