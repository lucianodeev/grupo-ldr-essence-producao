from pathlib import Path

root=Path('apps/painel-ldr/src')

def replace(path,old,new,label):
    p=root/path
    s=p.read_text(encoding='utf-8')
    if new in s:
        print('already',label); return
    if old not in s:
        raise SystemExit('anchor missing: '+label)
    p.write_text(s.replace(old,new,1),encoding='utf-8')
    print('patched',label)

# --- server: social post model + safe mentions/topics/media ---
replace(Path('lib/academic-network.server.ts'),
'''type PostType = "reflection"|"question"|"debate"|"study"|"recommendation";\nconst POST_TYPES = new Set<PostType>(["reflection","question","debate","study","recommendation"]);''',
'''type PostType = "reflection"|"question"|"debate"|"study"|"recommendation"|"photo";\nconst POST_TYPES = new Set<PostType>(["reflection","question","debate","study","recommendation","photo"]);''','photo post type')

replace(Path('lib/academic-network.server.ts'),
'''function clean(value:unknown,max:number){ return String(value??"").trim().slice(0,max); }''',
'''function clean(value:unknown,max:number){ return String(value??"").trim().slice(0,max); }\nfunction topicSlug(value:string){ return value.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/^#+/,"").replace(/[^a-z0-9]+/g,"").slice(0,50); }\nfunction mentionedUsernames(body:string){ return [...new Set([...body.matchAll(/(^|\\s)@([a-zA-Z0-9._]{3,30})\\b/g)].map(m=>m[2].toLowerCase()))].slice(0,20); }\nasync function createMentions(userId:string,body:string,target:{postId?:string;commentId?:string},anonymous:boolean){\n  if(anonymous)return;\n  const names=mentionedUsernames(body); if(!names.length)return;\n  const {data:profiles}=await db.from("academic_profiles").select("user_id,username").in("username",names);\n  for(const p of profiles??[]){ if(p.user_id===userId)continue; const row:any={actor_user_id:userId,mentioned_user_id:p.user_id,...(target.postId?{post_id:target.postId}:{comment_id:target.commentId})}; await db.from("academic_mentions").insert(row); await queueInAppNotification(p.user_id,userId,"Você foi mencionado","Uma publicação identificada mencionou seu @username na Rede Acadêmica.",{kind:"mention",...target}); }\n}\nasync function signedUrlMap(paths:string[]){\n  const unique=[...new Set(paths.filter(Boolean))]; const out=new Map<string,string>(); if(!unique.length)return out;\n  const {data}=await db.storage.from("academic-network").createSignedUrls(unique,3600);\n  (data??[]).forEach((x:any,i:number)=>{ if(x?.signedUrl)out.set(unique[i],x.signedUrl); }); return out;\n}''','social helpers')

replace(Path('lib/academic-network.server.ts'),
'''db.from("academic_profiles").select("id,user_id,bio,profession,country,city,interests,display_role,show_name,show_location").in("user_id",ids)''',
'''db.from("academic_profiles").select("id,user_id,username,avatar_path,bio,profession,country,city,interests,display_role,show_name,show_location").in("user_id",ids)''','author social fields')

replace(Path('lib/academic-network.server.ts'),
'''function safeAuthor(raw:any,anonymous:boolean){\n  if(anonymous)return {profileId:null,name:"Membro anônimo",role:"member",profession:"",country:"",city:"",anonymous:true};\n  const a=raw?.academic; const showName=a?.show_name!==false; const showLocation=a?.show_location===true;\n  return {profileId:a?.id??null,name:showName?(raw?.full_name||"Membro LDR"):"Membro LDR",role:a?.display_role??"member",profession:a?.profession??"",country:showLocation?(a?.country??""):"",city:showLocation?(a?.city??""):"",anonymous:false};\n}''',
'''function safeAuthor(raw:any,anonymous:boolean){\n  if(anonymous)return {profileId:null,username:null,avatarUrl:null,name:"Membro anônimo",role:"member",profession:"",country:"",city:"",anonymous:true};\n  const a=raw?.academic; const showName=a?.show_name!==false; const showLocation=a?.show_location===true;\n  return {profileId:a?.id??null,username:a?.username??null,avatarUrl:a?.avatarUrl??null,name:showName?(raw?.full_name||"Membro LDR"):"Membro LDR",role:a?.display_role??"member",profession:a?.profession??"",country:showLocation?(a?.country??""):"",city:showLocation?(a?.city??""):"",anonymous:false};\n}''','safe author social')

replace(Path('lib/academic-network.server.ts'),
'''let q=db.from("academic_posts").select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,created_at,updated_at").eq("status","active")''',
'''let q=db.from("academic_posts").select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,location_label,location_city,location_country,share_slug,created_at,updated_at").eq("status","active")''','post location fields')

