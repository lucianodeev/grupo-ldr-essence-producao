import {createServerFn} from "@tanstack/react-start";
import {requireSupabaseAuth} from "@/integrations/supabase/auth-middleware";

const CAREER_TYPES=["job","project"] as const;

export const refreshCareerIntelligence=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server"); const db=supabaseAdmin as any; const uid=context.userId;
 const [{data:goals},{data:proofs},{data:jobs},{data:projects}]=await Promise.all([
  db.from("ldr_career_goals").select("id,target_title,target_country,target_work_mode,target_competency_keys").eq("user_id",uid).eq("status","active").limit(5),
  db.from("ldr_proofs").select("id,title,competency_key,verification_status").eq("user_id",uid).limit(50),
  db.from("career_jobs").select("id,title,location,work_mode,status").eq("status","published").limit(50),
  db.from("ldr_experience_projects").select("id,title,modality,status").in("status",["open","in_progress"]).limit(30)
 ]);
 const goal=(goals??[])[0]; const skills=[...new Set((proofs??[]).map((p:any)=>p.competency_key).filter(Boolean))];
 const recs:any[]=[]; for(const j of jobs??[]){if(recs.length>=8)break; const title=String(j.title??""); const hit=goal&&title.toLowerCase().includes(String(goal.target_title??"").toLowerCase()); if(hit||!goal)recs.push({user_id:uid,opportunity_type:"job",source_reference:j.id,title,rationale:{summary:hit?"O título da vaga se aproxima do seu objetivo ativo.":"Vaga aberta disponível no ecossistema.",goal:goal?.target_title??null,evidence_skills:skills.slice(0,8)},status:"suggested"});}
 for(const p of projects??[]){if(recs.length>=12)break;recs.push({user_id:uid,opportunity_type:"project",source_reference:p.id,title:p.title,rationale:{summary:"Projeto ativo no ecossistema para prática e construção de evidências.",modality:p.modality},status:"suggested"});}

 // Refresh only recommendations owned by this career generator.
 // Other modules (Rede Acadêmica, negócios, eventos, cursos) may share this table.
 await db.from("ldr_opportunity_recommendations").delete().eq("user_id",uid).eq("status","suggested").in("opportunity_type",[...CAREER_TYPES]);
 if(recs.length)await db.from("ldr_opportunity_recommendations").insert(recs);

 const actions:any[]=[]; if(goal)actions.push({user_id:uid,context_type:"career",context_reference:goal.id,action_type:"build_portfolio",title:"Fortaleça seu portfólio para "+goal.target_title,rationale:{summary:"Objetivo ativo no Career GPS conectado às evidências disponíveis."}});
 if(!skills.length)actions.push({user_id:uid,context_type:"portfolio",action_type:"prove",title:"Adicione uma evidência ao LDR Proof",rationale:{summary:"Ainda não encontramos competências comprovadas no seu LDR Proof."}});
 if(recs.some(r=>r.opportunity_type==="project"))actions.push({user_id:uid,context_type:"project",action_type:"join_project",title:"Explore um projeto compatível",rationale:{summary:"Há projetos ativos disponíveis no ecossistema Empresa-Escola."}});
 await db.from("ldr_copilot_actions").delete().eq("user_id",uid).eq("status","suggested"); if(actions.length)await db.from("ldr_copilot_actions").insert(actions);
 return {recommendations:recs.length,actions:actions.length};
});