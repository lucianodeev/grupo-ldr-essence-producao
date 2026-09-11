import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { resolveAccess } from "@/lib/access.server";
import { undergraduateCourse } from "@/lib/undergraduate.catalog";

type Client=SupabaseClient<Database>;
const db=supabaseAdmin as unknown as {from:(table:string)=>any};
const ALLOWED=["new","contacted","qualified","converted","archived"] as const;
function fail(message:string):never{throw new Error(message)}
async function requireSuperadmin(supabase:Client,userId:string){const access=await resolveAccess(supabase,userId);if(!access.authorized||access.role!=="superadmin")fail("Acesso negado.");}

function normalize(input:{courseKey:string;fullName:string;email:string;phone:string;country:string}){
 const course=undergraduateCourse(input.courseKey.trim());
 const fullName=input.fullName.trim().replace(/\s+/g," ");
 const email=input.email.trim().toLowerCase();
 const phone=input.phone.trim();
 const country=input.country.trim();
 if(!course)fail("Curso inválido.");
 if(fullName.length<2||fullName.length>160)fail("Informe seu nome completo.");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)fail("Informe um e-mail válido.");
 if(phone.replace(/\D/g,"").length<7||phone.length>40)fail("Informe um telefone válido.");
 if(country.length<2||country.length>80)fail("Informe seu país.");
 return {course,fullName,email,phone,country};
}

export async function submitUndergraduateInterest(userId:string,input:{courseKey:string;fullName:string;email:string;phone:string;country:string}){
 const v=normalize(input);
 const {data:existing,error:lookupError}=await db.from("undergraduate_interest_leads").select("id").eq("course_key",v.course.key).ilike("email",v.email).maybeSingle();
 if(lookupError)fail("Não foi possível registrar seu interesse agora.");
 const payload={user_id:userId,course_key:v.course.key,course_title:v.course.title,full_name:v.fullName,email:v.email,phone:v.phone,country:v.country,status:"new",source:"biblioteca_ldr",updated_at:new Date().toISOString()};
 if(existing?.id){const {error}=await db.from("undergraduate_interest_leads").update(payload).eq("id",existing.id);if(error)fail("Não foi possível registrar seu interesse agora.");return {ok:true as const,updated:true as const};}
 const {error}=await db.from("undergraduate_interest_leads").insert(payload);if(error)fail("Não foi possível registrar seu interesse agora.");return {ok:true as const,updated:false as const};
}

export async function listUndergraduateInterests(supabase:Client,userId:string){
 await requireSuperadmin(supabase,userId);
 const {data,error}=await db.from("undergraduate_interest_leads").select("id,user_id,course_key,course_title,full_name,email,phone,country,status,source,created_at,updated_at").order("created_at",{ascending:false}).limit(500);
 if(error)fail("Não foi possível carregar os interessados.");return data??[];
}

export async function updateUndergraduateInterestStatus(supabase:Client,userId:string,input:{id:string;status:string}){
 await requireSuperadmin(supabase,userId);
 if(!ALLOWED.includes(input.status as (typeof ALLOWED)[number]))fail("Status inválido.");
 const {error}=await db.from("undergraduate_interest_leads").update({status:input.status,updated_at:new Date().toISOString()}).eq("id",input.id);
 if(error)fail("Não foi possível atualizar este interessado.");return {ok:true as const};
}
