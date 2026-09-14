from pathlib import Path

ROOT = Path("apps/painel-ldr/src")

def must_replace(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"anchor not found: {label}")
    return text.replace(old, new, 1)

# 1) Server function contract for internal sharing.
p = ROOT / "lib/academic-network.functions.ts"
s = p.read_text(encoding="utf-8")
anchor = 'export const academicToggleSupport=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).toggleAcademicSupport(context.userId,data.postId));\n'
addition = anchor + 'export const academicSharePost=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{postId:string;targetProfileId:string})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).shareAcademicPost(context.userId,data));\n'
s = must_replace(s, anchor, addition, "academic share function")
p.write_text(s, encoding="utf-8")

# 2) Academic server: return a signed avatar for the current profile and implement connected-user sharing.
p = ROOT / "lib/academic-network.server.ts"
s = p.read_text(encoding="utf-8")
s = must_replace(
    s,
    '  const profile=await ensureProfile(userId);',
    '  const profileRaw=await ensureProfile(userId);\n  const ownAvatarUrls=await signedUrlMap(profileRaw?.avatar_path?[profileRaw.avatar_path]:[]);\n  const profile={...profileRaw,avatarUrl:profileRaw?.avatar_path?(ownAvatarUrls.get(profileRaw.avatar_path)??null):null};',
    "signed current profile avatar",
)
share_anchor = 'export async function toggleAcademicSupport(userId:string,postId:string){ await requirePremium(userId); const {data}=await db.from("academic_reactions").select("post_id").eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support").maybeSingle(); if(data)await db.from("academic_reactions").delete().eq("user_id",userId).eq("post_id",postId).eq("reaction_type","support"); else {await db.from("academic_reactions").insert({user_id:userId,post_id:postId,reaction_type:"support"}); const {data:post}=await db.from("academic_posts").select("user_id").eq("id",postId).maybeSingle(); if(post?.user_id)await queueInAppNotification(post.user_id,userId,"Publicação acolhida","Sua publicação recebeu um Acolher.",{kind:"support",postId});} return {supported:!data}; }\n'
share_impl = share_anchor + '''export async function shareAcademicPost(userId:string,input:{postId:string;targetProfileId:string}){
  await requirePremium(userId);
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
}\n'''
s = must_replace(s, share_anchor, share_impl, "internal share implementation")
p.write_text(s, encoding="utf-8")

