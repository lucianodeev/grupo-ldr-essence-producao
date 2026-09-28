import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
import { hasOwnerDigitalAccess } from "@/lib/owner-digital-access.server";
import { hasActiveLdrOne } from "@/lib/ldr-one-entitlement.server";

const PRODUCT_KEY="formacao_gestao_pessoas_rh";
const SLUG="formacao-gratuita-gestao-pessoas-rh";
const TITLE="Formação em Gestão de Pessoas e Recursos Humanos";
const HOURS=600;
type Market="BR"|"INTL";
const db=supabaseAdmin as any;

function fail(m:string):never{throw new Error(m)}
async function customerFor(uid:string,email:string|null){const c=await resolveClient(uid,email);if(c.status!=="ok")fail("Acesso do cliente não disponível.");return c.customer;}
function matches(order:any){const metadata=(order?.metadata??{}) as Record<string,unknown>;const key=typeof metadata.product_key==="string"?metadata.product_key:"";return order?.catalog_key===PRODUCT_KEY||key===PRODUCT_KEY||key===SLUG;}
async function paidOrder(cid:string){const {data,error}=await db.from("orders").select("id,catalog_key,payment_status,metadata,created_at").eq("customer_id",cid).eq("payment_status","pago").order("created_at",{ascending:false});if(error)fail("Não foi possível verificar a compra da formação.");return(data??[]).find(matches)??null;}
function appOrigin(){const request=getRequest();return process.env.CLIENT_PANEL_URL?.replace(/\/$/,"")||(request?new URL(request.url).origin:"https://ldracademy.online");}
async function ensureProgram(){const description="Formação livre de caráter profissional em Gestão de Pessoas e Recursos Humanos, 600 horas e 100% online, incluída no catálogo digital elegível do LDR ONE.";const {data:e}=await db.from("training_programs").select("id,slug,status").eq("slug",SLUG).maybeSingle();if(e){await db.from("training_programs").update({status:"published",description,title:TITLE}).eq("id",e.id);return{...e,status:"published"};}const {data,error}=await db.from("training_programs").insert({slug:SLUG,title:TITLE,description,status:"published"}).select("id,slug,status").single();if(error||!data)throw error??new Error("Falha ao preparar formação de RH.");return data;}
async function enrollment(cid:string){try{const training=await ensureProgram();const {data}=await db.from("training_enrollments").select("id,enrolled_at,progress_percent,completed_at,product_key,active").eq("training_id",training.id).eq("customer_id",cid).eq("active",true).order("enrolled_at",{ascending:false}).limit(1).maybeSingle();return{training,data:data??null};}catch(e){console.warn("HR formation enrollment lookup skipped",e);return{training:null,data:null};}}
async function ensureEnrollment(cid:string,entitled:boolean){if(!entitled)return null;const x=await enrollment(cid);if(x.data)return x.data;if(!x.training)return null;const {data,error}=await db.from("training_enrollments").insert({training_id:x.training.id,customer_id:cid,active:true,product_key:PRODUCT_KEY}).select("id,enrolled_at,progress_percent,completed_at,product_key,active").single();if(error){console.warn("HR formation enrollment provisioning skipped",error);return null;}return data;}

export async function getFreeHrFormation(uid:string,email:string|null){const c=await customerFor(uid,email),x=await enrollment(c.id),owner=hasOwnerDigitalAccess(email,uid),order=await paidOrder(c.id);const legacy=!!x.data&&!x.data.product_key;const ldrOne=!legacy&&!owner&&!order?await hasActiveLdrOne(c.id):false;const entitled=owner||legacy||!!order||ldrOne;const e=await ensureEnrollment(c.id,entitled);return{productKey:PRODUCT_KEY,slug:SLUG,title:TITLE,free:false,readingOnly:true,hours:HOURS,totalModules:12,totalUnits:65,entitled,lifetimeAccess:owner||legacy||!!order,subscriptionAccess:ldrOne,grandfathered:legacy,enrolledAt:e?.enrolled_at??x.data?.enrolled_at??null,progressPercent:e?.progress_percent??x.data?.progress_percent??0,completedAt:e?.completed_at??x.data?.completed_at??null};}

export async function createHrFormationCheckout(uid:string,email:string|null,_market:Market){await customerFor(uid,email);fail("Novas compras individuais foram encerradas. Esta formação está incluída no LDR ONE.");}
