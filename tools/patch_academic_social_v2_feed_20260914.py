from pathlib import Path

srv=Path('apps/painel-ldr/src/lib/academic-network.server.ts')
fn=Path('apps/painel-ldr/src/lib/academic-network.functions.ts')
ui=Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.tsx')
s=srv.read_text(encoding='utf-8')
f=fn.read_text(encoding='utf-8')
u=ui.read_text(encoding='utf-8')

def replace(text,old,new,label):
    if new in text: return text
    if old not in text: raise SystemExit('anchor missing: '+label)
    return text.replace(old,new,1)

s=replace(s,
'export async function getAcademicNetwork(userId:string,email:string|null,opts?:{communityId?:string|null;search?:string|null;savedOnly?:boolean}){',
'export async function getAcademicNetwork(userId:string,email:string|null,opts?:{communityId?:string|null;search?:string|null;savedOnly?:boolean;offset?:number}){','opts offset')
s=replace(s,
'  const [{data:communities},{data:memberships},{data:diary},{data:prompts},{data:saved},{data:reacted},{data:connections}]=await Promise.all([',
'  const [{data:communities},{data:memberships},{data:diary},{data:prompts},{data:saved},{data:reacted},{data:connections},{data:follows},{data:latestArticles}]=await Promise.all([','snapshot extras tuple')
s=replace(s,
'    db.from("academic_connections").select("id,requester_user_id,receiver_user_id,status,created_at").or(`requester_user_id.eq.${userId},receiver_user_id.eq.${userId}`).order("created_at",{ascending:false})\n  ]);',
'    db.from("academic_connections").select("id,requester_user_id,receiver_user_id,status,created_at").or(`requester_user_id.eq.${userId},receiver_user_id.eq.${userId}`).order("created_at",{ascending:false}),\n    db.from("academic_follows").select("followed_user_id").eq("follower_user_id",userId).eq("status","accepted"),\n    db.from("academic_articles").select("id,slug,title,summary,category,created_at").eq("status","active").order("created_at",{ascending:false}).limit(20)\n  ]);','snapshot extras queries')
s=replace(s,
'  const savedIds=new Set((saved??[]).map((x:any)=>x.post_id));\n  let q=db.from("academic_posts").select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,location_label,location_city,location_country,share_slug,created_at,updated_at").eq("status","active").order("is_pinned",{ascending:false}).order("created_at",{ascending:false}).limit(access.premium?40:8);',
'  const savedIds=new Set((saved??[]).map((x:any)=>x.post_id)); const followedIds=new Set((follows??[]).map((x:any)=>x.followed_user_id)); const offset=Math.max(0,Number(opts?.offset??0)); const pageSize=access.premium?20:8;\n  let q=db.from("academic_posts").select("id,user_id,community_id,body,post_type,anonymous,status,is_pinned,location_label,location_city,location_country,share_slug,created_at,updated_at").eq("status","active").order("is_pinned",{ascending:false}).order("created_at",{ascending:false}).range(offset,offset+pageSize);','paged post query')
s=replace(s,
'  let posts=(rawPosts??[]).filter((p:any)=>!opts?.savedOnly||savedIds.has(p.id));',
'  const rawPage=rawPosts??[]; const hasMore=rawPage.length>pageSize; let posts=rawPage.slice(0,pageSize).filter((p:any)=>!opts?.savedOnly||savedIds.has(p.id));','page hasmore')
s=replace(s,
'posts=posts.map((p:any)=>({...p,user_id:undefined,author:safeAuthor(authors.get(p.user_id),p.anonymous),comments:commentsBy.get(p.id)??[],media:mediaBy.get(p.id)??[],topics:topicsBy.get(p.id)??[],saved:savedIds.has(p.id),supported:(reacted??[]).some((r:any)=>r.post_id===p.id),supportCount:counts.get(p.id)??0,own:p.user_id===userId}));',
'posts=posts.map((p:any)=>({...p,user_id:undefined,author:safeAuthor(authors.get(p.user_id),p.anonymous),comments:commentsBy.get(p.id)??[],media:mediaBy.get(p.id)??[],topics:topicsBy.get(p.id)??[],saved:savedIds.has(p.id),supported:(reacted??[]).some((r:any)=>r.post_id===p.id),supportCount:counts.get(p.id)??0,own:p.user_id===userId,followedAuthor:followedIds.has(p.user_id),memberCommunity:Boolean(p.community_id&&(memberships??[]).some((m:any)=>m.community_id===p.community_id))}));','post transparent signals')
s=replace(s,
'  return {access:{...access,freeDiary:true},profile,communities:communities??[],memberships:(memberships??[]).map((x:any)=>x.community_id),diary:diary??[],prompt,posts,connections:connectionsSafe,directory,userEmail:email??null};',
'  return {access:{...access,freeDiary:true},profile,communities:communities??[],memberships:(memberships??[]).map((x:any)=>x.community_id),diary:diary??[],prompt,posts,hasMore,nextOffset:offset+posts.length,latestArticles:latestArticles??[],connections:connectionsSafe,directory,userEmail:email??null};','snapshot feed metadata')

