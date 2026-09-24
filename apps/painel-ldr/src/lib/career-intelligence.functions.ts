import {createServerFn} from "@tanstack/react-start";
import {requireSupabaseAuth} from "@/integrations/supabase/auth-middleware";

const CAREER_TYPES=["job","project"] as const;
const norm=(v:any)=>String(v??"").trim().toLowerCase();

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
 const targetCountry=norm(goal?.target_country),targetWorkMode=norm(goal?.target_work_mode); const targetCompetencies=(goal?.target_competency_keys??[]).map(norm).filter(Boolean);\n const scoredJobs=(jobs??[]).map((j:any)=>{const title=String(j.title??"");const reasons:string[]=[];let score=0;const titleHit=Boolean(normalizedTargetTitle)&&norm(title).includes(normalizedTargetTitle);if(titleHit){score+=50;reasons.push("título alinhado ao objetivo ativo");}const countryHit=Boolean(targetCountry)&&norm(j.country)===targetCountry;if(countryHit){score+=20;reasons.push("país alinhado ao objetivo");}const modeHit=Boolean(targetWorkMode)&&norm(j.work_mode)===targetWorkMode;if(modeHit){score+=15;reasons.push("modalidade de trabalho alinhada");}const verifiedTargetSkills=skills.filter((s:any)=>targetCompetencies.includes(norm(s)));if(verifiedTargetSkills.length){score+=Math.min(15,verifiedTargetSkills.length*5);reasons.push("competências verificadas relacionadas ao objetivo");}if(!goal)reasons.push("vaga aberta disponível no ecossistema");return {j,score,reasons,verifiedTargetSkills};}).filter((x:any)=>!goal||x.score>0).sort((a:any,b:any)=>b.score-a.score||String(a.j.id).localeCompare(String(b.j.id)));\n const recs:any[]=[]; for(const {j,score,reasons,verifiedTargetSkills} of scoredJobs.slice(0,8)){recs.push({user_id:uid,opportunity_type:"job",source_reference:j.id,title:j.title,rationale:{generator:"career_intelligence",summary:reasons.length?`Compatibilidade baseada em: ${reasons.join(", ")}.`:"Vaga aberta disponível no ecossistema.",goal:goal?.target_title??null,evidence_skills:verifiedTargetSkills.slice(0,8),location:[j.city,j.country].filter(Boolean).join(", ")||null,work_mode:j.work_mode??null,ranking_score:score,ranking_factors:reasons},status:"suggested"});}
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