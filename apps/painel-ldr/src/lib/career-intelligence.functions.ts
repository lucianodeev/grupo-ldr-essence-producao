import {createServerFn} from "@tanstack/react-start";
import {requireSupabaseAuth} from "@/integrations/supabase/auth-middleware";
export const refreshCareerIntelligence=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server"); const db=supabaseAdmin as any; const uid=context.userId;
 const {data:customer}=await db.from("customers").select("id").eq("auth_user_id",uid).maybeSingle(); const {data:enrollments}=customer?await db.from("training_enrollments").select("id").eq("customer_id",customer.id):{data:[]}; const enrollmentIds=(enrollments??[]).map((x:any)=>x.id);\n const [{data:goals},{data:proofs},{data:jobs},{data:projects},{data:certs},{data:participations}]=await Promise.all([
  db.from("ldr_career_goals").select("id,target_title,target_country,target_work_mode,target_competency_keys").eq("user_id",uid).eq("status","active").limit(5),
  db.from("ldr_proofs").select("id,title,competency_key,verification_status").eq("user_id",uid).limit(50),
  db.from("career_jobs").select("id,title,location,work_mode,status").eq("status","published").limit(50),
  db.from("ldr_experience_projects").select("id,title,modality,status").in("status",["open","in_progress"]).limit(30),
  enrollmentIds.length?db.from("training_certificates").select("*").in("enrollment_id",enrollmentIds).limit(50):Promise.resolve({data:[]}),
  db.from("ldr_experience_participants").select("project_id,status,ldr_experience_projects(id,title,modality)").eq("user_id",uid).eq("status","completed").limit(50)
 ]);
 const existingRefs=new Set((proofs??[]).map((p:any)=>String(p.source_reference??"")));
 const proofAdds:any[]=[];
 for(const cert of certs??[]){const ref=String(cert.id);if(!existingRefs.has(ref))proofAdds.push({user_id:uid,proof_type:"course",title:cert.title??cert.certificate_number??"Certificado LDR",source_type:"ldr",source_label:"LDR Academy",source_reference:ref,verification_status:"pending",metadata:{origin:"training_certificate",system_issued:true}});}
 for(const part of participations??[]){const p=part.ldr_experience_projects;if(p?.id&&!existingRefs.has(String(p.id)))proofAdds.push({user_id:uid,proof_type:"project",title:p.title,source_type:"ldr",source_label:"LDR Empresa-Escola",source_reference:String(p.id),verification_status:"pending",metadata:{origin:"experience_project",modality:p.modality,system_recorded:true}});}
 if(proofAdds.length)await db.from("ldr_proofs").insert(proofAdds);

 const goal=(goals??[])[0]; const skills=[...new Set((proofs??[]).map((p:any)=>p.competency_key).filter(Boolean))];
 const recs:any[]=[]; for(const j of jobs??[]){if(recs.length>=8)break; const title=String(j.title??""); const hit=goal&&title.toLowerCase().includes(String(goal.target_title??"").toLowerCase()); if(hit||!goal)recs.push({user_id:uid,opportunity_type:"job",source_reference:j.id,title,rationale:{summary:hit?"O título da vaga se aproxima do seu objetivo ativo.":"Vaga aberta disponível no ecossistema.",goal:goal?.target_title??null,evidence_skills:skills.slice(0,8)},status:"suggested"});}
 for(const p of projects??[]){if(recs.length>=12)break;recs.push({user_id:uid,opportunity_type:"project",source_reference:p.id,title:p.title,rationale:{summary:"Projeto ativo no ecossistema para prática e construção de evidências.",modality:p.modality},status:"suggested"});}
 await db.from("ldr_opportunity_recommendations").delete().eq("user_id",uid).eq("status","suggested");
 if(recs.length)await db.from("ldr_opportunity_recommendations").insert(recs);
 const actions:any[]=[]; if(goal)actions.push({user_id:uid,context_type:"career",context_reference:goal.id,action_type:"build_portfolio",title:"Fortaleça seu portfólio para "+goal.target_title,rationale:{summary:"Objetivo ativo no Career GPS conectado às evidências disponíveis."}});
 if(!skills.length)actions.push({user_id:uid,context_type:"portfolio",action_type:"prove",title:"Adicione uma evidência ao LDR Proof",rationale:{summary:"Ainda não encontramos competências comprovadas no seu LDR Proof."}});
 if(recs.some(r=>r.opportunity_type==="project"))actions.push({user_id:uid,context_type:"project",action_type:"join_project",title:"Explore um projeto compatível",rationale:{summary:"Há projetos ativos disponíveis no ecossistema Empresa-Escola."}});
 await db.from("ldr_copilot_actions").delete().eq("user_id",uid).eq("status","suggested"); if(actions.length)await db.from("ldr_copilot_actions").insert(actions);
 return {recommendations:recs.length,actions:actions.length,proofsAdded:proofAdds.length};
});