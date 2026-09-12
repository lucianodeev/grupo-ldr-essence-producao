import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
import { hasOwnerDigitalAccess } from "@/lib/owner-digital-access.server";

const db=supabaseAdmin as any;

export const LEGACY_PROJECT_CONFIG={
  "formacao-psicanalise":{productKey:"formacao_psicanalise",title:"Formação em Psicanálise · Autismo + Atuação Internacional"},
  "formacao-terapia-breve-psicanalitica":{productKey:"formacao_terapia_breve_psicanalitica",title:"Formação em Terapia Breve Psicanalítica"},
  "formacao-completa-massoterapia":{productKey:"formacao_massoterapia",title:"Formação Completa em Massoterapia"},
  "formacao-mentoria-profissional-carreira":{productKey:"formacao_mentoria_profissional_carreira",title:"Formação em Mentoria Profissional e de Carreira"},
  "formacao-lideranca-gestao-pessoas":{productKey:"formacao_lideranca_gestao_pessoas",title:"Formação em Liderança e Gestão de Pessoas"},
} as const;

export type LegacyProjectSlug=keyof typeof LEGACY_PROJECT_CONFIG;

function fail(message:string):never{throw new Error(message)}
async function customerFor(userId:string,email:string|null){const x=await resolveClient(userId,email);if(x.status!=="ok")fail("Acesso do cliente não disponível.");return x.customer;}
function configFor(slug:string){const c=(LEGACY_PROJECT_CONFIG as Record<string,{productKey:string;title:string}>)[slug];if(!c)fail("Formação não configurada para projeto.");return c;}

export async function getLegacyTrainingProjectContext(userId:string,email:string|null,slug:LegacyProjectSlug){
  const cfg=configFor(slug);const customer=await customerFor(userId,email);const owner=hasOwnerDigitalAccess(email,userId);
  const {data:training}=await db.from("training_programs").select("id,slug,title,status").eq("slug",slug).eq("status","published").maybeSingle();
  if(!training)fail("Formação não encontrada.");
  const {data:enrollment}=await db.from("training_enrollments").select("id,active,progress_percent").eq("training_id",training.id).eq("customer_id",customer.id).eq("active",true).maybeSingle();
  if(!enrollment&&!owner)fail("Você não possui acesso ativo a esta formação.");
  const {data:progress}=await db.from("library_progress").select("progress_percent").eq("customer_id",customer.id).eq("product_key",cfg.productKey).maybeSingle();
  const progressPercent=Math.max(Number(enrollment?.progress_percent??0),Number(progress?.progress_percent??0));
  const {data:rows}=await db.from("training_project_submissions").select("id,submission_number,title,project_url,project_text,status,submitted_at,reviewed_at,feedback").eq("training_id",training.id).eq("customer_id",customer.id).order("submission_number",{ascending:true});
  const project=(rows??[]).at(-1)??null;
  return {slug,productKey:cfg.productKey,trainingId:training.id,title:cfg.title,owner,progressPercent,eligible:owner||progressPercent>=100,project};
}

export async function submitLegacyTrainingProject(userId:string,email:string|null,input:{slug:LegacyProjectSlug;title:string;projectText?:string|null;projectUrl?:string|null}){
  const ctx=await getLegacyTrainingProjectContext(userId,email,input.slug);if(!ctx.eligible)fail("Conclua 100% da formação antes de enviar o projeto final.");
  const customer=await customerFor(userId,email);const title=input.title.trim(),projectText=input.projectText?.trim()||null,projectUrl=input.projectUrl?.trim()||null;
  if(!title||(!projectText&&!projectUrl))fail("Informe o título e descreva o projeto ou envie um link.");
  if(ctx.project?.status==="submitted"||ctx.project?.status==="in_review")fail("Seu projeto já está aguardando avaliação.");
  if(ctx.project?.status==="approved")fail("Seu projeto já foi aprovado.");
  if(ctx.project?.status==="changes_requested"){
    const {data,error}=await db.from("training_project_submissions").update({title,project_text:projectText,project_url:projectUrl,status:"submitted",submitted_at:new Date().toISOString(),reviewed_at:null,reviewed_by:null,feedback:null}).eq("id",ctx.project.id).select("id,status").single();
    if(error||!data)fail("Não foi possível reenviar o projeto.");return data;
  }
  const {data,error}=await db.from("training_project_submissions").insert({training_id:ctx.trainingId,enrollment_id:null,customer_id:customer.id,submission_number:1,title,project_text:projectText,project_url:projectUrl,status:"submitted",submitted_at:new Date().toISOString()}).select("id,status").single();
  if(error||!data)fail("Não foi possível enviar o projeto.");return data;
}