# 3) Feed: true inline composer, reliable comments, correct report payload, internal share, editorial avatars.
p = ROOT / "components/academic-social-v3-feed.tsx"
s = p.read_text(encoding="utf-8")
s = must_replace(
    s,
    'import { academicAddEditorialComment, academicEditorialSnapshot, academicToggleEditorialFollow, academicToggleEditorialSave, academicToggleEditorialSupport } from "@/lib/academic-editorial-v3.functions";',
    'import { academicAddEditorialComment, academicEditorialSnapshot, academicToggleEditorialFollow, academicToggleEditorialSave, academicToggleEditorialSupport } from "@/lib/academic-editorial-v3.functions";\nimport { academicSharePost } from "@/lib/academic-network.functions";',
    "share import",
)
s = must_replace(
    s,
    ' const {t,locale,data,search,setSearch,communityId,setCommunityId,premium,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,savedOnly,extraPosts,more}=props;',
    ' const {t,locale,data,search,setSearch,communityId,setCommunityId,premium,post,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,savedOnly,extraPosts,more}=props;',
    "post prop",
)
s = must_replace(
    s,
    ' const editorialFn=useServerFn(academicEditorialSnapshot),eSupportFn=useServerFn(academicToggleEditorialSupport),eSaveFn=useServerFn(academicToggleEditorialSave),eFollowFn=useServerFn(academicToggleEditorialFollow),eCommentFn=useServerFn(academicAddEditorialComment);',
    ' const editorialFn=useServerFn(academicEditorialSnapshot),eSupportFn=useServerFn(academicToggleEditorialSupport),eSaveFn=useServerFn(academicToggleEditorialSave),eFollowFn=useServerFn(academicToggleEditorialFollow),eCommentFn=useServerFn(academicAddEditorialComment),sharePostFn=useServerFn(academicSharePost);',
    "share server fn",
)
s = must_replace(
    s,
    ' const eComment=useMutation({mutationFn:(x:{postId:string;body:string})=>eCommentFn({data:x}),onSuccess:(_,x)=>{setReply(v=>({...v,[x.postId]:""}));refreshEditorial()}});',
    ' const eComment=useMutation({mutationFn:(x:{postId:string;body:string})=>eCommentFn({data:x}),onSuccess:(_,x)=>{setReply(v=>({...v,[x.postId]:""}));refreshEditorial()}});\n const internalShare=useMutation({mutationFn:(x:{postId:string;targetProfileId:string})=>sharePostFn({data:x})});\n const shareTargets=(data.connections??[]).filter((x:any)=>x.status==="accepted"&&x.profile?.profileId).map((x:any)=>x.profile);',
    "share mutation",
)
s = s.replace('<TopComposer c={c}/>', '<TopComposer c={c} post={post} premium={premium}/>', 2)
s = must_replace(
    s,
    '<RealPostCard {...{p:x.p,t,locale,premium,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,share,c}}/>',
    '<RealPostCard {...{p:x.p,t,locale,premium,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,share,c,shareTargets,internalShare}}/>',
    "share props",
)
# Replace composer implementation wholesale.
start = s.index('function TopComposer(')
end = s.index('function Quick(', start)
composer = '''function TopComposer({c,post,premium}:any){const [body,setBody]=useState("");const publish=()=>{const value=body.trim();if(!value||!premium||post?.isPending)return;post.mutate({body:value,postType:"reflection",anonymous:false,communityId:null,topics:[]},{onSuccess:()=>setBody("")})};return <section className="academic-v4-composer rounded-2xl border bg-card p-3 shadow-sm"><div className="academic-v4-composer-main flex items-start gap-3 rounded-2xl bg-muted/45 px-3 py-2"><span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#07315a] text-xs font-black text-white">LDR</span><textarea value={body} onChange={e=>setBody(e.target.value)} disabled={!premium} rows={2} maxLength={12000} placeholder={c.sharePrompt} className="min-h-12 flex-1 resize-none bg-transparent py-2 text-base leading-6 outline-none disabled:cursor-not-allowed"/><button type="button" disabled={!premium||!body.trim()||post?.isPending} onClick={publish} className="mt-1 min-h-10 shrink-0 rounded-xl bg-[#07315a] px-3 text-[10px] font-black text-white disabled:opacity-40">{post?.isPending?"…":"PUBLICAR"}</button></div>{post?.error&&<p className="mt-2 rounded-xl border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">{String(post.error?.message||post.error)}</p>}<div className="academic-v4-quick-grid mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4"><Quick to="/cliente/rede-academica/criar" search={{kind:"reflection"}} icon={PenLine} label={c.reflection}/><Quick to="/cliente/rede-academica/criar-artigo" icon={FileText} label={c.article}/><Quick to="/cliente/rede-academica/criar" search={{kind:"question"}} icon={MessageCircle} label={c.question}/><Quick to="/cliente/rede-academica/criar" search={{kind:"photo"}} icon={Camera} label={c.photo}/></div></section>}\n'''
s = s[:start] + composer + s[end:]
# Replace real card wholesale to remove fragile sentinel input state.
start = s.index('function RealPostCard(')
end = s.index('function EditorialPostCard(', start)
real_card = '''function RealPostCard({p,t,locale,premium,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,share,c,shareTargets,internalShare}:any){
 const [text,setText]=useState(""),[commentOpen,setCommentOpen]=useState(false),[shareOpen,setShareOpen]=useState(false),[shareMessage,setShareMessage]=useState("");const roleLabel:Record<string,string>={member:t.member,student:t.student,professor:t.professor,mentor:t.mentor};const postUrl=()=>`${window.location.origin}/cliente/rede-academica/post/${p.id}`;
 return <article className="academic-v4-post rounded-[22px] border bg-card p-4 shadow-[0_5px_18px_rgba(7,20,38,.05)]"><header className="flex items-start justify-between gap-2"><div className="flex min-w-0 gap-3">{p.author.avatarUrl?<img src={p.author.avatarUrl} alt="Avatar" className="h-10 w-10 shrink-0 rounded-full object-cover"/>:<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e9f0f7] text-xs font-black text-[#07315a]">{String(p.author.name||"M").slice(0,1)}</span>}<div className="min-w-0">{!p.author.anonymous&&p.author.username?<Link to="/cliente/rede-academica/perfil/$username" params={{username:p.author.username}} className="block truncate text-sm font-black hover:underline">{p.author.name}</Link>:<b className="text-sm">{p.author.name}</b>}<div className="mt-1 flex flex-wrap gap-1.5 text-[9px] text-muted-foreground"><span>{roleLabel[p.author.role]||t.member}</span>{p.author.profession&&<span>· {p.author.profession}</span>}{p.author.country&&<span>· {FLAG[p.author.country]||"🌍"} {p.author.country}</span>}</div><p className="mt-1 text-[9px] text-muted-foreground">{new Date(p.created_at).toLocaleString(locale)}</p></div></div><details className="academic-v4-post-menu relative shrink-0"><summary aria-label={c.more} className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full text-xl font-black hover:bg-muted">⋯</summary><div className="absolute right-0 top-10 z-30 min-w-40 rounded-xl border bg-card p-1 shadow-xl">{p.own?<><button type="button" onClick={()=>{const n=window.prompt(t.edit,p.body);if(n?.trim()&&n.trim()!==p.body)updatePost.mutate({id:p.id,body:n.trim()})}} className="block min-h-10 w-full rounded-lg px-3 text-left text-[11px] font-bold hover:bg-muted">{t.edit}</button><button type="button" onClick={()=>confirm(t.remove+"?")&&delPost.mutate(p.id)} className="block min-h-10 w-full rounded-lg px-3 text-left text-[11px] font-bold text-destructive hover:bg-muted">{t.remove}</button></>:<><button type="button" disabled={!premium||!p.author?.profileId} onClick={()=>p.author?.profileId&&connect.mutate(p.author.profileId)} className="block min-h-10 w-full rounded-lg px-3 text-left text-[11px] font-bold hover:bg-muted disabled:opacity-40">{t.connect}</button><button type="button" onClick={()=>{const reason=window.prompt("offensive · harassment · hate · privacy · spam · inappropriate · other","other");if(reason)report.mutate({postId:p.id,reason:reason.trim().toLowerCase()})}} className="block min-h-10 w-full rounded-lg px-3 text-left text-[11px] font-bold hover:bg-muted">{t.report}</button></>}<button type="button" onClick={()=>share(postUrl(),p.body)} className="block min-h-10 w-full rounded-lg px-3 text-left text-[11px] font-bold hover:bg-muted">{c.share}</button></div></details></header><p className="academic-v4-post-body mt-4 whitespace-pre-wrap text-[15px] leading-6">{p.body}</p>{p.location_label&&<p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="h-3.5 w-3.5"/>{p.location_label}</p>}{(p.media??[]).map((m:any)=>m.url?<img key={m.id} src={m.url} alt={m.altText||"Imagem da publicação"} loading="lazy" className="mt-3 max-h-[620px] w-full rounded-2xl bg-muted object-contain"/>:null)}{!!p.topics?.length&&<div className="mt-3 flex flex-wrap gap-2">{p.topics.map((x:any)=><Link key={x.id} to="/cliente/rede-academica/buscar" search={{q:x.label} as any} className="text-[10px] font-bold text-[#315b80]">#{x.label}</Link>)}</div>}<div className="academic-v4-post-actions mt-3 grid grid-cols-4 border-t pt-2"><Mini onClick={()=>support.mutate(p.id)} disabled={!premium||support.isPending} icon={HeartHandshake} label={`${p.supported?t.supported:t.support} ${p.supportCount||""}`}/><Mini onClick={()=>setCommentOpen(v=>!v)} disabled={!premium} icon={MessageCircle} label={c.comment}/><Mini onClick={()=>save.mutate(p.id)} disabled={!premium||save.isPending} icon={Bookmark} label={p.saved?t.savedAction:t.save}/><Mini onClick={()=>{setShareOpen(v=>!v);setShareMessage("")}} icon={Share2} label={c.share}/></div>{commentOpen&&premium&&<div className="academic-v4-comment-row mt-3 flex gap-2"><input autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder={t.reply} className="academic-v4-comment-input min-h-11 flex-1 rounded-xl border bg-background px-3 text-base"/><button type="button" disabled={!text.trim()||comment.isPending} onClick={()=>{const b=text.trim();if(b)comment.mutate({postId:p.id,body:b,anonymous:false},{onSuccess:()=>{setText("");setCommentOpen(false)}})}} className="rounded-xl bg-[#07315a] px-3 text-xs font-black text-white disabled:opacity-40">OK</button></div>}{comment.error&&commentOpen&&<p className="mt-2 text-xs text-destructive">{String(comment.error?.message||comment.error)}</p>}{shareOpen&&<div className="mt-3 rounded-2xl border bg-muted/20 p-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>share(postUrl(),p.body)} className="min-h-10 rounded-xl border bg-card px-3 text-[10px] font-black">{locale==="pt"?"COMPARTILHAR LINK":locale==="fr"?"PARTAGER LE LIEN":locale==="es"?"COMPARTIR ENLACE":"SHARE LINK"}</button></div><div className="mt-3 border-t pt-3"><b className="text-[10px]">{locale==="pt"?"ENVIAR PARA UMA CONEXÃO":locale==="fr"?"ENVOYER À UNE CONNEXION":locale==="es"?"ENVIAR A UNA CONEXIÓN":"SEND TO A CONNECTION"}</b>{shareTargets?.length?<div className="mt-2 flex max-h-44 flex-col gap-1 overflow-y-auto">{shareTargets.map((target:any)=><button type="button" key={target.profileId} disabled={internalShare.isPending} onClick={()=>internalShare.mutate({postId:p.id,targetProfileId:target.profileId},{onSuccess:()=>setShareMessage(locale==="pt"?"Enviado na Rede Acadêmica.":locale==="fr"?"Envoyé sur le Réseau Académique.":locale==="es"?"Enviado en la Red Académica.":"Sent on the Academic Network."),onError:(err:any)=>setShareMessage(String(err?.message||err))})} className="flex min-h-10 items-center gap-2 rounded-xl bg-card px-3 text-left text-[11px] font-bold"><span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e9f0f7] text-[9px] font-black">{target.avatarUrl?<img src={target.avatarUrl} alt="" className="h-full w-full object-cover"/>:String(target.name||"M").slice(0,1)}</span><span className="truncate">{target.name}</span></button>)}</div>:<p className="mt-2 text-xs text-muted-foreground">{locale==="pt"?"Aceite uma conexão para enviar publicações dentro da Rede.":locale==="fr"?"Acceptez une connexion pour envoyer des publications dans le Réseau.":locale==="es"?"Acepta una conexión para enviar publicaciones dentro de la Red.":"Accept a connection to send posts inside the Network."}</p>}{shareMessage&&<p className="mt-2 text-xs font-bold text-muted-foreground">{shareMessage}</p>}</div></div>}{p.comments?.length>0&&<div className="mt-3 space-y-2 border-t pt-3">{p.comments.slice(0,3).map((x:any)=><div key={x.id} className="rounded-xl bg-muted/40 p-3"><div className="flex items-start gap-2">{x.author?.avatarUrl?<img src={x.author.avatarUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover"/>:<span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-background text-[9px] font-black">{String(x.author?.name||"M").slice(0,1)}</span>}<div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><b className="text-[10px]">{x.author.name}</b>{x.own&&<span className="flex gap-1"><button type="button" onClick={()=>{const n=window.prompt(t.edit,x.body);if(n?.trim()&&n.trim()!==x.body)updateComment.mutate({id:x.id,body:n.trim()})}} className="px-1 text-[9px] font-bold">{t.edit}</button><button type="button" onClick={()=>confirm(t.remove+"?")&&delComment.mutate(x.id)} className="px-1 text-[9px] font-bold text-destructive">{t.remove}</button></span>}</div><p className="mt-1 text-xs leading-5">{x.body}</p></div></div></div>)}</div>}</article>
}\n'''
s = s[:start] + real_card + s[end:]
# Editorial avatars should use the avatar_url field that already exists in the DB.
old_avatar = '<Link to="/cliente/rede-academica/perfil-editorial/$username" params={{username:profile.username}} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#07315a] to-[#315b80] text-xs font-black text-white">{String(profile.display_name||"L").split(" ").map((x:string)=>x[0]).join("").slice(0,2)}</Link>'
new_avatar = '<Link to="/cliente/rede-academica/perfil-editorial/$username" params={{username:profile.username}} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#07315a] to-[#315b80] text-xs font-black text-white">{profile.avatar_url?<img src={profile.avatar_url} alt={profile.display_name||"Perfil editorial"} className="h-full w-full object-cover"/>:String(profile.display_name||"L").split(" ").map((x:string)=>x[0]).join("").slice(0,2)}</Link>'
s = must_replace(s, old_avatar, new_avatar, "editorial avatar")
p.write_text(s, encoding="utf-8")

