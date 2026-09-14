import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess } from "@/lib/access.server";

const db = supabaseAdmin as any;
const TRIAL_DAYS = 7;
const ACTIVE_SUBSCRIPTION = new Set(["active", "trialing"]);

type Access = { premium:boolean; trialActive:boolean; trialEndsAt:string|null; subscriptionActive:boolean; isAdmin:boolean };
type PostType = "reflection"|"question"|"debate"|"study"|"recommendation";
const POST_TYPES = new Set<PostType>(["reflection","question","debate","study","recommendation"]);
const REPORT_REASONS = new Set(["offensive","harassment","hate","privacy","spam","inappropriate","other"]);
function fail(message:string):never{ throw new Error(message); }
function clean(value:unknown,max:number){ return String(value??"").trim().slice(0,max); }

async function rateLimit(userId:string,table:"academic_posts"|"academic_comments",seconds:number){
  const since=new Date(Date.now()-seconds*1000).toISOString();
  const {count}=await db.from(table).select("id",{count:"exact",head:true}).eq("user_id",userId).gte("created_at",since);
  if((count??0)>0) fail(`Aguarde ${seconds} segundos antes de publicar novamente.`);
}

async function queueInAppNotification(targetUserId:string,createdBy:string,subject:string,body:string,metadata:Record<string,unknown>={}){
  if(!targetUserId||targetUserId===createdBy)return;
  await db.from("notification_outbox").insert({
    audience_type:"client",target_id:targetUserId,channel:"in_app",event_type:"manual",
    subject,body,metadata:{source:"academic_network",...metadata},created_by:createdBy,status:"pending"
  });
}

async function isAdmin(userId:string){
  try{ const a=await resolveAccess(db,userId); return Boolean(a.authorized && a.role==="superadmin"); }catch{return false;}
}

async function subscriptionActive(userId:string){
  const {data:customer}=await db.from("customers").select("id").eq("auth_user_id",userId).maybeSingle();
  if(!customer?.id)return false;
  const {data:sub}=await db.from("library_subscriptions").select("status").eq("customer_id",customer.id).order("created_at",{ascending:false}).limit(1).maybeSingle();
  return ACTIVE_SUBSCRIPTION.has(String(sub?.status??""));
}

async function accessFor(userId:string):Promise<Access>{
  const [admin,sub]=await Promise.all([isAdmin(userId),subscriptionActive(userId)]);
  let {data:trial}=await db.from("academic_access_trials").select("started_at,expires_at,status").eq("user_id",userId).maybeSingle();
  if(!trial){
    const started=new Date(); const expires=new Date(started.getTime()+TRIAL_DAYS*86400000);
    const {data}=await db.from("academic_access_trials").insert({user_id:userId,started_at:started.toISOString(),expires_at:expires.toISOString(),status:"active"}).select("started_at,expires_at,status").single();
    trial=data;
  }
  const trialActive=trial?.status==="active" && new Date(trial.expires_at).getTime()>Date.now();
  if(trial?.status==="active"&&!trialActive) await db.from("academic_access_trials").update({status:"expired"}).eq("user_id",userId);
  return { premium:admin||sub||trialActive, trialActive, trialEndsAt:trial?.expires_at??null, subscriptionActive:sub, isAdmin:admin };
}

async function requirePremium(userId:string){ const access=await accessFor(userId); if(!access.premium)fail("Este recurso faz parte da assinatura da LDR Essence Academy."); return access; }

async function ensureProfile(userId:string){
  let {data}=await db.from("academic_profiles").select("*").eq("user_id",userId).maybeSingle();
  if(!data){ const created=await db.from("academic_profiles").insert({user_id:userId}).select("*").single(); data=created.data; }
  return data;
}

async function authorMap(userIds:string[]){
  const ids=[...new Set(userIds.filter(Boolean))];
  if(!ids.length)return new Map<string,any>();
  const [{data:base},{data:academic}]=await Promise.all([
    db.from("profiles").select("id,full_name").in("id",ids),
    db.from("academic_profiles").select("id,user_id,bio,profession,country,city,interests,display_role,show_name,show_location").in("user_id",ids)
  ]);
  const amap=new Map((academic??[]).map((x:any)=>[x.user_id,x]));
  return new Map((base??[]).map((x:any)=>[x.id,{...x,academic:amap.get(x.id)??null}]));
}

