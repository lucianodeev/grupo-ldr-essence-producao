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
   ...(clean(data.workMode,40)?{work_mode:clean(data.workMode,40)}:{}),...(clean(data.contractType,60)?{contract_type:clean(data.contractType,60)}:{}),...(clean(data.publicationLanguage,8)?{publication_language:clean(data.publicationLanguage,8)}:{}),
   status:"pending_review",source_type:"external_public",source_name:sourceName,source_url:sourceUrl,external_reference:externalReference,
   external_apply_url:applyUrl,source_published_at:data.sourcePublishedAt||null,source_expires_at:data.sourceExpiresAt||null,source_checked_at:new Date().toISOString(),source_active:true
  };
  const inserted=await db.from("career_jobs").insert(row).select("id,status").single();
  if(inserted.error||!inserted.data)throw new Error("Não foi possível preparar a vaga externa para revisão.");
  return {created:true as const,duplicate:false as const,jobId:inserted.data.id,status:inserted.data.status};
 });

type ExternalJobCheckInput={jobId:string;active:boolean;checkedAt?:string;expiresAt?:string};
export const updateExternalPublicJobAvailability=createServerFn({method:"POST"})
 .middleware([requireSupabaseAuth])
 .inputValidator((data:ExternalJobCheckInput)=>data)
 .handler(async({data,context})=>{
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");const db=supabaseAdmin as any;
  const access=await resolveAccess(db,context.userId);
  if(!access.authorized||access.role!=="superadmin")throw new Error("Acesso negado.");
  const jobId=clean(data.jobId,80);if(!jobId)throw new Error("Vaga obrigatória.");
  const found=await db.from("career_jobs").select("id,status,source_type").eq("id",jobId).eq("source_type","external_public").maybeSingle();
  if(found.error||!found.data)throw new Error("Vaga externa não encontrada.");
  const checkedAt=data.checkedAt&&Number.isFinite(Date.parse(data.checkedAt))?new Date(data.checkedAt).toISOString():new Date().toISOString();
  const expiresAt=data.expiresAt&&Number.isFinite(Date.parse(data.expiresAt))?new Date(data.expiresAt).toISOString():null;
  const expired=Boolean(expiresAt&&Date.parse(expiresAt)<=Date.parse(checkedAt));
  const active=Boolean(data.active)&&!expired;
  const patch:any={source_checked_at:checkedAt,source_active:active};
  if(data.expiresAt!==undefined)patch.source_expires_at=expiresAt;
  if(!active&&found.data.status==="published"){patch.status="closed";patch.closed_at=checkedAt;patch.close_reason=expired?"source_expired":"source_unavailable";}
  const updated=await db.from("career_jobs").update(patch).eq("id",jobId).eq("source_type","external_public").select("id,status,source_active,source_checked_at,source_expires_at,close_reason").single();
  if(updated.error||!updated.data)throw new Error("Não foi possível atualizar a disponibilidade da vaga externa.");
  return updated.data;
 });

export const closeExpiredExternalPublicJobs=createServerFn({method:"POST"})
 .middleware([requireSupabaseAuth])
 .handler(async({context})=>{
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");const db=supabaseAdmin as any;
  const access=await resolveAccess(db,context.userId);
  if(!access.authorized||access.role!=="superadmin")throw new Error("Acesso negado.");
  const now=new Date().toISOString();
  const expired=await db.from("career_jobs").select("id").eq("source_type","external_public").eq("status","published").eq("source_active",true).lte("source_expires_at",now);
  if(expired.error)throw new Error("Não foi possível verificar vagas externas expiradas.");
  const ids=(expired.data??[]).map((x:any)=>x.id);
  if(!ids.length)return {closed:0,checkedAt:now};
  const closed=await db.from("career_jobs").update({status:"closed",source_active:false,closed_at:now,close_reason:"source_expired",source_checked_at:now}).in("id",ids).eq("source_type","external_public");
  if(closed.error)throw new Error("Não foi possível encerrar vagas externas expiradas.");
  return {closed:ids.length,checkedAt:now};
 });
