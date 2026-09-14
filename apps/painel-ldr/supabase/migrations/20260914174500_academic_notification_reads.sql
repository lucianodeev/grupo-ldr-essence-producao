begin;

create table if not exists public.academic_notification_reads (
  notification_id uuid not null references public.notification_outbox(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(notification_id,user_id)
);
create index if not exists academic_notification_reads_user_idx on public.academic_notification_reads(user_id,read_at desc);
alter table public.academic_notification_reads enable row level security;
create policy academic_notification_reads_self_select on public.academic_notification_reads for select to authenticated using (user_id=auth.uid());
create policy academic_notification_reads_self_insert on public.academic_notification_reads for insert to authenticated with check (user_id=auth.uid());
create policy academic_notification_reads_self_delete on public.academic_notification_reads for delete to authenticated using (user_id=auth.uid());
grant select,insert,delete on public.academic_notification_reads to authenticated;

commit;