function safeAuthor(raw:any,anonymous:boolean){
  if(anonymous)return {profileId:null,name:"Membro anônimo",role:"member",profession:"",country:"",city:"",anonymous:true};
  const a=raw?.academic; const showName=a?.show_name!==false; const showLocation=a?.show_location===true;
  return {profileId:a?.id??null,name:showName?(raw?.full_name||"Membro LDR"):"Membro LDR",role:a?.display_role??"member",profession:a?.profession??"",country:showLocation?(a?.country??""):"",city:showLocation?(a?.city??""):"",anonymous:false};
}

export async function getAcademicNetwork(userId:string,email:string|null,opts?:{communityId?:string|null;search?:string|null;savedOnly?:boolean}){
  const access=await accessFor(userId);
  const profile=await ensureProfile(userId);
  const [{data:communities},{data:memberships},{data:diary},{data:prompts},{data:saved},{data:reacted},{data:connections}]=await Promise.all([
    db.from("academic_communities").select("id,slug,name,description,is_open,active").eq("active",true).order("name"),
    db.from("academic_community_members").select("community_id").eq("user_id",userId),
    db.from("academic_diary_entries").select("id,body,prompt,created_at,updated_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(100),
    db.from("academic_reflection_prompts").select("id,text").eq("active",true).order("created_at"),
    db.from("academic_saved_posts").select("post_id").eq("user_id",userId),
    db.from("academic_reactions").select("post_id").eq("user_id",userId).eq("reaction_type","support"),
    db.from("academic_connections").select("id,requester_user_id,receiver_user_id,status,created_at").or(`requester_user_id.eq.${userId},receiver_user_id.eq.${userId}`).order("created_at",{ascending:false})
  ]);
  const savedIds=new Set((saved??[]).map((x:any)=>x.post_id));
  let q=db.from("academic_posts").select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,created_at,updated_at").eq("status","active").order("is_pinned",{ascending:false}).order("created_at",{ascending:false}).limit(access.premium?40:8);
  if(opts?.communityId)q=q.eq("community_id",opts.communityId);
  if(opts?.search)q=q.ilike("body",`%${clean(opts.search,100)}%`);
  const {data:rawPosts}=await q;
  let posts=(rawPosts??[]).filter((p:any)=>!opts?.savedOnly||savedIds.has(p.id));
  const postIds=posts.map((p:any)=>p.id);
  const {data:rawComments}=postIds.length?await db.from("academic_comments").select("id,post_id,user_id,body,anonymous,status,created_at,updated_at").in("post_id",postIds).eq("status","active").order("created_at",{ascending:true}):{data:[]};
  const authorIds=[...posts.map((p:any)=>p.user_id),...(rawComments??[]).map((c:any)=>c.user_id),...(connections??[]).flatMap((c:any)=>[c.requester_user_id,c.receiver_user_id])];
  const authors=await authorMap(authorIds);
  const {data:reactionRows}=postIds.length?await db.from("academic_reactions").select("post_id").in("post_id",postIds).eq("reaction_type","support"):{data:[]};
  const counts=new Map<string,number>(); for(const r of reactionRows??[])counts.set(r.post_id,(counts.get(r.post_id)??0)+1);
  const commentsBy=new Map<string,any[]>();
  for(const c of rawComments??[]){ const arr=commentsBy.get(c.post_id)??[]; arr.push({...c,user_id:undefined,own:c.user_id===userId,author:safeAuthor(authors.get(c.user_id),c.anonymous)}); commentsBy.set(c.post_id,arr); }
  posts=posts.map((p:any)=>({...p,user_id:undefined,author:safeAuthor(authors.get(p.user_id),p.anonymous),comments:commentsBy.get(p.id)??[],saved:savedIds.has(p.id),supported:(reacted??[]).some((r:any)=>r.post_id===p.id),supportCount:counts.get(p.id)??0,own:p.user_id===userId}));
  const connectionsSafe=(connections??[]).map((c:any)=>{const other=c.requester_user_id===userId?c.receiver_user_id:c.requester_user_id;return {id:c.id,status:c.status,direction:c.requester_user_id===userId?"outgoing":"incoming",profile:safeAuthor(authors.get(other),false),created_at:c.created_at};});
  const promptList=prompts??[]; const prompt=promptList.length?promptList[Math.floor(new Date().getDate()%promptList.length)]:null;
  let directoryQuery=db.from("academic_profiles").select("id,user_id,bio,profession,country,city,interests,display_role,show_name,show_location").neq("user_id",userId).limit(access.premium?24:6);
  if(opts?.search){ const term=clean(opts.search,100).replace(/[,%()]/g," "); directoryQuery=directoryQuery.or(`bio.ilike.%${term}%,profession.ilike.%${term}%`); }
  const {data:directoryRaw}=await directoryQuery;
  const directoryAuthors=await authorMap((directoryRaw??[]).map((x:any)=>x.user_id));
  const directory=(directoryRaw??[]).map((x:any)=>({ ...safeAuthor(directoryAuthors.get(x.user_id),false), bio:x.bio,interests:x.interests??[] })).filter((x:any)=>x.profileId);
  return {access:{...access,freeDiary:true},profile,communities:communities??[],memberships:(memberships??[]).map((x:any)=>x.community_id),diary:diary??[],prompt,posts,connections:connectionsSafe,directory,userEmail:email??null};
}

export async function saveDiaryEntry(userId:string,input:{id?:string;body:string;prompt?:string|null}){
  const body=clean(input.body,20000); if(!body)fail("Escreva algo antes de salvar.");
  if(input.id){ const {data,error}=await db.from("academic_diary_entries").update({body,prompt:clean(input.prompt,500)||null,updated_at:new Date().toISOString()}).eq("id",input.id).eq("user_id",userId).select("id").maybeSingle(); if(error||!data)fail("Registro não encontrado."); return data; }
  const {data,error}=await db.from("academic_diary_entries").insert({user_id:userId,body,prompt:clean(input.prompt,500)||null}).select("id").single(); if(error)fail("Não foi possível salvar o diário."); return data;
}
export async function deleteDiaryEntry(userId:string,id:string){ await db.from("academic_diary_entries").delete().eq("id",id).eq("user_id",userId); return {ok:true}; }

export async function createAcademicPost(userId:string,input:{body:string;postType:PostType;anonymous:boolean;communityId?:string|null}){
  await requirePremium(userId); await rateLimit(userId,"academic_posts",15); const body=clean(input.body,12000); if(!body)fail("Escreva algo antes de publicar."); if(!POST_TYPES.has(input.postType))fail("Tipo inválido.");
  const {data,error}=await db.from("academic_posts").insert({user_id:userId,body,post_type:input.postType,anonymous:Boolean(input.anonymous),community_id:input.communityId||null}).select("id").single(); if(error)fail("Não foi possível publicar."); return data;
}
export async function updateAcademicPost(userId:string,input:{id:string;body:string}){ await requirePremium(userId); const body=clean(input.body,12000); if(!body)fail("Texto obrigatório."); const {data}=await db.from("academic_posts").update({body,updated_at:new Date().toISOString()}).eq("id",input.id).eq("user_id",userId).eq("status","active").select("id").maybeSingle(); if(!data)fail("Publicação não encontrada."); return data; }
export async function deleteAcademicPost(userId:string,id:string){ await db.from("academic_posts").update({status:"deleted",updated_at:new Date().toISOString()}).eq("id",id).eq("user_id",userId); return {ok:true}; }

export async function createAcademicComment(userId:string,input:{postId:string;body:string;anonymous:boolean}){ await requirePremium(userId); await rateLimit(userId,"academic_comments",8); const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data,error}=await db.from("academic_comments").insert({post_id:input.postId,user_id:userId,body,anonymous:Boolean(input.anonymous)}).select("id").single(); if(error)fail("Não foi possível comentar."); const {data:post}=await db.from("academic_posts").select("user_id").eq("id",input.postId).maybeSingle(); if(post?.user_id) await queueInAppNotification(post.user_id,userId,"Novo comentário na Rede Acadêmica","Sua publicação recebeu uma nova resposta.",{postId:input.postId}); return data; }
export async function updateAcademicComment(userId:string,input:{id:string;body:string}){ await requirePremium(userId); const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data}=await db.from("academic_comments").update({body,updated_at:new Date().toISOString()}).eq("id",input.id).eq("user_id",userId).eq("status","active").select("id").maybeSingle(); if(!data)fail("Comentário não encontrado."); return data; }
export async function deleteAcademicComment(userId:string,id:string){ await db.from("academic_comments").update({status:"deleted",updated_at:new Date().toISOString()}).eq("id",id).eq("user_id",userId); return {ok:true}; }

