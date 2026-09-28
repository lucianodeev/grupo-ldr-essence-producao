import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
const db=supabaseAdmin as any;
export type LdrPassPlan="individual"|"business"; export type LdrPassMarket="EU"; export type LdrPassBilling="monthly"|"annual";
const PRICE_ENV={individual:{monthly:"LDR_ONE_LIVE_PRICE_INDIVIDUAL_MONTHLY",annual:"LDR_ONE_LIVE_PRICE_INDIVIDUAL_ANNUAL"},business:{monthly:"LDR_ONE_LIVE_PRICE_BUSINESS_MONTHLY",annual:"LDR_ONE_LIVE_PRICE_BUSINESS_ANNUAL"}} as const;
const AMOUNTS={individual:{monthly:3990,annual:39900},business:{monthly:1990,annual:19900}} as const;
function fail(m:string):never{throw new Error(m)}
function origin(){const r=getRequest();return process.env.CLIENT_PANEL_URL?.replace(/\/$/,"")||(r?new URL(r.url).origin:"https://ldr-ecossistema-validacao.onrender.com")}
async function customerFor(u:string,e:string|null){const c=await resolveClient(u,e);if(c.status!=="ok")fail("Acesso do cliente não disponível.");return c.customer}
export function ldrPassPrice(plan:LdrPassPlan,market:LdrPassMarket,billing:LdrPassBilling){if(market!=="EU")fail("Mercado indisponível.");const priceId=process.env[PRICE_ENV[plan][billing]]??"";if(!/^price_[A-Za-z0-9]+$/.test(priceId))fail("Preço LDR ONE indisponível.");return {priceId,amount:AMOUNTS[plan][billing],currency:"EUR"}}
export async function getLdrPassContext(u:string,e:string|null){const customer=await customerFor(u,e);const {data,error}=await db.from("ldr_pass_subscriptions").select("*").eq("customer_id",customer.id).order("created_at",{ascending:false}).limit(1).maybeSingle();if(error)fail("Não foi possível carregar o LDR ONE.");return {customer,subscription:data??null,active:data?.status==="active"||data?.status==="trialing"}}
export async function createLdrPassCheckout(u:string,e:string|null,plan:LdrPassPlan,market:LdrPassMarket,billing:LdrPassBilling,source:string,seats=1){
 const quantity=plan==="individual"?1:seats;if(!Number.isSafeInteger(quantity)||(plan==="business"&&(quantity<5||quantity>10000)))fail("Quantidade de colaboradores inválida.");
 const customer=await customerFor(u,e);const {data:existing}=await db.from("ldr_pass_subscriptions").select("id,status").eq("customer_id",customer.id).in("status",["active","trialing","past_due","unpaid","paused","incomplete"]).limit(1).maybeSingle();if(existing)fail("Você já possui um LDR ONE em andamento.");
 const p=ldrPassPrice(plan,market,billing),safeSource=["academy","ldrrhestrategia","ecossistema"].includes(source)?source:"ecossistema";
 const {data:row,error}=await db.from("ldr_pass_subscriptions").insert({customer_id:customer.id,plan,market,currency:p.currency,billing_cycle:billing,amount_cents:p.amount*quantity,status:"pending",source:safeSource,ldr_one_seats:quantity,ldr_one_offer:plan}).select("id").single();if(error||!row)fail("Não foi possível preparar o LDR ONE.");
 const secret=process.env.STRIPE_SECRET_KEY;if(!secret?.startsWith("sk_live_")){await db.from("ldr_pass_subscriptions").delete().eq("id",row.id);fail("Pagamento LIVE indisponível.");}
 const q=new URLSearchParams();q.set("mode","subscription");q.set("line_items[0][price]",p.priceId);q.set("line_items[0][quantity]",String(quantity));q.set("success_url",`${origin()}/cliente/ldr-pass?subscription=success&session_id={CHECKOUT_SESSION_ID}`);q.set("cancel_url",`${origin()}/ldr-pass?subscription=cancel`);q.set("client_reference_id",u);q.set("billing_address_collection","auto");
 for(const [k,v] of Object.entries({checkout_kind:"ldr_pass_subscription",ldr_pass_subscription_id:row.id,customer_id:customer.id,plan,market,billing_cycle:billing,source:safeSource,seats:String(quantity)})){q.set(`metadata[${k}]`,v);q.set(`subscription_data[metadata][${k}]`,v)}
 if(customer.email)q.set("customer_email",customer.email);
 const response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/x-www-form-urlencoded","Idempotency-Key":`ldr-one-live-${row.id}`},body:q});const session=await response.json() as any;
 if(!response.ok||session.livemode!==true||!/^cs_live_[A-Za-z0-9]+$/.test(session.id??"")||typeof session.url!=="string"){await db.from("ldr_pass_subscriptions").delete().eq("id",row.id);fail(session?.error?.message||"Não foi possível abrir o checkout LIVE.");}
 await db.from("ldr_pass_subscriptions").update({stripe_checkout_session_id:session.id,updated_at:new Date().toISOString()}).eq("id",row.id);return {url:session.url}
}
