-- LDR Proof: additive evidence/trust foundation. Existing career/professional evidence remains unchanged.
create table if not exists public.ldr_proofs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 proof_type text not null check (proof_type in ('course','project','work','service','credential','assessment','review','other')),
 title text not null check (char_length(title) between 1 and 160),
 description text,
 competency_key text,
 source_type text not null check (source_type in ('ldr','company','institution','client','self','external')),
 source_label text,
 source_reference text,
 artifact_url text,
 verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected','expired')),
 verified_by uuid references auth.users(id) on delete set null,
 verified_at timestamptz,
 occurred_at timestamptz,
 is_public boolean not null default false,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check ((verification_status <> 'verified') or (verified_by is not null and verified_at is not null))
);
create index if not exists ldr_proofs_user_id_idx on public.ldr_proofs(user_id);
create index if not exists ldr_proofs_user_status_idx on public.ldr_proofs(user_id,verification_status);
create index if not exists ldr_proofs_competency_idx on public.ldr_proofs(competency_key) where competency_key is not null;
alter table public.ldr_proofs enable row level security;
revoke all on public.ldr_proofs from anon;
revoke all on public.ldr_proofs from authenticated;
grant select,insert,update,delete on public.ldr_proofs to authenticated;
grant all on public.ldr_proofs to service_role;
create policy "ldr_proofs_select_own" on public.ldr_proofs for select to authenticated using ((select auth.uid())=user_id);
create policy "ldr_proofs_insert_self_unverified" on public.ldr_proofs for insert to authenticated with check ((select auth.uid())=user_id and verification_status in ('unverified','pending') and verified_by is null and verified_at is null);
create policy "ldr_proofs_update_own_unverified" on public.ldr_proofs for update to authenticated using ((select auth.uid())=user_id and verification_status in ('unverified','pending')) with check ((select auth.uid())=user_id and verification_status in ('unverified','pending') and verified_by is null and verified_at is null);
create policy "ldr_proofs_delete_own_unverified" on public.ldr_proofs for delete to authenticated using ((select auth.uid())=user_id and verification_status in ('unverified','pending'));
comment on table public.ldr_proofs is 'LDR Proof evidence layer. User-submitted proof cannot self-verify; verification is server/admin mediated.';