# 4) Persisted avatar should be visible immediately and after reload in the profile editor.
p = ROOT / "routes/_clientarea.cliente.rede-academica.editar-perfil.tsx"
s = p.read_text(encoding="utf-8")
old = 'setShowName(p.show_name!==false);setShowLocation(p.show_location===true)},[data]);'
new = 'setShowName(p.show_name!==false);setShowLocation(p.show_location===true);setAvatarUrl(p.avatarUrl??null)},[data]);'
s = must_replace(s, old, new, "profile avatar hydrate")
p.write_text(s, encoding="utf-8")

# 5) Utility strip: keep the full accessibility word without squeezing the mobile layout.
p = ROOT / "routes/_clientarea.cliente.rede-academica.tsx"
s = p.read_text(encoding="utf-8")
s = must_replace(
    s,
    '  const item="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 text-[10px] font-black transition hover:bg-muted sm:flex-none sm:px-4";',
    '  const item="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 text-[9px] font-black transition hover:bg-muted sm:gap-2 sm:px-4 sm:text-[10px]";',
    "utility item sizing",
)
s = must_replace(
    s,
    'className="academic-v4-utility-strip flex items-center gap-1 rounded-[20px] border bg-card p-1.5 shadow-sm"',
    'className="academic-v4-utility-strip flex items-center gap-1 overflow-x-auto rounded-[20px] border bg-card p-1.5 shadow-sm [scrollbar-width:none]"',
    "utility strip overflow",
)
p.write_text(s, encoding="utf-8")

