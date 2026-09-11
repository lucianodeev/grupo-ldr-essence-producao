from pathlib import Path

# Enforce the first launch month by default while preserving environment overrides.
p=Path('apps/painel-ldr/src/lib/psychoanalysis-commerce.server.ts')
s=p.read_text(encoding='utf-8')
old='function promoState(){const configuredStart=process.env.PSYCHOANALYSIS_LAUNCH_START;const configuredEnd=process.env.PSYCHOANALYSIS_LAUNCH_END;const now=Date.now();if(configuredStart||configuredEnd){const start=configuredStart?Date.parse(configuredStart):0;const end=configuredEnd?Date.parse(configuredEnd):Number.MAX_SAFE_INTEGER;return {active:now>=start&&now<=end,start:configuredStart??null,end:configuredEnd??null};}return {active:true,start:null,end:null};}'
new='function promoState(){const configuredStart=process.env.PSYCHOANALYSIS_LAUNCH_START;const configuredEnd=process.env.PSYCHOANALYSIS_LAUNCH_END;const defaultStart="2026-09-11T00:00:00Z";const defaultEnd="2026-10-11T23:59:59Z";const startText=configuredStart||defaultStart;const endText=configuredEnd||defaultEnd;const start=Date.parse(startText);const end=Date.parse(endText);const now=Date.now();return {active:now>=start&&now<=end,start:startText,end:endText};}'
if old not in s: raise SystemExit('promoState anchor not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Mirror the lesson progress to the existing server-side learning progress store.
p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.psicanalise.tsx')
s=p.read_text(encoding='utf-8')
imp='import { clientSaveProgress } from "@/lib/learning.functions";\n'
if imp not in s:
    s=s.replace('import { clientCreatePsychoanalysisCheckout, clientPsychoanalysisOffer } from "@/lib/psychoanalysis-commerce.functions";\n','import { clientCreatePsychoanalysisCheckout, clientPsychoanalysisOffer } from "@/lib/psychoanalysis-commerce.functions";\n'+imp)
old=' const offerFn=useServerFn(clientPsychoanalysisOffer);const checkoutFn=useServerFn(clientCreatePsychoanalysisCheckout);'
new=' const offerFn=useServerFn(clientPsychoanalysisOffer);const checkoutFn=useServerFn(clientCreatePsychoanalysisCheckout);const saveProgressFn=useServerFn(clientSaveProgress);'
if old not in s: raise SystemExit('server functions anchor not found')
s=s.replace(old,new,1)
old=' const persist=(next:Saved)=>{setState(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}};'
new=' const persist=(next:Saved)=>{setState(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}const pct=Math.round((next.completed.length/PSYCHOANALYSIS_TOTAL_LESSONS)*100);const m=psychoanalysisModules[Math.min(next.module,psychoanalysisModules.length-1)];const l=m.lessons[Math.min(next.lesson,m.lessons.length-1)];saveProgressFn({data:{productKey:"formacao_psicanalise",progressPercent:pct,currentLocation:`Módulo ${m.id} · ${l.title}`}}).catch(()=>undefined);};'
if old not in s: raise SystemExit('persist anchor not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
