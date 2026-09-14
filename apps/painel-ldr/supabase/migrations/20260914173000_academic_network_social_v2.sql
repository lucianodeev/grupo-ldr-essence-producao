begin;

alter table public.academic_profiles add column if not exists username text;
alter table public.academic_profiles add column if not exists avatar_path text;
alter table public.academic_profiles add column if not exists courses text[] not null default '{}'::text[];
alter table public.academic_profiles add column if not exists profile_visibility text not null default 'public';
alter table public.academic_profiles drop constraint if exists academic_profiles_profile_visibility_check;
alter table public.academic_profiles add constraint academic_profiles_profile_visibility_check check (profile_visibility in ('public','private'));
create unique index if not exists academic_profiles_username_unique on public.academic_profiles(lower(username)) where username is not null;
create index if not exists academic_profiles_username_lookup_idx on public.academic_profiles(lower(username));

alter table public.academic_posts add column if not exists location_label text;
alter table public.academic_posts add column if not exists location_city text;
alter table public.academic_posts add column if not exists location_country text;
alter table public.academic_posts add column if not exists share_slug text;
create unique index if not exists academic_posts_share_slug_unique on public.academic_posts(share_slug) where share_slug is not null;

create table if not exists public.academic_follows (
  follower_user_id uuid not null references auth.users(id) on delete cascade,
  followed_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'accepted' check (status in ('accepted','pending')),
  created_at timestamptz not null default now(),
  primary key (follower_user_id, followed_user_id),
  check (follower_user_id <> followed_user_id)
);
create index if not exists academic_follows_followed_idx on public.academic_follows(followed_user_id, status, created_at desc);
create index if not exists academic_follows_follower_idx on public.academic_follows(follower_user_id, status, created_at desc);

create table if not exists public.academic_post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.academic_posts(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists academic_post_media_one_image_idx on public.academic_post_media(post_id) where sort_order = 0;
create index if not exists academic_post_media_owner_idx on public.academic_post_media(owner_user_id, created_at desc);

create table if not exists public.academic_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.academic_post_topics (
  post_id uuid not null references public.academic_posts(id) on delete cascade,
  topic_id uuid not null references public.academic_topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id, topic_id)
);
create index if not exists academic_post_topics_topic_idx on public.academic_post_topics(topic_id, created_at desc);

create table if not exists public.academic_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  community_id uuid references public.academic_communities(id) on delete set null,
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 180),
  summary text not null default '' check (char_length(summary) <= 800),
  body_html text not null check (char_length(body_html) between 1 and 100000),
  category text not null default '',
  keywords text[] not null default '{}'::text[],
  references_text text not null default '',
  cover_path text,
  location_label text,
  location_city text,
  location_country text,
  status text not null default 'active' check (status in ('draft','active','hidden','deleted','under_review')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academic_articles_feed_idx on public.academic_articles(status,is_pinned desc,created_at desc);
create index if not exists academic_articles_user_idx on public.academic_articles(user_id,created_at desc);
create index if not exists academic_articles_community_idx on public.academic_articles(community_id,status,created_at desc);

create table if not exists public.academic_saved_articles (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.academic_articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, article_id)
);

create table if not exists public.academic_article_reactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.academic_articles(id) on delete cascade,
  reaction_type text not null default 'support' check (reaction_type='support'),
  created_at timestamptz not null default now(),
  primary key(user_id, article_id, reaction_type)
);

