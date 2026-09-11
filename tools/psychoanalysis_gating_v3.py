from pathlib import Path
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.psicanalise.tsx')
s=p.read_text(encoding='utf-8')
s=s.replace('Brasil · 12x de R$ 31,03','Brasil · R$ 372,36 · pagamento único')
s=s.replace('Agenda e gravações serão exibidas aqui conforme a turma.','Agenda e links dos encontros ao vivo serão exibidos aqui conforme o calendário.')
anchor='const mod=psychoanalysisModules[Math.min(state.module,psychoanalysisModules.length-1)];const lesson=mod.lessons[Math.min(state.lesson,mod.lessons.length-1)];'
repl=anchor+'\n const maxUnlockedLesson=Math.max(1,Math.min(PSYCHOANALYSIS_TOTAL_LESSONS,Number(offer?.maxUnlockedLesson??1)));\n const currentGlobalIndex=psychoanalysisModules.slice(0,state.module).reduce((sum,m)=>sum+m.lessons.length,0)+state.lesson;\n const nextLocked=currentGlobalIndex+1>=maxUnlockedLesson;'
if anchor not in s: raise SystemExit('course state anchor missing')
s=s.replace(anchor,repl,1)
old='{psychoanalysisModules.map((m,mi)=>{const completedCount=m.lessons.filter(l=>state.completed.includes(l.id)).length;return <button key={m.id} onClick={()=>persist({...state,module:mi,lesson:0})} className={`w-full rounded-xl px-3 py-3 text-left ${state.module===mi?"bg-[#4b2077] text-white":"hover:bg-[#f4eef9]"}`}><span className="block text-[10px] font-black uppercase tracking-[.12em] opacity-70">Módulo {String(m.id).padStart(2,"0")} · {completedCount}/{m.lessons.length}</span><span className="mt-1 block text-sm font-bold leading-5">{m.title}</span></button>})}'
new='{psychoanalysisModules.map((m,mi)=>{const completedCount=m.lessons.filter(l=>state.completed.includes(l.id)).length;const firstIndex=psychoanalysisModules.slice(0,mi).reduce((sum,x)=>sum+x.lessons.length,0);const locked=firstIndex>=maxUnlockedLesson;return <button key={m.id} disabled={locked} onClick={()=>persist({...state,module:mi,lesson:0})} className={`w-full rounded-xl px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-40 ${state.module===mi?"bg-[#4b2077] text-white":"hover:bg-[#f4eef9]"}`}><span className="block text-[10px] font-black uppercase tracking-[.12em] opacity-70">Módulo {String(m.id).padStart(2,"0")} · {completedCount}/{m.lessons.length}{locked?" · libera ao longo do percurso":""}</span><span className="mt-1 block text-sm font-bold leading-5">{m.title}</span></button>})}'
if old not in s: raise SystemExit('module buttons anchor missing')
s=s.replace(old,new,1)
old='<button onClick={next} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5b2b86] px-4 py-2 text-sm font-black text-white">Próxima<ChevronRight className="h-4 w-4"/></button>'
new='<button onClick={next} disabled={nextLocked} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5b2b86] px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{nextLocked?"Próxima aula libera no próximo dia":"Próxima"}<ChevronRight className="h-4 w-4"/></button>'
if old not in s: raise SystemExit('next button anchor missing')
s=s.replace(old,new,1)
hero='''<span className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white">Conclusão mínima: 180 dias</span></div>'''
hero2='''<span className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white">Conclusão mínima: 180 dias</span>{offer.cohortNumber?<span className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white">Sua turma: PSICA-{String(offer.cohortNumber).padStart(3,"0")}</span>:null}</div>'''
if hero in s:s=s.replace(hero,hero2,1)
cert='''<p className="mt-1 text-xs leading-5 text-[#75677e]">Somente após 180 dias de matrícula e conclusão das atividades obrigatórias. Formação livre em Psicanálise · CBO 2515-50.</p></article>'''
cert2='''<p className="mt-1 text-xs leading-5 text-[#75677e]">Somente após 180 dias de matrícula e conclusão das atividades obrigatórias. Formação livre em Psicanálise · CBO 2515-50.</p><Link to="/cliente/treinamentos/psicanalise/certificado" className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-[#5b2b86] px-3 text-xs font-black text-white">{offer.certificateEligible?"Gerar certificado":"Ver requisitos"}</Link></article>'''
if cert not in s: raise SystemExit('certificate card anchor missing')
s=s.replace(cert,cert2,1)
p.write_text(s,encoding='utf-8')