replace(Path('lib/academic-network.server.ts'),
'''  const authors=await authorMap(authorIds);\n  const {data:reactionRows}=postIds.length?await db.from("academic_reactions").select("post_id").in("post_id",postIds).eq("reaction_type","support"):{data:[]};''',
'''  const authors=await authorMap(authorIds);\n  const avatarPaths=[...authors.values()].map((x:any)=>x.academic?.avatar_path).filter(Boolean); const avatarUrls=await signedUrlMap(avatarPaths); for(const x of authors.values())if(x.academic?.avatar_path)x.academic.avatarUrl=avatarUrls.get(x.academic.avatar_path)??null;\n  const [{data:reactionRows},{data:mediaRows},{data:topicLinks}]=postIds.length?await Promise.all([\n    db.from("academic_reactions").select("post_id").in("post_id",postIds).eq("reaction_type","support"),\n    db.from("academic_post_media").select("id,post_id,storage_path,alt_text,mime_type,sort_order").in("post_id",postIds).order("sort_order"),\n    db.from("academic_post_topics").select("post_id,topic_id").in("post_id",postIds)\n  ]):[{data:[]},{data:[]},{data:[]}];\n  const mediaUrls=await signedUrlMap((mediaRows??[]).map((x:any)=>x.storage_path));\n  const topicIds=[...new Set((topicLinks??[]).map((x:any)=>x.topic_id))]; const {data:topicRows}=topicIds.length?await db.from("academic_topics").select("id,slug,label").in("id",topicIds):{data:[]}; const topicMap=new Map((topicRows??[]).map((x:any)=>[x.id,x]));\n  const mediaBy=new Map<string,any[]>(); for(const m of mediaRows??[]){const a=mediaBy.get(m.post_id)??[];a.push({id:m.id,url:mediaUrls.get(m.storage_path)??null,altText:m.alt_text,mimeType:m.mime_type});mediaBy.set(m.post_id,a)}\n  const topicsBy=new Map<string,any[]>(); for(const l of topicLinks??[]){const t=topicMap.get(l.topic_id);if(t){const a=topicsBy.get(l.post_id)??[];a.push(t);topicsBy.set(l.post_id,a)}}''','feed media topics')

replace(Path('lib/academic-network.server.ts'),
'''posts=posts.map((p:any)=>({...p,user_id:undefined,author:safeAuthor(authors.get(p.user_id),p.anonymous),comments:commentsBy.get(p.id)??[],saved:savedIds.has(p.id),supported:(reacted??[]).some((r:any)=>r.post_id===p.id),supportCount:counts.get(p.id)??0,own:p.user_id===userId}));''',
'''posts=posts.map((p:any)=>({...p,user_id:undefined,author:safeAuthor(authors.get(p.user_id),p.anonymous),comments:commentsBy.get(p.id)??[],media:mediaBy.get(p.id)??[],topics:topicsBy.get(p.id)??[],saved:savedIds.has(p.id),supported:(reacted??[]).some((r:any)=>r.post_id===p.id),supportCount:counts.get(p.id)??0,own:p.user_id===userId}));''','feed enrichment')

replace(Path('lib/academic-network.server.ts'),
'''export async function createAcademicPost(userId:string,input:{body:string;postType:PostType;anonymous:boolean;communityId?:string|null}){\n  await requirePremium(userId); await rateLimit(userId,"academic_posts",15); const body=clean(input.body,12000); if(!body)fail("Escreva algo antes de publicar."); if(!POST_TYPES.has(input.postType))fail("Tipo inválido.");\n  const {data,error}=await db.from("academic_posts").insert({user_id:userId,body,post_type:input.postType,anonymous:Boolean(input.anonymous),community_id:input.communityId||null}).select("id").single(); if(error)fail("Não foi possível publicar."); return data;\n}''',
'''export async function createAcademicPost(userId:string,input:{body:string;postType:PostType;anonymous:boolean;communityId?:string|null;locationLabel?:string;locationCity?:string;locationCountry?:string;topics?:string[]}){\n  await requirePremium(userId); await rateLimit(userId,"academic_posts",15); const body=clean(input.body,12000); if(!body)fail("Escreva algo antes de publicar."); if(!POST_TYPES.has(input.postType))fail("Tipo inválido.");\n  const {data,error}=await db.from("academic_posts").insert({user_id:userId,body,post_type:input.postType,anonymous:Boolean(input.anonymous),community_id:input.communityId||null,location_label:clean(input.locationLabel,160)||null,location_city:clean(input.locationCity,80)||null,location_country:clean(input.locationCountry,80)||null}).select("id").single(); if(error)fail("Não foi possível publicar.");\n  const normalized=[...new Set((input.topics??[]).map(x=>topicSlug(clean(x,60))).filter(Boolean))].slice(0,8); if(normalized.length){const labels=new Map((input.topics??[]).map(x=>[topicSlug(clean(x,60)),clean(x.replace(/^#+/,""),60)]));await db.from("academic_topics").upsert(normalized.map(slug=>({slug,label:labels.get(slug)||slug})),{onConflict:"slug",ignoreDuplicates:true});const {data:topics}=await db.from("academic_topics").select("id,slug").in("slug",normalized);if(topics?.length)await db.from("academic_post_topics").insert(topics.map((t:any)=>({post_id:data.id,topic_id:t.id})));}\n  await createMentions(userId,body,{postId:data.id},Boolean(input.anonymous)); return data;\n}''','create social post')

