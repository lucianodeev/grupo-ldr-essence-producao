import {createServerFn} from "@tanstack/react-start";
import {requireSupabaseAuth} from "@/integrations/supabase/auth-middleware";
import {resolveAccess} from "@/lib/access.server";

type ExternalJobInput={
 sourceName:string; sourceUrl:string; externalReference?:string; externalApplyUrl?:string;
 title:string; description?:string; companyName?:string; country?:string; city?:string;
 workMode?:string; contractType?:string; publicationLanguage?:string;
 sourcePublishedAt?:string; sourceExpiresAt?:string;
};
function clean(v:unknown,max=4000){return String(v??"").trim().slice(0,max)}
function httpUrl(v:unknown){try{const u=new URL(clean(v,2000));return u.protocol==="https:"||u.protocol==="http:"?u.toString():null}catch{return null}}
export const stageExternalPublicJob=createServerFn({method:"POST"})
 .middleware([requireSupabaseAuth])
 .inputValidator((data:ExternalJobInput)=>data)
 .handler(async({data,context})=>{
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");const db=supabaseAdmin as any;
  const access=await resolveAccess(db,context.userId);
  if(!access.authorized||access.role!=="superadmin")throw new Error("Acesso negado.");
  const sourceName=clean(data.sourceName,160),sourceUrl=httpUrl(data.sourceUrl),title=clean(data.title,180);
  if(!sourceName||!sourceUrl||!title)throw new Error("Fonte, URL pública e título são obrigatórios.");
  const applyUrl=data.externalApplyUrl?httpUrl(data.externalApplyUrl):null;
  if(data.externalApplyUrl&&!applyUrl)throw new Error("URL de candidatura inválida.");
  const externalReference=clean(data.externalReference,300)||null;
  let duplicate:any=null;
  if(externalReference){const r=await db.from("career_jobs").select("id,status").eq("source_type","external_public").eq("source_name",sourceName).eq("external_reference",externalReference).maybeSingle();duplicate=r.data}
  if(!duplicate){const r=await db.from("career_jobs").select("id,status").eq("source_type","external_public").eq("source_url",sourceUrl).maybeSingle();duplicate=r.data}
  if(duplicate)return {created:false as const,duplicate:true as const,jobId:duplicate.id,status:duplicate.status};
  const row:any={
   company_id:null,title,description:clean(data.description,12000)||null,country:clean(data.country,100)||null,city:clean(data.city,100)||null,
   work_mode:clean(data.workMode,40)||"remote",contract_type:clean(data.contractType,60)||"employment",publication_language:clean(data.publicationLanguage,8)||"pt",
   status:"pending_review",source_type:"external_public",source_name:sourceName,source_url:sourceUrl,external_reference:externalReference,
   external_apply_url:applyUrl,source_published_at:data.sourcePublishedAt||null,source_expires_at:data.sourceExpiresAt||null,source_checked_at:new Date().toISOString(),source_active:true
  };
  const inserted=await db.from("career_jobs").insert(row).select("id,status").single();
  if(inserted.error||!inserted.data)throw new Error("Não foi possível preparar a vaga externa para revisão.");
  return {created:true as const,duplicate:false as const,jobId:inserted.data.id,status:inserted.data.status};
 });
