begin;

-- The live schema retains the public Master helper. Install its private
-- equivalent only on installations that have not already migrated it.
create schema if not exists private;
do $migration$
begin
  if to_regprocedure('private.is_superadmin(uuid)') is null then
    create function private.is_superadmin(_user_id uuid)
      returns boolean language sql stable security definer set search_path = ''
      as $helper$
        select exists (
          select 1 from public.profiles p
          join public.user_roles r on r.user_id = p.id
          where p.id = _user_id and p.is_active and r.role = 'superadmin'
        )
      $helper$;
    revoke all on function private.is_superadmin(uuid) from public, anon, authenticated;
  end if;
end
$migration$;

create table public.feira360_partners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 64),
  name text not null check (length(name) between 2 and 100),
  bio text not null check (length(bio) between 15 and 1600),
  locality text not null check (length(locality) between 2 and 100),
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  plan text not null default 'basic' check (plan in ('basic','premium')),
  featured_until timestamptz,
  created_at timestamptz not null default now()
);
create table public.feira360_services (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.feira360_partners(id),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 64),
  title text not null check (length(title) between 3 and 100),
  description text not null check (length(description) between 15 and 2000),
  category text not null check (category in ('consultoria','tecnologia','formacao','criativos','bem-estar','outros')),
  modality text not null check (modality in ('online','presencial','hibrido')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  price_cents integer check (price_cents between 1 and 100000000),
  unique (partner_id, slug)
);
create table public.feira360_settings (
  singleton boolean primary key default true check (singleton),
  commission_bps integer not null default 1500 check (commission_bps between 0 and 10000)
);
insert into public.feira360_settings default values;

create table public.feira360_quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id),
  customer_email text not null,
  service_id uuid not null references public.feira360_services(id),
  brief text not null check (length(brief) between 20 and 2000),
  source text check (source ~ '^[A-Za-z0-9_-]{1,60}$'),
  consent_at timestamptz not null default now(),
  consent_version text not null default 'quote-share-v1',
  status text not null default 'new' check (status in ('new','forwarded','in_progress','won','closed')),
  created_at timestamptz not null default now(),
  commission_bps integer not null check (commission_bps between 0 and 10000),
  contract_cents integer check (contract_cents between 1 and 100000000),
  commission_cents integer generated always as ((contract_cents::bigint * commission_bps + 5000) / 10000) stored,
  check ((status = 'won') = (contract_cents is not null))
);
create index feira360_quotes_customer_created_idx on public.feira360_quotes(customer_id, created_at);
create index feira360_quotes_service_idx on public.feira360_quotes(service_id);
create table public.feira360_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id),
  action text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.feira360_partners enable row level security;
alter table public.feira360_services enable row level security;
alter table public.feira360_quotes enable row level security;
alter table public.feira360_settings enable row level security;
alter table public.feira360_audit enable row level security;
revoke all on public.feira360_partners, public.feira360_services, public.feira360_quotes,
  public.feira360_settings, public.feira360_audit from public, anon, authenticated;

create function public.feira360_catalog(
  p_query text default '', p_category text default '', p_locality text default '',
  p_modality text default '', p_partner text default '', p_service text default '', p_offset integer default 0
) returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(result) order by result.featured desc, result.partner_name, result.partner_slug, result.slug), '[]'::jsonb)
  from (
    select s.slug, s.title, s.description, s.category, s.modality, s.price_cents,
      p.slug as partner_slug, p.name as partner_name, p.bio as partner_bio, p.locality,
      coalesce(p.featured_until > now() and p.plan = 'premium', false) as featured
    from public.feira360_services s join public.feira360_partners p on p.id = s.partner_id
    where p.status = 'approved' and s.status = 'approved'
      and (p_partner = '' or p.slug = p_partner)
      and (p_service = '' or s.slug = p_service)
      and (p_category = '' or s.category = p_category)
      and (p_modality = '' or s.modality = p_modality)
      and strpos(lower(p.locality), lower(left(p_locality, 100))) > 0
      and strpos(lower(concat_ws(' ', s.title, s.description, p.name)), lower(left(p_query, 100))) > 0
    order by featured desc, p.name, p.slug, s.slug
    limit 25 offset greatest(p_offset, 0)
  ) result
$$;

