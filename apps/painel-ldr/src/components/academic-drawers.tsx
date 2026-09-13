import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Gift, GraduationCap, X } from "lucide-react";
import { UNDERGRADUATE_COURSES } from "@/lib/undergraduate.catalog";
import { POSTGRADUATE_COURSES } from "@/lib/postgraduate-interest.catalog";
import { postgraduateCardTitle, undergraduateCardTitle } from "@/lib/library-card-i18n";

type Locale="pt"|"en"|"fr"|"es";

const COPY={
  pt:{free:"GRÁTIS",freeSub:"Cursos e conteúdos para começar agora",freeBadge:"ACESSO GRATUITO",freeTitle:"Cursos Gratuitos",freeIntro:"Comece agora sem pagar nada.",open:"ACESSAR CURSO",close:"Fechar",undergrad:"Graduação",undergradSub:"Cursos superiores · Em breve",postgrad:"Pós-graduação",postgradSub:"Especializações · Em breve",soon:"EM BREVE",hint:"Toque para ver todos"},
  en:{free:"FREE",freeSub:"Courses and content to start now",freeBadge:"FREE ACCESS",freeTitle:"Free Courses",freeIntro:"Start now at no cost.",open:"OPEN COURSE",close:"Close",undergrad:"Undergraduate",undergradSub:"Higher education · Coming soon",postgrad:"Postgraduate",postgradSub:"Specializations · Coming soon",soon:"COMING SOON",hint:"Tap to view all"},
  fr:{free:"GRATUIT",freeSub:"Cours et contenus pour commencer maintenant",freeBadge:"ACCÈS GRATUIT",freeTitle:"Cours gratuits",freeIntro:"Commencez maintenant gratuitement.",open:"OUVRIR LE COURS",close:"Fermer",undergrad:"Graduation",undergradSub:"Études supérieures · Bientôt",postgrad:"Post-graduation",postgradSub:"Spécialisations · Bientôt",soon:"BIENTÔT",hint:"Touchez pour tout afficher"},
  es:{free:"GRATIS",freeSub:"Cursos y contenidos para empezar ahora",freeBadge:"ACCESO GRATIS",freeTitle:"Cursos gratuitos",freeIntro:"Empieza ahora sin pagar nada.",open:"ABRIR CURSO",close:"Cerrar",undergrad:"Grado",undergradSub:"Educación superior · Próximamente",postgrad:"Posgrado",postgradSub:"Especializaciones · Próximamente",soon:"PRÓXIMAMENTE",hint:"Toca para ver todo"}
} as const;

