import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db=supabaseAdmin as any;
function clean(value:unknown,max:number){const v=String(value??"").trim().slice(0,max);return v||null}
function cleanList(value:unknown,maxItems=20,maxLength=100){if(!Array.isArray(value))return [];return [...new Set(value.map(x=>String(x??"").trim().slice(0,maxLength)).filter(Boolean))].slice(0,maxItems)}
function safeUrl(value:unknown){const v=String(value??"").trim();if(!v)return null;let url:URL;try{url=new URL(v)}catch{throw new Error("URL inválida.")}if(url.protocol!=="https:"&&url.protocol!=="http:")throw new Error("Use uma URL iniciada por https:// ou http://.");return url.toString().slice(0,500)}
export type AcademicProfileV1Input={bio?:string;institution?:string;courses?:string[];profession?:string;academicArea?:string;interests?:string[];competencies?:string[];researchTopics?:string[];languages?:string[];country?:string;city?:string;professionalObjective?:string;linkedinUrl?:string;websiteUrl?:string;availableForOpportunities?:boolean;availableForCollaboration?:boolean;showName?:boolean;showLocation?:boolean};
export async function updateAcademicProfileV1(userId:string,input:AcademicProfileV1Input){
 const existing=await db.from("academic_profiles").select("id").eq("user_id",userId).maybeSingle();
 if(existing.error)throw new Error("Não foi possível carregar o perfil acadêmico.");
 if(!existing.data){const created=await db.from("academic_profiles").upsert({user_id:userId},{onConflict:"user_id",ignoreDuplicates:true});if(created.error)throw new Error("Não foi possível criar o perfil acadêmico.")}
 const patch={bio:clean(input.bio,1200),institution:clean(input.institution,160),courses:cleanList(input.courses,20,120),profession:clean(input.profession,120),academic_area:clean(input.academicArea,160),interests:cleanList(input.interests,20,100),competencies:cleanList(input.competencies,24,100),research_topics:cleanList(input.researchTopics,20,140),languages:cleanList(input.languages,20,80),country:clean(input.country,80),city:clean(input.city,80),professional_objective:clean(input.professionalObjective,1200),linkedin_url:safeUrl(input.linkedinUrl),website_url:safeUrl(input.websiteUrl),available_for_opportunities:Boolean(input.availableForOpportunities),available_for_collaboration:Boolean(input.availableForCollaboration),show_name:input.showName!==false,show_location:Boolean(input.showLocation),updated_at:new Date().toISOString()};
 const {data,error}=await db.from("academic_profiles").update(patch).eq("user_id",userId).select("*").single();
 if(error||!data)throw new Error("Não foi possível atualizar o perfil.");
 return data;
}
