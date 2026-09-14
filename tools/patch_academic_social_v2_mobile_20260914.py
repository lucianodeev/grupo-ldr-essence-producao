from pathlib import Path

route=Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.tsx')
chat=Path('apps/painel-ldr/src/components/academy-chatbot.tsx')
s=route.read_text(encoding='utf-8')

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'Expected pattern not found: {label}')
    s=s.replace(old,new,1)

rep('MessageCircle, Network, Search, Send, Shield, SlidersHorizontal, UserRound, Users',
    'Bell, MessageCircle, Network, Plus, Search, Send, Shield, SlidersHorizontal, UserRound, Users',
    'lucide imports')
rep('<nav aria-label="Academic network" className="grid grid-cols-5 overflow-hidden rounded-[24px] border bg-card shadow-sm">',
    '<nav aria-label="Academic network" className="hidden grid-cols-5 overflow-hidden rounded-[24px] border bg-card shadow-sm sm:grid">',
    'desktop nav hide mobile')
rep('<span className="block truncate sm:whitespace-normal">{label}</span>',
    '<span className="block whitespace-normal">{label}</span>',
    'remove nav truncate')
rep('{tab==="profile"&&<Profile t={t} data={data} profile={profile} respond={respond} connect={connect}/>} ',
    '{tab==="profile"&&<Profile t={t} data={data} profile={profile} respond={respond} connect={connect} setTab={setTab}/>} ',
    'profile setTab prop')
rep('<p className="pb-6 text-center text-[11px] leading-5 text-muted-foreground">{t.safety}</p>\n  </div>',
    '<p className="pb-6 text-center text-[11px] leading-5 text-muted-foreground">{t.safety}</p>\n    <MobileAcademicNav tab={tab} setTab={setTab} />\n  </div>',
    'mobile nav mount')
rep('!savedOnly&&<section className="rounded-[28px] border bg-card p-4 shadow-[0_10px_30px_rgba(7,20,38,.08)] sm:p-6">',
    '!savedOnly&&<section id="academic-composer" className="scroll-mt-24 rounded-[28px] border bg-card p-4 shadow-[0_10px_30px_rgba(7,20,38,.08)] sm:p-6">',
    'composer anchor')
rep('function Profile({t,data,profile,respond,connect}:any){',
    'function Profile({t,data,profile,respond,connect,setTab}:any){',
    'profile signature')
rep('<button onClick={()=>profile.mutate({bio,profession,country,city,interests:interests.split(",").map((x:string)=>x.trim()).filter(Boolean),showName,showLocation})} className="mt-5 min-h-11 w-full rounded-xl bg-[#07315a] px-4 text-xs font-black text-white sm:w-auto">{t.saveProfile}</button></section>',
    '<button onClick={()=>profile.mutate({bio,profession,country,city,interests:interests.split(",").map((x:string)=>x.trim()).filter(Boolean),showName,showLocation})} className="mt-5 min-h-11 w-full rounded-xl bg-[#07315a] px-4 text-xs font-black text-white sm:w-auto">{t.saveProfile}</button><div className="mt-5 border-t pt-5"><b className="text-sm">Minha Área</b><div className="mt-3 grid gap-2 sm:grid-cols-2"><button onClick={()=>setTab("diary")} className="min-h-11 rounded-xl border px-3 text-xs font-black">{t.diary}</button><button onClick={()=>setTab("saved")} className="min-h-11 rounded-xl border px-3 text-xs font-black">{t.saved}</button></div></div></section>',
    'profile private area')

insert='''\nfunction MobileAcademicNav({tab,setTab}:any){\n  const goCreate=()=>{setTab("feed");window.setTimeout(()=>document.getElementById("academic-composer")?.scrollIntoView({behavior:"smooth",block:"center"}),40)};\n  const item=(active:boolean)=>`flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[8px] font-black leading-none tracking-[-.02em] ${active?"bg-[#07315a] text-white":"text-foreground"}`;\n  return <nav aria-label="Navegação móvel da Rede Acadêmica" className="fixed inset-x-0 bottom-0 z-[100] grid grid-cols-5 gap-1 border-t bg-background/95 px-1 pt-1 shadow-[0_-8px_30px_rgba(7,20,38,.12)] backdrop-blur sm:hidden" style={{paddingBottom:"max(env(safe-area-inset-bottom), .35rem)"}}>\n    <button type="button" onClick={()=>setTab("feed")} className={item(tab==="feed")}><Home className={`h-5 w-5 ${tab==="feed"?"text-[#efc56d]":""}`}/><span className="whitespace-nowrap">INÍCIO</span></button>\n    <button type="button" onClick={()=>setTab("communities")} className={item(tab==="communities")}><Users className={`h-5 w-5 ${tab==="communities"?"text-[#efc56d]":""}`}/><span className="whitespace-nowrap">COMUNIDADES</span></button>\n    <button type="button" onClick={goCreate} className="flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#d5ad55] px-0.5 text-[8px] font-black leading-none text-[#071426] shadow-sm"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#071426] text-[#efc56d]"><Plus className="h-5 w-5"/></span><span className="whitespace-nowrap">CRIAR</span></button>\n    <Link to="/cliente/rede-academica/notificacoes" className={item(false)}><Bell className="h-5 w-5"/><span className="whitespace-nowrap">NOTIFICAÇÕES</span></Link>\n    <button type="button" onClick={()=>setTab("profile")} className={item(tab==="profile")}><UserRound className={`h-5 w-5 ${tab==="profile"?"text-[#efc56d]":""}`}/><span className="whitespace-nowrap">PERFIL</span></button>\n  </nav>\n}\n'''
marker='\nfunction HeroBenefit('
if marker not in s: raise SystemExit('Expected HeroBenefit marker')
s=s.replace(marker,insert+marker,1)
route.write_text(s,encoding='utf-8')

c=chat.read_text(encoding='utf-8')
old='<div className="fixed z-[95]" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))", right: "calc(1rem + env(safe-area-inset-right))" }}>'
new='<div className="fixed z-[95]" style={{ bottom: location.pathname.startsWith("/cliente/rede-academica") ? "calc(5.4rem + env(safe-area-inset-bottom))" : "calc(1rem + env(safe-area-inset-bottom))", right: "calc(1rem + env(safe-area-inset-right))" }}>'
if old not in c: raise SystemExit('Expected chatbot position pattern')
c=c.replace(old,new,1)
chat.write_text(c,encoding='utf-8')
