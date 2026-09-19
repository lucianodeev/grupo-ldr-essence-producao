-- LDR ID: experience roles, intentionally separate from public.user_roles authorization roles.
create table if not exists public.ldr_identity_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null check (role_key in ('student','professional','freelancer','mentor','teacher','entrepreneur','contractor')),
  is_active boolean not null default true,
  activated_at timestamptz not null default now(),
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, role_key)
);
create index if not exists ldr_identity_roles_user_id_idx on public.ldr_identity_roles(user_id);
alter table public.ldr_identity_roles enable row level security;
revoke all on public.ldr_identity_roles from anon;
revoke all on public.ldr_identity_roles from authenticated;
grant select, insert, update, delete on public.ldr_identity_roles to authenticated;
grant all on public.ldr_identity_roles to service_role;
create policy "ldr_identity_roles_select_own" on public.ldr_identity_roles for select to authenticated using ((select auth.uid()) = user_id);
create policy "ldr_identity_roles_insert_own" on public.ldr_identity_roles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ldr_identity_roles_update_own" on public.ldr_identity_roles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ldr_identity_roles_delete_own" on public.ldr_identity_roles for delete to authenticated using ((select auth.uid()) = user_id);
comment on table public.ldr_identity_roles is 'LDR ID experience roles. Separate from user_roles authorization roles; never use for administrative authorization.';