const FREE_COURSES={
  pt:[
    {icon:"💼",title:"Como Organizar sua Carreira e Dar o Próximo Passo Profissional",meta:"7 aulas · 7 dias · acesso gratuito",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Francês Básico para Negócios — Nível A1",meta:"30 aulas · 10 horas · acesso gratuito",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Primeiros Socorros — Noções Básicas",meta:"30 aulas · 10 horas · acesso gratuito",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    {icon:"🛋️",title:"Clínica Psicanalítica: Sigmund Freud",meta:"120h · gratuito",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",tone:"#5b2b86"},
    {icon:"📚",title:"Orientação do Trabalho Científico",meta:"120h · gratuito",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",tone:"#0F5E7A"},
    {icon:"📄",title:"Modelos de Documentos Psicanalíticos",meta:"Conteúdo gratuito",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",tone:"#6F4E37"},
  ],
  en:[
    {icon:"💼",title:"Organize Your Career and Take the Next Professional Step",meta:"7 lessons · 7 days · free access",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Basic French for Business — Level A1",meta:"30 lessons · 10 hours · free access",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"First Aid — Basic Concepts",meta:"30 lessons · 10 hours · free access",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    {icon:"🛋️",title:"Psychoanalytic Clinic: Sigmund Freud",meta:"120h · free",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",tone:"#5b2b86"},
    {icon:"📚",title:"Scientific Work Guidance",meta:"120h · free",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",tone:"#0F5E7A"},
    {icon:"📄",title:"Psychoanalytic Document Models",meta:"Free content",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",tone:"#6F4E37"},
  ],
  fr:[
    {icon:"💼",title:"Organiser sa carrière et franchir la prochaine étape professionnelle",meta:"7 leçons · 7 jours · accès gratuit",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Français de base pour les affaires — Niveau A1",meta:"30 leçons · 10 heures · accès gratuit",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Premiers secours — Notions de base",meta:"30 leçons · 10 heures · accès gratuit",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    {icon:"🛋️",title:"Clinique psychanalytique : Sigmund Freud",meta:"120h · gratuit",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",tone:"#5b2b86"},
    {icon:"📚",title:"Orientation du travail scientifique",meta:"120h · gratuit",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",tone:"#0F5E7A"},
    {icon:"📄",title:"Modèles de documents psychanalytiques",meta:"Contenu gratuit",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",tone:"#6F4E37"},
  ],
  es:[
    {icon:"💼",title:"Cómo organizar tu carrera y dar el siguiente paso profesional",meta:"7 clases · 7 días · acceso gratis",href:"/cliente/biblioteca/curso-gratuito-carreira",tone:"#b85c2e"},
    {icon:"🇫🇷",title:"Francés básico para negocios — Nivel A1",meta:"30 clases · 10 horas · acceso gratis",href:"/cliente/cursos/frances-negocios-a1",tone:"#123f73"},
    {icon:"⛑️",title:"Primeros auxilios — Nociones básicas",meta:"30 clases · 10 horas · acceso gratis",href:"/cliente/cursos/primeiros-socorros",tone:"#b4232a"},
    {icon:"🛋️",title:"Clínica psicoanalítica: Sigmund Freud",meta:"120h · gratis",href:"/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",tone:"#5b2b86"},
    {icon:"📚",title:"Orientación del trabajo científico",meta:"120h · gratis",href:"/cliente/cursos/academy/orientacao-trabalho-cientifico",tone:"#0F5E7A"},
    {icon:"📄",title:"Modelos de documentos psicoanalíticos",meta:"Contenido gratis",href:"/cliente/cursos/academy/modelos-documentos-psicanaliticos",tone:"#6F4E37"},
  ]
} as const;

function Drawer({title,subtitle,children,hint}:{title:string;subtitle:string;children:React.ReactNode;hint:string}){
  return <details className="group overflow-hidden rounded-[22px] border border-[#d6ad63]/35 bg-white shadow-sm">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f4efe3] text-[#a77b2e]"><GraduationCap className="h-5 w-5"/></div>
        <div className="min-w-0"><h3 className="font-serif text-xl leading-tight text-[#0b2341]">{title}</h3><p className="mt-0.5 text-xs text-slate-500">{subtitle}</p></div>
      </div>
      <div className="flex shrink-0 items-center gap-2"><span className="hidden text-[10px] font-bold text-slate-400 sm:inline">{hint}</span><ChevronDown className="h-5 w-5 text-[#a77b2e] transition-transform group-open:rotate-180"/></div>
    </summary>
    <div className="border-t border-slate-100 bg-[#fffdf8] p-4 sm:p-5">{children}</div>
  </details>;
}

function FreeCoursesCatalogCard({locale}:{locale:Locale}){
  const t=COPY[locale];
  const freeCourses=FREE_COURSES[locale];
  const [target,setTarget]=useState<Element|null>(null);
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    const findTarget=()=>setTarget(document.querySelector("#catalogo-ldr .grid.grid-cols-4"));
    findTarget();
    const observer=new MutationObserver(findTarget);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    if(!open)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    window.addEventListener("keydown",onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)};
  },[open]);

  if(!target)return null;

  return <>
    {createPortal(<button type="button" onClick={()=>setOpen(true)} className="min-w-0 rounded-2xl bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#173f6b] px-1 py-4 text-center text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6ad63]" aria-haspopup="dialog" aria-expanded={open}>
      <Gift className="mx-auto h-5 w-5 text-[#d6ad63]"/>
      <p className="mt-2 text-[8px] font-black leading-tight sm:text-[10px]">{t.free}</p>
      <span className="mt-2 inline-flex rounded-full bg-[#d6ad63] px-1.5 py-0.5 text-[6px] font-black uppercase tracking-wide text-[#281605] sm:text-[7px]">{t.freeBadge}</span>
    </button>,target)}

    {open&&createPortal(<div className="fixed inset-0 z-[140] flex justify-end bg-[#071426]/65 backdrop-blur-sm" role="presentation" onMouseDown={(event)=>{if(event.currentTarget===event.target)setOpen(false)}}>
      <section role="dialog" aria-modal="true" aria-label={t.freeTitle} className="h-full w-full max-w-2xl overflow-y-auto bg-[#fffdf8] shadow-2xl sm:w-[min(92vw,720px)]">
        <header className="sticky top-0 z-10 border-b border-[#d6ad63]/25 bg-[#071426] px-5 py-5 text-white sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div><span className="inline-flex rounded-full bg-[#d6ad63] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#281605]">{t.freeBadge}</span><h2 className="mt-3 font-serif text-3xl text-white">{t.freeTitle}</h2><p className="mt-1 text-sm text-white/70">{t.freeIntro}</p></div>
            <button type="button" onClick={()=>setOpen(false)} aria-label={t.close} className="rounded-full border border-white/15 bg-white/10 p-2 text-white hover:bg-white/15"><X className="h-5 w-5"/></button>
          </div>
        </header>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          {freeCourses.map(course=><a key={course.href} href={course.href} className="group/card min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3"><span className="text-3xl">{course.icon}</span><span className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white" style={{backgroundColor:course.tone}}>{t.free}</span></div>
            <h3 className="mt-4 font-serif text-xl leading-snug text-[#0b2341]">{course.title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">{course.meta}</p>
            <span className="mt-4 inline-flex text-xs font-black" style={{color:course.tone}}>{t.open} →</span>
          </a>)}
        </div>
      </section>
    </div>,document.body)}
  </>;
}

export function AcademicDrawers({locale}:{locale:Locale}){
  const t=COPY[locale];
  const postgrads=Object.entries(POSTGRADUATE_COURSES);
  return <section className="space-y-3" aria-label={`${t.undergrad} e ${t.postgrad}`}>
    <style>{`#catalogo-ldr a[href="/cliente/cursos/organizar-carreira"],#catalogo-ldr a[href="/cliente/cursos/frances-negocios-a1"],#catalogo-ldr a[href="/cliente/cursos/primeiros-socorros"],#catalogo-ldr a[href="/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud"],#catalogo-ldr a[href="/cliente/cursos/academy/orientacao-trabalho-cientifico"],#catalogo-ldr a[href="/cliente/cursos/academy/modelos-documentos-psicanaliticos"]{display:none!important}`}</style>
    <FreeCoursesCatalogCard locale={locale}/>
    <Drawer title={t.undergrad} subtitle={t.undergradSub} hint={t.hint}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {UNDERGRADUATE_COURSES.map(course=><article key={course.key} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3"><span className="text-2xl">{course.icon}</span><span className="shrink-0 rounded-full bg-[#fff3d6] px-2.5 py-1 text-[9px] font-black tracking-wide text-[#8a611c]">{t.soon}</span></div>
          <h4 className="mt-3 break-normal font-serif text-lg leading-snug text-[#0b2341]">{undergraduateCardTitle(locale,course.key,course.title)}</h4>
          <p className="mt-2 text-xs text-slate-500">{course.years} {course.years===1?"ano":"anos"} · {course.semesters} semestres</p>
        </article>)}
      </div>
    </Drawer>
    <Drawer title={t.postgrad} subtitle={t.postgradSub} hint={t.hint}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {postgrads.map(([key,title],index)=><article key={key} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3"><span className="text-2xl">{["🤖","👥","🚀","💼","📈","🌍","🧠"][index]??"🎓"}</span><span className="shrink-0 rounded-full bg-[#fff3d6] px-2.5 py-1 text-[9px] font-black tracking-wide text-[#8a611c]">{t.soon}</span></div>
          <h4 className="mt-3 break-normal font-serif text-lg leading-snug text-[#0b2341]">{postgraduateCardTitle(locale,key,title)}</h4>
        </article>)}
      </div>
    </Drawer>
  </section>;
}
