from pathlib import Path
import re
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.tsx')
s=p.read_text(encoding='utf-8')

def rep(old,new,label,required=True):
 global s
 if new in s:
  print('already',label);return
 if old not in s:
  if required: raise SystemExit('anchor missing: '+label)
  print('skip',label);return
 s=s.replace(old,new,1);print('patched',label)

rep('Bell, MessageCircle, Network, Plus, Search, Send, Shield, SlidersHorizontal, UserRound, Users','Bell, MapPin, MessageCircle, Network, Plus, Search, Send, Share2, Shield, SlidersHorizontal, UserRound, Users','social icons')

# Mobile center button goes to the fully validated new composer route.
s=s.replace('  const goCreate=()=>{setTab("feed");window.setTimeout(()=>document.getElementById("academic-composer")?.scrollIntoView({behavior:"smooth",block:"center"}),40)};\n','')
s=s.replace('<button type="button" onClick={goCreate} className="flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#d5ad55] px-0.5 text-[8px] font-black leading-none text-[#071426] shadow-sm"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#071426] text-[#efc56d]"><Plus className="h-5 w-5"/></span><span className="whitespace-nowrap">CRIAR</span></button>','<Link to="/cliente/rede-academica/criar" className="flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#d5ad55] px-0.5 text-[8px] font-black leading-none text-[#071426] shadow-sm"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#071426] text-[#efc56d]"><Plus className="h-5 w-5"/></span><span className="whitespace-nowrap">CRIAR</span></Link>',1)

# Desktop utility shortcuts, without replacing the existing tab navigation.
nav_end='''    </nav>\n'''
quick='''    </nav>\n    <div className="hidden flex-wrap items-center gap-2 sm:flex">\n      <Link to="/cliente/rede-academica/criar" className="min-h-11 rounded-xl bg-[#07315a] px-4 py-3 text-[10px] font-black text-white"><Plus className="mr-1 inline h-4 w-4"/>CRIAR</Link>\n      <Link to="/cliente/rede-academica/buscar" className="min-h-11 rounded-xl border bg-card px-4 py-3 text-[10px] font-black"><Search className="mr-1 inline h-4 w-4"/>BUSCAR</Link>\n      <Link to="/cliente/rede-academica/notificacoes" className="min-h-11 rounded-xl border bg-card px-4 py-3 text-[10px] font-black"><Bell className="mr-1 inline h-4 w-4"/>NOTIFICAÇÕES</Link>\n      <Link to="/cliente/rede-academica/desafios" className="min-h-11 rounded-xl border bg-card px-4 py-3 text-[10px] font-black">DESAFIOS</Link>\n      <Link to="/cliente/rede-academica/salvos" className="min-h-11 rounded-xl border bg-card px-4 py-3 text-[10px] font-black">SALVOS</Link>\n    </div>\n'''
# first </nav> is the main desktop network nav
if 'to="/cliente/rede-academica/desafios"' not in s:
 idx=s.find(nav_end,s.find('aria-label="Academic network"'))
 if idx<0: raise SystemExit('main nav end not found')
 idx2=idx+len(nav_end);s=s[:idx]+quick+s[idx2:];print('patched desktop shortcuts')

# Feed avatar and profile identity. Anonymous authors cannot generate profile links.
avatar_old='<div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f0f8] font-black text-[#07315a] dark:bg-slate-800 dark:text-slate-100">{String(p.author.name||"M").slice(0,1).toUpperCase()}</div>'
avatar_new='{p.author.avatarUrl?<img src={p.author.avatarUrl} alt="Avatar" loading="lazy" className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover"/>:<div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f0f8] font-black text-[#07315a] dark:bg-slate-800 dark:text-slate-100">{String(p.author.name||"M").slice(0,1).toUpperCase()}</div>}'
rep(avatar_old,avatar_new,'feed avatars',required=False)
name_old='<b className="truncate text-sm">{p.author.name}</b>'
name_new='{!p.author.anonymous&&p.author.username?<Link to="/cliente/rede-academica/perfil/$username" params={{username:p.author.username}} className="truncate text-sm font-bold hover:underline">{p.author.name}</Link>:<b className="truncate text-sm">{p.author.name}</b>}{p.author.username&&<span className="text-[10px] text-muted-foreground">@{p.author.username}</span>}'
rep(name_old,name_new,'feed profile links',required=False)

