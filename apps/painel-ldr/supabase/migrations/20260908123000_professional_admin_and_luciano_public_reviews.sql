-- Additive commercial management fields for professionals.
alter table public.professional_accounts
  add column if not exists engagement_model text not null default 'subscription',
  add column if not exists custom_commission_rate numeric(5,4),
  add column if not exists managed_by_admin boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'professional_accounts_engagement_model_check'
      and conrelid = 'public.professional_accounts'::regclass
  ) then
    alter table public.professional_accounts
      add constraint professional_accounts_engagement_model_check
      check (engagement_model in ('subscription', 'commission', 'exempt'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'professional_accounts_custom_commission_check'
      and conrelid = 'public.professional_accounts'::regclass
  ) then
    alter table public.professional_accounts
      add constraint professional_accounts_custom_commission_check
      check (
        (engagement_model = 'commission' and custom_commission_rate between 0.10 and 0.20)
        or (engagement_model <> 'commission' and custom_commission_rate is null)
      );
  end if;
end $$;

-- External public reviews stay separate from verified marketplace reviews.
-- This preserves the booking-backed integrity rule of professional_reviews.
create table if not exists public.professional_external_reviews (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  reviewer_name text not null check (char_length(trim(reviewer_name)) between 1 and 120),
  rating integer not null check (rating between 1 and 5),
  body text not null check (char_length(trim(body)) between 1 and 4000),
  review_date date not null,
  source text not null default 'Zenklub',
  published boolean not null default true,
  imported_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists professional_external_reviews_dedup_idx
  on public.professional_external_reviews (
    professional_profile_id,
    lower(trim(reviewer_name)),
    md5(trim(body)),
    review_date
  );
create index if not exists professional_external_reviews_profile_idx
  on public.professional_external_reviews (professional_profile_id, published, review_date desc);

alter table public.professional_external_reviews enable row level security;
revoke all on public.professional_external_reviews from anon, authenticated;
grant all on public.professional_external_reviews to service_role;

-- Complete the existing Luciano profile without replacing proven formation
-- or experience fields already registered.
update public.professional_profiles
set
  display_name = 'Luciano Rodrigues Almeida',
  professional_title = 'Psicanalista | Gestor de Recursos Humanos | Mentor Profissional e de Empreendedores | Desenvolvimento Humano e Carreira Internacional',
  profile_headline = 'Brasil • Portugal • Bélgica • Atendimento Internacional Online',
  specialties = array[
    'Psicanálise',
    'RH',
    'Desenvolvimento Humano',
    'Mentoria Profissional',
    'Mentoria para Empreendedores',
    'Orientação Profissional',
    'Transição de Carreira',
    'Carreira Internacional',
    'Treinamentos',
    'Liderança',
    'Palestras'
  ]::text[],
  operating_countries = array['BR', 'PT', 'BE']::text[],
  international_positioning = 'Atendimento online para pessoas no Brasil e no exterior, com atuação especialmente conectada ao Brasil, Portugal e Bélgica. O trabalho integra desenvolvimento humano, carreira, psicanálise e visão internacional.',
  open_to_international_projects = true,
  open_to_partnerships = true,
  updated_at = now()
where slug = 'luciano-rodrigues-almeida';

with luciano as (
  select id from public.professional_profiles
  where slug = 'luciano-rodrigues-almeida'
  limit 1
), reviews(reviewer_name, body, review_date) as (
  values
    ('Ana', 'Excelente profissional, me acolheu e me ajudou muito nesse momento.', date '2023-04-14'),
    ('Elizabeth', 'Super simpático e atencioso! Estou gostando muito da terapia com o Luciano!', date '2023-08-01'),
    ('Madalena', 'Profissional tem uma escuta qualificada e me ajudou bastante.', date '2023-03-20'),
    ('Livian', 'Me senti super à vontade desde a primeira sessão, super recomendo.', date '2023-07-04'),
    ('Murilo', 'Uma ótima primeira sessão, me senti acolhido, um excelente profissional.', date '2023-12-18'),
    ('Marcello', 'Bastante atencioso na primeira consulta!!!', date '2023-09-03'),
    ('Jose', 'Luciano foi extremamente atencioso, me fez questionamentos pertinentes do início ao fim da sessão, tem uma escuta ativa incrível.', date '2023-09-14'),
    ('Jenifer', 'Ótimo profissional, soube me ouvir e me ajuda com minhas queixas!! Super indico!', date '2023-10-19'),
    ('Haroldo', 'Muito atencioso aos cuidados mentais.', date '2023-11-01'),
    ('Bianca', 'Maravilhoso! Luciano está cuidando da minha mãezinha e foi maravilhoso com ela. Um excelente profissional!', date '2023-02-15'),
    ('Gabriel', 'Além de um ótimo profissional, o Luciano faz questão que você se sinta bem e confortável em suas sessões. Busca entender suas questões e auxiliar para que você possa achar uma solução!', date '2023-07-18'),
    ('Luan', 'Pessoa do bem, energia maravilhosa !!!', date '2023-02-08'),
    ('Thaísa', 'Está me ajudando a me auto conhecer e estou adorando seu trabalho.', date '2023-02-02'),
    ('Jessica', 'Luciano foi e é um achado na minha vida. Situações e sentimentos que, por muitas vezes, obscuros em mim, se tornam factíveis e, juntos, conseguimos trilhar uma nova história.', date '2025-07-15'),
    ('Diego', 'Ótimo! Conseguimos desenvolver bem em 50 minutos.', date '2024-01-05')
)
insert into public.professional_external_reviews (
  professional_profile_id, reviewer_name, rating, body, review_date, source, published
)
select luciano.id, reviews.reviewer_name, 5, reviews.body, reviews.review_date, 'Zenklub', true
from luciano cross join reviews
on conflict do nothing;
