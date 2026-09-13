create table if not exists public.creator_product_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  creator_name text not null,
  public_name text,
  email text not null,
  phone text,
  country text,
  city text,
  locale text not null default 'pt' check (locale in ('pt','en','fr','es')),
  bio text,
  title text not null,
  subtitle text,
  category text not null,
  product_type text not null check (product_type in ('ebook','digital_book','academic_material','handout','course','formation','training','professional_material','other')),
  short_description text,
  description text not null,
  target_audience text,
  product_language text not null default 'pt',
  suggested_price_cents bigint check (suggested_price_cents is null or suggested_price_cents >= 0),
  currency text not null default 'EUR' check (currency in ('BRL','EUR','USD')),
  keywords text[] not null default '{}',
  status text not null default 'submitted' check (status in ('draft','submitted','under_review','changes_requested','approved','preparing','published','rejected','suspended')),
  creator_share_percent smallint not null default 85 check (creator_share_percent between 0 and 100),
  ldr_commission_percent smallint not null default 15 check (ldr_commission_percent between 0 and 100),
  gross_sales_cents bigint not null default 0,
  net_sales_cents bigint not null default 0,
  ldr_commission_cents bigint not null default 0,
  creator_due_cents bigint not null default 0,
  payout_status text not null default 'not_ready' check (payout_status in ('not_ready','pending','processing','paid','on_hold')),
  rights_accepted_at timestamptz not null,
  files jsonb not null default '[]'::jsonb,
  admin_notes text,
  published_product_key text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creator_marketplace_split_check check (creator_share_percent + ldr_commission_percent = 100)
);

create index if not exists creator_product_submissions_user_created_idx
  on public.creator_product_submissions(user_id, created_at desc);
create index if not exists creator_product_submissions_status_created_idx
  on public.creator_product_submissions(status, created_at desc);

alter table public.creator_product_submissions enable row level security;
revoke all on public.creator_product_submissions from anon, authenticated;
grant all on public.creator_product_submissions to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creator-submissions-private',
  'creator-submissions-private',
  false,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.creator_product_submissions is
  'Submissoes privadas de criadores para publicacao na LDR Academy. Acesso somente via backend autenticado/service_role.';
