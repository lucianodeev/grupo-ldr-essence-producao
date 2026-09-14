from pathlib import Path

# Preselect social composer type from quick-action query param.
create=Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.criar.tsx')
s=create.read_text()
old='export const Route=createFileRoute("/_clientarea/cliente/rede-academica/criar")({component:AcademicCreatePage});'
new='export const Route=createFileRoute("/_clientarea/cliente/rede-academica/criar")({validateSearch:(search:Record<string,unknown>)=>({kind:typeof search.kind==="string"?search.kind:undefined}),component:AcademicCreatePage});'
if old in s:s=s.replace(old,new,1)
anchor='function AcademicCreatePage(){\n const {locale:raw}=useI18n();'
if anchor in s:
    s=s.replace(anchor,'function AcademicCreatePage(){\n const routeSearch=Route.useSearch();\n const {locale:raw}=useI18n();',1)
old=' const [kind,setKind]=useState<Kind>("reflection"),[body,setBody]=useState("")'
new=' const initialKind=(routeSearch.kind==="question"||routeSearch.kind==="photo"||routeSearch.kind==="reflection"?routeSearch.kind:"reflection") as Kind;\n const [kind,setKind]=useState<Kind>(initialKind),[body,setBody]=useState("")'
if old in s:s=s.replace(old,new,1)
create.write_text(s)

feed=Path('apps/painel-ldr/src/components/academic-social-v3-feed.tsx')
s=feed.read_text()
s=s.replace('<Quick to="/cliente/rede-academica/criar" icon={PenLine} label={c.reflection}/>', '<Quick to="/cliente/rede-academica/criar" search={{kind:"reflection"}} icon={PenLine} label={c.reflection}/>')
s=s.replace('<Quick to="/cliente/rede-academica/criar" icon={MessageCircle} label={c.question}/>', '<Quick to="/cliente/rede-academica/criar" search={{kind:"question"}} icon={MessageCircle} label={c.question}/>')
s=s.replace('<Quick to="/cliente/rede-academica/criar" icon={Camera} label={c.photo}/>', '<Quick to="/cliente/rede-academica/criar" search={{kind:"photo"}} icon={Camera} label={c.photo}/>')
s=s.replace('function Quick({to,icon:Icon,label}:any){return <Link to={to}', 'function Quick({to,search,icon:Icon,label}:any){return <Link to={to} search={search as any}')
s=s.replace('<DiscoveryStrip c={c} editorial={editorial} eFollow={eFollow}/>', '<DiscoveryStrip c={c} editorial={editorial} eFollow={eFollow} data={data} setCommunityId={setCommunityId}/>', 1)
s=s.replace('<DiscoveryStrip c={c} editorial={editorial} eFollow={eFollow}/>', '<DiscoveryStrip c={c} editorial={editorial} eFollow={eFollow} data={data} setCommunityId={setCommunityId}/>', 1)
start=s.find('function DiscoveryStrip(')
end=s.find('function DesktopRail(',start)
if start<0 or end<0: raise SystemExit('discovery strip boundaries missing')
replacement='''function DiscoveryStrip({c,editorial,eFollow,data,setCommunityId}:any){
 const people=(editorial?.suggestions??[]).slice(0,3);const communities=(data?.communities??[]).slice(0,2);const article=editorial?.articles?.[0];const topics=[...new Set((editorial?.posts??[]).flatMap((p:any)=>p.topics??[]))].slice(0,4) as string[];
 if(!people.length&&!communities.length&&!article)return null;
 return <section className="my-4 space-y-4 rounded-2xl border bg-gradient-to-br from-[#f8fbff] to-[#fffaf0] p-4 dark:from-slate-900 dark:to-slate-950">
  {!!people.length&&<div><div className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-[#b78927]"/><b className="text-xs">{c.people}</b></div><div className="mt-3 grid gap-2 sm:grid-cols-3">{people.map((p:any)=><div key={p.id} className="rounded-xl bg-background/80 p-3"><Link to="/cliente/rede-academica/perfil-editorial/$username" params={{username:p.username}} className="text-xs font-black hover:underline">{p.display_name}</Link><p className="mt-1 text-[9px] text-muted-foreground">{FLAG[p.country]||"🌍"} {p.specialty}</p><button onClick={()=>eFollow.mutate(p.id)} className="mt-2 min-h-8 rounded-full border px-3 text-[9px] font-black">{c.follow}</button></div>)}</div></div>}
  {!!communities.length&&<div className="border-t pt-3"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#b78927]"/><b className="text-xs">{c.communities}</b></div><div className="mt-2 flex flex-wrap gap-2">{communities.map((x:any)=><button key={x.id} onClick={()=>setCommunityId?.(x.id)} className="min-h-9 rounded-full bg-background px-3 text-[9px] font-black">{x.name}</button>)}<Link to="/cliente/rede-academica" search={{tab:"communities"} as any} className="flex min-h-9 items-center rounded-full border px-3 text-[9px] font-black">{c.seeAll}</Link></div></div>}
  {!!topics.length&&<div className="border-t pt-3"><b className="text-xs">{c.discussions}</b><div className="mt-2 flex flex-wrap gap-2">{topics.map((x:string)=><Link key={x} to="/cliente/rede-academica/buscar" search={{q:x} as any} className="rounded-full bg-background px-3 py-2 text-[9px] font-black text-[#315b80]">#{x.replace(/\\s+/g,"")}</Link>)}</div></div>}
  {article&&<Link to="/cliente/rede-academica/artigo-editorial/$slug" params={{slug:article.slug}} className="block border-t pt-3"><span className="text-[9px] font-black text-[#9a772c]">{c.featuredArticle}</span><b className="mt-1 block font-serif text-base leading-5">{article.title}</b><span className="mt-2 block text-[9px] font-black text-[#07315a] dark:text-[#efc56d]">{c.read}</span></Link>}
 </section>}
'''
s=s[:start]+replacement+s[end:]
feed.write_text(s)
'''
