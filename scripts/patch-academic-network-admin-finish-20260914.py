from pathlib import Path

server = Path('apps/painel-ldr/src/lib/academic-network.server.ts')
functions = Path('apps/painel-ldr/src/lib/academic-network.functions.ts')
admin = Path('apps/painel-ldr/src/routes/_authenticated/admin.rede-academica.tsx')

s = server.read_text()
f = functions.read_text()
a = admin.read_text()

def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Expected pattern not found for {label}: {old[:160]!r}')
    return text.replace(old, new, 1)

old_admin_fn = 'export async function getAcademicAdmin(userId:string){ await requireAdmin(userId); const [{data:posts},{data:comments},{data:reports},{data:communities}]=await Promise.all([db.from("academic_posts").select("id,user_id,body,post_type,anonymous,status,is_pinned,created_at").order("created_at",{ascending:false}).limit(150),db.from("academic_comments").select("id,post_id,user_id,body,anonymous,status,created_at").order("created_at",{ascending:false}).limit(200),db.from("academic_reports").select("id,reporter_user_id,post_id,comment_id,reason,details,status,created_at").order("created_at",{ascending:false}).limit(200),db.from("academic_communities").select("id,slug,name,active").order("name")]); return {posts:posts??[],comments:comments??[],reports:reports??[],communities:communities??[]}; }'
new_admin_fn = '''export async function getAcademicAdmin(userId:string){
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
}'''
s = replace_once(s, old_admin_fn, new_admin_fn, 'getAcademicAdmin')

append_role = '''\nexport async function setAcademicProfileRole(userId:string,input:{profileId:string;role:"member"|"student"|"professor"|"mentor"}){
  await requireAdmin(userId);
  const allowed=new Set(["member","student","professor","mentor"]);
  if(!allowed.has(input.role))fail("Função acadêmica inválida.");
  const {data,error}=await db.from("academic_profiles").update({display_role:input.role,updated_at:new Date().toISOString()}).eq("id",input.profileId).select("id,display_role").maybeSingle();
  if(error||!data)fail("Perfil acadêmico não encontrado.");
  return data;
}\n'''
if 'export async function setAcademicProfileRole' not in s:
    s += append_role

f += '\nexport const academicSetProfileRole=createServerFn({method:"POST"}).middleware(auth).inputValidator((data:{profileId:string;role:"member"|"student"|"professor"|"mentor"})=>data).handler(async({context,data})=>(await import("@/lib/academic-network.server")).setAcademicProfileRole(context.userId,data));\n'

# Admin UI: import and wire role management.
a = replace_once(a,
'import { Eye, EyeOff, Flag, Pin, PinOff, ShieldCheck } from "lucide-react";',
'import { Eye, EyeOff, Flag, Pin, PinOff, ShieldCheck, UserCog } from "lucide-react";',
'admin icons')
a = replace_once(a,
'import { academicAdminSnapshot, academicModerate } from "@/lib/academic-network.functions";',
'import { academicAdminSnapshot, academicModerate, academicSetProfileRole } from "@/lib/academic-network.functions";',
'admin functions import')
a = replace_once(a,
'  const access=useAccess(); const qc=useQueryClient(); const snapshot=useServerFn(academicAdminSnapshot), moderateFn=useServerFn(academicModerate);',
'  const access=useAccess(); const qc=useQueryClient(); const snapshot=useServerFn(academicAdminSnapshot), moderateFn=useServerFn(academicModerate), setRoleFn=useServerFn(academicSetProfileRole);',
'admin server functions')
a = replace_once(a,
'  const moderate=useMutation({mutationFn:(x:{kind:"post"|"comment"|"report";id:string;action:"hide"|"restore"|"pin"|"unpin"|"resolve"|"dismiss"})=>moderateFn({data:x}),onSuccess:()=>qc.invalidateQueries({queryKey:["academic-network-admin"]})});',
'  const moderate=useMutation({mutationFn:(x:{kind:"post"|"comment"|"report";id:string;action:"hide"|"restore"|"pin"|"unpin"|"resolve"|"dismiss"})=>moderateFn({data:x}),onSuccess:()=>qc.invalidateQueries({queryKey:["academic-network-admin"]})});\n  const setRole=useMutation({mutationFn:(x:{profileId:string;role:"member"|"student"|"professor"|"mentor"})=>setRoleFn({data:x}),onSuccess:()=>qc.invalidateQueries({queryKey:["academic-network-admin"]})});',
'admin role mutation')
a = replace_once(a,
'    <section className="grid gap-4 sm:grid-cols-3"><Stat title="Publicações" value={data.posts?.length??0}/><Stat title="Comentários" value={data.comments?.length??0}/><Stat title="Denúncias abertas" value={activeReports.length}/></section>',
'    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat title="Publicações" value={data.posts?.length??0}/><Stat title="Comentários" value={data.comments?.length??0}/><Stat title="Denúncias abertas" value={activeReports.length}/><Stat title="Perfis acadêmicos" value={data.profiles?.length??0}/></section>',
'admin stats')

