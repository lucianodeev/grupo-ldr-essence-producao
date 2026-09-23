import {createServerFn} from "@tanstack/react-start";
import {requireSupabaseAuth} from "@/integrations/supabase/auth-middleware";

const CAREER_TYPES=["job","project"] as const;

export const refreshCareerIntelligence=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server"); const db=supabaseAdmin as any; const uid=context.userId;
 const [goalsResult,proofsResult,jobsResult,projectsResult]=await Promise.all([
  db.from("ldr_career_goals").select("id,target_title,target_country,target_work_mode,target_competency_keys").eq("user_id",uid).eq("status","active").limit(5),
  db.from("ldr_proofs").select("id,title,competency_key,verification_status").eq("user_id",uid).limit(50),
  db.from("career_jobs").select("id,title,city,country,work_mode,status").eq("status","published").limit(50),
  db.from("ldr_experience_projects").select("id,title,modality,status").in("status",["open","in_progress"]).limit(30)
 ]);
 const failed=[goalsResult,proofsResult,jobsResult,projectsResult].find((result:any)=>result.error);
 if(failed?.error)throw new Error("Não foi possível atualizar as oportunidades com segurança. As sugestões atuais foram preservadas.");
 const goals=goalsResult.data,proofs=proofsResult.data,jobs=jobsResult.data,projects=projectsResult.data;
 const goal=(goals??[])[0]; const skills=[...new Set((proofs??[]).map((p:any)=>p.competency_key).filter(Boolean))];
 const recs:any[]=[]; for(const j of jobs??[]){if(recs.length>=8)break; const title=String(j.title??""); const hit=goal&&title.toLowerCase().includes(String(goal.target_title??"").toLowerCase()); if(hit||!goal)recs.push({user_id:uid,opportunity_type:"job",source_reference:j.id,title,rationale:{generator:"career_intelligence",summary:hit?"O título da vaga se aproxima do seu objetivo ativo.":"Vaga aberta disponível no ecossistema.",goal:goal?.target_title??null,evidence_skills:skills.slice(0,8),location:[j.city,j.country].filter(Boolean).join(", ")||null,work_mode:j.work_mode??null},status:"suggested"});}
 for(const p of projects??[]){if(recs.length>=12)break;recs.push({user_id:uid,opportunity_type:"project",source_reference:p.id,title:p.title,rationale:{generator:"career_intelligence",summary:"Projeto ativo no ecossistema para prática e construção de evidências.",modality:p.modality},status:"suggested"});}

 // Refresh only recommendations owned by this career generator.
 // Other modules (Rede Acadêmica, negócios, eventos, cursos) may share this table.
 const recDelete=await db.from("ldr_opportunity_recommendations").delete().eq("user_id",uid).eq("status","suggested").in("opportunity_type",[...CAREER_TYPES]).contains("rationale",{generator:"career_intelligence"});
 if(recDelete.error)throw new Error("Não foi possível atualizar as oportunidades. As sugestões atuais foram preservadas.");
 if(recs.length){const recInsert=await db.from("ldr_opportunity_recommendations").insert(recs);if(recInsert.error)throw new Error("Não foi possível salvar as novas oportunidades.");}

 const actions:any[]=[]; if(goal)actions.push({user_id:uid,context_type:"career",context_reference:goal.id,action_type:"build_portfolio",title:"Fortaleça seu portfólio para "+goal.target_title,rationale:{summary:"Objetivo ativo no Career GPS conectado às evidências disponíveis."}});
 if(!skills.length)actions.push({user_id:uid,context_type:"portfolio",action_type:"prove",title:"Adicione uma evidência ao LDR Proof",rationale:{summary:"Ainda não encontramos competências comprovadas no seu LDR Proof."}});
 if(recs.some(r=>r.opportunity_type==="project"))actions.push({user_id:uid,context_type:"project",action_type:"join_project",title:"Explore um projeto compatível",rationale:{summary:"Há projetos ativos disponíveis no ecossistema Empresa-Escola."}});
 const actionDelete=await db.from("ldr_copilot_actions").delete().eq("user_id",uid).eq("status","suggested").in("context_type",["career","portfolio","project"]);
 if(actionDelete.error)throw new Error("As oportunidades foram atualizadas, mas não foi possível atualizar os próximos passos.");
 if(actions.length){const actionInsert=await db.from("ldr_copilot_actions").insert(actions);if(actionInsert.error)throw new Error("Não foi possível salvar os novos próximos passos.");}
 return {recommendations:recs.length,actions:actions.length};
});