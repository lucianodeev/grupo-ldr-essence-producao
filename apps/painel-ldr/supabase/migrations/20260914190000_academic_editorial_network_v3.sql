-- Academic Network Social V3: transparent editorial seed layer.
-- Incremental: keeps existing auth, posts, articles, subscriptions and RLS untouched.

create table if not exists public.academic_editorial_profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  avatar_url text,
  country text not null,
  city text,
  language text not null check (language in ('pt','en','fr','es')),
  profession text not null default '',
  specialty text not null default '',
  bio text not null default '',
  interests text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_editorial_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.academic_editorial_profiles(id) on delete restrict,
  body text not null,
  post_type text not null default 'reflection' check (post_type in ('reflection','question','debate','study','recommendation','photo')),
  language text not null check (language in ('pt','en','fr','es')),
  location_label text,
  topics text[] not null default '{}',
  media_url text,
  media_alt text,
  status text not null default 'active' check (status in ('active','hidden','archived')),
  editorial_seed boolean not null default true,
  editorial_generated_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.academic_editorial_articles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.academic_editorial_profiles(id) on delete restrict,
  title text not null,
  slug text not null unique,
  summary text not null default '',
  body text not null,
  language text not null check (language in ('pt','en','fr','es')),
  keywords text[] not null default '{}',
  status text not null default 'active' check (status in ('active','hidden','archived')),
  editorial_seed boolean not null default true,
  editorial_generated_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.academic_editorial_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.academic_editorial_posts(id) on delete cascade,
  profile_id uuid not null references public.academic_editorial_profiles(id) on delete restrict,
  body text not null,
  language text not null check (language in ('pt','en','fr','es')),
  status text not null default 'active' check (status in ('active','hidden')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.academic_editorial_reactions (
  post_id uuid not null references public.academic_editorial_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null default 'support' check (reaction_type='support'),
  created_at timestamptz not null default now(),
  primary key (post_id,user_id,reaction_type)
);

create table if not exists public.academic_saved_editorial_posts (
  post_id uuid not null references public.academic_editorial_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id,user_id)
);