# 6) Create-post page: refresh feed after success and show a real preview of the chosen image.
p = ROOT / "routes/_clientarea.cliente.rede-academica.criar.tsx"
s = p.read_text(encoding="utf-8")
s = must_replace(s, 'import { useMutation, useQuery } from "@tanstack/react-query";', 'import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";', "create query client import")
s = must_replace(s, ' const {locale:raw}=useI18n();const locale=', ' const qc=useQueryClient();const {locale:raw}=useI18n();const locale=', "create qc")
s = must_replace(s, 'onSuccess:p=>navigate({to:"/cliente/rede-academica/post/$id",params:{id:p.id}})', 'onSuccess:async p=>{await qc.invalidateQueries({queryKey:["academic-network"]});navigate({to:"/cliente/rede-academica/post/$id",params:{id:p.id}})}', "create refresh")
s = must_replace(s, '{file&&<input value={alt}', '{file&&<><img src={URL.createObjectURL(file)} alt="Prévia" className="mt-3 max-h-72 w-full rounded-2xl bg-muted object-contain"/><input value={alt}', "image preview start")
s = must_replace(s, 'placeholder="Alt text" className="mt-3 min-h-11 w-full rounded-xl border bg-background px-3 text-sm"/>}</div>', 'placeholder="Alt text" className="mt-3 min-h-11 w-full rounded-xl border bg-background px-3 text-sm"/></>}</div>', "image preview close")
p.write_text(s, encoding="utf-8")