export async function toggleAcademicSave(userId:string,postId:string){ await requirePremium(userId); const {data}=await db.from("academic_saved_posts").select("post_id").eq("user_id",userId).eq("post_id",postId).maybeSingle(); if(data)await db.from("academic_saved_posts").delete().eq("user_id",userId).eq("post_id",postId); else await db.from("academic_saved_posts").insert({user_id:userId,post_id:postId}); return {saved:!data}; }
export async function toggleAcademicSupport(userId:string,postId:string){ await requirePremium(userId); const {data}=await db.from("academic_reactions").select("post_id").eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support").maybeSingle(); if(data)await db.from("academic_reactions").delete().eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support"); else await db.from("academic_reactions").insert({user_id:userId,post_id:postId,reaction_type:"support"}); return {supported:!data}; }
export async function toggleAcademicMembership(userId:string,communityId:string){ await requirePremium(userId); const {data}=await db.from("academic_community_members").select("community_id").eq("user_id",userId).eq("community_id",communityId).maybeSingle(); if(data)await db.from("academic_community_members").delete().eq("user_id",userId).eq("community_id",communityId); else await db.from("academic_community_members").insert({user_id:userId,community_id:communityId}); return {joined:!data}; }

export async function updateAcademicProfile(userId:string,input:{bio?:string;profession?:string;country?:string;city?:string;interests?:string[];showName?:boolean;showLocation?:boolean}){
  await ensureProfile(userId); const patch={bio:clean(input.bio,1200),profession:clean(input.profession,120),country:clean(input.country,80),city:clean(input.city,80),interests:(input.interests??[]).map(x=>clean(x,80)).filter(Boolean).slice(0,12),show_name:Boolean(input.showName),show_location:Boolean(input.showLocation),updated_at:new Date().toISOString()}; const {data,error}=await db.from("academic_profiles").update(patch).eq("user_id",userId).select("*").single(); if(error)fail("Não foi possível atualizar o perfil."); return data;
}