create table if not exists public.academic_editorial_user_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.academic_editorial_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  status text not null default 'active' check (status in ('active','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_editorial_settings (
  id boolean primary key default true check (id=true),
  mode text not null default 'automatic' check (mode in ('automatic','manual')),
  manual_max_percent integer not null default 30 check (manual_max_percent in (5,10,20,30,40)),
  low_activity_percent integer not null default 35 check (low_activity_percent between 0 and 40),
  medium_activity_percent integer not null default 20 check (medium_activity_percent between 0 and 40),
  high_activity_percent integer not null default 8 check (high_activity_percent between 0 and 40),
  updated_at timestamptz not null default now()
);
insert into public.academic_editorial_settings(id) values(true) on conflict(id) do nothing;

create index if not exists academic_editorial_posts_feed_idx on public.academic_editorial_posts(status,published_at desc);
create index if not exists academic_editorial_posts_profile_idx on public.academic_editorial_posts(profile_id,published_at desc);
create index if not exists academic_editorial_articles_feed_idx on public.academic_editorial_articles(status,published_at desc);
create index if not exists academic_editorial_comments_post_idx on public.academic_editorial_comments(post_id,published_at);
create index if not exists academic_editorial_user_comments_post_idx on public.academic_editorial_user_comments(post_id,created_at);

alter table public.academic_editorial_profiles enable row level security;
alter table public.academic_editorial_posts enable row level security;
alter table public.academic_editorial_articles enable row level security;
alter table public.academic_editorial_comments enable row level security;
alter table public.academic_editorial_reactions enable row level security;
alter table public.academic_saved_editorial_posts enable row level security;
alter table public.academic_editorial_user_comments enable row level security;
alter table public.academic_editorial_settings enable row level security;

drop policy if exists academic_editorial_profiles_read on public.academic_editorial_profiles;
create policy academic_editorial_profiles_read on public.academic_editorial_profiles for select to authenticated using(active=true);
drop policy if exists academic_editorial_posts_read on public.academic_editorial_posts;
create policy academic_editorial_posts_read on public.academic_editorial_posts for select to authenticated using(status='active');
drop policy if exists academic_editorial_articles_read on public.academic_editorial_articles;
create policy academic_editorial_articles_read on public.academic_editorial_articles for select to authenticated using(status='active');
drop policy if exists academic_editorial_comments_read on public.academic_editorial_comments;
create policy academic_editorial_comments_read on public.academic_editorial_comments for select to authenticated using(status='active');
drop policy if exists academic_editorial_settings_read on public.academic_editorial_settings;
create policy academic_editorial_settings_read on public.academic_editorial_settings for select to authenticated using(true);

drop policy if exists academic_editorial_reactions_own_select on public.academic_editorial_reactions;
create policy academic_editorial_reactions_own_select on public.academic_editorial_reactions for select to authenticated using(user_id=auth.uid());
drop policy if exists academic_editorial_reactions_own_insert on public.academic_editorial_reactions;
create policy academic_editorial_reactions_own_insert on public.academic_editorial_reactions for insert to authenticated with check(user_id=auth.uid());
drop policy if exists academic_editorial_reactions_own_delete on public.academic_editorial_reactions;
create policy academic_editorial_reactions_own_delete on public.academic_editorial_reactions for delete to authenticated using(user_id=auth.uid());

drop policy if exists academic_saved_editorial_own_select on public.academic_saved_editorial_posts;
create policy academic_saved_editorial_own_select on public.academic_saved_editorial_posts for select to authenticated using(user_id=auth.uid());
drop policy if exists academic_saved_editorial_own_insert on public.academic_saved_editorial_posts;
create policy academic_saved_editorial_own_insert on public.academic_saved_editorial_posts for insert to authenticated with check(user_id=auth.uid());
drop policy if exists academic_saved_editorial_own_delete on public.academic_saved_editorial_posts;
create policy academic_saved_editorial_own_delete on public.academic_saved_editorial_posts for delete to authenticated using(user_id=auth.uid());

drop policy if exists academic_editorial_user_comments_read on public.academic_editorial_user_comments;
create policy academic_editorial_user_comments_read on public.academic_editorial_user_comments for select to authenticated using(status='active');
drop policy if exists academic_editorial_user_comments_own_insert on public.academic_editorial_user_comments;
create policy academic_editorial_user_comments_own_insert on public.academic_editorial_user_comments for insert to authenticated with check(user_id=auth.uid());
drop policy if exists academic_editorial_user_comments_own_update on public.academic_editorial_user_comments;
create policy academic_editorial_user_comments_own_update on public.academic_editorial_user_comments for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists academic_editorial_user_comments_own_delete on public.academic_editorial_user_comments;
create policy academic_editorial_user_comments_own_delete on public.academic_editorial_user_comments for delete to authenticated using(user_id=auth.uid());

grant select on public.academic_editorial_profiles, public.academic_editorial_posts, public.academic_editorial_articles, public.academic_editorial_comments, public.academic_editorial_settings to authenticated;
grant select,insert,delete on public.academic_editorial_reactions, public.academic_saved_editorial_posts to authenticated;
grant select,insert,update,delete on public.academic_editorial_user_comments to authenticated;
revoke all on public.academic_editorial_profiles, public.academic_editorial_posts, public.academic_editorial_articles, public.academic_editorial_comments, public.academic_editorial_settings from anon;
revoke all on public.academic_editorial_reactions, public.academic_saved_editorial_posts, public.academic_editorial_user_comments from anon;

insert into public.academic_editorial_profiles(username,display_name,country,city,language,profession,specialty,bio,interests)
values
('marina.azevedo','Marina Azevedo','Brasil','São Paulo','pt','Psicanalista e pesquisadora','Psicanálise','Interessa-se por clínica, cultura e modos contemporâneos de subjetivação.',array['Psicanálise','Clínica','Cultura']::text[]),
('caio.mendonca','Caio Mendonça','Brasil','Belo Horizonte','pt','Pesquisador em neurodiversidade','Neurodiversidade','Pesquisa inclusão, linguagem e experiências neurodivergentes em contextos educacionais.',array['Neurodiversidade','Inclusão','Educação']::text[]),
('renata.nogueira','Renata Nogueira','Brasil','Salvador','pt','Psicopedagoga','Educação','Estuda aprendizagem, vínculo e permanência de adultos em processos formativos.',array['Educação','Aprendizagem','Pesquisa']::text[]),
('bruno.tavares','Bruno Tavares','Brasil','Recife','pt','Mentor de carreira','Carreira','Pesquisa transições profissionais, identidade de trabalho e mobilidade internacional.',array['Carreira','Trabalho','Identidade']::text[]),
('livia.campos','Lívia Campos','Brasil','Curitiba','pt','Pesquisadora em psicologia social','Psicologia Social','Interessa-se por pertencimento, grupos, redes e construção de identidade.',array['Psicologia Social','Grupos','Pertencimento']::text[]),
('rafael.duarte','Rafael Duarte','Brasil','Brasília','pt','Especialista em RH','RH','Escreve sobre trabalho, liderança, cultura organizacional e desenvolvimento humano.',array['RH','Trabalho','Cultura Organizacional']::text[]),
('camila.rocha','Camila Rocha','Brasil','Fortaleza','pt','Educadora e pesquisadora','Autismo','Foco em inclusão, suporte individualizado e desenho de ambientes mais acessíveis.',array['Autismo','Inclusão','Acessibilidade']::text[]),
('thiago.lima','Thiago Lima','Brasil','Rio de Janeiro','pt','Professor de filosofia','Filosofia','Relaciona ética, tecnologia, sujeito e transformações da vida contemporânea.',array['Filosofia','Ética','Sociedade']::text[]),
('juliana.freitas','Juliana Freitas','Brasil','Porto Alegre','pt','Pesquisadora em saúde integrativa','Saúde Integrativa','Investiga práticas de cuidado, autonomia e educação em saúde.',array['Saúde Integrativa','Saúde','Cuidado']::text[]),
('andre.moura','André Moura','Brasil','Goiânia','pt','Pesquisador em tecnologia educacional','IA e Educação','Estuda IA, autoria, avaliação e novos formatos de aprendizagem.',array['IA e Educação','IA','Educação']::text[]),
('patricia.costa','Patrícia Costa','Brasil','Campinas','pt','Psicopedagoga','Psicopedagogia','Interessa-se por estilos de aprendizagem, adultos e formação continuada.',array['Psicopedagogia','Aprendizagem','Educação']::text[]),
('felipe.arantes','Felipe Arantes','Brasil','Florianópolis','pt','Sociólogo','Sociologia','Pesquisa mobilidade, relações de trabalho e mudanças culturais.',array['Sociologia','Sociedade','Trabalho']::text[]),
('daniela.prado','Daniela Prado','Brasil','Vitória','pt','Pesquisadora em sexualidade humana','Sexologia','Aborda sexualidade, educação e relações com linguagem não patologizante.',array['Sexologia','Sexualidade','Educação']::text[]),
('igor.santana','Igor Santana','Brasil','Manaus','pt','Gestor de projetos','Gestão','Escreve sobre equipes, projetos, aprendizagem organizacional e inovação.',array['Gestão','Projetos','Equipes']::text[]),
('beatriz.luz','Beatriz Luz','Brasil','Natal','pt','Pesquisadora em diversidade','Diversidade','Interessa-se por inclusão, pertencimento e participação em espaços institucionais.',array['Diversidade','Inclusão','Pertencimento']::text[]),
('marcelo.vieira','Marcelo Vieira','Brasil','João Pessoa','pt','Pesquisador em mobilidade humana','Imigração','Estuda deslocamento, adaptação cultural e identidade do imigrante.',array['Imigração','Pertencimento','Cultura']::text[]),
('aline.barbosa','Aline Barbosa','Brasil','São Luís','pt','Pesquisadora em comportamento','Comportamento Humano','Analisa hábitos, decisão, contexto social e aprendizagem.',array['Comportamento Humano','Comportamento','Aprendizagem']::text[]),
('eduardo.reis','Eduardo Reis','Brasil','Belém','pt','Metodologista','Pesquisa Acadêmica','Compartilha práticas de leitura, escrita, pesquisa e comunicação científica.',array['Pesquisa Acadêmica','Pesquisa','Metodologia']::text[]),
('ines.carvalho','Inês Carvalho','Portugal','Lisboa','pt','Investigadora em psicanálise','Psicanálise','Interessa-se por clínica, cultura e escuta no contexto europeu.',array['Psicanálise','Clínica','Cultura']::text[]),
('joao.matos','João Matos','Portugal','Porto','pt','Investigador em educação','Educação','Estuda aprendizagem ao longo da vida e comunidades de prática.',array['Educação','Aprendizagem','Pesquisa']::text[]),
('marta.figueiredo','Marta Figueiredo','Portugal','Coimbra','pt','Investigadora','Neurodiversidade','Pesquisa inclusão académica e experiências de estudantes neurodivergentes.',array['Neurodiversidade','Inclusão','Educação']::text[]),
('tiago.neves','Tiago Neves','Portugal','Braga','pt','Consultor de carreira','Carreira Internacional','Escreve sobre mobilidade, competências transferíveis e integração profissional.',array['Carreira Internacional','Carreira','Mobilidade']::text[]),
('leonor.almeida','Leonor Almeida','Portugal','Aveiro','pt','Psicopedagoga','Psicopedagogia','Interessa-se por aprendizagem adulta e desenho pedagógico inclusivo.',array['Psicopedagogia','Aprendizagem','Educação']::text[]),
('rui.fonseca','Rui Fonseca','Portugal','Setúbal','pt','Especialista em pessoas','RH','Pesquisa cultura de trabalho, recrutamento e integração de equipas.',array['RH','Trabalho','Cultura Organizacional']::text[]),
('sofia.pires','Sofia Pires','Portugal','Faro','pt','Socióloga','Sociologia','Estuda turismo, mobilidade, cidade e transformações do trabalho.',array['Sociologia','Sociedade','Trabalho']::text[]),
('miguel.correia','Miguel Correia','Portugal','Évora','pt','Docente','Filosofia','Explora ética, cuidado, conhecimento e tecnologia.',array['Filosofia','Ética','Sociedade']::text[]),
('ana.martins','Ana Martins','Portugal','Viseu','pt','Educadora em saúde','Saúde Integrativa','Interessa-se por promoção de saúde, autocuidado e literacia.',array['Saúde Integrativa','Saúde','Autonomia']::text[]),
('pedro.ramos','Pedro Ramos','Portugal','Leiria','pt','Gestor e formador','Gestão','Escreve sobre projetos, aprendizagem de equipas e decisão.',array['Gestão','Projetos','Equipes']::text[]),
('carolina.lopes','Carolina Lopes','Portugal','Guimarães','pt','Investigadora em inclusão','Autismo','Foco em acessibilidade, comunicação e participação social.',array['Autismo','Inclusão','Acessibilidade']::text[]),
('nuno.brito','Nuno Brito','Portugal','Cascais','pt','Investigador em edtech','IA e Educação','Estuda inteligência artificial, avaliação e desenho de aprendizagem.',array['IA e Educação','IA','Educação']::text[]),
('camille.laurent','Camille Laurent','Bélgica','Bruxelles','fr','Chercheuse en neurodiversité','Neurodiversité','Travaille sur l''inclusion, l''éducation et le sentiment d''appartenance.',array['Neurodiversité','Inclusion','Éducation']::text[]),
('thomas.dubois','Thomas Dubois','Bélgica','Liège','fr','Chercheur en psychanalyse','Psychanalyse','S''intéresse à la clinique, à la culture et aux formes contemporaines du lien.',array['Psychanalyse','Clinique','Culture']::text[]),
('elodie.martin','Élodie Martin','Bélgica','Namur','fr','Chercheuse en éducation','Éducation','Explore l''apprentissage des adultes et les communautés de savoir.',array['Éducation','Apprentissage','Recherche']::text[]),
('lucas.ferreira.be','Lucas Ferreira BE','Bélgica','Bruxelles','pt','Pesquisador em migração','Imigração','Escreve sobre adaptação, pertencimento e vida profissional de imigrantes.',array['Imigração','Pertencimento','Cultura']::text[]),
('sophie.bernard','Sophie Bernard','Bélgica','Mons','fr','Chercheuse','Psychologie sociale','Étudie les groupes, l''identité, les institutions et les liens sociaux.',array['Psychologie sociale','Groupes','Appartenance']::text[]),
('alex.morgan.be','Alex Morgan','Bélgica','Brussels','en','Learning researcher','AI in Education','Explores AI-assisted learning, authorship, assessment and academic integrity.',array['AI in Education','AI','Learning']::text[]),
('nathalie.leroy','Nathalie Leroy','Bélgica','Charleroi','fr','Chercheuse en inclusion','Autisme','Travaille sur l''accessibilité et les environnements d''apprentissage.',array['Autisme','Inclusion','Accessibilité']::text[]),
('mateus.sousa.be','Mateus Sousa','Bélgica','Antwerpen','pt','Consultor de carreira','Carreira Internacional','Interessa-se por mobilidade profissional e integração no mercado europeu.',array['Carreira Internacional','Carreira','Europa']::text[]),
('claire.simon','Claire Simon','Bélgica','Leuven','fr','Éducatrice en santé','Santé intégrative','S''intéresse à la prévention, à l''autonomie et à la littératie en santé.',array['Santé intégrative','Santé','Prévention']::text[]),
('emma.collins.be','Emma Collins','Bélgica','Brussels','en','Academic researcher','Research Methods','Writes about research design, reading, evidence and scholarly communication.',array['Research Methods','Research','Writing']::text[]),
('lucia.herrera','Lucía Herrera','Espanha','Madrid','es','Investigadora en psicoanálisis','Psicoanálisis','Interesada en clínica, cultura y subjetividad contemporánea.',array['Psicoanálisis','Clínica','Cultura']::text[]),
('pablo.garcia','Pablo García','Espanha','Barcelona','es','Investigador','Neurodiversidad','Trabaja sobre inclusión, identidad y participación neurodivergente.',array['Neurodiversidad','Inclusión','Educación']::text[]),
('marta.sanchez','Marta Sánchez','Espanha','Valencia','es','Investigadora educativa','Educación','Estudia aprendizaje adulto, evaluación y comunidades de práctica.',array['Educación','Aprendizaje','Investigación']::text[]),
('diego.romero','Diego Romero','Espanha','Sevilla','es','Orientador profesional','Carrera','Escribe sobre transiciones laborales, identidad profesional y movilidad.',array['Carrera','Trabajo','Identidad']::text[]),
('elena.torres','Elena Torres','Espanha','Bilbao','es','Socióloga','Sociología','Investiga ciudad, trabajo, migración y vínculos sociales.',array['Sociología','Sociedad','Trabajo']::text[]),
('javier.molina','Javier Molina','Espanha','Málaga','es','Investigador en tecnología educativa','IA y Educación','Explora IA, autoría, evaluación y diseño de aprendizaje.',array['IA y Educación','IA','Educación']::text[]),
('sara.vidal','Sara Vidal','Espanha','Zaragoza','es','Investigadora en inclusión','Autismo','Trabaja sobre accesibilidad, comunicación y participación.',array['Autismo','Inclusión','Accesibilidad']::text[]),
('alvaro.castillo','Álvaro Castillo','Espanha','Granada','es','Profesor de filosofía','Filosofía','Reflexiona sobre ética, conocimiento, tecnología y cuidado.',array['Filosofía','Ética','Sociedad']::text[]),
('irene.navarro','Irene Navarro','Espanha','A Coruña','es','Psicopedagoga','Psicopedagogía','Interesada en aprendizaje, acompañamiento y diversidad.',array['Psicopedagogía','Aprendizaje','Educación']::text[]),
('carlos.vega','Carlos Vega','Espanha','Alicante','es','Gestor de proyectos','Gestión','Escribe sobre equipos, proyectos, aprendizaje e innovación.',array['Gestión','Proyectos','Equipos']::text[])
on conflict(username) do nothing;

-- Seed 150 distinct editorial posts (3 per profile).
with generated as (
  select p.id profile_id,p.language,p.city,p.country,p.specialty,g.n,
    case p.language
      when 'fr' then case g.n
        when 1 then 'Question ouverte depuis '||coalesce(p.city,'')||' : dans le champ de '||p.specialty||', comment reconnaître les différences sans réduire les personnes à des étiquettes ? Le contexte, l''écoute et la participation changent souvent la qualité du débat.'
        when 2 then 'À propos de '||p.specialty||' : quels critères utilisez-vous pour distinguer une tendance d''une pratique qui produit réellement des connaissances utiles ? Je serais curieux de comparer les méthodes utilisées dans différents contextes.'
        else 'Hypothèse de discussion en '||p.specialty||' : l''expérience devient apprentissage lorsqu''elle est documentée, discutée et révisée. Comment transformez-vous ce qui se passe sur le terrain en connaissances partageables ?' end
      when 'en' then case g.n
        when 1 then 'An open question from '||coalesce(p.city,'')||': in '||p.specialty||', how can we recognise differences without reducing people to labels? Context, listening and participation often change the quality of the conversation.'
        when 2 then 'Thinking about '||p.specialty||': what criteria help you separate a trend from a practice that actually produces useful knowledge? I would like to compare how this is approached in different settings.'
        else 'A discussion hypothesis in '||p.specialty||': experience becomes learning when it is documented, discussed and revised. How do you turn what happens in practice into knowledge that others can use?' end
      when 'es' then case g.n
        when 1 then 'Pregunta abierta desde '||coalesce(p.city,'')||': en '||p.specialty||', ¿cómo reconocer las diferencias sin reducir a las personas a etiquetas? El contexto, la escucha y la participación suelen cambiar la calidad del debate.'
        when 2 then 'Pensando en '||p.specialty||': ¿qué criterios utilizáis para distinguir una tendencia de una práctica que realmente produce conocimiento útil? Me interesa comparar cómo se evalúa en contextos diferentes.'
        else 'Hipótesis para debatir en '||p.specialty||': la experiencia se convierte en aprendizaje cuando se registra, se discute y se revisa. ¿Cómo transformáis lo que ocurre en la práctica en conocimiento compartible?' end
      else case g.n
        when 1 then 'Pergunta aberta a partir de '||coalesce(p.city,'')||': em '||p.specialty||', como reconhecer diferenças sem reduzir pessoas a rótulos? Contexto, escuta e participação costumam mudar a qualidade do debate.'
        when 2 then 'Pensando em '||p.specialty||': quais critérios ajudam vocês a separar uma tendência de uma prática que realmente produz conhecimento útil? Tenho interesse em comparar como isso é avaliado em contextos diferentes.'
        else 'Hipótese para discussão em '||p.specialty||': a experiência vira aprendizagem quando é registrada, discutida e revisada. Como vocês transformam o que acontece na prática em conhecimento compartilhável?' end
    end body,
    case g.n when 1 then 'question' when 2 then 'reflection' else 'debate' end post_type
  from public.academic_editorial_profiles p cross join generate_series(1,3) g(n)
)
insert into public.academic_editorial_posts(profile_id,body,post_type,language,location_label,topics,published_at)
select profile_id,body,post_type,language,concat_ws(', ',city,country),array[specialty,
  case language when 'fr' then 'Communauté' when 'es' then 'Comunidad' when 'en' then 'Community' else 'Comunidade' end,
  case language when 'fr' then 'Recherche' when 'es' then 'Investigación' when 'en' then 'Research' else 'Pesquisa' end]::text[],
  now()-((row_number() over(order by profile_id,n)%29)+1)*interval '1 day'-(n*3)*interval '1 hour'
from generated g
where not exists(select 1 from public.academic_editorial_posts e where e.profile_id=g.profile_id and e.body=g.body);

-- Seed 36 long-form academic/editorial articles across countries and languages.
with selected as (
  select p.*, row_number() over(order by p.country,p.username) rn
  from public.academic_editorial_profiles p
), generated as (
  select *,
    lower(regexp_replace(username,'[^a-z0-9._]+','','g'))||'-editorial' slug,
    case language
      when 'fr' then 'Penser '||specialty||' : contexte, participation et apprentissage'
      when 'en' then 'Thinking about '||specialty||': context, participation and learning'
      when 'es' then 'Pensar '||specialty||': contexto, participación y aprendizaje'
      else 'Notas para pensar '||specialty||': contexto, participação e aprendizagem' end title,
    case language
      when 'fr' then 'Une introduction aux liens entre contexte, participation et réflexion critique dans les débats contemporains autour de '||specialty||'.'
      when 'en' then 'An introductory reflection on how context, participation and critical inquiry shape contemporary discussions in '||specialty||'.'
      when 'es' then 'Una introducción a cómo el contexto, la participación y la reflexión crítica atraviesan los debates contemporáneos sobre '||specialty||'.'
      else 'Uma leitura introdutória sobre como contexto, participação e reflexão crítica atravessam debates contemporâneos em '||specialty||'.' end summary,
    case language
      when 'fr' then 'Réfléchir à '||specialty||' demande plus qu''une collection de techniques. Il faut comprendre comment le contexte organise possibilités, limites et participation. Le langage influence les attentes et les relations; l''expérience, elle, ne devient savoir que lorsqu''elle est documentée, comparée et discutée. Il est également utile de distinguer les effets de mode des connaissances étayées. Les communautés d''apprentissage permettent enfin de croiser des perspectives et de transformer une réflexion individuelle en processus collectif. Quelles questions vous paraissent aujourd''hui indispensables dans ce champ ?'
      when 'en' then 'Thinking about '||specialty||' requires more than collecting techniques. It means asking how context shapes possibilities, limits and participation. Language influences expectations and relationships; experience becomes knowledge only when it is documented, compared and discussed. It is equally important to distinguish evidence from trend. Learning communities widen the frame by turning individual reflection into a shared process. What questions do you think are essential in this field today?'
      when 'es' then 'Pensar '||specialty||' requiere algo más que reunir técnicas. Implica preguntar cómo el contexto organiza posibilidades, límites y participación. El lenguaje influye en expectativas y relaciones; la experiencia se convierte en conocimiento cuando se registra, compara y debate. También conviene distinguir la evidencia de la tendencia. Las comunidades de aprendizaje amplían perspectivas y convierten la reflexión individual en un proceso compartido. ¿Qué preguntas consideráis imprescindibles hoy en este campo?'
      else 'Pensar '||specialty||' exige mais do que reunir técnicas. Exige perguntar como o contexto organiza possibilidades, limites e participação. A linguagem influencia expectativas e relações; a experiência só se transforma em conhecimento quando é registrada, comparada e discutida. Também é importante distinguir evidência de tendência. Comunidades de aprendizagem ampliam perspectivas e transformam reflexão individual em processo coletivo. Quais perguntas são indispensáveis hoje nesse campo?' end body
  from selected where rn<=36
)
insert into public.academic_editorial_articles(profile_id,title,slug,summary,body,language,keywords,published_at)
select id,title,slug,summary,body,language,array[specialty,'LDR Academic Network']::text[],now()-((rn%31)+2)*interval '1 day'
from generated on conflict(slug) do nothing;

-- Add one transparent editorial discussion reply to the first seeded post of each profile.
insert into public.academic_editorial_comments(post_id,profile_id,body,language,published_at)
select p.id,p.profile_id,
  case p.language
    when 'fr' then 'Je garde surtout l''importance du contexte : une même idée peut avoir des effets très différents selon la manière dont elle est discutée et appliquée.'
    when 'en' then 'The part I keep coming back to is context: the same idea can have very different effects depending on how it is discussed and applied.'
    when 'es' then 'Me quedo sobre todo con la importancia del contexto: una misma idea puede tener efectos muy distintos según cómo se discuta y se aplique.'
    else 'O ponto que mais me chama atenção é o contexto: a mesma ideia pode produzir efeitos muito diferentes conforme a forma como é discutida e aplicada.' end,
  p.language,p.published_at+interval '2 hours'
from (
  select distinct on(profile_id) * from public.academic_editorial_posts order by profile_id,published_at
) p
where not exists(select 1 from public.academic_editorial_comments c where c.post_id=p.id);
