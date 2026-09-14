from pathlib import Path

root=Path('apps/painel-ldr/src')

def patch(path, old, new, label):
    p=root/path
    s=p.read_text(encoding='utf-8')
    if new in s:
        print(label, 'already applied')
        return
    if old not in s:
        raise SystemExit(f'Anchor not found: {label}')
    p.write_text(s.replace(old,new,1),encoding='utf-8')
    print('patched',label)

# ---- server: anti-flood + in-app notifications ----
patch(Path('lib/academic-network.server.ts'),
'''function clean(value:unknown,max:number){ return String(value??"").trim().slice(0,max); }\n''',
'''function clean(value:unknown,max:number){ return String(value??"").trim().slice(0,max); }\n\nasync function rateLimit(userId:string,table:"academic_posts"|"academic_comments",seconds:number){\n  const since=new Date(Date.now()-seconds*1000).toISOString();\n  const {count}=await db.from(table).select("id",{count:"exact",head:true}).eq("user_id",userId).gte("created_at",since);\n  if((count??0)>0) fail(`Aguarde ${seconds} segundos antes de publicar novamente.`);\n}\n\nasync function queueInAppNotification(targetUserId:string,createdBy:string,subject:string,body:string,metadata:Record<string,unknown>={}){\n  if(!targetUserId||targetUserId===createdBy)return;\n  await db.from("notification_outbox").insert({\n    audience_type:"client",target_id:targetUserId,channel:"in_app",event_type:"manual",\n    subject,body,metadata:{source:"academic_network",...metadata},created_by:createdBy,status:"pending"\n  });\n}\n''','server helpers')

patch(Path('lib/academic-network.server.ts'),
'''  const {data:rawComments}=postIds.length?await db.from("academic_comments").select("id,post_id,user_id,body,anonymous,status,created_at,updated_at").in("post_id",postIds).eq("status","active").order("created_at",{ascending:true}):{data:[]};''',
'''  const {data:rawComments}=postIds.length?await db.from("academic_comments").select("id,post_id,user_id,body,anonymous,status,created_at,updated_at").in("post_id",postIds).eq("status","active").order("created_at",{ascending:true}):{data:[]};''','comments select')

patch(Path('lib/academic-network.server.ts'),
'''  for(const c of rawComments??[]){ const arr=commentsBy.get(c.post_id)??[]; arr.push({...c,user_id:undefined,author:safeAuthor(authors.get(c.user_id),c.anonymous)}); commentsBy.set(c.post_id,arr); }''',
'''  for(const c of rawComments??[]){ const arr=commentsBy.get(c.post_id)??[]; arr.push({...c,user_id:undefined,own:c.user_id===userId,author:safeAuthor(authors.get(c.user_id),c.anonymous)}); commentsBy.set(c.post_id,arr); }''','comment ownership')

patch(Path('lib/academic-network.server.ts'),
'''  const promptList=prompts??[]; const prompt=promptList.length?promptList[Math.floor(new Date().getDate()%promptList.length)]:null;\n  return {access:{...access,freeDiary:true},profile,communities:communities??[],memberships:(memberships??[]).map((x:any)=>x.community_id),diary:diary??[],prompt,posts,connections:connectionsSafe,userEmail:email??null};''',
'''  const promptList=prompts??[]; const prompt=promptList.length?promptList[Math.floor(new Date().getDate()%promptList.length)]:null;\n  let directoryQuery=db.from("academic_profiles").select("id,user_id,bio,profession,country,city,interests,display_role,show_name,show_location").neq("user_id",userId).limit(access.premium?24:6);\n  if(opts?.search){ const term=clean(opts.search,100).replace(/[,%()]/g," "); directoryQuery=directoryQuery.or(`bio.ilike.%${term}%,profession.ilike.%${term}%`); }\n  const {data:directoryRaw}=await directoryQuery;\n  const directoryAuthors=await authorMap((directoryRaw??[]).map((x:any)=>x.user_id));\n  const directory=(directoryRaw??[]).map((x:any)=>({ ...safeAuthor(directoryAuthors.get(x.user_id),false), bio:x.bio,interests:x.interests??[] })).filter((x:any)=>x.profileId);\n  return {access:{...access,freeDiary:true},profile,communities:communities??[],memberships:(memberships??[]).map((x:any)=>x.community_id),diary:diary??[],prompt,posts,connections:connectionsSafe,directory,userEmail:email??null};''','profile directory')