export async function requestAcademicConnection(userId:string,targetProfileId:string){ await requirePremium(userId); const {data:target}=await db.from("academic_profiles").select("user_id").eq("id",targetProfileId).maybeSingle(); if(!target?.user_id||target.user_id===userId)fail("Perfil inválido."); const a=userId<target.user_id?userId:target.user_id,b=userId<target.user_id?target.user_id:userId; const {data:existing}=await db.from("academic_connections").select("id,status,requester_user_id,receiver_user_id").or(`and(requester_user_id.eq.${a},receiver_user_id.eq.${b}),and(requester_user_id.eq.${b},receiver_user_id.eq.${a})`).maybeSingle(); if(existing)return existing; const {data,error}=await db.from("academic_connections").insert({requester_user_id:userId,receiver_user_id:target.user_id,status:"pending"}).select("id,status").single(); if(error)fail("Não foi possível conectar."); await queueInAppNotification(target.user_id,userId,"Nova conexão acadêmica","Você recebeu uma solicitação de conexão na Rede Acadêmica.",{connectionId:data.id}); return data; }
export async function respondAcademicConnection(userId:string,id:string,status:"accepted"|"declined"){ await requirePremium(userId); const {data:before}=await db.from("academic_connections").select("requester_user_id").eq("id",id).eq("receiver_user_id",userId).eq("status","pending").maybeSingle(); const {data}=await db.from("academic_connections").update({status,updated_at:new Date().toISOString()}).eq("id",id).eq("receiver_user_id",userId).eq("status","pending").select("id,status").maybeSingle(); if(!data)fail("Solicitação não encontrada."); if(status==="accepted"&&before?.requester_user_id) await queueInAppNotification(before.requester_user_id,userId,"Conexão aceita","Sua solicitação de conexão acadêmica foi aceita.",{connectionId:id}); return data; }

