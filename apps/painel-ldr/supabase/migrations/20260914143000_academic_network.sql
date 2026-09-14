begin;

create table if not exists public.academic_communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  is_open boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  bio text not null default '',
  profession text not null default '',
  country text not null default '',
  city text not null default '',
  interests text[] not null default '{}'::text[],
  display_role text not null default 'member' check (display_role in ('member','student','professor','mentor')),
  show_name boolean not null default true,
  show_location boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 20000),
  prompt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academic_diary_entries_user_created_idx on public.academic_diary_entries(user_id, created_at desc);

create table if not exists public.academic_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  community_id uuid references public.academic_communities(id) on delete set null,
  body text not null check (char_length(body) between 1 and 12000),
  post_type text not null default 'reflection' check (post_type in ('reflection','question','debate','study','recommendation')),
  anonymous boolean not null default false,
  status text not null default 'active' check (status in ('active','hidden','deleted','under_review')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academic_posts_feed_idx on public.academic_posts(status, is_pinned desc, created_at desc);
create index if not exists academic_posts_community_idx on public.academic_posts(community_id, status, created_at desc);
create index if not exists academic_posts_user_idx on public.academic_posts(user_id, created_at desc);

create table if not exists public.academic_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.academic_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 6000),
  anonymous boolean not null default false,
  status text not null default 'active' check (status in ('active','hidden','deleted','under_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academic_comments_post_idx on public.academic_comments(post_id, status, created_at);

create table if not exists public.academic_saved_posts (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.academic_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.academic_reactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.academic_posts(id) on delete cascade,
  reaction_type text not null default 'support' check (reaction_type = 'support'),
  created_at timestamptz not null default now(),
  primary key (user_id, post_id, reaction_type)
);

create table if not exists public.academic_community_members (
  community_id uuid not null references public.academic_communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','moderator')),
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table if not exists public.academic_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.academic_posts(id) on delete cascade,
  comment_id uuid references public.academic_comments(id) on delete cascade,
  reason text not null,
  details text not null default '',
  status text not null default 'new' check (status in ('new','reviewing','resolved','dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((post_id is not null) <> (comment_id is not null))
);
create index if not exists academic_reports_status_idx on public.academic_reports(status, created_at desc);

create table if not exists public.academic_connections (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  receiver_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_user_id <> receiver_user_id)
);
create unique index if not exists academic_connections_pair_unique on public.academic_connections(least(requester_user_id,receiver_user_id), greatest(requester_user_id,receiver_user_id));

create table if not exists public.academic_reflection_prompts (
  id uuid primary key default gen_random_uuid(),
  text text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.academic_access_trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  status text not null default 'active' check (status in ('active','expired','revoked')),
  created_at timestamptz not null default now()
);

alter table public.academic_communities enable row level security;
alter table public.academic_profiles enable row level security;
alter table public.academic_diary_entries enable row level security;
alter table public.academic_posts enable row level security;
alter table public.academic_comments enable row level security;
alter table public.academic_saved_posts enable row level security;
alter table public.academic_reactions enable row level security;
alter table public.academic_community_members enable row level security;
alter table public.academic_reports enable row level security;
alter table public.academic_connections enable row level security;
alter table public.academic_reflection_prompts enable row level security;
alter table public.academic_access_trials enable row level security;

-- Direct browser access is intentionally narrow. Community feed/anonymity is served by authenticated server functions.
drop policy if exists academic_communities_read on public.academic_communities;
create policy academic_communities_read on public.academic_communities for select to authenticated using (active = true);

drop policy if exists academic_diary_self_select on public.academic_diary_entries;
create policy academic_diary_self_select on public.academic_diary_entries for select to authenticated using (user_id = auth.uid());
drop policy if exists academic_diary_self_insert on public.academic_diary_entries;
create policy academic_diary_self_insert on public.academic_diary_entries for insert to authenticated with check (user_id = auth.uid());
drop policy if exists academic_diary_self_update on public.academic_diary_entries;
create policy academic_diary_self_update on public.academic_diary_entries for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists academic_diary_self_delete on public.academic_diary_entries;
create policy academic_diary_self_delete on public.academic_diary_entries for delete to authenticated using (user_id = auth.uid());

drop policy if exists academic_profiles_self_select on public.academic_profiles;
create policy academic_profiles_self_select on public.academic_profiles for select to authenticated using (user_id = auth.uid());
drop policy if exists academic_profiles_self_insert on public.academic_profiles;
create policy academic_profiles_self_insert on public.academic_profiles for insert to authenticated with check (user_id = auth.uid());
drop policy if exists academic_profiles_self_update on public.academic_profiles;
create policy academic_profiles_self_update on public.academic_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists academic_posts_self_select on public.academic_posts;
create policy academic_posts_self_select on public.academic_posts for select to authenticated using (user_id = auth.uid());
drop policy if exists academic_posts_self_insert on public.academic_posts;
create policy academic_posts_self_insert on public.academic_posts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists academic_posts_self_update on public.academic_posts;
create policy academic_posts_self_update on public.academic_posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists academic_posts_self_delete on public.academic_posts;
create policy academic_posts_self_delete on public.academic_posts for delete to authenticated using (user_id = auth.uid());

drop policy if exists academic_comments_self_select on public.academic_comments;
create policy academic_comments_self_select on public.academic_comments for select to authenticated using (user_id = auth.uid());
drop policy if exists academic_comments_self_insert on public.academic_comments;
create policy academic_comments_self_insert on public.academic_comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists academic_comments_self_update on public.academic_comments;
create policy academic_comments_self_update on public.academic_comments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists academic_comments_self_delete on public.academic_comments;
create policy academic_comments_self_delete on public.academic_comments for delete to authenticated using (user_id = auth.uid());

drop policy if exists academic_saved_self_all on public.academic_saved_posts;
create policy academic_saved_self_all on public.academic_saved_posts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists academic_reactions_self_all on public.academic_reactions;
create policy academic_reactions_self_all on public.academic_reactions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists academic_members_self_all on public.academic_community_members;
create policy academic_members_self_all on public.academic_community_members for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists academic_reports_self_select on public.academic_reports;
create policy academic_reports_self_select on public.academic_reports for select to authenticated using (reporter_user_id = auth.uid());
drop policy if exists academic_reports_self_insert on public.academic_reports;
create policy academic_reports_self_insert on public.academic_reports for insert to authenticated with check (reporter_user_id = auth.uid());
drop policy if exists academic_connections_self_select on public.academic_connections;
create policy academic_connections_self_select on public.academic_connections for select to authenticated using (requester_user_id = auth.uid() or receiver_user_id = auth.uid());
drop policy if exists academic_prompts_read on public.academic_reflection_prompts;
create policy academic_prompts_read on public.academic_reflection_prompts for select to authenticated using (active = true);
drop policy if exists academic_trials_self_select on public.academic_access_trials;
create policy academic_trials_self_select on public.academic_access_trials for select to authenticated using (user_id = auth.uid());

grant select on public.academic_communities, public.academic_reflection_prompts to authenticated;
grant select, insert, update, delete on public.academic_diary_entries, public.academic_profiles, public.academic_posts, public.academic_comments, public.academic_saved_posts, public.academic_reactions, public.academic_community_members to authenticated;
grant select, insert on public.academic_reports to authenticated;
grant select on public.academic_connections, public.academic_access_trials to authenticated;

insert into public.academic_communities(slug,name,description,is_open,active) values
('geral','Comunidade Geral','Reflexões, perguntas e trocas entre todos os membros.',true,true),
('psicanalise','Psicanálise','Estudo, clínica, teoria e discussões em psicanálise.',true,true),
('psicologia-comportamento','Psicologia e Comportamento','Debates sobre comportamento, subjetividade e saúde mental.',true,true),
('autismo-neurodiversidade','Autismo e Neurodiversidade','Conhecimento, respeito e discussão sobre neurodiversidade.',true,true),
('terapias-integrativas','Terapias Integrativas','Práticas integrativas, ética e formação.',true,true),
('rh-gestao-pessoas','RH e Gestão de Pessoas','Pessoas, organizações, recrutamento e liderança.',true,true),
('carreira','Carreira','Desenvolvimento, transição e planejamento profissional.',true,true),
('empreendedorismo','Empreendedorismo','Negócios, projetos e construção de oportunidades.',true,true),
('inteligencia-artificial','Inteligência Artificial','IA aplicada ao estudo, à carreira e aos negócios.',true,true),
('estetica-bem-estar','Estética e Bem-Estar','Formação, prática e mercado de bem-estar.',true,true),
('tricologia','Tricologia','Saúde capilar, prática profissional e estudos.',true,true),
('educacao','Educação','Aprendizagem, ensino, pesquisa e desenvolvimento acadêmico.',true,true)
on conflict (slug) do update set name=excluded.name, description=excluded.description, active=true;

insert into public.academic_reflection_prompts(text,active) values
('O que você não conseguiu dizer hoje?',true),
('Que pensamento ficou com você depois da aula?',true),
('O que você percebeu em si hoje?',true),
('Que ideia você gostaria de compreender melhor?',true),
('O que te atravessou hoje?',true)
on conflict (text) do update set active=true;

commit;