f=replace(f,
'export const academicNetworkSnapshot=createServerFn({method:"GET"}).middleware(auth).inputValidator((data?:{communityId?:string|null;search?:string|null;savedOnly?:boolean})=>data??{}).handler(async({context,data})=>{const m=await import("@/lib/academic-network.server");return m.getAcademicNetwork(context.userId,emailOf(context.claims),data)});',
'export const academicNetworkSnapshot=createServerFn({method:"GET"}).middleware(auth).inputValidator((data?:{communityId?:string|null;search?:string|null;savedOnly?:boolean;offset?:number})=>data??{}).handler(async({context,data})=>{const m=await import("@/lib/academic-network.server");return m.getAcademicNetwork(context.userId,emailOf(context.claims),data)});\nexport const academicFeedMore=createServerFn({method:"GET"}).middleware(auth).inputValidator((data:{offset:number;communityId?:string|null;search?:string|null})=>data).handler(async({context,data})=>{const m=await import("@/lib/academic-network.server");return m.getAcademicNetwork(context.userId,emailOf(context.claims),data)});','feed more function')

# UI import and server function
u=replace(u,'academicCreateComment, academicCreatePost, academicDeleteComment, academicDeleteDiary, academicDeletePost, academicNetworkSnapshot,','academicCreateComment, academicCreatePost, academicDeleteComment, academicDeleteDiary, academicDeletePost, academicFeedMore, academicNetworkSnapshot,','feed import')
u=replace(u,'const snapshotFn=useServerFn(academicNetworkSnapshot), postFn=useServerFn(academicCreatePost),','const snapshotFn=useServerFn(academicNetworkSnapshot), feedMoreFn=useServerFn(academicFeedMore), postFn=useServerFn(academicCreatePost),','feed fn')
# local extra posts and load mutation near query
needle='  const {data,isLoading,error}=useQuery({queryKey:["academic-network",search,communityId],queryFn:()=>snapshotFn({data:{search:search||null,communityId:communityId||null}})});'
replacement=needle+'\n  const [extraPosts,setExtraPosts]=useState<any[]>([]); const more=useMutation({mutationFn:(offset:number)=>feedMoreFn({data:{offset,search:search||null,communityId:communityId||null}}),onSuccess:(page)=>setExtraPosts(prev=>[...prev,...(page.posts??[])])});'
u=replace(u,needle,replacement,'extra posts state')
# reset extras on search/community would require useEffect not imported. Instead offset based on base+extra and changing query old extra stale. clear in inputs via handlers patch.
u=u.replace('onChange={e=>setSearch(e.target.value)}','onChange={e=>{setSearch(e.target.value);setExtraPosts([])}}')
u=u.replace('onChange={e=>setCommunityId(e.target.value)}','onChange={e=>{setCommunityId(e.target.value);setExtraPosts([])}}')
# Feed prop
u=replace(u,'updatePost={updatePost} updateComment={updateComment} savedOnly={tab==="saved"}/>','updatePost={updatePost} updateComment={updateComment} savedOnly={tab==="saved"} extraPosts={extraPosts} more={more}/>','feed extras prop')
u=replace(u,'function Feed({t,locale,data,search,setSearch,communityId,setCommunityId,premium,post,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,savedOnly}:any){','function Feed({t,locale,data,search,setSearch,communityId,setCommunityId,premium,post,comment,save,support,connect,report,delPost,delComment,updatePost,updateComment,savedOnly,extraPosts,more}:any){','feed signature')
# add mode state and combined list after first state line
needle='  const [body,setBody]=useState(""); const [postType,setPostType]=useState("reflection"); const [anonymous,setAnonymous]=useState(false); const [commentBody,setCommentBody]=useState<Record<string,string>>({}); const [commentAnon,setCommentAnon]=useState<Record<string,boolean>>({});'
replacement=needle+' const [feedMode,setFeedMode]=useState<"for_you"|"following"|"recent"|"articles"|"reflections">("for_you");'
u=replace(u,needle,replacement,'feed mode state')
needle='  const communities=data.communities??[]; const pinned=(data.posts??[]).filter((p:any)=>p.is_pinned);'
replacement='  const communities=data.communities??[]; const allPosts=[...(data.posts??[]),...(extraPosts??[])]; const pinned=allPosts.filter((p:any)=>p.is_pinned); const ranked=[...allPosts].sort((a:any,b:any)=>feedMode==="recent"?new Date(b.created_at).getTime()-new Date(a.created_at).getTime():(Number(b.is_pinned)-Number(a.is_pinned))||(Number(b.followedAuthor)-Number(a.followedAuthor))||(Number(b.memberCommunity)-Number(a.memberCommunity))||(new Date(b.created_at).getTime()-new Date(a.created_at).getTime())); const visiblePosts=feedMode==="following"?ranked.filter((p:any)=>p.followedAuthor):feedMode==="reflections"?ranked.filter((p:any)=>p.post_type==="reflection"):ranked;'
u=replace(u,needle,replacement,'feed ranking transparent')
# replace likely list expression (data.posts??[]) map. Do a safe global only within Feed after signature position.
start=u.find('function Feed('); end=u.find('\nfunction Communities',start)
seg=u[start:end if end>start else len(u)]
seg=seg.replace('(data.posts??[])','visiblePosts',1)
u=u[:start]+seg+u[end if end>start else len(u):]
# insert filters before highlight title marker
marker='<div><b className="text-sm">{t.highlight}</b><p className="text-xs text-muted-foreground">{t.highlightSub}</p></div>'
filters='<div className="flex flex-wrap gap-2"><button onClick={()=>setFeedMode("for_you")} className={`min-h-10 rounded-full border px-3 text-[10px] font-black ${feedMode==="for_you"?"bg-[#07315a] text-white":""}`}>PARA VOCÊ</button><button onClick={()=>setFeedMode("following")} className={`min-h-10 rounded-full border px-3 text-[10px] font-black ${feedMode==="following"?"bg-[#07315a] text-white":""}`}>SEGUINDO</button><button onClick={()=>setFeedMode("recent")} className={`min-h-10 rounded-full border px-3 text-[10px] font-black ${feedMode==="recent"?"bg-[#07315a] text-white":""}`}>RECENTES</button><button onClick={()=>setFeedMode("articles")} className={`min-h-10 rounded-full border px-3 text-[10px] font-black ${feedMode==="articles"?"bg-[#07315a] text-white":""}`}>ARTIGOS</button><button onClick={()=>setFeedMode("reflections")} className={`min-h-10 rounded-full border px-3 text-[10px] font-black ${feedMode==="reflections"?"bg-[#07315a] text-white":""}`}>REFLEXÕES</button></div>'+marker
u=replace(u,marker,filters,'feed filter controls')
# Article mode: insert before map container by common empty feed expression
needle='{visiblePosts.length?visiblePosts.map((p:any)=>'
if needle in u:
    u=u.replace(needle,'{feedMode==="articles"?<div className="grid gap-3 sm:grid-cols-2">{(data.latestArticles??[]).map((a:any)=><Link key={a.id} to="/cliente/rede-academica/artigo/$slug" params={{slug:a.slug}} className="rounded-2xl border bg-card p-4"><span className="text-[10px] font-black text-[#9a772c]">{a.category||"ARTIGO"}</span><b className="mt-2 block font-serif text-lg">{a.title}</b><p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{a.summary}</p></Link>)}</div>:visiblePosts.length?visiblePosts.map((p:any)=>',1)
    # Need close ternary structure unchanged ends :empty; our inserted adds additional branch cleanly.
# load more before Feed closes, only post modes. Search last safety-ish after list impossible; append before function next.
load='''{feedMode!=="articles"&&(data.hasMore||extraPosts.length>0)&&<div className="pt-2 text-center"><button disabled={more.isPending} onClick={()=>more.mutate((data.posts?.length??0)+extraPosts.length)} className="min-h-11 rounded-xl border bg-card px-5 text-xs font-black">{more.isPending?"CARREGANDO…":"CARREGAR MAIS"}</button></div>}'''
# insert before closing return's final </div> near end of Feed by locating next function and last '</div>\n}'
start=u.find('function Feed('); end=u.find('\nfunction Communities',start)
if end>start and 'CARREGAR MAIS' not in u[start:end]:
    seg=u[start:end]; pos=seg.rfind('</div>\n}')
    if pos<0: pos=seg.rfind('</div>}')
    if pos<0: raise SystemExit('feed close anchor missing')
    seg=seg[:pos]+load+seg[pos:];u=u[:start]+seg+u[end:]

srv.write_text(s,encoding='utf-8');fn.write_text(f,encoding='utf-8');ui.write_text(u,encoding='utf-8')
print('Feed pagination/filter patch applied.')