export async function reportAcademicContent(userId:string,input:{postId?:string;commentId?:string;reason:string;details?:string}){ await requirePremium(userId); if(Boolean(input.postId)===Boolean(input.commentId))fail("Conteúdo inválido."); const reason=REPORT_REASONS.has(input.reason)?input.reason:"other"; const {data,error}=await db.from("academic_reports").insert({reporter_user_id:userId,post_id:input.postId||null,comment_id:input.commentId||null,reason,details:clean(input.details,1200)}).select("id").single(); if(error)fail("Não foi possível enviar a denúncia."); return data; }

async function requireAdmin(userId:string){ if(!(await isAdmin(userId)))fail("Acesso negado."); }
export async function getAcademicAdmin(userId:string){
  await requireAdmin(userId);
  const [{data:posts},{data:comments},{data:reports},{data:communities},{data:academicProfiles}]=await Promise.all([
    db.from("academic_posts").select("id,user_id,body,post_type,anonymous,status,is_pinned,created_at").order("created_at",{ascending:false}).limit(150),
    db.from("academic_comments").select("id,post_id,user_id,body,anonymous,status,created_at").order("created_at",{ascending:false}).limit(200),
    db.from("academic_reports").select("id,reporter_user_id,post_id,comment_id,reason,details,status,created_at").order("created_at",{ascending:false}).limit(200),
    db.from("academic_communities").select("id,slug,name,active").order("name"),
    db.from("academic_profiles").select("id,user_id,bio,profession,country,city,display_role,show_name,show_location,created_at").order("created_at",{ascending:false}).limit(250)
  ]);
  const ids=(academicProfiles??[]).map((p:any)=>p.user_id);
  const {data:baseProfiles}=ids.length?await db.from("profiles").select("id,full_name").in("id",ids):{data:[]};
  const names=new Map((baseProfiles??[]).map((p:any)=>[p.id,p.full_name]));
  const profiles=(academicProfiles??[]).map((p:any)=>({...p,user_id:undefined,name:names.get(p.user_id)||"Membro LDR"}));
  return {posts:posts??[],comments:comments??[],reports:reports??[],communities:communities??[],profiles};
}
export async function moderateAcademic(userId:string,input:{kind:"post"|"comment"|"report";id:string;action:"hide"|"restore"|"pin"|"unpin"|"resolve"|"dismiss"}){ await requireAdmin(userId); if(input.kind==="post"){const patch:any={updated_at:new Date().toISOString()}; if(input.action==="hide")patch.status="hidden"; else if(input.action==="restore")patch.status="active"; else if(input.action==="pin"){ const {count}=await db.from("academic_posts").select("id",{count:"exact",head:true}).eq("is_pinned",true).eq("status","active"); const {data:target}=await db.from("academic_posts").select("is_pinned").eq("id",input.id).maybeSingle(); if(!target?.is_pinned&&(count??0)>=3) fail("Limite de 3 publicações fixadas atingido."); patch.is_pinned=true; } else if(input.action==="unpin")patch.is_pinned=false; else fail("Ação inválida."); await db.from("academic_posts").update(patch).eq("id",input.id);} else if(input.kind==="comment"){if(!["hide","restore"].includes(input.action))fail("Ação inválida."); await db.from("academic_comments").update({status:input.action==="hide"?"hidden":"active",updated_at:new Date().toISOString()}).eq("id",input.id);} else {if(!["resolve","dismiss"].includes(input.action))fail("Ação inválida."); await db.from("academic_reports").update({status:input.action==="resolve"?"resolved":"dismissed",reviewed_by:userId,reviewed_at:new Date().toISOString()}).eq("id",input.id);} return {ok:true}; }

export async function setAcademicProfileRole(userId:string,input:{profileId:string;role:"member"|"student"|"professor"|"mentor"}){
  await requireAdmin(userId);
  const allowed=new Set(["member","student","professor","mentor"]);
  if(!allowed.has(input.role))fail("Função acadêmica inválida.");
  const {data,error}=await db.from("academic_profiles").update({display_role:input.role,updated_at:new Date().toISOString()}).eq("id",input.profileId).select("id,display_role").maybeSingle();
  if(error||!data)fail("Perfil acadêmico não encontrado.");
  return data;
}
