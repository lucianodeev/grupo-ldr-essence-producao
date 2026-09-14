begin;

insert into public.platform_financial_config(config_key,numeric_value,text_value,active)
values ('platform_fee_percent',20,'20%',true)
on conflict (config_key) do update set numeric_value=20,text_value='20%',active=true,updated_at=now();

update public.subscription_plans set active=false,updated_at=now() where plan_code in ('professional','pro','360');
update public.professional_accounts set engagement_model='commission',custom_commission_rate=null,updated_at=now();

update public.platform_financial_config
set numeric_value=0.20,text_value='20% (legacy; use platform_fee_percent)',active=false,updated_at=now()
where config_key in ('platform_commission_rate','commission_social_clinic','commission_professional_direct','commission_ldr_generated');

alter table public.marketplace_payments add column if not exists platform_fee_percent_at_transaction numeric(5,2);
alter table public.professional_services add column if not exists language_codes text[] not null default '{}';
alter table public.professional_services add column if not exists available_for_private boolean not null default true;
alter table public.professional_services add column if not exists available_for_company boolean not null default false;
alter table public.professional_services add column if not exists image_url text;

update public.professional_categories set active=false where slug in ('recursos-humanos','consultoria-carreira','mentoria','consultores');
update public.professional_categories set active=true,sort_order=10 where slug='psicanalise';
update public.professional_categories set active=true,sort_order=20,regulated_by_default=true where slug='psicologia';

insert into public.professional_categories(slug,name_pt,name_en,name_fr,name_es,regulated_by_default,requires_admin_review,active,sort_order)
values
('fonoaudiologia','Fonoaudiologia','Speech-language therapy','Orthophonie','Fonoaudiología',true,true,true,30),
('terapia-ocupacional','Terapia Ocupacional','Occupational therapy','Ergothérapie','Terapia ocupacional',true,true,true,40),
('terapias-integrativas','Terapias Integrativas','Integrative therapies','Thérapies intégratives','Terapias integrativas',false,true,true,50),
('saude-emocional','Saúde Emocional','Emotional health','Santé émotionnelle','Salud emocional',false,true,true,70)
on conflict (slug) do update set name_pt=excluded.name_pt,name_en=excluded.name_en,name_fr=excluded.name_fr,name_es=excluded.name_es,regulated_by_default=excluded.regulated_by_default,requires_admin_review=true,active=true,sort_order=excluded.sort_order;

update public.professional_categories set name_pt='Terapias',name_en='Therapies',name_fr='Thérapies',name_es='Terapias',active=true,sort_order=60 where slug='terapeutas';
update public.professional_categories set name_pt='Bem-estar',name_en='Wellbeing',name_fr='Bien-être',name_es='Bienestar',active=true,sort_order=80 where slug='bem-estar';
update public.professional_categories set active=false where slug in ('massagistas','desenvolvimento-humano');

insert into public.audit_logs(action,target,details)
values ('platform_financial_config.global_fee_migrated','platform_fee_percent',jsonb_build_object('platform_fee_percent',20,'professional_net_percent',80,'historical_transactions_recalculated',false,'effective_at',now()));

commit;
