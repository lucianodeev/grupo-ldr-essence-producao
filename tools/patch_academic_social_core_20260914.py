from pathlib import Path

ROOT=Path('apps/painel-ldr/src')

def must_replace(path,old,new,label):
    p=ROOT/path
    s=p.read_text()
    if old not in s:
        raise SystemExit(f'anchor not found: {label}')
    p.write_text(s.replace(old,new))

# Network server: share/repost hydration + file metadata + attachment-only posts.
p=ROOT/'lib/academic-network.server.ts'
s=p.read_text()
s=s.replace('type PostType = "reflection"|"question"|"debate"|"study"|"recommendation"|"photo";','type PostType = "reflection"|"question"|"debate"|"study"|"recommendation"|"photo"|"share";')
s=s.replace('const POST_TYPES = new Set<PostType>(["reflection","question","debate","study","recommendation","photo"]);','const POST_TYPES = new Set<PostType>(["reflection","question","debate","study","recommendation","photo","share"]);')
s=s.replace('select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,location_label,location_city,location_country,share_slug,created_at,updated_at")','select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,location_label,location_city,location_country,share_slug,original_post_id,share_comment,created_at,updated_at")')
s=s.replace('select("id,post_id,storage_path,alt_text,mime_type,sort_order")','select("id,post_id,storage_path,alt_text,mime_type,file_name,sort_order")')
s=s.replace('a.push({id:m.id,url:mediaUrls.get(m.storage_path)??null,altText:m.alt_text,mimeType:m.mime_type});','a.push({id:m.id,url:mediaUrls.get(m.storage_path)??null,altText:m.alt_text,mimeType:m.mime_type,fileName:m.file_name});')
old='''  posts=posts.map((p:any)=>({...p,user_id:undefined,author:safeAuthor(authors.get(p.user_id),p.anonymous),comments:commentsBy.get(p.id)??[],media:mediaBy.get(p.id)??[],topics:topicsBy.get(p.id)??[],saved:savedIds.has(p.id),supported:(reacted??[]).some((r:any)=>r.post_id===p.id),supportCount:counts.get(p.id)??0,own:p.user_id===userId,followedAuthor:followedIds.has(p.user_id),memberCommunity:Boolean(p.community_id&&(memberships??[]).some((m:any)=>m.community_id===p.community_id))}));
  const connectionsSafe='''
new='''  posts=posts.map((p:any)=>({...p,user_id:undefined,author:safeAuthor(authors.get(p.user_id),p.anonymous),comments:commentsBy.get(p.id)??[],media:mediaBy.get(p.id)??[],topics:topicsBy.get(p.id)??[],saved:savedIds.has(p.id),supported:(reacted??[]).some((r:any)=>r.post_id===p.id),supportCount:counts.get(p.id)??0,own:p.user_id===userId,followedAuthor:followedIds.has(p.user_id),memberCommunity:Boolean(p.community_id&&(memberships??[]).some((m:any)=>m.community_id===p.community_id))}));
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
  const connectionsSafe='''
if old not in s: raise SystemExit('anchor not found: original post hydration')
s=s.replace(old,new)
old='''export async function createAcademicPost(userId:string,input:{body:string;postType:PostType;anonymous:boolean;communityId?:string|null;locationLabel?:string;locationCity?:string;locationCountry?:string;topics?:string[]}){
  await requirePremium(userId); await rateLimit(userId,"academic_posts",15); const body=clean(input.body,12000); if(!body)fail("Escreva algo antes de publicar."); if(!POST_TYPES.has(input.postType))fail("Tipo inválido.");'''
new='''export async function createAcademicPost(userId:string,input:{body:string;postType:PostType;anonymous:boolean;communityId?:string|null;locationLabel?:string;locationCity?:string;locationCountry?:string;topics?:string[];hasAttachment?:boolean}){
  await requirePremium(userId); await rateLimit(userId,"academic_posts",15); const body=clean(input.body,12000); if(!body&&!input.hasAttachment)fail("Escreva algo ou anexe um arquivo antes de publicar."); if(!POST_TYPES.has(input.postType)||input.postType==="share")fail("Tipo inválido.");'''
