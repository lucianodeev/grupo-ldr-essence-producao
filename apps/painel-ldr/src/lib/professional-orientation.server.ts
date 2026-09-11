import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
import { resolveAccess } from "@/lib/access.server";

const db=supabaseAdmin as any;
const PRODUCT_KEY="orientacao_profissional_escrita";
const TITLE="Orientação Profissional Escrita";
const OWNER_EMAIL="llucianouam@gmail.com";
type Market="BR"|"INTL";
type PackageMinutes=10|30|60;

const PROMO_PRICES={
  INTL:{10:90,30:190,60:390},
  BR:{10:535,30:1130,60:2320},
} as const;
const REGULAR_PRICES={
  INTL:{10:450,30:1350,60:2700},
  BR:{10:2675,30:8025,60:16050},
} as const;

function fail(message:string):never{throw new Error(message)}
function appOrigin(){const request=getRequest();const requestUrl=request?new URL(request.url):null;return process.env.CLIENT_PANEL_URL?.replace(/\/$/,"")||requestUrl?.origin||"https://painel.ldrrhestrategia.com";}
async function customerFor(userId:string,email:string|null){const ctx=await resolveClient(userId,email);if(ctx.status!=="ok")fail("Acesso do cliente não disponível.");return ctx.customer;}
async function requireMaster(supabase:any,userId:string){const access=await resolveAccess(supabase,userId);if(!access.authorized||access.role!=="superadmin")fail("Acesso negado.");}

async function promoFor(customerId:string){
  const {data}=await db.from("professional_written_promos").select("first_purchase_at,promo_expires_at").eq("customer_id",customerId).maybeSingle();
  if(!data)return {started:false,active:true,firstPurchaseAt:null,promoExpiresAt:null};
  const active=Date.parse(data.promo_expires_at)>Date.now();
  return {started:true,active,firstPurchaseAt:data.first_purchase_at,promoExpiresAt:data.promo_expires_at};
}
function amountFor(market:Market,minutes:PackageMinutes,promo:boolean){return (promo?PROMO_PRICES:REGULAR_PRICES)[market][minutes];}
function packageRows(market:Market,promo:boolean){return ([10,30,60] as PackageMinutes[]).map(minutes=>({minutes,amountCents:amountFor(market,minutes,promo),currency:market==="BR"?"BRL":"EUR"}));}

export async function getProfessionalOrientationOffer(userId:string,email:string|null){
  const customer=await customerFor(userId,email);
  const market:Market=(customer.country??"").toString().toUpperCase()==="BR"?"BR":"INTL";
  const promo=await promoFor(customer.id);
  const {data:sessions}=await db.from("professional_written_sessions").select("id,package_minutes,remaining_seconds,currency,amount_cents,promo_applied,status,started_at,ended_at,created_at,updated_at").eq("customer_id",customer.id).order("created_at",{ascending:false}).limit(30);
  return {productKey:PRODUCT_KEY,title:TITLE,market,promo,packages:packageRows(market,promo.active),regularPackages:packageRows(market,false),sessions:sessions??[]};
}

