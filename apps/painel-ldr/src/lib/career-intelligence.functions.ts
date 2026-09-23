import {createServerFn} from "@tanstack/react-start";
import {requireSupabaseAuth} from "@/integrations/supabase/auth-middleware";
export const refreshCareerIntelligence=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server"); const db=supabaseAdmin as any; const uid=context.userId;
 const [{data:goals},{data:proofs},{data:jobs},{data:projects}]=await Promise.all([
  db.from("ldr_career_goals").select("id,target_title,target_country,target_work_mode,target_competency_keys").eq("user_id",uid).eq("status","active").limit(5),
  db.from("ldr_proofs").select("id,title,competency_key,verification_status").eq("user_id",uid).limit(50),
  db.from("career_jobs").select("id,title,country,city,work_mode,status,source_type,source_name,source_active,source_expires_at").eq("status","published").limit(50),
  db.from("ldr_experience_projects").select("id,title,modality,status").in("status",["open","in_progress"]).limit(30)
 ]);
 const goal=(goals??[])[0]; const skills=[...new Set((proofs??[]).map((p:any)=>p.competency_key).filter(Boolean))];
 const now=Date.now(); const validJobs=(jobs??[]).filter((j:any)=>j.source_type!=="external_public"||(j.source_active!==false&&(!j.source_expires_at||Date.parse(j.source_expires_at)>now)));\n const recs:any[]=[]; for(const j of validJobs){if(recs.length>=8)break; const title=String(j.title??""); const hit=goal&&title.toLowerCase().includes(String(goal.target_title??"").toLowerCase()); if(hit||!goal)recs.push({user_id:uid,opportunity_type:"job",source_reference:j.id,title,rationale:{summary:hit?"O título da vaga se aproxima do seu objetivo ativo.":j.source_type==="external_public"?"Vaga pública externa ativa disponível como possibilidade.":"Vaga aberta disponível no ecossistema.",goal:goal?.target_title??null,evidence_skills:skills.slice(0,8),source_type:j.source_type??"internal",source_name:j.source_name??null},status:"suggested"});}
 for(const p of projects??[]){if(recs.length>=12)break;recs.push({user_id:uid,opportunity_type:"project",source_reference:p.id,title:p.title,rationale:{summary:"Projeto ativo no ecossistema para prática e construção de evidências.",modality:p.modality},status:"suggested"});}
 await db.from("ldr_opportunity_recommendations").delete().eq("user_id",uid).eq("status","suggested");
 if(recs.length)await db.from("ldr_opportunity_recommendations").insert(recs);
 const actions:any[]=[]; if(goal)actions.push({user_id:uid,context_type:"career",context_reference:goal.id,action_type:"build_portfolio",title:"Fortaleça seu portfólio para "+goal.target_title,rationale:{summary:"Objetivo ativo no Career GPS conectado às evidências disponíveis."}});
 if(!skills.length)actions.push({user_id:uid,context_type:"portfolio",action_type:"prove",title:"Adicione uma evidência ao LDR Proof",rationale:{summary:"Ainda não encontramos competências comprovadas no seu LDR Proof."}});
 if(recs.some(r=>r.opportunity_type==="project"))actions.push({user_id:uid,context_type:"project",action_type:"join_project",title:"Explore um projeto compatível",rationale:{summary:"Há projetos ativos disponíveis no ecossistema Empresa-Escola."}});
 await db.from("ldr_copilot_actions").delete().eq("user_id",uid).eq("status","suggested"); if(actions.length)await db.from("ldr_copilot_actions").insert(actions);
 return {recommendations:recs.length,actions:actions.length};
});

export const getAcademicPostPossibilityContext=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data:{postId:string})=>data).handler(async({data,context})=>{
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server"); const db=supabaseAdmin as any; const uid=context.userId;
 const postId=String(data?.postId??"").trim();
 if(!postId)return {found:false as const};
 const {data:post,error}=await db.from("academic_posts").select("id,user_id,body,post_type,status").eq("id",postId).eq("user_id",uid).eq("status","active").maybeSingle();
 if(error||!post)return {found:false as const};
 const body=String(post.body??"").trim(); const normalized=body.toLocaleLowerCase();
 const signals=[
  {kind:"project",words:["projeto","project","projet","proyecto","ideia","idea","idée"]},
  {kind:"learning",words:["aprender","aprendendo","learn","learning","apprendre","apprends","aprender"]},
  {kind:"mentor",words:["mentor","mentoria","orientador","orientação","guidance","supervisor"]},
  {kind:"collaboration",words:["parceiro","parceria","colabor","partner","équipe","equipo","team"]},
  {kind:"service",words:["serviço","service","servicio","freelance","cliente","client"]},
  {kind:"work",words:["trabalho","vaga","emprego","work","job","emploi","trabajo"]}
 ].filter(s=>s.words.some(w=>normalized.includes(w))).map(s=>s.kind);
 return {found:true as const,post:{id:post.id,body:body.slice(0,1200),postType:post.post_type},signals:[...new Set(signals)]};
});