patch(Path('lib/academic-network.server.ts'),
'''export async function createAcademicPost(userId:string,input:{body:string;postType:PostType;anonymous:boolean;communityId?:string|null}){\n  await requirePremium(userId); const body=clean(input.body,12000);''',
'''export async function createAcademicPost(userId:string,input:{body:string;postType:PostType;anonymous:boolean;communityId?:string|null}){\n  await requirePremium(userId); await rateLimit(userId,"academic_posts",15); const body=clean(input.body,12000);''','post anti-flood')

patch(Path('lib/academic-network.server.ts'),
'''export async function createAcademicComment(userId:string,input:{postId:string;body:string;anonymous:boolean}){ await requirePremium(userId); const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data,error}=await db.from("academic_comments").insert({post_id:input.postId,user_id:userId,body,anonymous:Boolean(input.anonymous)}).select("id").single(); if(error)fail("Não foi possível comentar."); return data; }\nexport async function deleteAcademicComment''',
'''export async function createAcademicComment(userId:string,input:{postId:string;body:string;anonymous:boolean}){ await requirePremium(userId); await rateLimit(userId,"academic_comments",8); const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data,error}=await db.from("academic_comments").insert({post_id:input.postId,user_id:userId,body,anonymous:Boolean(input.anonymous)}).select("id").single(); if(error)fail("Não foi possível comentar."); const {data:post}=await db.from("academic_posts").select("user_id").eq("id",input.postId).maybeSingle(); if(post?.user_id) await queueInAppNotification(post.user_id,userId,"Novo comentário na Rede Acadêmica","Sua publicação recebeu uma nova resposta.",{postId:input.postId}); return data; }\nexport async function updateAcademicComment(userId:string,input:{id:string;body:string}){ await requirePremium(userId); const body=clean(input.body,6000); if(!body)fail("Resposta vazia."); const {data}=await db.from("academic_comments").update({body,updated_at:new Date().toISOString()}).eq("id",input.id).eq("user_id",userId).eq("status","active").select("id").maybeSingle(); if(!data)fail("Comentário não encontrado."); return data; }\nexport async function deleteAcademicComment''','comment edit + notification + anti-flood')

patch(Path('lib/academic-network.server.ts'),
'''const {data,error}=await db.from("academic_connections").insert({requester_user_id:userId,receiver_user_id:target.user_id,status:"pending"}).select("id,status").single(); if(error)fail("Não foi possível conectar."); return data; }''',
'''const {data,error}=await db.from("academic_connections").insert({requester_user_id:userId,receiver_user_id:target.user_id,status:"pending"}).select("id,status").single(); if(error)fail("Não foi possível conectar."); await queueInAppNotification(target.user_id,userId,"Nova conexão acadêmica","Você recebeu uma solicitação de conexão na Rede Acadêmica.",{connectionId:data.id}); return data; }''','connection request notification')

