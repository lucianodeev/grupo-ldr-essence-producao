import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, LockKeyhole } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getAcademySubscriptionCourse } from "@/lib/academy-subscription-courses.catalog";
import { clientLibraryCourseEntitlement } from "@/lib/library-subscription.functions";
import { clientSaveProgress } from "@/lib/learning.functions";

export const Route=createFileRoute("/_clientarea/cliente/cursos/assinatura/$slug")({component:Page});

type Locale="pt"|"en"|"fr"|"es";
const UI={
  pt:{badge:"INCLUÍDO NA ASSINATURA",module:"Módulo",progress:"Seu progresso",prev:"Anterior",next:"Próximo",done:"Marcar concluído",completed:"Concluído",topics:"Pontos de estudo",activity:"Atividade aplicada",materials:"Materiais complementares",certificate:(hours:number)=>`Certificado de ${hours} horas após a conclusão dos requisitos do curso.`,checking:"Verificando sua assinatura…",locked:"Este curso é exclusivo para assinantes da LDR Academy.",subscribe:"VER ASSINATURA",notFound:"Curso não encontrado.",hours:(hours:number)=>`${hours} horas · Curso Livre · 100% online`},
  en:{badge:"INCLUDED IN SUBSCRIPTION",module:"Module",progress:"Your progress",prev:"Previous",next:"Next",done:"Mark complete",completed:"Completed",topics:"Study points",activity:"Applied activity",materials:"Complementary materials",certificate:(hours:number)=>`${hours}-hour certificate after completing the course requirements.`,checking:"Checking your subscription…",locked:"This course is exclusive to LDR Academy subscribers.",subscribe:"VIEW SUBSCRIPTION",notFound:"Course not found.",hours:(hours:number)=>`${hours} hours · Non-degree course · 100% online`},
  fr:{badge:"INCLUS DANS L’ABONNEMENT",module:"Module",progress:"Votre progression",prev:"Précédent",next:"Suivant",done:"Marquer terminé",completed:"Terminé",topics:"Points d’étude",activity:"Activité appliquée",materials:"Matériels complémentaires",certificate:(hours:number)=>`Certificat de ${hours} heures après validation des exigences du cours.`,checking:"Vérification de votre abonnement…",locked:"Ce cours est réservé aux abonnés de la LDR Academy.",subscribe:"VOIR L’ABONNEMENT",notFound:"Cours introuvable.",hours:(hours:number)=>`${hours} heures · Cours libre · 100% en ligne`},
  es:{badge:"INCLUIDO EN LA SUSCRIPCIÓN",module:"Módulo",progress:"Tu progreso",prev:"Anterior",next:"Siguiente",done:"Marcar completado",completed:"Completado",topics:"Puntos de estudio",activity:"Actividad aplicada",materials:"Materiales complementarios",certificate:(hours:number)=>`Certificado de ${hours} horas tras completar los requisitos del curso.`,checking:"Verificando tu suscripción…",locked:"Este curso es exclusivo para suscriptores de LDR Academy.",subscribe:"VER SUSCRIPCIÓN",notFound:"Curso no encontrado.",hours:(hours:number)=>`${hours} horas · Curso libre · 100% online`},
} as const;