if old not in s: raise SystemExit('anchor not found: create post attachment')
s=s.replace(old,new)
share_anchor='''export async function toggleAcademicMembership(userId:string,communityId:string){ await requirePremium(userId);'''
repost='''export async function repostAcademicPost(userId:string,input:{postId:string;comment?:string}){
  await requirePremium(userId);await rateLimit(userId,"academic_posts",8);
  const {data:source}=await db.from("academic_posts").select("id,user_id,original_post_id,status").eq("id",input.postId).eq("status","active").maybeSingle();if(!source)fail("Publicação não encontrada.");
  const originalId=source.original_post_id||source.id;const comment=clean(input.comment,2000);
  const {data,error}=await db.from("academic_posts").insert({user_id:userId,body:comment,share_comment:comment||null,post_type:"share",anonymous:false,original_post_id:originalId,status:"active"}).select("id").single();if(error||!data)fail("Não foi possível compartilhar no seu perfil.");
  const {data:original}=await db.from("academic_posts").select("user_id").eq("id",originalId).maybeSingle();if(original?.user_id)await queueInAppNotification(original.user_id,userId,"Sua publicação foi compartilhada","Uma conexão compartilhou sua publicação no próprio perfil.",{kind:"repost",postId:data.id,post_id:data.id,original_post_id:originalId});
  return data;
}

'''+share_anchor
if share_anchor not in s: raise SystemExit('anchor not found: repost insertion')
s=s.replace(share_anchor,repost)
p.write_text(s)

# Network function accepts attachment marker.
p=ROOT/'lib/academic-network.functions.ts';s=p.read_text();s=s.replace('topics?:string[]})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).createAcademicPost(context.userId,data));','topics?:string[];hasAttachment?:boolean})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).createAcademicPost(context.userId,data));');p.write_text(s)

