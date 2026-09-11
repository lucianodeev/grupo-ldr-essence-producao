import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
import { hasOwnerDigitalAccess } from "@/lib/owner-digital-access.server";

const PRODUCT_KEY="formacao_terapia_breve_psicanalitica";
const PRODUCT_SLUG="formacao-terapia-breve-psicanalitica";
const TITLE="Formação em Terapia Breve Psicanalítica";
const PRICE_BRL=29_999;
const PRICE_EUR=4_990;
const TOTAL_LESSONS=300;
const TOTAL_HOURS=1200;
const MINIMUM_DAYS=300;
const MAXIMUM_MONTHS=12;
const COHORT_CAPACITY=50;
type Market="BR"|"INTL";
const db=supabaseAdmin as any;
function fail(message:string):never{throw new Error(message)}

async function customerFor(userId:string,email:string|null){const ctx=await resolveClient(userId,email);if(ctx.status!=="ok")fail("Acesso do cliente não disponível.");return ctx.customer;}
function matches(order:any){const metadata=(order?.metadata??{}) as Record<string,unknown>;const key=typeof metadata.product_key==="string"?metadata.product_key:"";return order?.catalog_key===PRODUCT_KEY||key===PRODUCT_KEY||key===PRODUCT_SLUG;}
async function paidOrder(customerId:string){const {data,error}=await db.from("orders").select("id,catalog_key,payment_status,amount_cents,currency,stripe_checkout_session_id,metadata,created_at").eq("customer_id",customerId).eq("payment_status","pago").order("created_at",{ascending:false});if(error)fail("Não foi possível verificar a compra da formação.");return (data??[]).find(matches)??null;}
function appOrigin(){const request=getRequest();const requestUrl=request?new URL(request.url):null;return process.env.CLIENT_PANEL_URL?.replace(/\/$/,"")||requestUrl?.origin||"https://painel.ldrrhestrategia.com";}
function daysSince(value:string|null|undefined){if(!value)return 0;const time=Date.parse(value);if(!Number.isFinite(time))return 0;return Math.max(0,Math.floor((Date.now()-time)/86_400_000));}

async function ensureProgram(){
  const {data:existing}=await db.from("training_programs").select("id,slug,title,status").eq("slug",PRODUCT_SLUG).maybeSingle();
  if(existing){
    if(existing.status!=="published"){
      const {data:published}=await db.from("training_programs").update({status:"published",description:"Formação livre em Terapia Breve Psicanalítica com 15 módulos, 300 aulas, carga horária formativa total de 1.200 horas e 6 encontros ao vivo."}).eq("id",existing.id).select("id,slug,title,status").single();
      return published??{...existing,status:"published"};
    }
    return existing;
  }
  const {data,error}=await db.from("training_programs").insert({slug:PRODUCT_SLUG,title:TITLE,description:"Formação livre em Terapia Breve Psicanalítica com 15 módulos, 300 aulas, carga horária formativa total de 1.200 horas e 6 encontros ao vivo.",status:"published"}).select("id,slug,title,status").single();
  if(error||!data)throw error??new Error("Falha ao preparar a formação.");
  return data;
}

async function assignCohortBestEffort(trainingId:string,enrollmentId:string){
  try{
    const {data:cohorts}=await db.from("training_cohorts").select("id,cohort_number,capacity,status").eq("training_id",trainingId).order("cohort_number",{ascending:true});
    let chosen:any=null;
    for(const cohort of cohorts??[]){
      if(cohort.status!=="open")continue;
      const {data:members}=await db.from("training_enrollments").select("id").eq("cohort_id",cohort.id).eq("active",true);
      if((members??[]).length<Number(cohort.capacity??COHORT_CAPACITY)){chosen=cohort;break;}
    }
    if(!chosen){
      const next=Math.max(0,...((cohorts??[]).map((x:any)=>Number(x.cohort_number??0))))+1;
      const {data:newCohort}=await db.from("training_cohorts").insert({training_id:trainingId,cohort_number:next,capacity:COHORT_CAPACITY,status:"open",starts_at:new Date().toISOString()}).select("id,cohort_number,capacity,status").single();
      chosen=newCohort??null;
    }
    if(chosen?.id)await db.from("training_enrollments").update({cohort_id:chosen.id}).eq("id",enrollmentId);
  }catch(error){console.warn("brief therapy cohort assignment skipped",error);}
}

async function ensureEnrollment(customerId:string,entitled:boolean){
  if(!entitled)return null;
  try{
    const training=await ensureProgram();
    let {data:enrollment}=await db.from("training_enrollments").select("id,enrolled_at,cohort_id,progress_percent,completed_at,certificate_available_at,training_cohorts(cohort_number,capacity,status)").eq("training_id",training.id).eq("customer_id",customerId).eq("active",true).maybeSingle();
    if(!enrollment){
      const created=await db.from("training_enrollments").insert({training_id:training.id,customer_id:customerId,active:true}).select("id,enrolled_at,cohort_id,progress_percent,completed_at,certificate_available_at").single();
      if(created.error||!created.data)throw created.error??new Error("Falha ao criar matrícula.");
      enrollment=created.data;
      await assignCohortBestEffort(training.id,enrollment.id);
      const refreshed=await db.from("training_enrollments").select("id,enrolled_at,cohort_id,progress_percent,completed_at,certificate_available_at,training_cohorts(cohort_number,capacity,status)").eq("id",enrollment.id).maybeSingle();
      enrollment=refreshed.data??enrollment;
    }else if(!enrollment.cohort_id){
      await assignCohortBestEffort(training.id,enrollment.id);
      const refreshed=await db.from("training_enrollments").select("id,enrolled_at,cohort_id,progress_percent,completed_at,certificate_available_at,training_cohorts(cohort_number,capacity,status)").eq("id",enrollment.id).maybeSingle();
      enrollment=refreshed.data??enrollment;
    }
    return enrollment;
  }catch(error){console.warn("brief therapy enrollment provisioning skipped",error);return null;}
}

