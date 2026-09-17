import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveAccess } from "@/lib/access.server";

const db = supabaseAdmin as any;
const ACTIVE_SUBSCRIPTION = new Set(["active", "trialing"]);

type Access = { premium:boolean; trialActive:boolean; trialEndsAt:string|null; subscriptionActive:boolean; isAdmin:boolean };
type PostType = "reflection"|"question"|"debate"|"study"|"recommendation"|"photo"|"share";
const POST_TYPES = new Set<PostType>(["reflection","question","debate","study","recommendation","photo","share"]);
const REPORT_REASONS = new Set(["offensive","harassment","hate","privacy","spam","inappropriate","other"]);
function fail(message:string):never{ throw new Error(message); }
function clean(value:unknown,max:number){ return String(value??"").trim().slice(0,max); }
function topicSlug(value:string){ return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/^#+/,"").replace(/[^a-z0-9]+/g,"").slice(0,50); }
function mentionedUsernames(body:string){ return [...new Set([...body.matchAll(/(^|\s)@([a-zA-Z0-9._]{3,30})\b/g)].map(m=>m[2]).filter((name):name is string=>Boolean(name)).map(name=>name.toLowerCase()))].slice(0,20); }
async function createMentions(userId:string,body:string,target:{postId?:string;commentId?:string},anonymous:boolean){
  if(anonymous)return;
  const names=mentionedUsernames(body); if(!names.length)return;
  const {data:profiles}=await db.from("academic_profiles").select("user_id,username").in("username",names);
  for(const p of profiles??[]){ if(p.user_id===userId)continue; const row:any={actor_user_id:userId,mentioned_user_id:p.user_id,...(target.postId?{post_id:target.postId}:{comment_id:target.commentId})}; await db.from("academic_mentions").insert(row); await queueInAppNotification(p.user_id,userId,"Você foi mencionado","Uma publicação identificada mencionou seu @username na Rede Acadêmica.",{kind:"mention",...target}); }
}
async function signedUrlMap(paths:string[]){
  const unique=[...new Set(paths.filter(Boolean))]; const out=new Map<string,string>(); if(!unique.length)return out;
  const {data}=await db.storage.from("academic-network").createSignedUrls(unique,3600);
  (data??[]).forEach((x:any,i:number)=>{ const path=unique[i];if(x?.signedUrl&&path)out.set(path,x.signedUrl); }); return out;
}

async function rateLimit(userId:string,table:"academic_posts"|"academic_comments",seconds:number){
  const since=new Date(Date.now()-seconds*1000).toISOString();
  const {count}=await db.from(table).select("id",{count:"exact",head:true}).eq("user_id",userId).gte("created_at",since);
  if((count??0)>0) fail(`Aguarde ${seconds} segundos antes de publicar novamente.`);
}

async function queueInAppNotification(targetUserId:string,createdBy:string,subject:string,body:string,metadata:Record<string,unknown>={}){
  if(!targetUserId||targetUserId===createdBy)return;
  const {data:customer}=await db.from("customers").select("id").eq("auth_user_id",targetUserId).maybeSingle();
  if(!customer?.id)return;
  await db.from("notification_outbox").insert({
    audience_type:"client",target_id:customer.id,channel:"in_app",event_type:"manual",
    subject,body,metadata:{source:"academic_network",target_auth_user_id:targetUserId,...metadata},created_by:createdBy,status:"pending"
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
  // The Academic Network is free for every authenticated user.
  // subscriptionActive remains factual and is never used as a social-network entitlement.
  const [admin,sub]=await Promise.all([isAdmin(userId),subscriptionActive(userId)]);
  return { premium:true, trialActive:false, trialEndsAt:null, subscriptionActive:sub, isAdmin:admin };
}

async function ensureProfile(userId:string){
  const current=await db.from("academic_profiles").select("*").eq("user_id",userId).maybeSingle();
  if(current.error)fail("Não foi possível carregar o perfil acadêmico.");
  if(current.data)return current.data;
  const created=await db.from("academic_profiles").upsert({user_id:userId},{onConflict:"user_id",ignoreDuplicates:true});
  if(created.error)fail("Não foi possível criar o perfil acadêmico.");
  const result=await db.from("academic_profiles").select("*").eq("user_id",userId).single();
  if(result.error||!result.data)fail("Não foi possível carregar o perfil acadêmico.");
  return result.data;
}

async function authorMap(userIds:string[]){
  const ids=[...new Set(userIds.filter(Boolean))];
  if(!ids.length)return new Map<string,any>();
  const [{data:base},{data:academic}]=await Promise.all([
    db.from("profiles").select("id,full_name").in("id",ids),
    db.from("academic_profiles").select("id,user_id,username,avatar_path,bio,profession,country,city,interests,display_role,show_name,show_location").in("user_id",ids)
  ]);
  const amap=new Map((academic??[]).map((x:any)=>[x.user_id,x]));
  return new Map((base??[]).map((x:any)=>[x.id,{...x,academic:amap.get(x.id)??null}]));
}

function safeAuthor(raw:any,anonymous:boolean){
  if(anonymous)return {profileId:null,username:null,avatarUrl:null,name:"Membro anônimo",role:"member",profession:"",country:"",city:"",anonymous:true};
  const a=raw?.academic; const showName=a?.show_name!==false; const showLocation=a?.show_location===true;
  return {profileId:a?.id??null,username:a?.username??null,avatarUrl:a?.avatarUrl??null,name:showName?(raw?.full_name||"Membro LDR"):"Membro LDR",role:a?.display_role??"member",profession:a?.profession??"",country:showLocation?(a?.country??""):"",city:showLocation?(a?.city??""):"",anonymous:false};
}

export async function getAcademicNetwork(userId:string,email:string|null,opts?:{communityId?:string|null;search?:string|null;savedOnly?:boolean;offset?:number}){
  const access=await accessFor(userId);
  const profileRaw=await ensureProfile(userId);
  const ownAvatarUrls=await signedUrlMap(profileRaw?.avatar_path?[profileRaw.avatar_path]:[]);
  const profile={...profileRaw,avatarUrl:profileRaw?.avatar_path?(ownAvatarUrls.get(profileRaw.avatar_path)??null):null};
  const [{data:communities},{data:memberships},{data:diary},{data:prompts},{data:saved},{data:reacted},{data:connections},{data:follows},{data:latestArticles}]=await Promise.all([
    db.from("academic_communities").select("id,slug,name,description,is_open,active").eq("active",true).order("name"),
    db.from("academic_community_members").select("community_id").eq("user_id",userId),
    db.from("academic_diary_entries").select("id,body,prompt,created_at,updated_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(100),
    db.from("academic_reflection_prompts").select("id,text").eq("active",true).order("created_at"),
    db.from("academic_saved_posts").select("post_id").eq("user_id",userId),
    db.from("academic_reactions").select("post_id").eq("user_id",userId).eq("reaction_type","support"),
    db.from("academic_connections").select("id,requester_user_id,receiver_user_id,status,created_at").or(`requester_user_id.eq.${userId},receiver_user_id.eq.${userId}`).order("created_at",{ascending:false}),
    db.from("academic_follows").select("followed_user_id").eq("follower_user_id",userId).eq("status","accepted"),
    db.from("academic_articles").select("id,slug,title,summary,category,created_at").eq("status","active").order("created_at",{ascending:false}).limit(20)
  ]);
  const savedIds=new Set((saved??[]).map((x:any)=>x.post_id)); const followedIds=new Set((follows??[]).map((x:any)=>x.followed_user_id)); const offset=Math.max(0,Number(opts?.offset??0)); const pageSize=20;
  let q=db.from("academic_posts").select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,location_label,location_city,location_country,share_slug,original_post_id,share_comment,created_at,updated_at").eq("status","active").order("is_pinned",{ascending:false}).order("created_at",{ascending:false}).range(offset,offset+pageSize);
  if(opts?.communityId)q=q.eq("community_id",opts.communityId);
  if(opts?.search)q=q.ilike("body",`%${clean(opts.search,100)}%`);
  if(opts?.savedOnly)q=q.in("id",savedIds.size?[...savedIds]:["00000000-0000-0000-0000-000000000000"]);
  const {data:rawPosts,error:postsError}=await q;
  if(postsError)fail("Não foi possível carregar as publicações.");
  const rawPage=rawPosts??[]; const hasMore=rawPage.length>pageSize; let posts=rawPage.slice(0,pageSize);
  const postIds=posts.map((p:any)=>p.id);
  const {data:rawComments}=postIds.length?await db.from("academic_comments").select("id,post_id,user_id,body,anonymous,status,created_at,updated_at").in("post_id",postIds).eq("status","active").order("created_at",{ascending:true}):{data:[]};
  const authorIds=[...posts.map((p:any)=>p.user_id),...(rawComments??[]).map((c:any)=>c.user_id),...(connections??[]).flatMap((c:any)=>[c.requester_user_id,c.receiver_user_id])];
  const authors=await authorMap(authorIds);
  const avatarPaths=[...authors.values()].map((x:any)=>x.academic?.avatar_path).filter(Boolean); const avatarUrls=await signedUrlMap(avatarPaths); for(const x of authors.values())if(x.academic?.avatar_path)x.academic.avatarUrl=avatarUrls.get(x.academic.avatar_path)??null;
  const [{data:reactionRows},{data:mediaRows},{data:topicLinks}]=postIds.length?await Promise.all([
    db.from("academic_reactions").select("post_id").in("post_id",postIds).eq("reaction_type","support"),
    db.from("academic_post_media").select("id,post_id,storage_path,alt_text,mime_type,file_name,sort_order").in("post_id",postIds).order("sort_order"),
    db.from("academic_post_topics").select("post_id,topic_id").in("post_id",postIds)
  ]):[{data:[]},{data:[]},{data:[]}];
  const mediaUrls=await signedUrlMap((mediaRows??[]).map((x:any)=>x.storage_path));
  const topicIds=[...new Set((topicLinks??[]).map((x:any)=>x.topic_id))]; const {data:topicRows}=topicIds.length?await db.from("academic_topics").select("id,slug,label").in("id",topicIds):{data:[]}; const topicMap=new Map((topicRows??[]).map((x:any)=>[x.id,x]));
  const mediaBy=new Map<string,any[]>(); for(const m of mediaRows??[]){const a=mediaBy.get(m.post_id)??[];a.push({id:m.id,url:mediaUrls.get(m.storage_path)??null,altText:m.alt_text,mimeType:m.mime_type,fileName:m.file_name});mediaBy.set(m.post_id,a)}
  const topicsBy=new Map<string,any[]>(); for(const l of topicLinks??[]){const t=topicMap.get(l.topic_id);if(t){const a=topicsBy.get(l.post_id)??[];a.push(t);topicsBy.set(l.post_id,a)}}
  const counts=new Map<string,number>(); for(const r of reactionRows??[])counts.set(r.post_id,(counts.get(r.post_id)??0)+1);
  const commentsBy=new Map<string,any[]>();
  for(const c of rawComments??[]){ const arr=commentsBy.get(c.post_id)??[]; arr.push({...c,user_id:undefined,own:c.user_id===userId,author:safeAuthor(authors.get(c.user_id),c.anonymous)}); commentsBy.set(c.post_id,arr); }
  posts=posts.map((p:any)=>({...p,user_id:undefined,author:safeAuthor(authors.get(p.user_id),p.anonymous),comments:commentsBy.get(p.id)??[],media:mediaBy.get(p.id)??[],topics:topicsBy.get(p.id)??[],saved:savedIds.has(p.id),supported:(reacted??[]).some((r:any)=>r.post_id===p.id),supportCount:counts.get(p.id)??0,own:p.user_id===userId,followedAuthor:followedIds.has(p.user_id),memberCommunity:Boolean(p.community_id&&(memberships??[]).some((m:any)=>m.community_id===p.community_id))}));
  const originalIds=[...new Set(posts.map((x:any)=>x.original_post_id).filter(Boolean))];
  const originalMap=new Map<string,any>();
  if(originalIds.length){
    const {data:originalRows}=await db.from("academic_posts").select("id,user_id,body,post_type,anonymous,status,location_label,created_at").in("id",originalIds).eq("status","active");
    const originalAuthors=await authorMap((originalRows??[]).map((x:any)=>x.user_id));
    const originalAvatarPaths=[...originalAuthors.values()].map((x:any)=>x.academic?.avatar_path).filter(Boolean);const originalAvatarUrls=await signedUrlMap(originalAvatarPaths);for(const x of originalAuthors.values())if(x.academic?.avatar_path)x.academic.avatarUrl=originalAvatarUrls.get(x.academic.avatar_path)??null;
    const {data:originalMedia}=await db.from("academic_post_media").select("id,post_id,storage_path,alt_text,mime_type,file_name,sort_order").in("post_id",originalIds).order("sort_order");
    const originalMediaUrls=await signedUrlMap((originalMedia??[]).map((x:any)=>x.storage_path));const originalMediaBy=new Map<string,any[]>();for(const m of originalMedia??[]){const a=originalMediaBy.get(m.post_id)??[];a.push({id:m.id,url:originalMediaUrls.get(m.storage_path)??null,altText:m.alt_text,mimeType:m.mime_type,fileName:m.file_name});originalMediaBy.set(m.post_id,a)}
    for(const op of originalRows??[])originalMap.set(op.id,{...op,user_id:undefined,author:safeAuthor(originalAuthors.get(op.user_id),op.anonymous),media:originalMediaBy.get(op.id)??[]});
  }
  posts=posts.map((x:any)=>({...x,originalPost:x.original_post_id?(originalMap.get(x.original_post_id)??null):null}));
  const connectionsSafe=(connections??[]).map((c:any)=>{const other=c.requester_user_id===userId?c.receiver_user_id:c.requester_user_id;return {id:c.id,status:c.status,direction:c.requester_user_id===userId?"outgoing":"incoming",profile:safeAuthor(authors.get(other),false),created_at:c.created_at};});
  const promptList=prompts??[]; const prompt=promptList.length?promptList[Math.floor(new Date().getDate()%promptList.length)]:null;
  let directoryQuery=db.from("academic_profiles").select("id,user_id,bio,profession,country,city,interests,display_role,show_name,show_location").neq("user_id",userId).limit(24);
  if(opts?.search){ const term=clean(opts.search,100).replace(/[,%()]/g," "); directoryQuery=directoryQuery.or(`bio.ilike.%${term}%,profession.ilike.%${term}%`); }
  const {data:directoryRaw}=await directoryQuery;
  const directoryAuthors=await authorMap((directoryRaw??[]).map((x:any)=>x.user_id));
  const directory=(directoryRaw??[]).map((x:any)=>({ ...safeAuthor(directoryAuthors.get(x.user_id),false), bio:x.bio,interests:x.interests??[] })).filter((x:any)=>x.profileId);
  return {access:{...access,freeDiary:true},profile,communities:communities??[],memberships:(memberships??[]).map((x:any)=>x.community_id),diary:diary??[],prompt,posts,hasMore,nextOffset:offset+posts.length,latestArticles:latestArticles??[],connections:connectionsSafe,directory,userEmail:email??null};
}

export async function saveDiaryEntry(userId:string,input:{id?:string;body:string;prompt?:string|null}){
  const body=clean(input.body,20000); if(!body)fail("Escreva algo antes de salvar.");
  if(input.id){ const {data,error}=await db.from("academic_diary_entries").update({body,prompt:clean(input.prompt,500)||null,updated_at:new Date().toISOString()}).eq("id",input.id).eq("user_id",userId).select("id").maybeSingle(); if(error||!data)fail("Registro não encontrado."); return data; }
  const {data,error}=await db.from("academic_diary_entries").insert({user_id:userId,body,prompt:clean(input.prompt,500)||null}).select("id").single(); if(error)fail("Não foi possível salvar o diário."); return data;
}
export async function deleteDiaryEntry(userId:string,id:string){ await db.from("academic_diary_entries").delete().eq("id",id).eq("user_id",userId); return {ok:true}; }

export async function createAcademicPost(userId:string,input:{body:string;postType:PostType;anonymous:boolean;communityId?:string|null;locationLabel?:string;locationCity?:string;locationCountry?:string;topics?:string[];hasAttachment?:boolean;attachment?:{path:string;fileName?:string;altText?:string}}){
  await rateLimit(userId,"academic_posts",15); const body=clean(input.body,12000); if(!body&&!input.hasAttachment)fail("Escreva algo ou anexe um arquivo antes de publicar."); if(!POST_TYPES.has(input.postType)||input.postType==="share")fail("Tipo inválido.");
  // Upload and validate before creating a row; publish only after media is linked.
  const media=input.attachment?await import("@/lib/academic-media-v2.server"):null;
  if(input.attachment)await media!.verifyOwnedFile(userId,input.attachment.path,"posts");
  const {data,error}=await db.from("academic_posts").insert({user_id:userId,body,status:input.attachment?"hidden":"active",post_type:input.postType,anonymous:Boolean(input.anonymous),community_id:input.communityId||null,location_label:clean(input.locationLabel,160)||null,location_city:clean(input.locationCity,80)||null,location_country:clean(input.locationCountry,80)||null}).select("id").single(); if(error)fail("Não foi possível publicar.");
  if(input.attachment){
    try{
      await media!.finalizeAcademicPostMedia(userId,{...input.attachment,postId:data.id},true);
      const published=await db.from("academic_posts").update({status:"active"}).eq("id",data.id).eq("user_id",userId).eq("status","hidden").select("id").single();
      if(published.error||!published.data)fail("Não foi possível concluir a publicação.");
    }catch(error){
      const cleanup=await db.from("academic_posts").delete().eq("id",data.id).eq("user_id",userId).eq("status","hidden");
      if(cleanup.error)console.error("Academic pending post cleanup failed",data.id,cleanup.error.code);
      throw error;
    }
  }
  const normalized=[...new Set((input.topics??[]).map(x=>topicSlug(clean(x,60))).filter(Boolean))].slice(0,8); if(normalized.length){const labels=new Map((input.topics??[]).map(x=>[topicSlug(clean(x,60)),clean(x.replace(/^#+/,""),60)]));await db.from("academic_topics").upsert(normalized.map(slug=>({slug,label:labels.get(slug)||slug})),{onConflict:"slug",ignoreDuplicates:true});const {data:topics}=await db.from("academic_topics").select("id,slug").in("slug",normalized);if(topics?.length)await db.from("academic_post_topics").insert(topics.map((t:any)=>({post_id:data.id,topic_id:t.id})));}
  await createMentions(userId,body,{postId:data.id},Boolean(input.anonymous)); return data;
}
export async function updateAcademicPost(userId:string,input:{id:string;body:string}){ const body=clean(input.body,12000); if(!body)fail("Texto obrigatório."); const {data}=await db.from("academic_posts").update({body,updated_at:new Date().toISOString()}).eq("id",input.id).eq("user_id",userId).eq("status","active").select("id").maybeSingle(); if(!data)fail("Publicação não encontrada."); return data; }
export async function deleteAcademicPost(userId:string,id:string){ await db.from("academic_posts").update({status:"deleted",updated_at:new Date().toISOString()}).eq("id",id).eq("user_id",userId); return {ok:true}; }

export async function createAcademicComment(userId:string,input:{postId:string;body:string;anonymous:boolean}){ await rateLimit(userId,"academic_comments",8); const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data,error}=await db.from("academic_comments").insert({post_id:input.postId,user_id:userId,body,anonymous:Boolean(input.anonymous)}).select("id").single(); if(error)fail("Não foi possível comentar."); const {data:post}=await db.from("academic_posts").select("user_id").eq("id",input.postId).maybeSingle(); if(post?.user_id) await queueInAppNotification(post.user_id,userId,"Novo comentário na Rede Acadêmica","Sua publicação recebeu uma nova resposta.",{kind:"comment",postId:input.postId,commentId:data.id}); await createMentions(userId,body,{commentId:data.id},Boolean(input.anonymous)); return data; }
export async function updateAcademicComment(userId:string,input:{id:string;body:string}){ const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data}=await db.from("academic_comments").update({body,updated_at:new Date().toISOString()}).eq("id",input.id).eq("user_id",userId).eq("status","active").select("id").maybeSingle(); if(!data)fail("Comentário não encontrado."); return data; }
export async function deleteAcademicComment(userId:string,id:string){return (await import("@/lib/academic-comment-delete.server")).deleteOwnedAcademicComment(userId,id);}

export async function toggleAcademicSave(userId:string,postId:string){ const current=await db.from("academic_saved_posts").select("post_id").eq("user_id",userId).eq("post_id",postId).maybeSingle(); if(current.error)fail("Não foi possível verificar a publicação salva."); if(current.data){const removed=await db.from("academic_saved_posts").delete().eq("user_id",userId).eq("post_id",postId);if(removed.error)fail("Não foi possível remover a publicação dos salvos.")}else{const added=await db.from("academic_saved_posts").insert({user_id:userId,post_id:postId});if(added.error)fail("Não foi possível salvar a publicação.")} const canonical=await db.from("academic_saved_posts").select("post_id").eq("user_id",userId).eq("post_id",postId).maybeSingle();if(canonical.error)fail("Não foi possível confirmar a publicação salva.");return {saved:Boolean(canonical.data)}; }
export async function toggleAcademicSupport(userId:string,postId:string){ const current=await db.from("academic_reactions").select("post_id").eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support").maybeSingle();if(current.error)fail("Não foi possível verificar o acolhimento.");if(current.data){const removed=await db.from("academic_reactions").delete().eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support");if(removed.error)fail("Não foi possível remover o acolhimento.")}else{const added=await db.from("academic_reactions").insert({user_id:userId,post_id:postId,reaction_type:"support"});if(added.error)fail("Não foi possível acolher a publicação.");const {data:post}=await db.from("academic_posts").select("user_id").eq("id",postId).maybeSingle();if(post?.user_id)await queueInAppNotification(post.user_id,userId,"Publicação acolhida","Sua publicação recebeu um Acolher.",{kind:"support",postId})}const canonical=await db.from("academic_reactions").select("post_id").eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support").maybeSingle();if(canonical.error)fail("Não foi possível confirmar o acolhimento.");const counted=await db.from("academic_reactions").select("post_id",{count:"exact",head:true}).eq("post_id",postId).eq("reaction_type","support");if(counted.error)fail("Não foi possível atualizar a contagem de acolhimentos.");return {supported:Boolean(canonical.data),supportCount:Math.max(0,counted.count??0)}; }
export async function shareAcademicPost(userId:string,input:{postId:string;targetProfileId:string}){

  const [{data:post},{data:target},{data:links}]=await Promise.all([
    db.from("academic_posts").select("id,status").eq("id",input.postId).eq("status","active").maybeSingle(),
    db.from("academic_profiles").select("id,user_id,username").eq("id",input.targetProfileId).maybeSingle(),
    db.from("academic_connections").select("requester_user_id,receiver_user_id,status").eq("status","accepted").or(`requester_user_id.eq.${userId},receiver_user_id.eq.${userId}`)
  ]);
  if(!post)fail("Publicação não encontrada.");
  if(!target?.user_id||target.user_id===userId)fail("Destinatário inválido.");
  const connected=(links??[]).some((x:any)=>(x.requester_user_id===userId&&x.receiver_user_id===target.user_id)||(x.receiver_user_id===userId&&x.requester_user_id===target.user_id));
  if(!connected)fail("Compartilhamento interno disponível para conexões aceitas.");
  const authors=await authorMap([userId]);const actor=safeAuthor(authors.get(userId),false);
  await queueInAppNotification(target.user_id,userId,"Publicação compartilhada",`${actor.name||"Uma conexão"} compartilhou uma publicação com você.`,{kind:"shared_post",postId:input.postId,post_id:input.postId,actorUsername:actor.username});
  return {ok:true};
}
export async function repostAcademicPost(userId:string,input:{postId:string;comment?:string}){
  await rateLimit(userId,"academic_posts",8);
  const {data:source}=await db.from("academic_posts").select("id,user_id,original_post_id,status").eq("id",input.postId).eq("status","active").maybeSingle();if(!source)fail("Publicação não encontrada.");
  const originalId=source.original_post_id||source.id;const comment=clean(input.comment,2000);
  const {data,error}=await db.from("academic_posts").insert({user_id:userId,body:comment,share_comment:comment||null,post_type:"share",anonymous:false,original_post_id:originalId,status:"active"}).select("id").single();if(error||!data)fail("Não foi possível compartilhar no seu perfil.");
  const {data:original}=await db.from("academic_posts").select("user_id").eq("id",originalId).maybeSingle();if(original?.user_id)await queueInAppNotification(original.user_id,userId,"Sua publicação foi compartilhada","Uma conexão compartilhou sua publicação no próprio perfil.",{kind:"repost",postId:data.id,post_id:data.id,original_post_id:originalId});
  return data;
}

export async function toggleAcademicMembership(userId:string,communityId:string){

  const current=await db.from("academic_community_members").select("community_id").eq("user_id",userId).eq("community_id",communityId).maybeSingle();
  if(current.error)fail("Não foi possível verificar sua participação.");
  const result=current.data?await db.from("academic_community_members").delete().eq("user_id",userId).eq("community_id",communityId):await db.from("academic_community_members").upsert({user_id:userId,community_id:communityId},{onConflict:"community_id,user_id",ignoreDuplicates:true});
  if(result.error)fail("Não foi possível atualizar sua participação na comunidade.");
  return {joined:!current.data};
}

export async function updateAcademicProfile(userId:string,input:{bio?:string;profession?:string;country?:string;city?:string;interests?:string[];showName?:boolean;showLocation?:boolean}){
  await ensureProfile(userId); const patch={bio:clean(input.bio,1200),profession:clean(input.profession,120),country:clean(input.country,80),city:clean(input.city,80),interests:(input.interests??[]).map(x=>clean(x,80)).filter(Boolean).slice(0,12),show_name:Boolean(input.showName),show_location:Boolean(input.showLocation),updated_at:new Date().toISOString()}; const {data,error}=await db.from("academic_profiles").update(patch).eq("user_id",userId).select("*").single(); if(error)fail("Não foi possível atualizar o perfil."); return data;
}

export async function requestAcademicConnection(userId:string,targetProfileId:string){ const {data:target}:{data:any}=await db.from("academic_profiles").select("user_id").eq("id",targetProfileId).maybeSingle(); if(!target?.user_id||target.user_id===userId)fail("Perfil inválido."); const a=userId<target.user_id?userId:target.user_id,b=userId<target.user_id?target.user_id:userId; const {data:existing}=await db.from("academic_connections").select("id,status,requester_user_id,receiver_user_id").or(`and(requester_user_id.eq.${a},receiver_user_id.eq.${b}),and(requester_user_id.eq.${b},receiver_user_id.eq.${a})`).maybeSingle(); if(existing)return existing; const {data,error}=await db.from("academic_connections").insert({requester_user_id:userId,receiver_user_id:target.user_id,status:"pending"}).select("id,status").single(); if(error)fail("Não foi possível conectar."); await queueInAppNotification(target.user_id,userId,"Nova conexão acadêmica","Você recebeu uma solicitação de conexão na Rede Acadêmica.",{connectionId:data.id}); return data; }
export async function respondAcademicConnection(userId:string,id:string,status:"accepted"|"declined"){ const {data:before}=await db.from("academic_connections").select("requester_user_id").eq("id",id).eq("receiver_user_id",userId).eq("status","pending").maybeSingle(); const {data}=await db.from("academic_connections").update({status,updated_at:new Date().toISOString()}).eq("id",id).eq("receiver_user_id",userId).eq("status","pending").select("id,status").maybeSingle(); if(!data)fail("Solicitação não encontrada."); if(status==="accepted"&&before?.requester_user_id) await queueInAppNotification(before.requester_user_id,userId,"Conexão aceita","Sua solicitação de conexão acadêmica foi aceita.",{connectionId:id}); return data; }

export async function reportAcademicContent(userId:string,input:{postId?:string;commentId?:string;reason:string;details?:string}){ if(Boolean(input.postId)===Boolean(input.commentId))fail("Conteúdo inválido."); const reason=REPORT_REASONS.has(input.reason)?input.reason:"other"; const {data,error}=await db.from("academic_reports").insert({reporter_user_id:userId,post_id:input.postId||null,comment_id:input.commentId||null,reason,details:clean(input.details,1200)}).select("id").single(); if(error)fail("Não foi possível enviar a denúncia."); return data; }

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