# Feed imports and mutations.
p=ROOT/'components/academic-social-v3-feed.tsx';s=p.read_text()
s=s.replace('import { useMemo, useState } from "react";','import { useMemo, useRef, useState } from "react";\nimport { supabase } from "@/integrations/supabase/client";\nimport { optimizeAcademicImage } from "@/lib/academic-image-client";\nimport { academicFinalizePostMedia, academicPrepareImageUpload } from "@/lib/academic-media-v2.functions";\nimport { academicDmSendPost } from "@/lib/academic-dm.functions";')
s=s.replace('import { academicSharePost } from "@/lib/academic-network.functions";','import { academicRepostPost } from "@/lib/academic-network.functions";')
s=s.replace('eCommentFn=useServerFn(academicAddEditorialComment),sharePostFn=useServerFn(academicSharePost);','eCommentFn=useServerFn(academicAddEditorialComment),repostFn=useServerFn(academicRepostPost),dmPostFn=useServerFn(academicDmSendPost);')
s=s.replace('const internalShare=useMutation({mutationFn:(x:{postId:string;targetProfileId:string})=>sharePostFn({data:x})});','const repost=useMutation({mutationFn:(x:{postId:string;comment?:string})=>repostFn({data:x}),onSuccess:()=>qc.invalidateQueries({queryKey:["academic-network"]})});\n const dmShare=useMutation({mutationFn:(x:{postId:string;targetProfileId:string})=>dmPostFn({data:x})});')
s=s.replace('<TopComposer c={c} post={post} premium={premium}/>','<TopComposer c={c} post={post} premium={premium} data={data} locale={locale}/>')
s=s.replace('shareTargets,internalShare}}','shareTargets,repost,dmShare}}')
start=s.index('function TopComposer(')
end=s.index('function Quick(',start)
composer='''function TopComposer({c,post,premium,data,locale}:any){
 const qc=useQueryClient();const prepareFn=useServerFn(academicPrepareImageUpload),finalizeFn=useServerFn(academicFinalizePostMedia);const fileRef=useRef<HTMLInputElement>(null);
 const [body,setBody]=useState(""),[postType,setPostType]=useState("reflection"),[location,setLocation]=useState(""),[locationOpen,setLocationOpen]=useState(false),[file,setFile]=useState<File|null>(null),[localError,setLocalError]=useState("");
 const labels=locale==="fr"?{type:"Type",file:"Photo / PDF",location:"Localisation",publish:"PUBLIER"}:locale==="es"?{type:"Tipo",file:"Foto / PDF",location:"Ubicación",publish:"PUBLICAR"}:locale==="en"?{type:"Type",file:"Photo / PDF",location:"Location",publish:"PUBLISH"}:{type:"Tipo",file:"Foto / PDF",location:"Localização",publish:"PUBLICAR"};
 const typeOptions=[['reflection',c.reflection],['question',c.question],['debate',locale==='pt'?'Debate':'Debate'],['study',locale==='pt'?'Estudo':locale==='fr'?'Étude':locale==='es'?'Estudio':'Study'],['recommendation',locale==='pt'?'Indicação':locale==='fr'?'Recommandation':locale==='es'?'Indicación':'Recommendation'],['photo',c.photo]];
 const clear=()=>{setBody('');setPostType('reflection');setLocation('');setLocationOpen(false);setFile(null);setLocalError('');if(fileRef.current)fileRef.current.value=''};
 const publish=async()=>{if(!premium||post?.isPending||(!body.trim()&&!file))return;setLocalError('');try{const created=await post.mutateAsync({body:body.trim(),postType,anonymous:false,communityId:null,locationLabel:location.trim(),topics:[],hasAttachment:Boolean(file)});if(file){const uploadFile=file.type.startsWith('image/')?await optimizeAcademicImage(file,1920):file;const prepared=await prepareFn({data:{fileName:uploadFile.name||file.name,contentType:uploadFile.type,size:uploadFile.size,purpose:'posts'}});const {error}=await supabase.storage.from(prepared.bucket).uploadToSignedUrl(prepared.path,prepared.token,uploadFile,{contentType:uploadFile.type});if(error)throw error;await finalizeFn({data:{postId:created.id,path:prepared.path,fileName:file.name,altText:file.type==='application/pdf'?file.name:''}})}clear();await qc.invalidateQueries({queryKey:['academic-network']})}catch(err:any){setLocalError(String(err?.message||err))}};
 return <section id="academic-composer" className="academic-v4-composer rounded-2xl border bg-card p-3 shadow-sm"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#07315a] text-xs font-black text-white">{data?.profile?.avatarUrl?<img src={data.profile.avatarUrl} alt="" className="h-full w-full object-cover"/>:'LDR'}</span><textarea value={body} onChange={e=>{setBody(e.target.value);e.currentTarget.style.height='auto';e.currentTarget.style.height=Math.min(e.currentTarget.scrollHeight,140)+'px'}} disabled={!premium} rows={2} maxLength={12000} placeholder={c.sharePrompt} className="min-h-12 max-h-[140px] flex-1 resize-none rounded-xl bg-muted/45 px-3 py-2 text-base leading-6 outline-none disabled:cursor-not-allowed"/></div><div className="mt-2 flex flex-wrap items-center gap-2"><select value={postType} onChange={e=>setPostType(e.target.value)} className="min-h-10 rounded-xl border bg-background px-3 text-[11px] font-black" aria-label={labels.type}>{typeOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={e=>{const f=e.target.files?.[0]??null;if(f&&f.size>10*1024*1024){setLocalError('Arquivo maior que 10 MB.');setFile(null);return}setFile(f);setLocalError('')}}/><button type="button" onClick={()=>fileRef.current?.click()} className="min-h-10 rounded-xl border px-3 text-[11px] font-black"><Camera className="mr-1 inline h-4 w-4 text-[#b78927]"/>{labels.file}</button><button type="button" onClick={()=>setLocationOpen(v=>!v)} className="min-h-10 rounded-xl border px-3 text-[11px] font-black"><MapPin className="mr-1 inline h-4 w-4 text-[#b78927]"/>{labels.location}</button><button type="button" disabled={!premium||post?.isPending||(!body.trim()&&!file)} onClick={publish} className="ml-auto min-h-10 rounded-xl bg-[#07315a] px-4 text-[10px] font-black text-white disabled:opacity-40">{post?.isPending?'…':labels.publish}</button></div>{locationOpen&&<input autoFocus value={location} onChange={e=>setLocation(e.target.value)} maxLength={160} placeholder="Bruxelas, Bélgica" className="mt-2 min-h-10 w-full rounded-xl border bg-background px-3 text-sm"/>}{file&&<div className="mt-2 rounded-xl border bg-muted/30 p-2">{file.type.startsWith('image/')?<img src={URL.createObjectURL(file)} alt="Prévia" className="max-h-64 w-full rounded-lg object-contain"/>:<div className="flex items-center gap-3"><FileText className="h-8 w-8 text-[#b78927]"/><div className="min-w-0 flex-1"><b className="block truncate text-xs">{file.name}</b><small className="text-muted-foreground">PDF · {(file.size/1024/1024).toFixed(2)} MB</small></div><button type="button" onClick={()=>setFile(null)} className="rounded-lg border px-2 py-1 text-[10px] font-black">REMOVER</button></div>}</div>}{(localError||post?.error)&&<p className="mt-2 rounded-xl border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">{localError||String(post.error?.message||post.error)}</p>}</section>}
'''
s=s[:start]+composer+s[end:]
s=s.replace('function RealPostCard({p,t,locale,premium,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,share,c,shareTargets,internalShare}:any){','function RealPostCard({p,t,locale,premium,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,share,c,shareTargets,repost,dmShare}:any){')
s=s.replace('<p className="academic-v4-post-body mt-4 whitespace-pre-wrap text-[15px] leading-6">{p.body}</p>','{p.post_type==="share"&&<p className="mt-3 text-[10px] font-black text-[#9a772c]">{p.author.name} compartilhou uma publicação</p>}{p.body&&<p className="academic-v4-post-body mt-3 whitespace-pre-wrap text-[15px] leading-6">{p.body}</p>}{p.originalPost&&<OriginalPostCard p={p.originalPost}/>}')
s=s.replace('{(p.media??[]).map((m:any)=>m.url?<img key={m.id} src={m.url} alt={m.altText||"Imagem da publicação"} loading="lazy" className="mt-3 max-h-[620px] w-full rounded-2xl bg-muted object-contain"/>:null)}','<PostMedia media={p.media??[]}/>')
share_start=s.index('{shareOpen&&<div className="mt-3 rounded-2xl border bg-muted/20 p-3">')
share_end=s.index('{p.comments?.length>0&&',share_start)
share_ui='''{shareOpen&&<div className="mt-3 rounded-2xl border bg-muted/20 p-3"><div className="flex flex-wrap gap-2"><button type="button" disabled={repost.isPending} onClick={()=>{const note=window.prompt(locale==="pt"?"Comentário opcional ao compartilhar":"Optional comment","")??"";repost.mutate({postId:p.id,comment:note},{onSuccess:()=>{setShareMessage(locale==="pt"?"Compartilhado no seu perfil.":"Shared to your profile.");setShareOpen(false)},onError:(err:any)=>setShareMessage(String(err?.message||err))})}} className="min-h-10 rounded-xl bg-[#07315a] px-3 text-[10px] font-black text-white">{locale==="pt"?"COMPARTILHAR NO MEU PERFIL":"SHARE TO MY PROFILE"}</button><button type="button" onClick={()=>share(postUrl(),p.body||'Rede Acadêmica LDR')} className="min-h-10 rounded-xl border bg-card px-3 text-[10px] font-black">{locale==="pt"?"COPIAR / COMPARTILHAR LINK":"SHARE LINK"}</button></div><div className="mt-3 border-t pt-3"><b className="text-[10px]">{locale==="pt"?"ENVIAR POR MENSAGEM":"SEND BY MESSAGE"}</b>{shareTargets?.length?<div className="mt-2 flex max-h-44 flex-col gap-1 overflow-y-auto">{shareTargets.map((target:any)=><button type="button" key={target.profileId} disabled={dmShare.isPending} onClick={()=>dmShare.mutate({postId:p.id,targetProfileId:target.profileId},{onSuccess:()=>setShareMessage(locale==="pt"?"Enviado por mensagem privada.":"Sent by private message."),onError:(err:any)=>setShareMessage(String(err?.message||err))})} className="flex min-h-10 items-center gap-2 rounded-xl bg-card px-3 text-left text-[11px] font-bold"><span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e9f0f7] text-[9px] font-black">{target.avatarUrl?<img src={target.avatarUrl} alt="" className="h-full w-full object-cover"/>:String(target.name||"M").slice(0,1)}</span><span className="truncate">{target.name}</span></button>)}</div>:<p className="mt-2 text-xs text-muted-foreground">{locale==="pt"?"Aceite uma conexão para enviar mensagens privadas.":"Accept a connection to send private messages."}</p>}{shareMessage&&<p className="mt-2 text-xs font-bold text-muted-foreground">{shareMessage}</p>}</div></div>}'''
s=s[:share_start]+share_ui+s[share_end:]
insert_at=s.index('function EditorialPostCard(')
helpers='''function PostMedia({media}:any){return <>{(media??[]).map((m:any)=>!m.url?null:m.mimeType==="application/pdf"?<a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-3 rounded-2xl border bg-muted/30 p-4"><FileText className="h-9 w-9 shrink-0 text-[#b78927]"/><span className="min-w-0 flex-1"><b className="block truncate text-sm">{m.fileName||m.altText||"Documento.pdf"}</b><small className="text-muted-foreground">Documento PDF · abrir</small></span></a>:<img key={m.id} src={m.url} alt={m.altText||"Imagem da publicação"} loading="lazy" className="mt-3 max-h-[620px] w-full rounded-2xl bg-muted object-contain"/>)}</>}
function OriginalPostCard({p}:any){return <div className="mt-3 rounded-2xl border bg-muted/20 p-3"><div className="flex items-center gap-2">{p.author?.avatarUrl?<img src={p.author.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover"/>:<span className="grid h-8 w-8 place-items-center rounded-full bg-background text-[10px] font-black">{String(p.author?.name||"M").slice(0,1)}</span>}<div><b className="text-xs">{p.author?.name||"Membro LDR"}</b><p className="text-[9px] text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p></div></div>{p.body&&<p className="mt-3 whitespace-pre-wrap text-sm leading-6">{p.body}</p>}{p.location_label&&<p className="mt-2 text-[10px] text-muted-foreground">📍 {p.location_label}</p>}<PostMedia media={p.media??[]}/></div>}
'''
s=s[:insert_at]+helpers+s[insert_at:]
p.write_text(s)

# Chat utility strip now opens academic DM instead of the generic assistant.
p=ROOT/'routes/_clientarea.cliente.rede-academica.tsx';s=p.read_text();
s=s.replace('  const openChat=()=>{const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>(\'button[aria-expanded]\'));buttons.find((button)=>String(button.className).includes(\'F4B942\'))?.click()};\n','')
s=s.replace('<button type="button" onClick={openChat} className={item}><MessageCircle className="h-4 w-4 shrink-0 text-[#b78927]"/><span>{labels.chat}</span></button>','<Link to="/cliente/rede-academica/chat" className={item}><MessageCircle className="h-4 w-4 shrink-0 text-[#b78927]"/><span>{labels.chat}</span></Link>')
p.write_text(s)

print('academic social core patch applied')
