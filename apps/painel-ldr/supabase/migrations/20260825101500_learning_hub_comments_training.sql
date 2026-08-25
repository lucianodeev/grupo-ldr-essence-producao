create table if not exists public.training_programs (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, description text,
  status text not null default 'draft' check (status in ('draft','published','archived')), created_by uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.training_enrollments (
  id uuid primary key default gen_random_uuid(), training_id uuid not null references public.training_programs(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade, active boolean not null default true,
  enrolled_at timestamptz not null default now(), unique(training_id,customer_id)
);
create table if not exists public.training_modules (
  id uuid primary key default gen_random_uuid(), training_id uuid not null references public.training_programs(id) on delete cascade,
  title text not null, description text, position integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.training_materials (
  id uuid primary key default gen_random_uuid(), training_id uuid not null references public.training_programs(id) on delete cascade,
  module_id uuid references public.training_modules(id) on delete cascade, title text not null, description text,
  material_type text not null default 'link' check (material_type in ('link','pdf','video','text','file')), url text, body text,
  position integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.training_live_sessions (
  id uuid primary key default gen_random_uuid(), training_id uuid not null references public.training_programs(id) on delete cascade,
  title text not null, description text, starts_at timestamptz not null, ends_at timestamptz, meeting_url text,
  published boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.training_announcements (
  id uuid primary key default gen_random_uuid(), training_id uuid not null references public.training_programs(id) on delete cascade,
  title text not null, body text not null, published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.library_comments (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade,
  product_key text, training_id uuid references public.training_programs(id) on delete cascade,
  parent_id uuid references public.library_comments(id) on delete cascade, author_user_id uuid not null,
  author_kind text not null check (author_kind in ('client','professional')), author_label text,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  status text not null default 'open' check (status in ('open','answered','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (product_key is not null or training_id is not null)
);
create table if not exists public.library_progress (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade,
  product_key text not null, progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  current_location text, updated_at timestamptz not null default now(), unique(customer_id,product_key)
);
create index if not exists training_enrollments_customer_idx on public.training_enrollments(customer_id,active);
create index if not exists library_comments_customer_idx on public.library_comments(customer_id,created_at desc);
alter table public.training_programs enable row level security;
alter table public.training_enrollments enable row level security;
alter table public.training_modules enable row level security;
alter table public.training_materials enable row level security;
alter table public.training_live_sessions enable row level security;
alter table public.training_announcements enable row level security;
alter table public.library_comments enable row level security;
alter table public.library_progress enable row level security;
revoke all on public.training_programs, public.training_enrollments, public.training_modules, public.training_materials, public.training_live_sessions, public.training_announcements, public.library_comments, public.library_progress from anon, authenticated;
grant all on public.training_programs, public.training_enrollments, public.training_modules, public.training_materials, public.training_live_sessions, public.training_announcements, public.library_comments, public.library_progress to service_role;
