-- Bidirectional private attachments for Ecosystem Support.
create table if not exists public.ecosystem_contact_messages (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.ecosystem_contacts(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  body text not null default '',
  sender_email text,
  created_at timestamptz not null default now()
);
alter table public.ecosystem_contact_messages enable row level security;
revoke all on public.ecosystem_contact_messages from anon, authenticated;
grant select, insert on public.ecosystem_contact_messages to authenticated;
create policy ecosystem_contact_messages_superadmin_all on public.ecosystem_contact_messages
for all to authenticated
using (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='superadmin'))
with check (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='superadmin'));

create table if not exists public.ecosystem_contact_attachments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.ecosystem_contacts(id) on delete cascade,
  message_id uuid references public.ecosystem_contact_messages(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  original_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now()
);
alter table public.ecosystem_contact_attachments enable row level security;
revoke all on public.ecosystem_contact_attachments from anon, authenticated;
grant select, insert on public.ecosystem_contact_attachments to authenticated;
create policy ecosystem_contact_attachments_superadmin_all on public.ecosystem_contact_attachments
for all to authenticated
using (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='superadmin'))
with check (exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role='superadmin'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ecosystem-support-private','ecosystem-support-private',false,10485760,array[
'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
'text/plain','text/csv','image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