async function savedProgress(customerId:string){
  const {data}=await db.from("library_progress").select("progress_percent,current_location,updated_at").eq("customer_id",customerId).eq("product_key",PRODUCT_KEY).maybeSingle();
  return data??null;
}

export async function getBriefTherapyOffer(userId:string,email:string|null){
  const customer=await customerFor(userId,email);
  const order=await paidOrder(customer.id);
  const owner=hasOwnerDigitalAccess(email,userId);
  const entitled=Boolean(order)||owner;
  const enrollment=await ensureEnrollment(customer.id,entitled);
  const progress=await savedProgress(customer.id);
  const enrolledAt=(enrollment?.enrolled_at??order?.created_at??null) as string|null;
  const elapsedDays=owner?MINIMUM_DAYS:daysSince(enrolledAt);
  const maxUnlockedLesson=owner?TOTAL_LESSONS:Math.min(TOTAL_LESSONS,elapsedDays+1);
  const progressPercent=Number(progress?.progress_percent??enrollment?.progress_percent??0);
  const certificateEligible=entitled&&elapsedDays>=MINIMUM_DAYS&&progressPercent>=100;
  return {productKey:PRODUCT_KEY,slug:PRODUCT_SLUG,title:TITLE,priceBrlCents:PRICE_BRL,priceEurCents:PRICE_EUR,regularPriceBrlCents:PRICE_BRL,regularPriceEurCents:PRICE_EUR,launchPromotionActive:false,launchMonths:0,launchStart:null,launchEnd:null,entitled,lifetimeAccess:true,minimumMonths:6,maximumMonths:MAXIMUM_MONTHS,minimumDays:MINIMUM_DAYS,liveSessionsIncluded:6,totalModules:15,totalLessons:TOTAL_LESSONS,totalHours:TOTAL_HOURS,enrolledAt,elapsedDays,maxUnlockedLesson,progressPercent,cohortNumber:enrollment?.training_cohorts?.cohort_number??null,cohortCapacity:enrollment?.training_cohorts?.capacity??COHORT_CAPACITY,certificateEligible,certificateAvailableAt:certificateEligible?new Date().toISOString():enrollment?.certificate_available_at??null,customerName:customer.fullName??customer.full_name??customer.email??"Aluno"};
}

export async function createBriefTherapyCheckout(userId:string,email:string|null,market:Market){
  const customer=await customerFor(userId,email);const offer=await getBriefTherapyOffer(userId,email);if(offer.entitled)fail("Esta formação já está disponível para sua conta.");
  const amountCents=market==="BR"?offer.priceBrlCents:offer.priceEurCents;const currency=market==="BR"?"BRL":"EUR";const metadata={product_key:PRODUCT_KEY,training_slug:PRODUCT_SLUG,market,auth_user_id:userId};
  const {data:order,error}=await db.from("orders").insert({order_number:"",customer_id:customer.id,contact_email:customer.email,contact_phone:customer.phone,service_type:"produto_digital",title:TITLE,description:"Formação em Terapia Breve Psicanalítica · pagamento único · acesso vitalício aos conteúdos digitais",quantity:1,amount_cents:amountCents,currency,payment_status:"pendente",status:"novo",priority:"media",catalog_key:PRODUCT_KEY,metadata}).select("id").single();if(error||!order)fail("Não foi possível iniciar o pedido da formação.");
  const secret=process.env.STRIPE_SECRET_KEY;if(!secret){await db.from("orders").delete().eq("id",order.id);fail("Pagamento temporariamente indisponível.");}
  const params=new URLSearchParams();params.set("mode","payment");params.set("line_items[0][price_data][currency]",currency.toLowerCase());params.set("line_items[0][price_data][unit_amount]",String(amountCents));params.set("line_items[0][price_data][product_data][name]",TITLE);params.set("line_items[0][quantity]","1");params.set("success_url",`${appOrigin()}/cliente/biblioteca?payment=success&product=brief-therapy&session_id={CHECKOUT_SESSION_ID}`);params.set("cancel_url",`${appOrigin()}/cliente/biblioteca?payment=cancel&product=brief-therapy`);params.set("client_reference_id",userId);params.set("metadata[order_id]",order.id);params.set("metadata[product_key]",PRODUCT_KEY);params.set("metadata[training_slug]",PRODUCT_SLUG);params.set("metadata[user_id]",userId);params.set("metadata[market]",market);params.set("payment_intent_data[metadata][order_id]",order.id);params.set("payment_intent_data[metadata][product_key]",PRODUCT_KEY);if(customer.email)params.set("customer_email",customer.email);
  let response:Response;try{response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/x-www-form-urlencoded"},body:params});}catch{await db.from("orders").delete().eq("id",order.id);fail("Não foi possível abrir o checkout.");}
  const session=(await response.json()) as {id?:string;url?:string};if(!response.ok||!session.id||!session.url){await db.from("orders").delete().eq("id",order.id);fail("Não foi possível abrir o checkout.");}await db.from("orders").update({stripe_checkout_session_id:session.id,metadata}).eq("id",order.id);return {url:session.url};
}
