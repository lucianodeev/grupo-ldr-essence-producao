-- PREFLIGHT SOMENTE LEITURA. Não cria nem altera objetos.
-- Projeto confirmado: sfrcsrzuoqdscflfuwik
-- Executar no SQL Editor antes de desenhar migração.

-- 1. Objetos envolvidos e seus campos
select c.table_name,c.ordinal_position,c.column_name,c.data_type,c.udt_name,c.is_nullable,c.column_default
from information_schema.columns c
where c.table_schema='public' and c.table_name in
('appointments','appointment_events','appointment_calendar_sync','mentorships','mentorship_sessions','s8_sessions','session_credits','orders','deliveries','delivery_events','order_history')
order by c.table_name,c.ordinal_position;

-- 2. Chaves estrangeiras e ações de exclusão
select con.conrelid::regclass::text as source_table,con.conname,
       pg_get_constraintdef(con.oid) as definition
from pg_constraint con join pg_namespace n on n.oid=(select relnamespace from pg_class where oid=con.conrelid)
where n.nspname='public' and con.contype in ('f','u','p','c')
  and con.conrelid::regclass::text ~ '(appointment|mentorship|s8_session|session_credit|deliver|order)'
order by 1,2;

-- 3. RPCs relevantes (apenas assinaturas, não dados)
select p.proname,pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and (p.proname like '%appointment%' or p.proname like '%mentorship%')
order by 1;

-- 4. RLS e políticas
select schemaname,tablename,policyname,roles,cmd,qual,with_check
from pg_policies
where schemaname='public' and tablename in
('appointments','appointment_events','appointment_calendar_sync','mentorships','mentorship_sessions','s8_sessions','session_credits','orders','deliveries')
order by tablename,policyname;

-- 5. Estados persistidos válidos
select t.typname,e.enumlabel,e.enumsortorder
from pg_type t join pg_enum e on e.enumtypid=t.oid
where t.typname in ('delivery_status','session_status','payment_status')
order by t.typname,e.enumsortorder;

-- 6. Contagens agregadas sem divulgar informações pessoais
select 'mentorship_sessions' as source,count(*) as rows from public.mentorship_sessions
union all select 's8_sessions',count(*) from public.s8_sessions
union all select 'session_credits',count(*) from public.session_credits
union all select 'deliveries',count(*) from public.deliveries;