patch(Path('lib/academic-network.server.ts'),
'''export async function respondAcademicConnection(userId:string,id:string,status:"accepted"|"declined"){ await requirePremium(userId); const {data}=await db.from("academic_connections").update({status,updated_at:new Date().toISOString()}).eq("id",id).eq("receiver_user_id",userId).eq("status","pending").select("id,status").maybeSingle(); if(!data)fail("Solicitação não encontrada."); return data; }''',
'''export async function respondAcademicConnection(userId:string,id:string,status:"accepted"|"declined"){ await requirePremium(userId); const {data:before}=await db.from("academic_connections").select("requester_user_id").eq("id",id).eq("receiver_user_id",userId).eq("status","pending").maybeSingle(); const {data}=await db.from("academic_connections").update({status,updated_at:new Date().toISOString()}).eq("id",id).eq("receiver_user_id",userId).eq("status","pending").select("id,status").maybeSingle(); if(!data)fail("Solicitação não encontrada."); if(status==="accepted"&&before?.requester_user_id) await queueInAppNotification(before.requester_user_id,userId,"Conexão aceita","Sua solicitação de conexão acadêmica foi aceita.",{connectionId:id}); return data; }''','connection response notification')

patch(Path('lib/academic-network.server.ts'),
'''export async function moderateAcademic(userId:string,input:{kind:"post"|"comment"|"report";id:string;action:"hide"|"restore"|"pin"|"unpin"|"resolve"|"dismiss"}){ await requireAdmin(userId); if(input.kind==="post"){const patch:any={updated_at:new Date().toISOString()}; if(input.action==="hide")patch.status="hidden"; else if(input.action==="restore")patch.status="active"; else if(input.action==="pin")patch.is_pinned=true;''',
'''export async function moderateAcademic(userId:string,input:{kind:"post"|"comment"|"report";id:string;action:"hide"|"restore"|"pin"|"unpin"|"resolve"|"dismiss"}){ await requireAdmin(userId); if(input.kind==="post"){const patch:any={updated_at:new Date().toISOString()}; if(input.action==="hide")patch.status="hidden"; else if(input.action==="restore")patch.status="active"; else if(input.action==="pin"){ const {count}=await db.from("academic_posts").select("id",{count:"exact",head:true}).eq("is_pinned",true).eq("status","active"); const {data:target}=await db.from("academic_posts").select("is_pinned").eq("id",input.id).maybeSingle(); if(!target?.is_pinned&&(count??0)>=3) fail("Limite de 3 publicações fixadas atingido."); patch.is_pinned=true; }''','pin limit')

# ---- functions: expose comment edit ----
patch(Path('lib/academic-network.functions.ts'),
'''export const academicCreateComment=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string;body:string;anonymous:boolean})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).createAcademicComment(context.userId,data));\nexport const academicDeleteComment''',
'''export const academicCreateComment=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string;body:string;anonymous:boolean})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).createAcademicComment(context.userId,data));\nexport const academicUpdateComment=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{id:string;body:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).updateAcademicComment(context.userId,data));\nexport const academicDeleteComment''','comment edit function')

