import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess, writeAudit } from "@/lib/access.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client=SupabaseClient<Database>;
const db=supabaseAdmin as unknown as {from:(table:string)=>any};
function fail(m:string):never{throw new Error(m)}
async function requireInternal(supabase:Client,userId:string,superOnly=false){const a=await resolveAccess(supabase,userId);if(!a.authorized||(superOnly&&a.role!=="superadmin"))fail("Acesso negado.");return a}

export async function getProfessionalNetworkAdmin(supabase:Client,userId:string){await requireInternal(supabase,userId,true);const [{data:profiles},{data:accounts},{data:subs},{data:plans},{data:payments},{data:payouts},{data:rules},{data:categories},{data:config},{data:events}]=await Promise.all([
 db.from("professional_profiles").select("id,professional_account_id,slug,display_name,professional_title,category_id,city,country_code,languages,online_enabled,in_person_enabled,identity_verified,documents_verified,profile_verified,compliance_status,profile_status,is_public,view_count,created_at,updated_at").order("created_at",{ascending:false}),
 db.from("professional_accounts").select("id,auth_user_id,status,onboarding_step,onboarding_completed,country_code,preferred_currency,connect_status,payout_method_status,created_at"),
 db.from("professional_subscriptions").select("id,professional_account_id,plan_id,status,current_period_start,current_period_end,cancel_at_period_end,created_at").order("created_at",{ascending:false}),
 db.from("subscription_plans").select("*").order("market").order("sort_order"),
 db.from("marketplace_payments").select("id,professional_account_id,status,gross_amount_cents,platform_fee_cents,payment_fee_cents,refund_amount_cents,adjustment_cents,provider_net_cents,currency,paid_at,created_at").order("created_at",{ascending:false}).limit(500),
 db.from("payouts").select("*").order("period_end",{ascending:false}).limit(300),
 db.from("professional_country_rules").select("id,country_code,category_id,requires_registration,requires_manual_review,registration_label,required_documents,allowed_modalities,advertising_restrictions,fiscal_requirements,legal_notice,active,reviewed_at"),
 db.from("professional_categories").select("id,slug,name_pt,regulated_by_default,requires_admin_review,active,sort_order").order("sort_order"),
 db.from("platform_financial_config").select("*").eq("active",true),
 db.from("professional_events").select("*").order("starts_at",{ascending:false}).limit(100),
]);
 const accountBy=new Map((accounts??[]).map((a:any)=>[a.id,a]));const subBy=new Map<string,any>();for(const s of subs??[]){if(!subBy.has(s.professional_account_id))subBy.set(s.professional_account_id,s)}
 return {profiles:(profiles??[]).map((p:any)=>({...p,account:accountBy.get(p.professional_account_id)??null,subscription:subBy.get(p.professional_account_id)??null})),plans:plans??[],payments:payments??[],payouts:payouts??[],rules:rules??[],categories:categories??[],config:config??[],events:events??[]};
}

export async function reviewProfessional(supabase:Client,userId:string,input:{profileId:string;action:"approve"|"pause"|"suspend"|"request_documents";identityVerified?:boolean;documentsVerified?:boolean;profileVerified?:boolean}){const actor=await requireInternal(supabase,userId,true);const {data:p}=await db.from("professional_profiles").select("id,slug,professional_account_id,category_id,country_code").eq("id",input.profileId).maybeSingle();if(!p)fail("Perfil não encontrado.");
 if(input.action==="approve"){
  const {data:rule}=await db.from("professional_country_rules").select("requires_registration,requires_manual_review,required_documents").eq("country_code",p.country_code).eq("category_id",p.category_id).eq("active",true).maybeSingle();
  if(!rule)fail("Regra de conformidade ainda não configurada e ativa para esta categoria e país.");
  if(p.slug!=="luciano-rodrigues-almeida"){const {data:activeSub}=await db.from("professional_subscriptions").select("id").eq("professional_account_id",p.professional_account_id).eq("status","active").limit(1);if(!(activeSub??[]).length)fail("A assinatura precisa estar ativa antes da aprovação do perfil.")}
  if(rule.requires_registration){const {data:cred}=await db.from("professional_credentials").select("id").eq("professional_account_id",p.professional_account_id).eq("category_id",p.category_id).eq("country_code",p.country_code).eq("status","verified").eq("meets_title_requirement",true).limit(1);if(!(cred??[]).length)fail("Registro profissional obrigatório ainda não validado.")}
  await db.from("professional_profiles").update({compliance_status:"approved",profile_status:"active",is_public:true,identity_verified:Boolean(input.identityVerified),documents_verified:Boolean(input.documentsVerified),profile_verified:Boolean(input.profileVerified),reviewed_at:new Date().toISOString(),reviewed_by:userId}).eq("id",p.id);
  await db.from("professional_accounts").update({status:"active",updated_at:new Date().toISOString()}).eq("id",p.professional_account_id);
 } else if(input.action==="request_documents") {await db.from("professional_profiles").update({compliance_status:"needs_review",profile_status:"review",is_public:false,updated_at:new Date().toISOString()}).eq("id",p.id);await db.from("professional_accounts").update({status:"documents_pending",updated_at:new Date().toISOString()}).eq("id",p.professional_account_id)}
 else {const suspended=input.action==="suspend";await db.from("professional_profiles").update({profile_status:suspended?"suspended":"paused",is_public:false,updated_at:new Date().toISOString()}).eq("id",p.id);await db.from("professional_accounts").update({status:suspended?"suspended":"paused",updated_at:new Date().toISOString()}).eq("id",p.professional_account_id)}
 await writeAudit({actorId:userId,actorEmail:actor.email,action:`professional_network.${input.action}`,target:p.id});return {ok:true as const};
}