# Add location, responsive image and topics immediately after the post body.
if '{p.location_label&&' not in s:
 m=re.search(r'(<p className="[^"]*whitespace-pre-wrap[^"]*">\{p\.body\}</p>)',s)
 if m:
  extra=m.group(1)+'''{p.location_label&&<p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-4 w-4"/>{p.location_label}</p>}{(p.media??[]).map((m:any)=><img key={m.id} src={m.url} alt={m.altText||"Imagem da publicação"} loading="lazy" className="mt-4 max-h-[640px] w-full rounded-2xl bg-muted object-contain"/>)}{!!p.topics?.length&&<div className="mt-3 flex flex-wrap gap-2">{p.topics.map((topic:any)=><span key={topic.id} className="rounded-full border px-3 py-1 text-[10px] font-bold">#{topic.label}</span>)}</div>}'''
  s=s[:m.start()]+extra+s[m.end():];print('patched feed media/location/topics')
 else: print('skip feed body enrichment')

# Add individual post share link next to existing social actions.
if 'aria-label="Compartilhar publicação"' not in s:
 anchor='<button disabled={!premium} onClick={()=>{const reason=askReportReason();if(reason)report.mutate({postId:p.id,reason,details:`Denúncia enviada pela interface: ${reportReasonLabel[reason]}.`})}}'
 pos=s.find(anchor)
 if pos>=0:
  link='<Link aria-label="Compartilhar publicação" to="/cliente/rede-academica/post/$id" params={{id:p.id}} className="min-w-0 rounded-lg px-2 py-2 text-left font-bold hover:bg-muted/60"><span className="flex items-center gap-1"><Share2 className="h-4 w-4"/>Compartilhar</span></Link>'
  s=s[:pos]+link+s[pos:];print('patched feed share')
 else: print('skip feed share')

# Profile utility cards link to the dedicated secure pages.
if 'to="/cliente/rede-academica/editar-perfil"' not in s:
 marker='<b className="text-sm">Minha Área</b>'
 pos=s.find(marker)
 if pos>=0:
  end=pos+len(marker)
  insert='<div className="mt-3 grid gap-2"><Link to="/cliente/rede-academica/editar-perfil" className="flex min-h-11 items-center rounded-xl border px-3 text-xs font-black">EDITAR PERFIL SOCIAL</Link>{data.profile?.username&&<Link to="/cliente/rede-academica/perfil/$username" params={{username:data.profile.username}} className="flex min-h-11 items-center rounded-xl border px-3 text-xs font-black">VER MEU PERFIL PÚBLICO</Link>}<Link to="/cliente/rede-academica/salvos" className="flex min-h-11 items-center rounded-xl border px-3 text-xs font-black">SALVOS</Link></div>'
  s=s[:end]+insert+s[end:];print('patched profile social links')

# Diary -> reflection is intentionally a copy into sessionStorage; original diary row is untouched.
if 'ldr_academic_reflection_draft' not in s:
 m=re.search(r'(\{data\.diary\.map\(\(d:any\)=>.*?\{d\.body\}.*?)(</article>|</div>)',s,re.S)
 if m:
  before=m.group(1);closing=m.group(2)
  action='<button onClick={()=>{sessionStorage.setItem("ldr_academic_reflection_draft",d.body);window.location.href="/cliente/rede-academica/criar"}} className="mt-3 min-h-10 rounded-xl border px-3 text-[10px] font-black">TRANSFORMAR EM REFLEXÃO</button>'
  s=s[:m.start()]+before+action+closing+s[m.end():];print('patched diary transform')
 else: print('skip diary transform')

p.write_text(s,encoding='utf-8')

# New composer reads a private session-only diary draft, then deletes that copy.
c=Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.criar.tsx')
t=c.read_text(encoding='utf-8')
if 'useEffect, useRef' not in t:
 t=t.replace('import { useRef, useState } from "react";','import { useEffect, useRef, useState } from "react";')
if 'ldr_academic_reflection_draft' not in t:
 anchor=' const [kind,setKind]=useState<Kind>("reflection"),[body,setBody]=useState("")'
 idx=t.find(anchor)
 if idx<0: raise SystemExit('create composer state anchor missing')
 line_end=t.find(';\n',idx)+2
 effect=' useEffect(()=>{const draft=sessionStorage.getItem("ldr_academic_reflection_draft");if(draft){setKind("reflection");setBody(draft);sessionStorage.removeItem("ldr_academic_reflection_draft")}},[]);\n'
 t=t[:line_end]+effect+t[line_end:]
c.write_text(t,encoding='utf-8')
print('Academic social V2 UI patch ready.')