comments_section = '''\n    <section className="rounded-2xl border bg-card p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/><h2 className="text-lg font-bold">Comentários recentes</h2></div><div className="mt-4 space-y-3">{data.comments?.length?data.comments.slice(0,80).map((c:any)=><div key={c.id} className="rounded-xl border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 text-[10px] font-black"><span className="rounded-full bg-muted px-2 py-1">{c.status}</span>{c.anonymous&&<span className="rounded-full bg-muted px-2 py-1">ANÔNIMO</span>}</div><p className="mt-2 whitespace-pre-wrap break-words text-sm">{c.body}</p><p className="mt-2 text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p></div><div className="flex flex-wrap gap-2">{c.status==="active"?<button title="Ocultar comentário" onClick={()=>moderate.mutate({kind:"comment",id:c.id,action:"hide"})} className="rounded-lg border p-2"><EyeOff className="h-4 w-4"/></button>:<button title="Restaurar comentário" onClick={()=>moderate.mutate({kind:"comment",id:c.id,action:"restore"})} className="rounded-lg border p-2"><Eye className="h-4 w-4"/></button>}</div></div></div>):<p className="text-sm text-muted-foreground">Nenhum comentário publicado.</p>}</div></section>\n'''
profiles_section = '''\n    <section className="rounded-2xl border bg-card p-5"><div className="flex items-center gap-2"><UserCog className="h-5 w-5"/><h2 className="text-lg font-bold">Perfis e funções acadêmicas</h2></div><p className="mt-1 text-xs text-muted-foreground">Defina quem aparece como Membro, Aluno, Professor ou Mentor. Esta função é visual dentro da Rede e não altera permissões administrativas do sistema.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{data.profiles?.length?data.profiles.map((p:any)=><div key={p.id} className="rounded-xl border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><b className="block truncate text-sm">{p.name}</b><p className="mt-1 truncate text-xs text-muted-foreground">{p.profession||"Profissão não informada"}</p></div><select value={p.display_role} disabled={setRole.isPending} onChange={e=>setRole.mutate({profileId:p.id,role:e.target.value as "member"|"student"|"professor"|"mentor"})} className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-bold sm:w-auto"><option value="member">MEMBRO</option><option value="student">ALUNO</option><option value="professor">PROFESSOR</option><option value="mentor">MENTOR</option></select></div></div>):<p className="text-sm text-muted-foreground">Nenhum perfil acadêmico criado ainda.</p>}</div></section>\n'''
anchor = '    <section className="rounded-2xl border bg-card p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/><h2 className="text-lg font-bold">Publicações recentes</h2></div>'
if anchor not in a:
    raise SystemExit('Publications anchor not found')
a = a.replace(anchor, comments_section + profiles_section + anchor, 1)

server.write_text(s)
functions.write_text(f)
admin.write_text(a)
print('Academic network admin finish patch applied safely.')