export async function updateNetworkFinancialConfig(supabase:Client,userId:string,input:{commissionPercent?:number;payoutFrequencyDays?:number;plans?:Array<{id:string;amountCents:number}>}){const actor=await requireInternal(supabase,userId,true);if(input.commissionPercent!=null){const pct=Number(input.commissionPercent);if(!Number.isFinite(pct)||pct<0||pct>50)fail("Comissão deve estar entre 0% e 50%.");await db.from("platform_financial_config").update({numeric_value:pct/100,text_value:`${pct}%`,updated_at:new Date().toISOString(),updated_by:userId}).eq("config_key","platform_commission_rate")}
 if(input.payoutFrequencyDays!=null){const d=Math.round(Number(input.payoutFrequencyDays));if(d<1||d>90)fail("Periodicidade inválida.");await db.from("platform_financial_config").update({numeric_value:d,text_value:d===30?"monthly":`${d} days`,updated_at:new Date().toISOString(),updated_by:userId}).eq("config_key","payout_frequency_days")}
 for(const p of input.plans??[]){const amount=Math.round(Number(p.amountCents));if(amount<=0)fail("Valor de plano inválido.");await db.from("subscription_plans").update({amount_cents:amount,updated_at:new Date().toISOString()}).eq("id",p.id)}
 await writeAudit({actorId:userId,actorEmail:actor.email,action:"professional_network.financial_config_updated",details:{commissionPercent:input.commissionPercent,payoutFrequencyDays:input.payoutFrequencyDays,plans:input.plans?.length??0}});return {ok:true as const};
}

export async function prepareProfessionalPayout(supabase:Client,userId:string,input:{professionalAccountId:string;periodStart:string;periodEnd:string;currency:"EUR"|"BRL";scheduledFor?:string|null}){const actor=await requireInternal(supabase,userId,true);const {data:payments}=await db.from("marketplace_payments").select("gross_amount_cents,platform_fee_cents,payment_fee_cents,refund_amount_cents,adjustment_cents,provider_net_cents,paid_at,status").eq("professional_account_id",input.professionalAccountId).eq("currency",input.currency).in("status",["paid","partially_refunded"]).gte("paid_at",`${input.periodStart}T00:00:00Z`).lte("paid_at",`${input.periodEnd}T23:59:59Z`);const rows=payments??[];const sum=(k:string)=>rows.reduce((s:number,x:any)=>s+Number(x[k]??0),0);const payload={professional_account_id:input.professionalAccountId,period_start:input.periodStart,period_end:input.periodEnd,currency:input.currency,gross_cents:sum("gross_amount_cents"),platform_fee_cents:sum("platform_fee_cents"),payment_fee_cents:sum("payment_fee_cents"),refund_cents:sum("refund_amount_cents"),adjustment_cents:sum("adjustment_cents"),net_cents:sum("provider_net_cents"),status:"awaiting_documentation",scheduled_for:input.scheduledFor||null,updated_at:new Date().toISOString()};const {error}=await db.from("payouts").upsert(payload,{onConflict:"professional_account_id,period_start,period_end,currency"});if(error)throw error;await writeAudit({actorId:userId,actorEmail:actor.email,action:"professional_network.payout_prepared",target:input.professionalAccountId,details:{periodStart:input.periodStart,periodEnd:input.periodEnd,currency:input.currency}});return {ok:true as const};
}
