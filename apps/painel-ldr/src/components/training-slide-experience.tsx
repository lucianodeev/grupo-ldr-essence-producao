import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, GraduationCap, LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Locale="pt"|"en"|"fr"|"es";

type Props={
  locale:Locale;
  c:Record<string,string>;
  currentLesson:any;
  currentState:any;
  selectedDay:number;
  unlockedDay:number;
  curriculum:any[];
  activities:Record<string,any>;
  currentComplete:boolean;
  dark:boolean;
  card:string;
  soft:string;
  input:string;
  updateDay:(mutator:(draft:any)=>any)=>void;
  persist:(markComplete?:boolean)=>void;
  goDay:(day:number)=>void;
  savePending:boolean;
  syncLabel:string;
  isDayComplete:(value?:any)=>boolean;
};

function t(locale:Locale,values:Record<Locale,string>){return values[locale]}

export function TrainingSlideExperience({locale,c,currentLesson,currentState,selectedDay,unlockedDay,curriculum,activities,currentComplete,dark,card,soft,input,updateDay,persist,goDay,savePending,syncLabel,isDayComplete}:Props){
  const [step,setStep]=useState(0);
  useEffect(()=>setStep(0),[selectedDay]);
  const objectiveQuestions=useMemo(()=>currentLesson.questions.filter((q:any)=>q.type==="objective"),[currentLesson]);
  const writtenQuestions=useMemo(()=>currentLesson.questions.filter((q:any)=>q.type==="written"),[currentLesson]);
  const slides=useMemo(()=>[
    {kind:"intro",label:t(locale,{pt:"Comece por aqui",en:"Start here",fr:"Commencez ici",es:"Empieza aquí"})},
    ...currentLesson.theory.map((text:string,i:number)=>({kind:"theory",label:`${c.reading} · ${i+1}/${currentLesson.theory.length}`,text})),
    {kind:"story",label:c.story,text:currentLesson.storyLens},
    {kind:"example",label:c.example,text:currentLesson.example},
    {kind:"field",label:c.field,text:currentLesson.activity},
    ...currentLesson.quiz.map((question:any,i:number)=>({kind:"quiz",label:`${c.quiz} · ${i+1}/${currentLesson.quiz.length}`,question})),
    ...objectiveQuestions.map((question:any,i:number)=>({kind:"objective",label:`${c.objective} · ${i+1}/${objectiveQuestions.length}`,question})),
    ...writtenQuestions.map((question:any,i:number)=>({kind:"written",label:`${c.written} · ${i+1}/${writtenQuestions.length}`,question})),
    {kind:"review",label:t(locale,{pt:"Revisão final",en:"Final review",fr:"Révision finale",es:"Revisión final"})},
  ],[currentLesson,objectiveQuestions,writtenQuestions,c,locale]);
  const safe=Math.min(Math.max(0,step),Math.max(0,slides.length-1));
  const slide:any=slides[safe];
  const pct=Math.round(((safe+1)/Math.max(1,slides.length))*100);
  const objectiveDone=Object.values(currentState.objectiveAnswers??{}).filter(Boolean).length;
  const writtenDone=Object.values(currentState.writtenAnswers??{}).filter((v:any)=>typeof v==="string"&&v.trim().length>=500&&v.length<=1000).length;
  const quizDone=Object.values(currentState.quizAnswers??{}).filter(v=>typeof v==="number").length;
  function move(delta:number){setStep(v=>Math.min(Math.max(0,v+delta),slides.length-1));window.setTimeout(()=>document.getElementById("lesson-slide-card")?.scrollIntoView({behavior:"smooth",block:"start"}),30)}

  return <>
    <section className={`rounded-3xl border p-4 ${card}`}>
      <div className="flex items-center justify-between gap-3">
        <button aria-label="Previous lesson" disabled={selectedDay<=1} onClick={()=>goDay(selectedDay-1)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border disabled:opacity-30"><ChevronLeft className="h-5 w-5"/></button>
        <div className="min-w-0 text-center"><p className="text-xs font-black uppercase tracking-[.14em] text-[#a67618]">{c.day} {selectedDay} · {c.month} {currentLesson.month}</p><h2 className="truncate font-serif text-xl font-bold sm:text-2xl">{currentLesson.title}</h2></div>
        <button aria-label="Next lesson" disabled={selectedDay>=unlockedDay} onClick={()=>goDay(selectedDay+1)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border disabled:opacity-30"><ChevronRight className="h-5 w-5"/></button>
      </div>
    </section>

    <section id="lesson-slide-card" className={`scroll-mt-4 overflow-hidden rounded-[2rem] border shadow-sm ${card}`}>
      <div className="border-b border-[#d7ad54]/35 bg-[#5b0824] px-4 py-4 text-white sm:px-6">
        <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[.14em] text-[#f2cf78]"><span>{slide?.label}</span><span>{safe+1}/{slides.length}</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#d7ad54] transition-all duration-300" style={{width:`${pct}%`}}/></div>
      </div>

      <div className="min-h-[420px] p-5 sm:min-h-[460px] sm:p-8">
        {slide?.kind==="intro"&&<div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-8 text-center sm:py-14"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#5b0824] text-[#f2cf78]"><GraduationCap className="h-8 w-8"/></div><p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-[#a67618]">{c.day} {selectedDay}</p><h3 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{currentLesson.title}</h3><p className="mt-4 max-w-2xl text-base leading-7 opacity-75">{t(locale,{pt:`Hoje vamos trabalhar ${currentLesson.theme}. Avance no seu ritmo; suas respostas são salvas enquanto você constrói a aula.`,en:`Today we will work on ${currentLesson.theme}. Move at your own pace; your answers are saved as you progress.`,fr:`Aujourd’hui, nous allons travailler ${currentLesson.theme}. Avancez à votre rythme ; vos réponses sont enregistrées pendant le parcours.`,es:`Hoy vamos a trabajar ${currentLesson.theme}. Avanza a tu ritmo; tus respuestas se guardan durante el recorrido.`})}</p></div>}

        {slide?.kind==="theory"&&<div className="mx-auto max-w-3xl"><div className="flex items-center gap-2 text-[#9e7119]"><BookOpen className="h-5 w-5"/><span className="text-xs font-black uppercase tracking-[.14em]">{slide.label}</span></div><h3 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">{currentLesson.theme}</h3><p className="mt-5 text-base leading-8 sm:text-lg">{slide.text}</p><div className={`mt-6 rounded-2xl p-4 text-sm leading-6 ${soft}`}>{t(locale,{pt:"Não precisa memorizar. Entenda a ideia e pense onde ela aparece no seu negócio.",en:"You do not need to memorize this. Understand the idea and notice where it appears in your business.",fr:"Pas besoin de mémoriser. Comprenez l’idée et observez où elle apparaît dans votre activité.",es:"No necesitas memorizar. Entiende la idea y observa dónde aparece en tu negocio."})}</div></div>}

        {slide?.kind==="story"&&<div className="mx-auto max-w-3xl"><p className="text-xs font-black uppercase tracking-[.15em] text-[#a67618]">{c.story}</p><h3 className="mt-2 font-serif text-3xl font-bold">{c.story}</h3><div className={`mt-6 rounded-3xl p-5 sm:p-6 ${soft}`}><p className="text-base leading-8 sm:text-lg">{slide.text}</p></div></div>}

        {slide?.kind==="example"&&<div className="mx-auto max-w-3xl"><p className="text-xs font-black uppercase tracking-[.15em] text-[#a67618]">{c.example}</p><h3 className="mt-2 font-serif text-3xl font-bold">{t(locale,{pt:"Veja na prática",en:"See it in practice",fr:"Voyez en pratique",es:"Míralo en la práctica"})}</h3><div className="mt-6 rounded-3xl border border-[#d7ad54]/60 p-5 sm:p-6"><p className="text-base leading-8 sm:text-lg">{slide.text}</p></div></div>}

        {slide?.kind==="field"&&<div className="mx-auto max-w-3xl"><div className="rounded-3xl bg-[#5b0824] p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[.15em] text-[#f2cf78]">{c.field}</p><h3 className="mt-2 font-serif text-3xl font-bold">{t(locale,{pt:"Agora leve para a realidade",en:"Now take it into reality",fr:"Passez maintenant à la réalité",es:"Ahora llévalo a la realidad"})}</h3><p className="mt-5 text-base leading-8 text-[#f7eadd] sm:text-lg">{slide.text}</p></div></div>}

        {slide?.kind==="quiz"&&<div className="mx-auto max-w-3xl"><p className="text-xs font-black uppercase tracking-[.15em] text-[#a67618]">{slide.label}</p><h3 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">{slide.question.prompt}</h3><div className="mt-6 grid gap-3">{slide.question.options.map((opt:string,i:number)=>{const selected=currentState.quizAnswers[slide.question.id];return <button key={opt} onClick={()=>updateDay(d=>({...d,quizAnswers:{...d.quizAnswers,[slide.question.id]:i}}))} className={`min-h-14 rounded-2xl border p-4 text-left text-sm font-semibold transition sm:text-base ${selected===i?(i===slide.question.correct?"border-emerald-500 bg-emerald-50 text-emerald-900":"border-rose-400 bg-rose-50 text-rose-900"):card}`}>{opt}</button>})}</div>{typeof currentState.quizAnswers[slide.question.id]==="number"?<p className="mt-4 text-sm font-bold opacity-70">{currentState.quizAnswers[slide.question.id]===slide.question.correct?t(locale,{pt:"✓ Resposta correta",en:"✓ Correct answer",fr:"✓ Bonne réponse",es:"✓ Respuesta correcta"}):t(locale,{pt:"Revise a ideia e tente compreender por quê.",en:"Review the idea and try to understand why.",fr:"Revoyez l’idée et cherchez à comprendre pourquoi.",es:"Revisa la idea e intenta comprender por qué."})}</p>:null}</div>}

        {slide?.kind==="objective"&&<div className="mx-auto max-w-3xl"><p className="text-xs font-black uppercase tracking-[.15em] text-[#a67618]">{slide.label}</p><h3 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">{slide.question.prompt}</h3>{slide.question.options?.length?<div className="mt-6 grid gap-3">{slide.question.options.map((opt:string)=><button key={opt} onClick={()=>updateDay(d=>({...d,objectiveAnswers:{...d.objectiveAnswers,[slide.question.id]:opt}}))} className={`min-h-14 rounded-2xl border p-4 text-left text-sm font-semibold transition sm:text-base ${currentState.objectiveAnswers[slide.question.id]===opt?"border-[#8a1739] bg-[#5b0824] text-white":card}`}>{opt}</button>)}</div>:<textarea value={currentState.objectiveAnswers[slide.question.id]??""} onChange={e=>updateDay(d=>({...d,objectiveAnswers:{...d.objectiveAnswers,[slide.question.id]:e.target.value}}))} className={`mt-6 min-h-32 w-full rounded-2xl border p-4 ${input}`}/>}<p className="mt-4 text-sm opacity-60">{objectiveDone}/7 {t(locale,{pt:"respondidas",en:"answered",fr:"répondues",es:"respondidas"})}</p></div>}

        {slide?.kind==="written"&&<div className="mx-auto max-w-3xl"><p className="text-xs font-black uppercase tracking-[.15em] text-[#a67618]">{slide.label}</p><h3 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">{slide.question.prompt}</h3><p className="mt-3 text-sm leading-6 opacity-65">{t(locale,{pt:"Pesquise, teste e responda com base no seu negócio. A resposta precisa ter entre 500 e 1.000 caracteres.",en:"Research, test and answer from your business context. Your response must contain 500 to 1,000 characters.",fr:"Recherchez, testez et répondez à partir de votre activité. La réponse doit contenir entre 500 et 1 000 caractères.",es:"Investiga, prueba y responde desde tu negocio. La respuesta debe tener entre 500 y 1.000 caracteres."})}</p><textarea maxLength={1000} value={currentState.writtenAnswers[slide.question.id]??""} onChange={e=>updateDay(d=>({...d,writtenAnswers:{...d.writtenAnswers,[slide.question.id]:e.target.value}}))} className={`mt-5 min-h-56 w-full rounded-2xl border p-4 leading-7 ${input}`} placeholder={t(locale,{pt:"Escreva sua análise, evidências, teste ou decisão concreta…",en:"Write your analysis, evidence, test or concrete decision…",fr:"Écrivez votre analyse, preuves, test ou décision concrète…",es:"Escribe tu análisis, evidencias, prueba o decisión concreta…"})}/><div className="mt-2 flex items-center justify-between text-xs font-bold"><span className={(currentState.writtenAnswers[slide.question.id]?.length??0)>=500?"text-emerald-600":"opacity-60"}>{currentState.writtenAnswers[slide.question.id]?.length??0}/1000</span><span className="opacity-60">{writtenDone}/3 {t(locale,{pt:"válidas",en:"valid",fr:"valides",es:"válidas"})}</span></div></div>}

        {slide?.kind==="review"&&<div className="mx-auto max-w-3xl"><div className="text-center"><div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${currentComplete?"bg-emerald-100 text-emerald-700":"bg-[#fff0d0] text-[#9e7119]"}`}><CheckCircle2 className="h-8 w-8"/></div><p className="mt-4 text-xs font-black uppercase tracking-[.15em] text-[#a67618]">{slide.label}</p><h3 className="mt-2 font-serif text-3xl font-bold">{t(locale,{pt:"Pronto para concluir?",en:"Ready to complete?",fr:"Prêt à terminer ?",es:"¿Listo para terminar?"})}</h3></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className={`rounded-2xl p-4 text-center ${soft}`}><strong className="text-2xl">{quizDone}/3</strong><p className="mt-1 text-xs font-bold opacity-65">Quiz</p></div><div className={`rounded-2xl p-4 text-center ${soft}`}><strong className="text-2xl">{objectiveDone}/7</strong><p className="mt-1 text-xs font-bold opacity-65">{c.objective}</p></div><div className={`rounded-2xl p-4 text-center ${soft}`}><strong className="text-2xl">{writtenDone}/3</strong><p className="mt-1 text-xs font-bold opacity-65">{c.written}</p></div></div>{!currentComplete?<div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{c.needAll}</div>:<div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">{t(locale,{pt:"Tudo pronto. Você pode concluir esta aula.",en:"Everything is ready. You can complete this lesson.",fr:"Tout est prêt. Vous pouvez terminer ce cours.",es:"Todo está listo. Puedes completar esta clase."})}</div>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={()=>persist(false)} disabled={savePending} className="min-h-12 rounded-2xl border border-[#8a1739] px-5 font-black text-[#8a1739] disabled:opacity-40">{c.saveDraft}</button><button onClick={()=>persist(true)} disabled={!currentComplete||savePending} className="min-h-12 rounded-2xl bg-[#5b0824] px-5 font-black text-white disabled:opacity-40">{c.finish}</button></div>{syncLabel?<p className="mt-3 text-center text-sm font-bold opacity-70">{syncLabel}</p>:null}</div>}
      </div>

      <div className={`border-t border-[#d7ad54]/35 p-4 sm:px-6 ${dark?"bg-[#1b1116]":"bg-[#fff8eb]"}`}>
        <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <button disabled={safe===0} onClick={()=>move(-1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d7ad54] px-4 font-bold disabled:opacity-30"><ChevronLeft className="h-4 w-4"/>{t(locale,{pt:"Anterior",en:"Previous",fr:"Précédent",es:"Anterior"})}</button>
          <span className="hidden text-xs font-black uppercase tracking-[.12em] opacity-50 sm:block">{pct}%</span>
          {safe<slides.length-1?<button onClick={()=>move(1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#5b0824] px-4 font-black text-white">{t(locale,{pt:"Próximo",en:"Next",fr:"Suivant",es:"Siguiente"})}<ChevronRight className="h-4 w-4"/></button>:<button onClick={()=>setStep(0)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d7ad54] px-4 font-bold">{c.review}<ChevronLeft className="h-4 w-4"/></button>}
        </div>
      </div>
    </section>

    <details className={`rounded-3xl border ${card}`}>
      <summary className="cursor-pointer list-none p-4 font-bold"><div className="flex items-center justify-between gap-3"><span>{t(locale,{pt:"Ver aulas liberadas",en:"View unlocked lessons",fr:"Voir les cours débloqués",es:"Ver clases desbloqueadas"})}</span><span className="text-xs opacity-55">{selectedDay}/{unlockedDay}</span></div></summary>
      <div className="border-t border-[#d7ad54]/30 p-4"><div className="grid grid-cols-6 gap-2 sm:grid-cols-10">{curriculum.map((l:any)=>{const enabled=l.day<=unlockedDay;const done=isDayComplete(activities[String(l.day)]);return <button key={l.day} disabled={!enabled} onClick={()=>goDay(l.day)} title={`${c.day} ${l.day} · ${l.title}`} className={`grid aspect-square min-h-9 place-items-center rounded-xl border text-xs font-black ${selectedDay===l.day?"border-[#5b0824] bg-[#5b0824] text-white":done?"border-emerald-400 bg-emerald-50 text-emerald-700":enabled?card:"opacity-30"}`}>{done?<CheckCircle2 className="h-4 w-4"/>:enabled?l.day:<LockKeyhole className="h-3 w-3"/>}</button>})}</div></div>
    </details>
  </>;
}