create function public.feira360_account(p_action text, p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  partner public.feira360_partners;
  job public.feira360_quotes;
  target uuid;
  next_status text := p_data->>'status';
  next_plan text := p_data->>'plan';
  rate integer;
  email_address text;
  price integer;
begin
  if actor is null then
    raise exception using errcode = '42501', message = 'Inicie sessão para continuar.';
  end if;

  if p_action in ('apply', 'add_service') then
    if not exists (select 1 from auth.users u where u.id = actor and u.email_confirmed_at is not null) then
      raise exception using errcode = '42501', message = 'Confirme o e-mail da sua conta.';
    end if;
    if p_action = 'apply' then
      insert into public.feira360_partners(owner_id, slug, name, bio, locality)
      values (actor, trim(p_data->>'slug'), trim(p_data->>'name'), trim(p_data->>'bio'), trim(p_data->>'locality'))
      returning * into partner;
    else
      select * into partner from public.feira360_partners where owner_id = actor and status = 'approved' for update;
      if not found then
        raise exception using errcode = '42501', message = 'Aguarde a aprovação do perfil.';
      end if;
      if (select count(*) from public.feira360_services where partner_id = partner.id) >= 25 then
        raise exception using errcode = '22023', message = 'O perfil atingiu o limite de serviços.';
      end if;
    end if;
    insert into public.feira360_services(partner_id, slug, title, description, category, modality, price_cents, status)
    values (partner.id, trim(p_data->>'serviceSlug'), trim(p_data->>'title'), trim(p_data->>'description'),
      p_data->>'category', p_data->>'modality', nullif(p_data->>'priceCents','')::integer,
      case when p_action = 'apply' then 'approved' else 'pending' end)
    returning id into target;
    insert into public.feira360_audit(actor_id, action, target_id)
      values (actor, p_action, case when p_action = 'apply' then partner.id else target end);
    return to_jsonb(case when p_action = 'apply' then partner.id else target end);
  end if;

  if p_action = 'quote' then
    if (p_data->'consent') is distinct from 'true'::jsonb then
      raise exception using errcode = '22023', message = 'Confirme a partilha dos dados do pedido.';
    end if;
    select s.id into target
      from public.feira360_services s join public.feira360_partners p on p.id = s.partner_id
      where p.slug = p_data->>'partner' and s.slug = p_data->>'service' and p.status = 'approved' and s.status = 'approved'
      for share of p, s;
    if target is null then
      raise exception using errcode = '22023', message = 'Este serviço não está disponível.';
    end if;
    select u.email into email_address from auth.users u where u.id = actor and u.email_confirmed_at is not null;
    if email_address is null then
      raise exception using errcode = '42501', message = 'Confirme o e-mail da sua conta.';
    end if;
    perform pg_advisory_xact_lock(hashtextextended('feira360-quote:' || actor::text, 0));
    if (select count(*) from public.feira360_quotes
          where customer_id = actor and created_at > now() - interval '1 hour') >= 5
      or exists (select 1 from public.feira360_quotes where customer_id = actor and service_id = target
        and brief = trim(p_data->>'brief') and created_at > now() - interval '10 minutes') then
      raise exception using errcode = '22023', message = 'Já enviou este pedido ou atingiu o limite horário.';
    end if;
    select commission_bps into strict rate from public.feira360_settings;
    insert into public.feira360_quotes(customer_id, customer_email, service_id, brief, source, commission_bps)
    values (actor, email_address, target, trim(p_data->>'brief'), nullif(p_data->>'source',''), rate)
    returning * into job;
    insert into public.feira360_audit(actor_id, action, target_id) values (actor, p_action, job.id);
    return to_jsonb(job.id);
  end if;

  if p_action = 'partner_dashboard' then
    select * into partner from public.feira360_partners where owner_id = actor;
    return jsonb_build_object('partner', case when partner.id is not null then
      jsonb_build_object('name',partner.name,'slug',partner.slug,'status',partner.status,'plan',partner.plan) end,
      'services', coalesce((select jsonb_agg(jsonb_build_object('slug',s.slug,'title',s.title,'status',s.status)
        order by s.title, s.slug) from public.feira360_services s where s.partner_id = partner.id), '[]'::jsonb),
      'quotes', coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at desc) from (
        select q.id, q.brief, q.customer_email, q.status, q.created_at, q.commission_cents, s.title
        from public.feira360_quotes q join public.feira360_services s on s.id = q.service_id
        where s.partner_id = partner.id and partner.status = 'approved' and q.status not in ('new','closed')
        order by q.created_at desc limit 100
      ) q), '[]'::jsonb));
  end if;

  if p_action = 'acknowledge' then
    select p.* into partner from public.feira360_partners p
      where p.owner_id = actor and p.status = 'approved' for share;
    update public.feira360_quotes q set status = 'in_progress'
      from public.feira360_services s
      where q.id = (p_data->>'id')::uuid and q.service_id = s.id and s.partner_id = partner.id
        and q.status = 'forwarded' returning q.* into job;
    if not found then
      raise exception using errcode = '42501', message = 'Oportunidade indisponível.';
    end if;
    insert into public.feira360_audit(actor_id, action, target_id) values (actor, p_action, job.id);
    return to_jsonb(job.id);
  end if;

  if private.is_superadmin(actor) is not true then
    raise exception using errcode = '42501', message = 'Acesso exclusivo da Área Master.';
  end if;

  if p_action = 'master_dashboard' then
    return jsonb_build_object(
      'rate', (select commission_bps from public.feira360_settings),
      'partners', coalesce((select jsonb_agg(to_jsonb(p) order by (p.status = 'pending') desc, p.created_at desc) from (
        select p.*, (select jsonb_agg(to_jsonb(s)) from public.feira360_services s where s.partner_id = p.id) as services
        from public.feira360_partners p order by (p.status = 'pending') desc, p.created_at desc limit 100
      ) p), '[]'::jsonb),
      'quotes', coalesce((select jsonb_agg(to_jsonb(q) order by (q.status = 'new') desc, q.created_at desc) from (
        select q.*, s.title, p.name as partner_name, p.status as partner_status
        from public.feira360_quotes q join public.feira360_services s on s.id = q.service_id
        join public.feira360_partners p on p.id = s.partner_id order by (q.status = 'new') desc, q.created_at desc limit 100
      ) q), '[]'::jsonb),
      'audit', coalesce((select jsonb_agg(to_jsonb(a) order by a.id desc) from (
        select * from public.feira360_audit order by id desc limit 30
      ) a), '[]'::jsonb));
  end if;

  if p_action = 'moderate' and next_status in ('approved','rejected','suspended') then
    update public.feira360_partners set status = next_status
      where id = (p_data->>'id')::uuid and status <> next_status returning id into target;
  elsif p_action = 'moderate_service' and next_status in ('approved','rejected','suspended') then
    update public.feira360_services set status = next_status
      where id = (p_data->>'id')::uuid and status <> next_status returning id into target;
  elsif p_action = 'monetization' and next_plan in ('basic','premium') then
    update public.feira360_partners set plan = next_plan, featured_until =
      case when next_plan = 'premium' and p_data->'featured' = 'true'::jsonb then now() + interval '30 days' end
      where id = (p_data->>'id')::uuid and status = 'approved' returning id into target;
  elsif p_action = 'commission_rate' then
    rate := (p_data->>'bps')::integer;
    update public.feira360_settings set commission_bps = rate;
  elsif p_action = 'quote_status' and next_status in ('forwarded','won','closed') then
    if next_status = 'won' then
      price := (p_data->>'contractCents')::integer;
    end if;
    target := (p_data->>'id')::uuid;
    if next_status = 'forwarded' then
      perform p.id from public.feira360_quotes q join public.feira360_services s on s.id = q.service_id
        join public.feira360_partners p on p.id = s.partner_id
        where q.id = target and p.status = 'approved' and s.status = 'approved' for share of p, s;
      if not found then
        raise exception using errcode = '22023', message = 'O parceiro e o serviço precisam estar aprovados.';
      end if;
    end if;
    update public.feira360_quotes set status = next_status, contract_cents = price
      where id = target and (
        (status = 'new' and next_status = 'forwarded') or
        (status in ('forwarded','in_progress') and next_status = 'won') or
        (status in ('new','forwarded','in_progress') and next_status = 'closed')
      ) returning id into target;
  else
    raise exception using errcode = '22023', message = 'Operação inválida.';
  end if;
  if target is null and p_action <> 'commission_rate' then
    raise exception using errcode = '22023', message = 'A operação não se aplica ao estado atual.';
  end if;
  insert into public.feira360_audit(actor_id, action, target_id, details)
    values (actor, p_action, target, jsonb_strip_nulls(jsonb_build_object(
      'status', next_status, 'plan', next_plan, 'rate', rate, 'contract_cents', price,
      'featured', case when p_action = 'monetization' then p_data->'featured' end)));
  return to_jsonb(coalesce(target::text, rate::text));
end;
$$;
revoke all on function public.feira360_catalog(text,text,text,text,text,text,integer) from public, anon, authenticated;
revoke all on function public.feira360_account(text,jsonb) from public, anon, authenticated;
grant execute on function public.feira360_catalog(text,text,text,text,text,text,integer) to anon, authenticated;
grant execute on function public.feira360_account(text,jsonb) to authenticated;

commit;