replace(Path('lib/academic-network.server.ts'),
'''export async function createAcademicComment(userId:string,input:{postId:string;body:string;anonymous:boolean}){ await requirePremium(userId); await rateLimit(userId,"academic_comments",8); const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data,error}=await db.from("academic_comments").insert({post_id:input.postId,user_id:userId,body,anonymous:Boolean(input.anonymous)}).select("id").single(); if(error)fail("Não foi possível comentar."); const {data:post}=await db.from("academic_posts").select("user_id").eq("id",input.postId).maybeSingle(); if(post?.user_id) await queueInAppNotification(post.user_id,userId,"Novo comentário na Rede Acadêmica","Sua publicação recebeu uma nova resposta.",{postId:input.postId}); return data; }''',
'''export async function createAcademicComment(userId:string,input:{postId:string;body:string;anonymous:boolean}){ await requirePremium(userId); await rateLimit(userId,"academic_comments",8); const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data,error}=await db.from("academic_comments").insert({post_id:input.postId,user_id:userId,body,anonymous:Boolean(input.anonymous)}).select("id").single(); if(error)fail("Não foi possível comentar."); const {data:post}=await db.from("academic_posts").select("user_id").eq("id",input.postId).maybeSingle(); if(post?.user_id) await queueInAppNotification(post.user_id,userId,"Novo comentário na Rede Acadêmica","Sua publicação recebeu uma nova resposta.",{kind:"comment",postId:input.postId,commentId:data.id}); await createMentions(userId,body,{commentId:data.id},Boolean(input.anonymous)); return data; }''','comment mentions')

replace(Path('lib/academic-network.server.ts'),
'''export async function toggleAcademicSupport(userId:string,postId:string){ await requirePremium(userId); const {data}=await db.from("academic_reactions").select("post_id").eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support").maybeSingle(); if(data)await db.from("academic_reactions").delete().eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support"); else await db.from("academic_reactions").insert({user_id:userId,post_id:postId,reaction_type:"support"}); return {supported:!data}; }''',
'''export async function toggleAcademicSupport(userId:string,postId:string){ await requirePremium(userId); const {data}=await db.from("academic_reactions").select("post_id").eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support").maybeSingle(); if(data)await db.from("academic_reactions").delete().eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support"); else {await db.from("academic_reactions").insert({user_id:userId,post_id:postId,reaction_type:"support"}); const {data:post}=await db.from("academic_posts").select("user_id").eq("id",postId).maybeSingle(); if(post?.user_id)await queueInAppNotification(post.user_id,userId,"Publicação acolhida","Sua publicação recebeu um Acolher.",{kind:"support",postId});} return {supported:!data}; }''','support notification')

# --- functions: expanded post contract ---
replace(Path('lib/academic-network.functions.ts'),
'''export const academicCreatePost=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{body:string;postType:"reflection"|"question"|"debate"|"study"|"recommendation";anonymous:boolean;communityId?:string|null})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).createAcademicPost(context.userId,data));''',
'''export const academicCreatePost=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{body:string;postType:"reflection"|"question"|"debate"|"study"|"recommendation"|"photo";anonymous:boolean;communityId?:string|null;locationLabel?:string;locationCity?:string;locationCountry?:string;topics?:string[]})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).createAcademicPost(context.userId,data));''','post function contract')

# --- admin: challenges stay inside existing master route ---
admin=root/'routes/_authenticated/admin.rede-academica.tsx'
s=admin.read_text(encoding='utf-8')
if 'AcademicChallengesAdmin' not in s:
    anchor='import { useAccess } from "@/lib/central-data";'
    if anchor not in s: raise SystemExit('admin import anchor missing')
    s=s.replace(anchor,anchor+'\nimport { AcademicChallengesAdmin } from "@/components/academic-challenges-admin";',1)
    close='    <section className="rounded-2xl border bg-card p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/><h2 className="text-lg font-bold">Publicações recentes</h2></div>'
    if close not in s: raise SystemExit('admin publications anchor missing')
    s=s.replace(close,'    <AcademicChallengesAdmin/>\n'+close,1)
    admin.write_text(s,encoding='utf-8'); print('patched admin challenges')
else: print('already admin challenges')