# ---- client: hook edit functions and directory ----
p=root/'routes/_clientarea.cliente.rede-academica.tsx'
s=p.read_text(encoding='utf-8')
if 'academicUpdateComment' not in s:
    s=s.replace('academicReport, academicRequestConnection, academicRespondConnection, academicSaveDiary, academicToggleMembership,','academicReport, academicRequestConnection, academicRespondConnection, academicSaveDiary, academicToggleMembership, academicUpdateComment, academicUpdatePost,')
    s=s.replace('const snapshotFn=useServerFn(academicNetworkSnapshot), postFn=useServerFn(academicCreatePost), commentFn=useServerFn(academicCreateComment), diaryFn=', 'const snapshotFn=useServerFn(academicNetworkSnapshot), postFn=useServerFn(academicCreatePost), commentFn=useServerFn(academicCreateComment), updatePostFn=useServerFn(academicUpdatePost), updateCommentFn=useServerFn(academicUpdateComment), diaryFn=')
    s=s.replace('const post=simpleMutation((x)=>postFn({data:x})), comment=simpleMutation((x)=>commentFn({data:x})), diary=', 'const post=simpleMutation((x)=>postFn({data:x})), updatePost=simpleMutation((x)=>updatePostFn({data:x})), comment=simpleMutation((x)=>commentFn({data:x})), updateComment=simpleMutation((x)=>updateCommentFn({data:x})), diary=')
    s=s.replace('delPost={delPost} savedOnly={tab==="saved"}', 'delPost={delPost} updatePost={updatePost} updateComment={updateComment} savedOnly={tab==="saved"}')
    s=s.replace('function Feed({data,search,setSearch,communityId,setCommunityId,premium,post,comment,save,support,connect,report,delPost,savedOnly}:any){', 'function Feed({data,search,setSearch,communityId,setCommunityId,premium,post,comment,save,support,connect,report,delPost,updatePost,updateComment,savedOnly}:any){')
    s=s.replace('{p.own&&<button onClick={()=>confirm("Excluir esta publicação?")&&delPost.mutate(p.id)} className="text-[11px] text-muted-foreground hover:text-destructive">Excluir</button>}', '{p.own&&<div className="flex gap-2"><button onClick={()=>{const next=window.prompt("Editar publicação",p.body);if(next&&next.trim()&&next.trim()!==p.body)updatePost.mutate({id:p.id,body:next})}} className="text-[11px] text-muted-foreground hover:text-primary">Editar</button><button onClick={()=>confirm("Excluir esta publicação?")&&delPost.mutate(p.id)} className="text-[11px] text-muted-foreground hover:text-destructive">Excluir</button></div>}')
    old='<p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p></div>)}'
    new='<p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>{c.own&&<div className="mt-2 flex gap-2"><button onClick={()=>{const next=window.prompt("Editar comentário",c.body);if(next&&next.trim()&&next.trim()!==c.body)updateComment.mutate({id:c.id,body:next})}} className="text-[10px] font-bold text-muted-foreground">Editar</button></div>}</div>)}'
    if old not in s: raise SystemExit('comment UI anchor not found')
    s=s.replace(old,new,1)
    # add member directory to Profile aside
    marker='<div className="rounded-[22px] border bg-card p-4"><b className="text-sm">Privacidade</b><p className="mt-2 text-xs leading-5 text-muted-foreground">Seu e-mail, telefone, pagamentos e conteúdo do Diário não aparecem no perfil acadêmico.</p></div></aside></div>}'
    replacement='<div className="rounded-[22px] border bg-card p-4"><b className="text-sm">Pessoas da Rede</b><div className="mt-3 space-y-3">{(data.directory??[]).slice(0,8).map((person:any)=><div key={person.profileId} className="rounded-xl bg-muted/60 p-3"><div className="flex items-start justify-between gap-2"><div><b className="text-xs">{person.name}</b><p className="mt-1 text-[10px] text-muted-foreground">{person.profession||roleLabel[person.role]||"Membro"}</p></div>{data.access.premium&&<button onClick={()=>{const fn=(window as any).__academicConnect; if(fn)fn(person.profileId)}} className="rounded-lg border px-2 py-1 text-[9px] font-black">CONECTAR</button>}</div>{person.bio&&<p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{person.bio}</p>}</div>)}</div></div><div className="rounded-[22px] border bg-card p-4"><b className="text-sm">Privacidade</b><p className="mt-2 text-xs leading-5 text-muted-foreground">Seu e-mail, telefone, pagamentos e conteúdo do Diário não aparecem no perfil acadêmico.</p></div></aside></div>}'
    # Simpler: directory view only; connections are already available from posts to avoid global bridge.
    replacement=replacement.replace('{data.access.premium&&<button onClick={()=>{const fn=(window as any).__academicConnect; if(fn)fn(person.profileId)}} className="rounded-lg border px-2 py-1 text-[9px] font-black">CONECTAR</button>}','')
    if marker not in s: raise SystemExit('profile privacy anchor not found')
    s=s.replace(marker,replacement,1)
    p.write_text(s,encoding='utf-8')
    print('patched client edit + directory UI')
else:
    print('client polish already applied')

print('Academic network polish patch complete.')