function Page(){
  const {slug}=Route.useParams();
  const {locale:raw}=useI18n();
  const locale=(raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as Locale;
  const u=UI[locale];
  const course=getAcademySubscriptionCourse(slug);
  const getEntitlement=useServerFn(clientLibraryCourseEntitlement);
  const saveProgress=useServerFn(clientSaveProgress);
  const [checking,setChecking]=useState(true);
  const [active,setActive]=useState(false);
  const [index,setIndex]=useState(0);
  const [done,setDone]=useState<number[]>([]);

  useEffect(()=>{
    let alive=true;
    if(!course){setChecking(false);return()=>{alive=false;};}\n    getEntitlement({data:{resourceKey:course.productKey}}).then((decision)=>{if(alive)setActive(Boolean(decision.allowed));}).catch(()=>{if(alive)setActive(false);}).finally(()=>{if(alive)setChecking(false);});
    return()=>{alive=false;};
  },[course,getEntitlement]);

  useEffect(()=>{
    if(!course)return;
    try{
      const saved=JSON.parse(localStorage.getItem(`ldr-subscription-course-${course.slug}`)||"{}");
      if(Array.isArray(saved.done))setDone(saved.done.filter((x:unknown)=>Number.isInteger(x)) as number[]);
      if(Number.isInteger(saved.index))setIndex(Math.max(0,Math.min(course.modules.length-1,saved.index)));
    }catch{}
  },[course]);

  const progress=useMemo(()=>course?Math.round(done.length/course.modules.length*100):0,[course,done]);
  if(!course)return <section className="s8-card">{u.notFound}</section>;
  if(checking)return <section className="s8-card">{u.checking}</section>;
  if(!active)return <section className="mx-auto max-w-2xl rounded-[28px] border bg-white p-8 text-center shadow-sm"><LockKeyhole className="mx-auto h-10 w-10 text-[#b18435]"/><h1 className="mt-4 font-serif text-3xl text-slate-900">{course.name[locale]}</h1><p className="mt-3 text-slate-600">{u.locked}</p><Link to="/cliente/biblioteca" className="mt-6 inline-flex rounded-xl bg-[#071426] px-5 py-3 font-black text-white">{u.subscribe}</Link></section>;

  const persist=(nextDone:number[],nextIndex=index)=>{
    setDone(nextDone);setIndex(nextIndex);
    try{localStorage.setItem(`ldr-subscription-course-${course.slug}`,JSON.stringify({done:nextDone,index:nextIndex}));}catch{}
    saveProgress({data:{productKey:course.productKey,progressPercent:Math.round(nextDone.length/course.modules.length*100),currentLocation:`${u.module} ${nextIndex+1}`}}).catch(()=>{});
  };
  const complete=()=>persist(done.includes(index)?done:[...done,index]);
  const next=()=>{const nextDone=done.includes(index)?done:[...done,index];persist(nextDone,Math.min(course.modules.length-1,index+1));};
  const module=course.modules[index];

  return <div className="space-y-5 pb-10">
    <section className="rounded-[28px] bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#163b67] p-6 text-white">
      <span className="rounded-full bg-[#d6ad63] px-3 py-1 text-xs font-black text-[#281605]">{u.badge}</span>
      <h1 className="mt-4 font-serif text-3xl text-[#fff7e7]">{course.name[locale]}</h1>
      <p className="mt-2 max-w-4xl text-white/80">{course.description[locale]}</p>
      <p className="mt-3 text-sm font-semibold text-white/70">{u.hours(course.hours)}</p>
      <p className="mt-2 text-sm text-[#f4d99a]">{u.certificate(course.hours)}</p>
      <div className="mt-5 max-w-sm"><div className="flex justify-between text-xs font-black"><span>{u.progress}</span><span>{progress}%</span></div><div className="mt-2 h-2 rounded-full bg-white/15"><div className="h-2 rounded-full bg-[#d6ad63]" style={{width:`${progress}%`}}/></div></div>
    </section>

    <section className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-2xl border bg-white p-3">
        <div className="space-y-2">{course.modules.map((m,i)=><button key={m.title} onClick={()=>setIndex(i)} className={`w-full rounded-xl px-3 py-3 text-left text-sm ${index===i?"bg-[#071426] text-white":"hover:bg-slate-50"}`}><b>{i+1}.</b> {m.title}{done.includes(i)?" ✓":""}</button>)}</div>
      </aside>
      <main>
        <article className="rounded-2xl border bg-white p-6">
          <p className="text-xs font-black text-[#a06f1c]">{u.module} {index+1}/{course.modules.length}</p>
          <h2 className="mt-3 font-serif text-3xl text-slate-900">{module.title}</h2>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5"><h3 className="font-black text-slate-900">{u.topics}</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">{module.topics.map(topic=><li key={topic}>{topic}</li>)}</ul></div>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-black text-amber-950">{u.activity}</h3><p className="mt-2 leading-7 text-amber-950/90">{module.activity}</p></div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-900">{u.materials}</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">{course.materials.map(item=><li key={item}>{item}</li>)}</ul></div>
          {course.disclaimer?<p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">{course.disclaimer[locale]}</p>:null}
          <div className="mt-7 flex flex-wrap justify-between gap-3 border-t pt-5">
            <button onClick={()=>setIndex(Math.max(0,index-1))} disabled={index===0} className="rounded-xl border px-4 py-2 disabled:opacity-30"><ChevronLeft className="mr-1 inline h-4 w-4"/>{u.prev}</button>
            <div className="flex gap-2"><button onClick={complete} className="rounded-xl border px-4 py-2 font-bold">{done.includes(index)?<><CheckCircle2 className="mr-1 inline h-4 w-4"/>{u.completed}</>:u.done}</button><button onClick={next} disabled={index===course.modules.length-1} className="rounded-xl bg-[#071426] px-4 py-2 font-black text-white disabled:opacity-40">{u.next}<ChevronRight className="ml-1 inline h-4 w-4"/></button></div>
          </div>
        </article>
      </main>
    </section>
  </div>;
}