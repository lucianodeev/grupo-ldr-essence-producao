import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db=supabaseAdmin as unknown as {from:(table:string)=>any};
function fail(message:string):never{throw new Error(message)}

async function context(userId:string){
  const {data:account}=await db.from("professional_accounts").select("id,status,preferred_currency,country_code").eq("auth_user_id",userId).maybeSingle();
  if(!account)fail("Área profissional não encontrada.");
  const {data:profile}=await db.from("professional_profiles").select("id,professional_account_id,category_id,country_code,city,compliance_status,profile_status,is_public").eq("professional_account_id",account.id).maybeSingle();
  if(!profile)fail("Complete seu perfil antes de escolher serviços.");
  return {account,profile};
}

async function activeSubscription(accountId:string){
  const {data}=await db.from("professional_subscriptions").select("id,status,current_period_end,plan_id,subscription_plans(plan_code,name)").eq("professional_account_id",accountId).eq("status","active").order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(!data)return null;
  if(data.current_period_end&&new Date(data.current_period_end).getTime()<=Date.now())return null;
  return data;
}

export async function getCatalogServicesForProfessional(userId:string){
  const {account,profile}=await context(userId);
  const currency=(profile.country_code||account.country_code)==="BR"?"BRL":"EUR";
  const [{data:elig},{data:current},{data:config},{data:sub}]=await Promise.all([
    db.from("professional_service_eligibility").select("catalog_key,country_code,allowed_modalities,requires_admin_review,notes").eq("category_id",profile.category_id).eq("active",true),
    db.from("professional_services").select("id,catalog_key,name,modality,duration_minutes,currency,price_cents,public_location,booking_enabled,active,source_type,approval_status,requires_admin_review").eq("professional_profile_id",profile.id).order("sort_order"),
    db.from("platform_financial_config").select("numeric_value").eq("config_key","platform_commission_rate").eq("active",true).maybeSingle(),
    activeSubscription(account.id),
  ]);
  const allowedRows=(elig??[]).filter((e:any)=>!e.country_code||e.country_code===profile.country_code);
  const keys=[...new Set(allowedRows.map((e:any)=>e.catalog_key))];
  let catalog:any[]=[];
  if(keys.length){const {data}=await db.from("service_catalog").select("catalog_key,name,category,currency,amount_cents,billing_model,package_sessions,billing_cadence,is_clinical,active,sort_order").in("catalog_key",keys).eq("active",true).order("sort_order");catalog=data??[]}
  const currentByKey=new Map((current??[]).filter((x:any)=>x.catalog_key).map((x:any)=>[x.catalog_key,x]));
  const eligibilityByKey=new Map(allowedRows.map((x:any)=>[x.catalog_key,x]));
  const options=catalog.map((service:any)=>({
    ...service,
    market_available:service.currency===currency,
    eligibility:eligibilityByKey.get(service.catalog_key)??null,
    selected:currentByKey.get(service.catalog_key)??null,
  }));
  return {profile,account,subscription:sub??null,currency,commissionRate:Number(config?.numeric_value??0.10),options,current:current??[]};
}

export async function addCatalogServiceForProfessional(userId:string,input:{catalogKey:string;durationMinutes:number;modality:"online"|"in_person"|"both";publicLocation?:string|null}){
  const {account,profile}=await context(userId);
  const {data:eligibility}=await db.from("professional_service_eligibility").select("catalog_key,country_code,allowed_modalities,requires_admin_review").eq("category_id",profile.category_id).eq("catalog_key",input.catalogKey).eq("active",true).or(`country_code.is.null,country_code.eq.${profile.country_code}`).order("country_code",{ascending:false,nullsFirst:false}).limit(1).maybeSingle();
  if(!eligibility)fail("Este serviço ainda não está habilitado para sua categoria e país.");
  const {data:catalog}=await db.from("service_catalog").select("catalog_key,name,category,currency,amount_cents,billing_model,package_sessions,is_clinical,active").eq("catalog_key",input.catalogKey).eq("active",true).maybeSingle();
  if(!catalog)fail("Serviço LDR indisponível.");
  const expectedCurrency=(profile.country_code||account.country_code)==="BR"?"BRL":"EUR";
  if(catalog.currency!==expectedCurrency)fail("Este serviço ainda não possui preço configurado para o seu mercado.");
  const duration=Math.round(Number(input.durationMinutes));
  if(duration<5||duration>480)fail("Informe uma duração válida para o atendimento.");
  const allowed=Array.isArray(eligibility.allowed_modalities)?eligibility.allowed_modalities:[];
  if(allowed.length&&!allowed.includes(input.modality)&&!allowed.includes("both"))fail("Modalidade não permitida para este serviço.");
  if(input.modality==="in_person"&&!input.publicLocation?.trim())fail("Informe cidade/região ou local público para o atendimento presencial.");
  const requiresReview=Boolean(eligibility.requires_admin_review||catalog.is_clinical);
  const approvalStatus=requiresReview?"pending_review":"approved";
  const subscription=await activeSubscription(account.id);
  const profileReady=profile.compliance_status==="approved"&&profile.profile_status==="active"&&profile.is_public;
  const bookingEnabled=Boolean(subscription)&&profileReady&&!requiresReview&&Number(catalog.amount_cents)>0;
  const payload={
    professional_profile_id:profile.id,
    catalog_key:catalog.catalog_key,
    name:catalog.name,
    description:"Serviço oficial do catálogo LDR.",
    modality:input.modality,
    duration_minutes:duration,
    currency:catalog.currency,
    price_cents:catalog.amount_cents,
    city:profile.city||null,
    public_location:input.publicLocation?.trim()||null,
    booking_enabled:bookingEnabled,
    active:true,
    source_type:"ldr_catalog",
    approval_status:approvalStatus,
    requires_admin_review:requiresReview,
    updated_at:new Date().toISOString(),
  };
  const {data:existing}=await db.from("professional_services").select("id").eq("professional_profile_id",profile.id).eq("catalog_key",catalog.catalog_key).maybeSingle();
  let id:string;
  if(existing){const {error}=await db.from("professional_services").update(payload).eq("id",existing.id);if(error)throw error;id=existing.id}
  else{const {data,error}=await db.from("professional_services").insert({...payload,sort_order:50}).select("id").single();if(error||!data)fail("Não foi possível adicionar o serviço ao perfil.");id=data.id}
  await db.from("audit_logs").insert({actor_id:userId,action:"professional_network.catalog_service_selected",target:id,details:{catalog_key:catalog.catalog_key,approval_status:approvalStatus}});
  return {ok:true as const,id,approvalStatus,bookingEnabled};
}
