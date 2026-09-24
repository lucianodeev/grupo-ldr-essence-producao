import {createServerFn} from "@tanstack/react-start";
import {requireSupabaseAuth} from "@/integrations/supabase/auth-middleware";

const CAREER_TYPES=["job","project"] as const;

export const refreshCareerIntelligence=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server"); const db=supabaseAdmin as any; const uid=context.userId;
 const [goalsResult,proofsResult,jobsResult,projectsResult]=await Promise.all([
  db.from("ldr_career_goals").select("id,target_title,target_country,target_work_mode,target_competency_keys").eq("user_id",uid).eq("status","active").order("updated_at",{ascending:false}).order("created_at",{ascending:false}).limit(5),
  db.from("ldr_proofs").select("id,title,competency_key,verification_status").eq("user_id",uid).limit(50),
  db.from("career_jobs").select("id,title,city,country,work_mode,status").eq("status","published").limit(50),
  db.from("ldr_experience_projects").select("id,title,modality,status").in("status",["open","in_progress"]).limit(30)
 ]);
 const failed=[goalsResult,proofsResult,jobsResult,projectsResult].find((result:any)=>result.error);
 if(failed?.error)throw new Error("Não foi possível atualizar as oportunidades com segurança. As sugestões atuais foram preservadas.");
 const goals=goalsResult.data,proofs=proofsResult.data,jobs=jobsResult.data,projects=projectsResult.data;
 const goal=(goals??[])[0]; const targetTitle=String(goal?.target_title??"").trim(); const normalizedTargetTitle=targetTitle.toLowerCase(); const verifiedProofs=(proofs??[]).filter((p:any)=>String(p.verification_status??"").toLowerCase()==="verified"); const skills=[...new Set(verifiedProofs.map((p:any)=>p.competency_key).filter(Boolean))];
 const recs:any[]=[]; for(const j of jobs??[]){if(recs.length>=8)break; const title=String(j.title??""); const hit=Boolean(normalizedTargetTitle)&&title.toLowerCase().includes(normalizedTargetTitle); if(hit||!normalizedTargetTitle)recs.push({user_id:uid,opportunity_type:"job",source_reference:j.id,title,rationale:{generator:"career_intelligence",summary:hit?"O título da vaga se aproxima do seu objetivo ativo.":"Vaga aberta disponível no ecossistema.",goal:goal?.target_title??null,evidence_skills:skills.slice(0,8),location:[j.city,j.country].filter(Boolean).join(", ")||null,work_mode:j.work_mode??null},status:"suggested"});}
 for(const p of projects??[]){if(recs.length>=12)break;recs.push({user_id:uid,opportunity_type:"project",source_reference:p.id,title:p.title,rationale:{generator:"career_intelligence",summary:"Projeto ativo no ecossistema para prática e construção de evidências.",modality:p.modality},status:"suggested"});}

 const actions:any[]=[]; if(goal)actions.push({user_id:uid,context_type:"career",context_reference:goal.id,action_type:"build_portfolio",title:targetTitle?"Fortaleça seu portfólio para "+targetTitle:"Fortaleça seu portfólio profissional",rationale:{generator:"career_intelligence",summary:"Objetivo ativo no Career GPS conectado às evidências disponíveis."}});
 if(!skills.length)actions.push({user_id:uid,context_type:"portfolio",action_type:"prove",title:"Adicione uma evidência ao LDR Proof",rationale:{generator:"career_intelligence",summary:"Ainda não encontramos competências verificadas no seu LDR Proof."}});
 if(recs.some(r=>r.opportunity_type==="project"))actions.push({user_id:uid,context_type:"project",action_type:"join_project",title:"Explore um projeto compatível",rationale:{generator:"career_intelligence",summary:"Há projetos ativos disponíveis no ecossistema Empresa-Escola."}});

 // Replace this generator's recommendations and Copilot actions in one database transaction.
 // If any insert fails, Postgres rolls the entire RPC back and preserves the previous suggestions.
 const rpcRecommendations=recs.map(({user_id:_,status:__,...rec})=>rec);
 const rpcActions=actions.map(({user_id:_,...action})=>action);
 const {data:refreshResult,error:refreshError}=await db.rpc("ldr_refresh_career_intelligence_atomic",{p_user_id:uid,p_recommendations:rpcRecommendations,p_actions:rpcActions});
 if(refreshError)throw new Error("Não foi possível atualizar as oportunidades com segurança. As sugestões atuais foram preservadas.");
 const result=(refreshResult??{}) as any;
 return {recommendations:Number(result.recommendations??recs.length),actions:Number(result.actions??actions.length)};
});