# 7) Notifications: accept camelCase and snake_case metadata and prioritize the actual shared content destination.
p = ROOT / "routes/_clientarea.cliente.rede-academica.notificacoes.tsx"
s = p.read_text(encoding="utf-8")
old = 'function hrefFor(n:any){const m=n?.metadata??{};if(m.actorUsername)return `/cliente/rede-academica/perfil/${encodeURIComponent(String(m.actorUsername))}`;if(m.article_slug)return `/cliente/rede-academica/artigo/${encodeURIComponent(String(m.article_slug))}`;if(m.slug&&String(m.kind??"").includes("article"))return `/cliente/rede-academica/artigo/${encodeURIComponent(String(m.slug))}`;if(m.post_id)return `/cliente/rede-academica/post/${encodeURIComponent(String(m.post_id))}`;return null}'
new = 'function hrefFor(n:any){const m=n?.metadata??{};const postId=m.post_id??m.postId;const articleSlug=m.article_slug??m.articleSlug??(m.slug&&String(m.kind??"").includes("article")?m.slug:null);if(postId)return `/cliente/rede-academica/post/${encodeURIComponent(String(postId))}`;if(articleSlug)return `/cliente/rede-academica/artigo/${encodeURIComponent(String(articleSlug))}`;if(m.actorUsername)return `/cliente/rede-academica/perfil/${encodeURIComponent(String(m.actorUsername))}`;return null}'
s = must_replace(s, old, new, "notification target links")
p.write_text(s, encoding="utf-8")

# 8) Small CSS guard: utility labels stay intact and text controls remain interactive.
p = ROOT / "styles/academic-network-v4.css"
s = p.read_text(encoding="utf-8")
marker = '.academic-v4-feed { width: 100%; min-width: 0; }\n'
extra = marker + '.academic-v4-utility-strip { -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }\n.academic-v4-utility-strip span { white-space: nowrap; overflow-wrap: normal; }\n.academic-social-v4 textarea,.academic-social-v4 input { pointer-events: auto; user-select: text; }\n'
s = must_replace(s, marker, extra, "utility/input css")
p.write_text(s, encoding="utf-8")

print("Academic network functional repair applied")
