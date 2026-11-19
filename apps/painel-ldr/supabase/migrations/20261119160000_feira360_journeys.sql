begin;

create table public.feira360_briefs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id),
  customer_email text not null,
  request_key uuid not null,
  category text not null check (category in ('digital', 'rh', 'mentoria')),
  brief text not null check (length(brief) between 20 and 2000),
  deadline text not null check (length(deadline) between 1 and 100),
  budget_cents integer check (budget_cents between 0 and 100000000),
  referral_id uuid references public.feira360_partners(id),
  partner_id uuid references public.feira360_partners(id),
  contact_id uuid unique references public.ecosystem_contacts(id),
  order_id uuid unique references public.orders(id),
  status text not null default 'received' check (status in ('received','review','forwarded','canceled')),
  commission_bps integer not null check (commission_bps between 0 and 10000),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (customer_id, request_key)
);
create index feira360_briefs_partner_idx on public.feira360_briefs(partner_id, created_at desc);
create index feira360_briefs_referral_idx on public.feira360_briefs(referral_id);
-- A single payable proposal for each FEIRA 360 support contact.
create unique index feira360_one_approved_proposal_idx on public.orders ((metadata->>'contact_id'))
  where metadata->>'checkout_kind' = 'enterprise_quote'
    and metadata->>'source_project' = 'FEIRA 360'
    and metadata->>'quote_state' in ('approved','accepted');

create table public.feira360_brief_commissions (
  brief_id uuid primary key references public.feira360_briefs(id),
  order_id uuid not null unique references public.orders(id),
  amount_cents integer not null check (amount_cents >= 0),
  recorded_at timestamptz not null default now()
);

alter table public.feira360_briefs enable row level security;
alter table public.feira360_brief_commissions enable row level security;
revoke all on public.feira360_briefs, public.feira360_brief_commissions from public, anon, authenticated;

create function private.feira360_record_paid_brief(p_order uuid)
returns void language sql security definer set search_path = '' as $$
  insert into public.feira360_brief_commissions (brief_id, order_id, amount_cents)
  select b.id, o.id, ((o.amount_cents::bigint * b.commission_bps + 5000) / 10000)::integer
  from public.feira360_briefs b join public.orders o on o.id = b.order_id
  where o.id = p_order and b.status = 'forwarded' and b.partner_id is not null
    and o.payment_status = 'pago' and o.currency = 'EUR' and o.amount_cents > 0
    and o.metadata->>'checkout_kind' = 'enterprise_quote'
    and o.metadata->>'quote_state' = 'accepted'
    and o.metadata->>'user_id' = b.customer_id::text
    and o.customer_id is not null and o.stripe_checkout_session_id is not null
  on conflict (brief_id) do nothing;
$$;
revoke all on function private.feira360_record_paid_brief(uuid) from public, anon, authenticated;

create function private.feira360_capture_paid_brief()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.payment_status = 'pago' and old.payment_status is distinct from new.payment_status then
    perform private.feira360_record_paid_brief(new.id);
  end if;
  return new;
end;
$$;
revoke all on function private.feira360_capture_paid_brief() from public, anon, authenticated;
create trigger feira360_capture_paid_brief after update of payment_status on public.orders
for each row execute function private.feira360_capture_paid_brief();

