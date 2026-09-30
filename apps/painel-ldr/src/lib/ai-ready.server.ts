import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
import { getEmployeeContext } from "@/lib/organization-portal.server";

export type AiReadyMarket = "BR" | "INTL";
const PRODUCT_KEY = "ai_ready_2026";

async function customer(userId:string,email:string|null){
  const ctx=await resolveClient(userId,email);
  if(ctx.status!=="ok") throw new Error("Acesso de cliente indisponível.");
  return ctx.customer;
}

export async function getAiReadyAccess(userId:string,email:string|null){
  const employee=await getEmployeeContext(userId,email);
  const employeeAllocation=employee.status==="ok"
    ? employee.benefits.find((b:any)=>b.catalog_key===PRODUCT_KEY&&["assigned","requested","used"].includes(String(b.status)))??null
    : null;
  let c:null|Awaited<ReturnType<typeof customer>>=null;
  let order:any=null;
  try{
    c=await customer(userId,email);
    const result=await supabaseAdmin.from("orders").select("id,payment_status,status,created_at,metadata").eq("customer_id",c.id).eq("payment_status","pago").order("created_at",{ascending:false});
    if(result.error) throw new Error("Não foi possível validar o acesso.");
    order=(result.data??[]).find((o:any)=>o?.metadata?.product_key===PRODUCT_KEY)??null;
  }catch(error){
    if(!employeeAllocation) throw error;
  }
  return {customer:c,entitled:Boolean(order||employeeAllocation),order,employeeAllocation,employee:employee.status==="ok"?employee.member:null};
}

export async function createAiReadyCheckout(userId:string,email:string|null,market:AiReadyMarket){
  const c=await customer(userId,email);
  const existing=await getAiReadyAccess(userId,email);
  if(existing.entitled) throw new Error("AI READY 2026 já está disponível para esta conta.");
  const amountCents=market==="BR"?29700:4900;
  const currency=market==="BR"?"BRL":"EUR";
  const {data:order,error}=await supabaseAdmin.from("orders").insert({
    order_number:"",customer_id:c.id,contact_email:c.email,contact_phone:c.phone,
    service_type:"produto_digital",title:"AI READY 2026",description:"Kit empresarial e treinamento de uso responsável de IA",
    quantity:1,amount_cents:amountCents,currency,payment_status:"pendente",status:"novo",priority:"media",
    catalog_key:PRODUCT_KEY,metadata:{product_key:PRODUCT_KEY,market,auth_user_id:userId,seats:10}
  } as never).select("id,order_number").single();
  if(error||!order) throw new Error("Não foi possível iniciar o pedido.");

  const secret=process.env["STRIPE_SECRET_KEY"];
  if(!secret){await supabaseAdmin.from("orders").delete().eq("id",order.id);throw new Error("Pagamento temporariamente indisponível.");}
  const req=getRequest(); const origin=req?new URL(req.url).origin:"https://ldrrhestrategia.com";
  const p=new URLSearchParams();
  p.set("mode","payment");
  p.set("line_items[0][price_data][currency]",currency.toLowerCase());
  p.set("line_items[0][price_data][unit_amount]",String(amountCents));
  p.set("line_items[0][price_data][product_data][name]","AI READY 2026 — até 10 colaboradores");
  p.set("line_items[0][quantity]","1");
  p.set("success_url",origin+"/cliente/ai-ready?payment=success&session_id={CHECKOUT_SESSION_ID}");
  p.set("cancel_url",origin+"/cliente/ai-ready?payment=cancel");
  p.set("client_reference_id",userId);
  p.set("metadata[order_id]",order.id); p.set("metadata[product_key]",PRODUCT_KEY); p.set("metadata[user_id]",userId); p.set("metadata[market]",market);
  p.set("payment_intent_data[metadata][order_id]",order.id); p.set("payment_intent_data[metadata][product_key]",PRODUCT_KEY); p.set("payment_intent_data[metadata][user_id]",userId);
  if(c.email)p.set("customer_email",c.email);
  const res=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/x-www-form-urlencoded"},body:p});
  const session=await res.json() as any;
  if(!res.ok||!session?.id||!session?.url){await supabaseAdmin.from("orders").delete().eq("id",order.id);throw new Error("Não foi possível abrir o checkout.");}
  await supabaseAdmin.from("orders").update({stripe_checkout_session_id:session.id} as never).eq("id",order.id);
  return {url:String(session.url)};
}