create table if not exists public.academic_article_comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.academic_articles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 6000),
  anonymous boolean not null default false,
  status text not null default 'active' check (status in ('active','hidden','deleted','under_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academic_article_comments_article_idx on public.academic_article_comments(article_id,status,created_at);

create table if not exists public.academic_mentions (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  mentioned_user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.academic_posts(id) on delete cascade,
  comment_id uuid references public.academic_comments(id) on delete cascade,
  article_id uuid references public.academic_articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((post_id is not null)::int + (comment_id is not null)::int + (article_id is not null)::int = 1)
);
create index if not exists academic_mentions_target_idx on public.academic_mentions(mentioned_user_id,created_at desc);

create table if not exists public.academic_challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  theme text not null,
  description text not null default '',
  rules text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft','published','closed','cancelled')),
  category text not null default '',
  image_path text,
  eligible_roles text[] not null default array['member','student','professor','mentor']::text[],
  community_weight numeric(5,2) not null default 40.00 check (community_weight between 0 and 100),
  jury_weight numeric(5,2) not null default 60.00 check (jury_weight between 0 and 100),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (community_weight + jury_weight = 100)
);
create index if not exists academic_challenges_status_idx on public.academic_challenges(status,starts_at,ends_at);

create table if not exists public.academic_challenge_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.academic_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in ('post','article')),
  post_id uuid references public.academic_posts(id) on delete cascade,
  article_id uuid references public.academic_articles(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted','eligible','ineligible','winner','highlighted')),
  jury_score numeric(7,3),
  community_score numeric(7,3),
  final_score numeric(7,3),
  badge text check (badge is null or badge in ('article_highlight','community_choice','ldr_academic_highlight')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(challenge_id,user_id,entry_type,post_id,article_id),
  check ((entry_type='post' and post_id is not null and article_id is null) or (entry_type='article' and article_id is not null and post_id is null))
);
create index if not exists academic_challenge_entries_challenge_idx on public.academic_challenge_entries(challenge_id,status,final_score desc nulls last);

create table if not exists public.academic_challenge_jury_scores (
  challenge_entry_id uuid not null references public.academic_challenge_entries(id) on delete cascade,
  juror_user_id uuid not null references auth.users(id) on delete cascade,
  score numeric(5,2) not null check (score between 0 and 100),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(challenge_entry_id,juror_user_id)
);

alter table public.academic_follows enable row level security;
alter table public.academic_post_media enable row level security;
alter table public.academic_topics enable row level security;
alter table public.academic_post_topics enable row level security;
alter table public.academic_articles enable row level security;
alter table public.academic_saved_articles enable row level security;
alter table public.academic_article_reactions enable row level security;
alter table public.academic_article_comments enable row level security;
alter table public.academic_mentions enable row level security;
alter table public.academic_challenges enable row level security;
alter table public.academic_challenge_entries enable row level security;
alter table public.academic_challenge_jury_scores enable row level security;

-- Direct browser policies stay narrow. Cross-user feeds/profiles are served by authenticated server functions.
create policy academic_follows_self_select on public.academic_follows for select to authenticated using (follower_user_id=auth.uid() or followed_user_id=auth.uid());
create policy academic_follows_self_insert on public.academic_follows for insert to authenticated with check (follower_user_id=auth.uid());
create policy academic_follows_self_delete on public.academic_follows for delete to authenticated using (follower_user_id=auth.uid());

create policy academic_post_media_owner_select on public.academic_post_media for select to authenticated using (owner_user_id=auth.uid());
create policy academic_post_media_owner_insert on public.academic_post_media for insert to authenticated with check (owner_user_id=auth.uid());
create policy academic_post_media_owner_update on public.academic_post_media for update to authenticated using (owner_user_id=auth.uid()) with check (owner_user_id=auth.uid());
create policy academic_post_media_owner_delete on public.academic_post_media for delete to authenticated using (owner_user_id=auth.uid());

create policy academic_topics_read on public.academic_topics for select to authenticated using (true);
create policy academic_post_topics_own_select on public.academic_post_topics for select to authenticated using (exists(select 1 from public.academic_posts p where p.id=post_id and p.user_id=auth.uid()));
create policy academic_post_topics_own_insert on public.academic_post_topics for insert to authenticated with check (exists(select 1 from public.academic_posts p where p.id=post_id and p.user_id=auth.uid()));
create policy academic_post_topics_own_delete on public.academic_post_topics for delete to authenticated using (exists(select 1 from public.academic_posts p where p.id=post_id and p.user_id=auth.uid()));

create policy academic_articles_self_select on public.academic_articles for select to authenticated using (user_id=auth.uid());
create policy academic_articles_self_insert on public.academic_articles for insert to authenticated with check (user_id=auth.uid());
create policy academic_articles_self_update on public.academic_articles for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy academic_articles_self_delete on public.academic_articles for delete to authenticated using (user_id=auth.uid());
create policy academic_saved_articles_self_all on public.academic_saved_articles for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy academic_article_reactions_self_all on public.academic_article_reactions for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy academic_article_comments_self_select on public.academic_article_comments for select to authenticated using (user_id=auth.uid());
create policy academic_article_comments_self_insert on public.academic_article_comments for insert to authenticated with check (user_id=auth.uid());
create policy academic_article_comments_self_update on public.academic_article_comments for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy academic_article_comments_self_delete on public.academic_article_comments for delete to authenticated using (user_id=auth.uid());
create policy academic_mentions_self_select on public.academic_mentions for select to authenticated using (actor_user_id=auth.uid() or mentioned_user_id=auth.uid());
create policy academic_mentions_self_insert on public.academic_mentions for insert to authenticated with check (actor_user_id=auth.uid());
create policy academic_challenges_read_published on public.academic_challenges for select to authenticated using (status in ('published','closed'));
create policy academic_challenge_entries_self_select on public.academic_challenge_entries for select to authenticated using (user_id=auth.uid());
create policy academic_challenge_entries_self_insert on public.academic_challenge_entries for insert to authenticated with check (user_id=auth.uid());
create policy academic_challenge_entries_self_update on public.academic_challenge_entries for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy academic_challenge_jury_none on public.academic_challenge_jury_scores for select to authenticated using (false);

grant select,insert,delete on public.academic_follows to authenticated;
grant select,insert,update,delete on public.academic_post_media to authenticated;
grant select on public.academic_topics to authenticated;
grant select,insert,delete on public.academic_post_topics to authenticated;
grant select,insert,update,delete on public.academic_articles, public.academic_saved_articles, public.academic_article_reactions, public.academic_article_comments to authenticated;
grant select,insert on public.academic_mentions to authenticated;
grant select on public.academic_challenges to authenticated;
grant select,insert,update on public.academic_challenge_entries to authenticated;
grant select on public.academic_challenge_jury_scores to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('academic-network','academic-network',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;

-- Expected object path: <auth.uid()>/avatars|posts|articles/<filename>
drop policy if exists academic_network_storage_read on storage.objects;
create policy academic_network_storage_read on storage.objects for select to authenticated using (bucket_id='academic-network');
drop policy if exists academic_network_storage_insert on storage.objects;
create policy academic_network_storage_insert on storage.objects for insert to authenticated with check (bucket_id='academic-network' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists academic_network_storage_update on storage.objects;
create policy academic_network_storage_update on storage.objects for update to authenticated using (bucket_id='academic-network' and owner_id=auth.uid()::text) with check (bucket_id='academic-network' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists academic_network_storage_delete on storage.objects;
create policy academic_network_storage_delete on storage.objects for delete to authenticated using (bucket_id='academic-network' and owner_id=auth.uid()::text);

commit;