create function public.feira360_journeys(p_action text, p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  record public.feira360_briefs;
  recipient public.feira360_partners;
  contact uuid;
  order_ref uuid;
  referral uuid;
  email text;
  request_id uuid;
  previous uuid;
  source_token text := p_data->>'source';
begin
  if actor is null then raise exception using errcode = '42501', message = 'Inicie sessão.'; end if;

  if p_action = 'submit' then
    if p_data->'consent' is distinct from 'true'::jsonb then
      raise exception using errcode = '22023', message = 'Confirme a partilha dos dados do pedido.';
    end if;
    request_id := (p_data->>'requestKey')::uuid;
    if request_id is null then raise exception using errcode = '22023', message = 'Identificador do pedido obrigatório.'; end if;
    select lower(u.email) into email from auth.users u where u.id = actor and u.email_confirmed_at is not null;
    if email is null then raise exception using errcode = '42501', message = 'Confirme o e-mail da conta.'; end if;
    perform pg_advisory_xact_lock(hashtextextended('feira360-brief:' || actor::text, 0));
    select * into record from public.feira360_briefs b where b.customer_id = actor and b.request_key = request_id;
    if found then return to_jsonb(record.id); end if;
    select b.id into previous from public.feira360_briefs b
      where b.customer_id = actor and b.created_at > now() - interval '10 minutes' and b.status <> 'canceled'
        and b.category = p_data->>'category' and b.brief = trim(p_data->>'brief')
        and b.deadline = trim(p_data->>'deadline')
        and b.budget_cents is not distinct from (p_data->>'budgetCents')::integer
      order by b.created_at desc limit 1;
    if found then return to_jsonb(previous); end if;
    if (select count(*) from public.feira360_briefs where customer_id = actor and created_at > now() - interval '1 hour') >= 5 then
      raise exception using errcode = '22023', message = 'Atingiu o limite horário de pedidos.';
    end if;
    select id into referral from public.feira360_partners
      where status = 'approved' and 'ldr-' || id::text = source_token;
    insert into public.feira360_briefs (customer_id, customer_email, request_key, category, brief, deadline, budget_cents, referral_id, commission_bps)
    select actor, email, request_id, p_data->>'category', trim(p_data->>'brief'), trim(p_data->>'deadline'),
      (p_data->>'budgetCents')::integer, referral, commission_bps
    from public.feira360_settings returning * into record;
    insert into public.feira360_audit(actor_id, action, target_id) values(actor, 'brief_submit', record.id);
    return to_jsonb(record.id);
  end if;

  if p_action = 'mine' then
    return jsonb_build_object(
      'briefs', coalesce((select jsonb_agg(to_jsonb(item)) from (
        select b.id, b.category, b.brief, b.deadline, b.budget_cents, b.created_at,
          case when o.payment_status = 'pago' and o.status = 'concluido' then 'done'
               when o.payment_status = 'pago' then 'contracted'
               when o.status = 'cancelado' or o.payment_status::text in ('estornado', 'reembolsado') then 'canceled'
               when o.metadata->>'quote_state' in ('approved','accepted') then 'proposal'
               else b.status end as status,
          case when o.metadata->>'quote_state' in ('approved','accepted') then o.id end as order_id,
          coalesce(o.payment_status = 'pago', false) as paid,
          b.status in ('received','review','forwarded') and b.contact_id is null as cancelable
        from public.feira360_briefs b left join public.orders o on o.id = b.order_id
        where b.customer_id = actor order by b.created_at desc, b.id limit 100
      ) item), '[]'::jsonb),
      'quotes', coalesce((select jsonb_agg(to_jsonb(item)) from (
        select q.id, s.title, q.brief, q.status, q.created_at
        from public.feira360_quotes q join public.feira360_services s on s.id = q.service_id
        where q.customer_id = actor order by q.created_at desc, q.id limit 100
      ) item), '[]'::jsonb));
  end if;

  if p_action = 'partner' then
    select * into recipient from public.feira360_partners where owner_id = actor and status = 'approved';
    if not found then return null; end if;
    return jsonb_build_object(
      'ref', 'ldr-' || recipient.id::text,
      'attributed', (select count(*) from public.feira360_briefs where referral_id = recipient.id) +
        (select count(*) from public.feira360_quotes where source = 'ldr-' || recipient.id::text),
      'converted', (select count(*) from public.feira360_briefs b join public.feira360_brief_commissions c on c.brief_id = b.id where b.referral_id = recipient.id) +
        (select count(*) from public.feira360_quotes where source = 'ldr-' || recipient.id::text and status = 'won'),
      'briefs', coalesce((select jsonb_agg(to_jsonb(item)) from (
        select id, category, brief, deadline, budget_cents, created_at
        from public.feira360_briefs where partner_id = recipient.id and status = 'forwarded'
        order by created_at desc, id limit 100
      ) item), '[]'::jsonb));
  end if;

  if p_action = 'cancel' then
    update public.feira360_briefs set status = 'canceled'
      where id = (p_data->>'id')::uuid and customer_id = actor
      and status in ('received','review','forwarded') and contact_id is null returning * into record;
    if not found then raise exception using errcode = '22023', message = 'Este pedido não pode ser cancelado.'; end if;
    insert into public.feira360_audit(actor_id, action, target_id) values(actor, 'brief_cancel', record.id);
    return to_jsonb(record.id);
  end if;

  if p_action = 'cancel_direct' then
    update public.feira360_quotes set status = 'closed'
      where id = (p_data->>'id')::uuid and customer_id = actor and status = 'new'
      returning id into order_ref;
    if not found then raise exception using errcode = '22023', message = 'Este pedido não pode ser cancelado.'; end if;
    insert into public.feira360_audit(actor_id, action, target_id) values(actor, 'quote_customer_cancel', order_ref);
    return to_jsonb(order_ref);
  end if;

  if private.is_superadmin(actor) is not true then
    raise exception using errcode = '42501', message = 'Acesso exclusivo da Área Master.';
  end if;

  if p_action = 'master' then
    return coalesce((select jsonb_agg(to_jsonb(item)) from (
      select b.*, p.name as referral_name, c.amount_cents as commission_cents, linked.payment_status as payment_status,
        coalesce((select jsonb_agg(jsonb_build_object('id', o.id, 'number', o.order_number, 'title', o.title))
          from public.orders o where b.contact_id is not null and o.metadata->>'contact_id' = b.contact_id::text
            and o.metadata->>'checkout_kind' = 'enterprise_quote' and o.metadata->>'quote_state' in ('approved','accepted')
            and o.currency = 'EUR' and o.status <> 'cancelado'), '[]'::jsonb) as proposals
      from public.feira360_briefs b left join public.feira360_partners p on p.id = b.referral_id
      left join public.feira360_brief_commissions c on c.brief_id = b.id
      left join public.orders linked on linked.id = b.order_id
      order by b.created_at desc, b.id limit 100
    ) item), '[]'::jsonb);
  end if;

  select * into record from public.feira360_briefs where id = (p_data->>'id')::uuid for update;
  if not found then raise exception using errcode = '22023', message = 'Pedido indisponível.'; end if;
  if p_action = 'review' and record.status = 'received' then
    update public.feira360_briefs set status = 'review' where id = record.id;
  elsif p_action = 'forward' and record.status in ('received','review') then
    select * into recipient from public.feira360_partners
      where id = (p_data->>'partnerId')::uuid and status = 'approved' for share;
    if not found then raise exception using errcode = '22023', message = 'Selecione um parceiro aprovado.'; end if;
    update public.feira360_briefs set status = 'forwarded', partner_id = recipient.id where id = record.id;
  elsif p_action = 'prepare_proposal' and record.status = 'forwarded' then
    if record.contact_id is not null then return to_jsonb(record.contact_id); end if;
    insert into public.ecosystem_contacts
      (name, email, subject, message, source_project, source_url, language, wants_luciano, consent_contact)
    values ('Cliente FEIRA 360', record.customer_email, 'Serviços para empresas',
      concat_ws(chr(10), 'Organização: FEIRA 360', 'Pedido: ' || record.id::text,
        'Categoria: ' || record.category, 'Prazo: ' || record.deadline, record.brief),
      'FEIRA 360', 'https://ldrecossistema.online/feira360', 'pt', false, true)
    returning id into contact;
    update public.feira360_briefs set contact_id = contact where id = record.id;
  elsif p_action = 'link_proposal' and record.status = 'forwarded' and record.contact_id is not null then
    order_ref := (p_data->>'orderId')::uuid;
    if record.order_id = order_ref then return to_jsonb(order_ref); end if;
    if record.order_id is not null then raise exception using errcode = '22023', message = 'Este pedido já tem uma proposta vinculada.'; end if;
    perform 1 from public.orders o where o.id = order_ref and lower(o.contact_email) = record.customer_email
      and o.metadata->>'contact_id' = record.contact_id::text and o.metadata->>'checkout_kind' = 'enterprise_quote'
      and o.metadata->>'quote_state' in ('approved','accepted') and o.currency = 'EUR' and o.status <> 'cancelado'
      and (o.metadata->>'quote_state' = 'approved' or o.metadata->>'user_id' = record.customer_id::text)
      for update;
    if not found then raise exception using errcode = '22023', message = 'Selecione uma proposta aprovada em euros deste pedido.'; end if;
    update public.feira360_briefs set order_id = order_ref where id = record.id;
    perform private.feira360_record_paid_brief(order_ref);
  else
    raise exception using errcode = '22023', message = 'Transição indisponível para este pedido.';
  end if;
  insert into public.feira360_audit(actor_id, action, target_id) values(actor, 'brief_' || p_action, record.id);
  return to_jsonb(coalesce(contact, order_ref, record.id));
end;
$$;
revoke all on function public.feira360_journeys(text, jsonb) from public, anon, authenticated;
grant execute on function public.feira360_journeys(text, jsonb) to authenticated;
commit;