export async function createProfessionalOrientationCheckout(userId:string,email:string|null,market:Market,packageMinutes:PackageMinutes){
  if(![10,30,60].includes(packageMinutes))fail("Pacote inválido.");
  const customer=await customerFor(userId,email);
  const promo=await promoFor(customer.id);
  const amountCents=amountFor(market,packageMinutes,promo.active);
  const currency=market==="BR"?"BRL":"EUR";
  const metadata={product_key:PRODUCT_KEY,package_minutes:String(packageMinutes),promo_applied:String(promo.active),market,auth_user_id:userId};
  const {data:order,error}=await db.from("orders").insert({order_number:"",customer_id:customer.id,contact_email:customer.email,contact_phone:customer.phone,service_type:"produto_digital",title:`${TITLE} — ${packageMinutes} minutos`,description:`Orientação profissional por texto · ${packageMinutes} minutos`,quantity:1,amount_cents:amountCents,currency,payment_status:"pendente",status:"novo",priority:"media",catalog_key:PRODUCT_KEY,metadata}).select("id").single();
  if(error||!order)fail("Não foi possível iniciar o pagamento.");
  const secret=process.env.STRIPE_SECRET_KEY;if(!secret){await db.from("orders").delete().eq("id",order.id);fail("Pagamento temporariamente indisponível.");}
  const params=new URLSearchParams();
  params.set("mode","payment");params.set("line_items[0][price_data][currency]",currency.toLowerCase());params.set("line_items[0][price_data][unit_amount]",String(amountCents));params.set("line_items[0][price_data][product_data][name]",`${TITLE} — ${packageMinutes} minutos`);params.set("line_items[0][quantity]","1");
  params.set("success_url",`${appOrigin()}/cliente/orientacao-profissional?payment=success&session_id={CHECKOUT_SESSION_ID}`);params.set("cancel_url",`${appOrigin()}/cliente/orientacao-profissional?payment=cancel`);params.set("client_reference_id",userId);
  params.set("metadata[order_id]",order.id);params.set("metadata[product_key]",PRODUCT_KEY);params.set("metadata[user_id]",userId);params.set("metadata[package_minutes]",String(packageMinutes));params.set("metadata[promo_applied]",String(promo.active));params.set("metadata[market]",market);
  params.set("payment_intent_data[metadata][order_id]",order.id);params.set("payment_intent_data[metadata][product_key]",PRODUCT_KEY);if(customer.email)params.set("customer_email",customer.email);
  let response:Response;try{response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/x-www-form-urlencoded"},body:params});}catch{await db.from("orders").delete().eq("id",order.id);fail("Não foi possível abrir o checkout.");}
  const session=await response.json() as any;if(!response.ok||!session.id||!session.url){await db.from("orders").delete().eq("id",order.id);fail("Não foi possível abrir o checkout.");}
  await db.from("orders").update({stripe_checkout_session_id:session.id,metadata}).eq("id",order.id);
  return {url:session.url};
}

export async function activateProfessionalOrientationCheckout(userId:string,email:string|null,checkoutSessionId:string){
  if(!checkoutSessionId)fail("Sessão de pagamento inválida.");
  const customer=await customerFor(userId,email);
  const {data:existing}=await db.from("professional_written_sessions").select("id").eq("stripe_checkout_session_id",checkoutSessionId).maybeSingle();if(existing?.id)return {sessionId:existing.id};
  const secret=process.env.STRIPE_SECRET_KEY;if(!secret)fail("Pagamento temporariamente indisponível.");
  const response=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(checkoutSessionId)}`,{headers:{Authorization:`Bearer ${secret}`}});const session=await response.json() as any;
  if(!response.ok||session.payment_status!=="paid")fail("Pagamento ainda não confirmado.");
  if(session.metadata?.product_key!==PRODUCT_KEY||session.metadata?.user_id!==userId)fail("Pagamento não pertence a esta conta.");
  const minutes=Number(session.metadata?.package_minutes) as PackageMinutes;if(![10,30,60].includes(minutes))fail("Pacote inválido.");
  const orderId=session.metadata?.order_id||null;const promoApplied=session.metadata?.promo_applied==="true";const market:Market=session.metadata?.market==="BR"?"BR":"INTL";const currency=market==="BR"?"BRL":"EUR";const amountCents=Number(session.amount_total??amountFor(market,minutes,promoApplied));
  if(orderId)await db.from("orders").update({payment_status:"pago",status:"confirmado",stripe_checkout_session_id:checkoutSessionId}).eq("id",orderId).eq("customer_id",customer.id);
  let promo=await promoFor(customer.id);
  if(!promo.started){const now=new Date();const expires=new Date(now.getTime()+30*86_400_000);await db.from("professional_written_promos").insert({customer_id:customer.id,first_purchase_at:now.toISOString(),promo_expires_at:expires.toISOString()});promo=await promoFor(customer.id);}
  const {data:created,error}=await db.from("professional_written_sessions").insert({customer_id:customer.id,auth_user_id:userId,order_id:orderId,stripe_checkout_session_id:checkoutSessionId,package_minutes:minutes,purchased_seconds:minutes*60,remaining_seconds:minutes*60,currency,amount_cents:amountCents,promo_applied:promoApplied,status:"paid"}).select("id").single();
  if(error||!created)fail("Não foi possível criar a orientação.");return {sessionId:created.id,promo};
}

async function ownedSession(userId:string,email:string|null,sessionId:string){const customer=await customerFor(userId,email);const {data,error}=await db.from("professional_written_sessions").select("*").eq("id",sessionId).eq("customer_id",customer.id).maybeSingle();if(error||!data)fail("Orientação não encontrada.");return {customer,session:data};}
function consumeTimer(session:any){if(!session.timer_running||!session.last_timer_started_at)return {remaining:Number(session.remaining_seconds??0),elapsed:0};const elapsed=Math.max(0,Math.floor((Date.now()-Date.parse(session.last_timer_started_at))/1000));return {remaining:Math.max(0,Number(session.remaining_seconds??0)-elapsed),elapsed};}
async function normalizeSession(session:any){const t=consumeTimer(session);if(t.elapsed>0){const closed=t.remaining<=0;const patch:any={remaining_seconds:t.remaining,last_timer_started_at:closed?null:new Date().toISOString(),timer_running:!closed,updated_at:new Date().toISOString()};if(closed){patch.status="closed";patch.ended_at=new Date().toISOString();}await db.from("professional_written_sessions").update(patch).eq("id",session.id);return {...session,...patch};}return session;}

export async function getProfessionalOrientationSession(userId:string,email:string|null,sessionId:string){const {session}=await ownedSession(userId,email,sessionId);const normalized=await normalizeSession(session);const {data:messages}=await db.from("professional_written_messages").select("id,sender_type,message,created_at,read_at").eq("session_id",sessionId).order("created_at",{ascending:true});return {session:normalized,messages:messages??[]};}

async function notifyMaster(customer:any,sessionId:string,message:string){try{const {data:profile}=await db.from("profiles").select("id").ilike("email",OWNER_EMAIL).maybeSingle();if(!profile?.id)return;await db.from("notification_outbox").insert({audience_type:"professional",target_id:profile.id,channel:"in_app",event_type:"manual",subject:"Nova Orientação Profissional Escrita",body:`${customer.fullName??customer.full_name??customer.email??"Cliente"}: ${message.slice(0,180)}`,scheduled_for:new Date().toISOString(),status:"sent",sent_at:new Date().toISOString()});}catch(error){console.warn("professional orientation notification skipped",error);}}

export async function sendProfessionalOrientationClientMessage(userId:string,email:string|null,sessionId:string,message:string,consent:boolean){
  const body=message.trim();if(!body||body.length>5000)fail("Mensagem inválida.");const {customer,session:raw}=await ownedSession(userId,email,sessionId);let session=await normalizeSession(raw);if(session.status==="closed"||Number(session.remaining_seconds)<=0)fail("Esta orientação foi encerrada.");
  const first=!session.started_at;if(first&&!consent)fail("Confirme o aceite antes de iniciar.");
  const timer=consumeTimer(session);if(timer.remaining<=0)fail("O tempo desta orientação terminou.");
  const now=new Date().toISOString();const patch:any={remaining_seconds:timer.remaining,timer_running:false,last_timer_started_at:null,last_client_message_at:now,status:"waiting_professional",updated_at:now};if(first){patch.started_at=now;patch.consent_at=now;}
  await db.from("professional_written_sessions").update(patch).eq("id",sessionId);const {error}=await db.from("professional_written_messages").insert({session_id:sessionId,sender_type:"client",sender_user_id:userId,message:body});if(error)throw error;await notifyMaster(customer,sessionId,body);return {ok:true};
}

export async function getProfessionalOrientationAdmin(supabase:any,userId:string){await requireMaster(supabase,userId);const {data:sessions,error}=await db.from("professional_written_sessions").select("id,customer_id,package_minutes,remaining_seconds,currency,amount_cents,promo_applied,status,started_at,last_client_message_at,last_professional_message_at,created_at,updated_at,customers(full_name,email)").order("updated_at",{ascending:false}).limit(100);if(error)throw error;return sessions??[];}
export async function getProfessionalOrientationAdminSession(supabase:any,userId:string,sessionId:string){await requireMaster(supabase,userId);const {data:s,error}=await db.from("professional_written_sessions").select("*,customers(full_name,email)").eq("id",sessionId).maybeSingle();if(error||!s)fail("Orientação não encontrada.");const session=await normalizeSession(s);const {data:messages}=await db.from("professional_written_messages").select("id,sender_type,message,created_at,read_at").eq("session_id",sessionId).order("created_at",{ascending:true});return {session,messages:messages??[]};}
export async function sendProfessionalOrientationProfessionalMessage(supabase:any,userId:string,sessionId:string,message:string){await requireMaster(supabase,userId);const body=message.trim();if(!body||body.length>5000)fail("Mensagem inválida.");const {data:raw}=await db.from("professional_written_sessions").select("*").eq("id",sessionId).maybeSingle();if(!raw)fail("Orientação não encontrada.");const session=await normalizeSession(raw);if(session.status==="closed"||Number(session.remaining_seconds)<=0)fail("Esta orientação foi encerrada.");const now=new Date().toISOString();const {error}=await db.from("professional_written_messages").insert({session_id:sessionId,sender_type:"professional",sender_user_id:userId,message:body});if(error)throw error;await db.from("professional_written_sessions").update({status:"waiting_client",timer_running:true,last_timer_started_at:now,last_professional_message_at:now,updated_at:now}).eq("id",sessionId);return {ok:true};}
