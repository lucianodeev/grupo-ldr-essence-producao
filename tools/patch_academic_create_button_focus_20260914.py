from pathlib import Path
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.rede-academica.tsx')
s=p.read_text()
desktop='''      <Link to="/cliente/rede-academica/criar" className="min-h-11 rounded-xl bg-[#07315a] px-4 py-3 text-[10px] font-black text-white"><Plus className="mr-1 inline h-4 w-4"/>{locale==="pt"?"CRIAR":locale==="en"?"CREATE":locale==="fr"?"CRÉER":"CREAR"}</Link>'''
desktop_new='''      <button type="button" onClick={()=>{setTab("feed");setTimeout(()=>{const el=document.getElementById("academic-composer");el?.scrollIntoView({behavior:"smooth",block:"center"});el?.querySelector<HTMLTextAreaElement>("textarea")?.focus()},0)}} className="min-h-11 rounded-xl bg-[#07315a] px-4 py-3 text-[10px] font-black text-white"><Plus className="mr-1 inline h-4 w-4"/>{locale==="pt"?"CRIAR":locale==="en"?"CREATE":locale==="fr"?"CRÉER":"CREAR"}</button>'''
mobile='''    <Link to="/cliente/rede-academica/criar" className="flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#d5ad55] px-0.5 text-[9px] font-black leading-none text-[#071426] shadow-sm"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#071426] text-[#efc56d]"><Plus className="h-5 w-5"/></span><span className="block max-w-full truncate whitespace-nowrap">{locale==="pt"?"CRIAR":locale==="en"?"CREATE":locale==="fr"?"CRÉER":"CREAR"}</span></Link>'''
mobile_new='''    <button type="button" onClick={()=>{setTab("feed");setTimeout(()=>{const el=document.getElementById("academic-composer");el?.scrollIntoView({behavior:"smooth",block:"center"});el?.querySelector<HTMLTextAreaElement>("textarea")?.focus()},0)}} className="flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-[#d5ad55] px-0.5 text-[9px] font-black leading-none text-[#071426] shadow-sm"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#071426] text-[#efc56d]"><Plus className="h-5 w-5"/></span><span className="block max-w-full truncate whitespace-nowrap">{locale==="pt"?"CRIAR":locale==="en"?"CREATE":locale==="fr"?"CRÉER":"CREAR"}</span></button>'''
if desktop not in s: raise SystemExit('desktop create anchor not found')
if mobile not in s: raise SystemExit('mobile create anchor not found')
s=s.replace(desktop,desktop_new).replace(mobile,mobile_new)
p.write_text(s)
print('create buttons now focus compact feed composer')
