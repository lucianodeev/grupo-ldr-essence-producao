from pathlib import Path

root = Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.tsx')
s = root.read_text()

# Allow direct links to the private diary/profile/community tabs without changing the default feed behavior.
s = s.replace(
    'export const Route=createFileRoute("/_clientarea/cliente/rede-academica")({component:AcademicNetworkPage});',
    'export const Route=createFileRoute("/_clientarea/cliente/rede-academica")({validateSearch:(search:Record<string,unknown>)=>({tab:typeof search.tab==="string"?search.tab:undefined}),component:AcademicNetworkPage});'
)
s = s.replace(
    '  const qc=useQueryClient();\n',
    '  const qc=useQueryClient(); const routeSearch=Route.useSearch();\n',
    1
)
s = s.replace(
    '  const [tab,setTab]=useState<Tab>("feed"); const [communityId,setCommunityId]=useState(""); const [search,setSearch]=useState("");',
    '  const initialTab=(routeSearch.tab==="communities"||routeSearch.tab==="diary"||routeSearch.tab==="saved"||routeSearch.tab==="profile"?routeSearch.tab:"feed") as Tab;\n  const [tab,setTab]=useState<Tab>(initialTab); const [communityId,setCommunityId]=useState(""); const [search,setSearch]=useState("");'
)

# Reuse the existing translated navigation labels instead of fixed Portuguese labels.
s = s.replace('>CRIAR</Link>', '>{locale==="pt"?"CRIAR":locale==="en"?"CREATE":locale==="fr"?"CRÉER":"CREAR"}</Link>')
s = s.replace('>BUSCAR</Link>', '>{locale==="pt"?"BUSCAR":locale==="en"?"SEARCH":locale==="fr"?"RECHERCHER":"BUSCAR"}</Link>')
s = s.replace('>NOTIFICAÇÕES</Link>', '>{locale==="pt"?"NOTIFICAÇÕES":locale==="en"?"NOTIFICATIONS":locale==="fr"?"NOTIFICATIONS":"NOTIFICACIONES"}</Link>')
s = s.replace('>DESAFIOS</Link>', '>{locale==="pt"?"DESAFIOS":locale==="en"?"CHALLENGES":locale==="fr"?"DÉFIS":"DESAFÍOS"}</Link>')
s = s.replace('>SALVOS</Link>', '>{t.saved}</Link>')
s = s.replace('<MobileAcademicNav tab={tab} setTab={setTab} />', '<MobileAcademicNav tab={tab} setTab={setTab} t={t} locale={locale} />')
s = s.replace('function MobileAcademicNav({tab,setTab}:any){', 'function MobileAcademicNav({tab,setTab,t,locale}:any){')
s = s.replace('<span className="whitespace-nowrap">INÍCIO</span>', '<span className="whitespace-nowrap">{locale==="pt"?"INÍCIO":locale==="en"?"HOME":locale==="fr"?"ACCUEIL":"INICIO"}</span>')
s = s.replace('<span className="whitespace-nowrap">COMUNIDADES</span>', '<span className="whitespace-nowrap">{t.communities}</span>')
s = s.replace('<span className="whitespace-nowrap">CRIAR</span>', '<span className="whitespace-nowrap">{locale==="pt"?"CRIAR":locale==="en"?"CREATE":locale==="fr"?"CRÉER":"CREAR"}</span>')
s = s.replace('<span className="whitespace-nowrap">NOTIFICAÇÕES</span>', '<span className="whitespace-nowrap">{locale==="pt"?"NOTIFICAÇÕES":locale==="en"?"NOTIFICATIONS":locale==="fr"?"NOTIFICATIONS":"NOTIFICACIONES"}</span>')
s = s.replace('<span className="whitespace-nowrap">PERFIL</span>', '<span className="whitespace-nowrap">{locale==="pt"?"PERFIL":locale==="en"?"PROFILE":locale==="fr"?"PROFIL":"PERFIL"}</span>')
s = s.replace('aria-label="Navegação móvel da Rede Acadêmica"', 'aria-label={locale==="pt"?"Navegação móvel da Rede Acadêmica":locale==="en"?"Academic Network mobile navigation":locale==="fr"?"Navigation mobile du Réseau Académique":"Navegación móvil de la Red Académica"}')
root.write_text(s)

server = Path('apps/painel-ldr/src/lib/academic-social-v2.server.ts')
s = server.read_text()
old = '''  return {profile:{id:p.id,username:p.username,name:p.show_name===false?"Membro LDR":await baseName(p.user_id),avatarUrl:await signedAvatar(p.avatar_path),bio:p.bio,profession:p.profession,role:p.display_role,country:p.show_location?p.country:"",city:p.show_location?p.city:"",interests:p.interests??[],courses:p.courses??[],own,followed:followRow?.status==="accepted",followStatus:followRow?.status??null,followers:followers??0,following:following??0,postCount:postCount??0,articleCount:articleCount??0},posts:posts??[],articles:articles??[]};'''
new = '''  const postRows=posts??[]; const postIds=postRows.map((x:any)=>x.id);\n  const {data:mediaRows}=postIds.length?await db.from("academic_post_media").select("id,post_id,storage_path,alt_text,mime_type,sort_order").in("post_id",postIds).order("sort_order"):{data:[]};\n  const mediaPaths=[...new Set((mediaRows??[]).map((x:any)=>x.storage_path).filter(Boolean))]; const mediaUrlMap=new Map<string,string>();\n  if(mediaPaths.length){const {data:signed}=await db.storage.from("academic-network").createSignedUrls(mediaPaths,3600);(signed??[]).forEach((x:any,i:number)=>{if(x?.signedUrl)mediaUrlMap.set(mediaPaths[i],x.signedUrl)});}\n  const mediaByPost=new Map<string,any[]>(); for(const m of mediaRows??[]){const list=mediaByPost.get(m.post_id)??[];list.push({id:m.id,url:mediaUrlMap.get(m.storage_path)??null,altText:m.alt_text,mimeType:m.mime_type});mediaByPost.set(m.post_id,list)}\n  const safePosts=postRows.map((x:any)=>({...x,media:mediaByPost.get(x.id)??[]}));\n  return {profile:{id:p.id,username:p.username,name:p.show_name===false?"Membro LDR":await baseName(p.user_id),avatarUrl:await signedAvatar(p.avatar_path),bio:p.bio,profession:p.profession,role:p.display_role,country:p.show_location?p.country:"",city:p.show_location?p.city:"",interests:p.interests??[],courses:p.courses??[],own,followed:followRow?.status==="accepted",followStatus:followRow?.status??null,followers:followers??0,following:following??0,postCount:postCount??0,articleCount:articleCount??0},posts:safePosts,articles:articles??[]};'''
if old not in s:
    raise SystemExit('social profile return anchor not found')
s = s.replace(old,new)
server.write_text(s)
