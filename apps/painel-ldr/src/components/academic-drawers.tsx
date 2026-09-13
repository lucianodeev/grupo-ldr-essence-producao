import { ChevronDown, Gift, GraduationCap } from "lucide-react";
import { UNDERGRADUATE_COURSES } from "@/lib/undergraduate.catalog";
import { POSTGRADUATE_COURSES } from "@/lib/postgraduate-interest.catalog";
import { postgraduateCardTitle, undergraduateCardTitle } from "@/lib/library-card-i18n";

type Locale="pt"|"en"|"fr"|"es";

const COPY={
  pt:{free:"GRÁTIS",freeSub:"Cursos e conteúdos para começar agora",freeHint:"Toque para ver todos",freeBadge:"ACESSO GRATUITO",freeTitle:"Cursos Gratuitos",freeIntro:"Comece agora sem pagar nada.",open:"ACESSAR CURSO",undergrad:"Graduação",undergradSub:"Cursos superiores · Em breve",postgrad:"Pós-graduação",postgradSub:"Especializações · Em breve",soon:"EM BREVE",hint:"Toque para ver todos"},
  en:{free:"FREE",freeSub:"Courses and content to start now",freeHint:"Tap to view all",freeBadge:"FREE ACCESS",freeTitle:"Free Courses",freeIntro:"Start now at no cost.",open:"OPEN COURSE",undergrad:"Undergraduate",undergradSub:"Higher education · Coming soon",postgrad:"Postgraduate",postgradSub:"Specializations · Coming soon",soon:"COMING SOON",hint:"Tap to view all"},
  fr:{free:"GRATUIT",freeSub:"Cours et contenus pour commencer maintenant",freeHint:"Touchez pour tout afficher",freeBadge:"ACCÈS GRATUIT",freeTitle:"Cours gratuits",freeIntro:"Commencez maintenant gratuitement.",open:"OUVRIR LE COURS",undergrad:"Graduation",undergradSub:"Études supérieures · Bientôt",postgrad:"Post-graduation",postgradSub:"Spécialisations · Bientôt",soon:"BIENTÔT",hint:"Touchez pour tout afficher"},
  es:{free:"GRATIS",freeSub:"Cursos y contenidos para empezar ahora",freeHint:"Toca para ver todo",freeBadge:"ACCESO GRATIS",freeTitle:"Cursos gratuitos",freeIntro:"Empieza ahora sin pagar nada.",open:"ABRIR CURSO",undergrad:"Grado",undergradSub:"Educación superior · Próximamente",postgrad:"Posgrado",postgradSub:"Especializaciones · Próximamente",soon:"PRÓXIMAMENTE",hint:"Toca para ver todo"}
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

function Drawer({title,subtitle,children,hint,free=false}:{title:string;subtitle:string;children:React.ReactNode;hint:string;free?:boolean}){
  return <details className={`group overflow-hidden rounded-[22px] border bg-white shadow-sm ${free?"border-[#d6ad63]/60":"border-[#d6ad63]/35"}`}>
    <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden ${free?"bg-gradient-to-r from-[#071426] via-[#0b2341] to-[#173f6b] text-white":""}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${free?"bg-[#d6ad63] text-[#281605]":"bg-[#f4efe3] text-[#a77b2e]"}`}>{free?<Gift className="h-5 w-5"/>:<GraduationCap className="h-5 w-5"/>}</div>
        <div className="min-w-0"><h3 className={`font-serif text-xl leading-tight ${free?"text-white":"text-[#0b2341]"}`}>{title}</h3><p className={`mt-0.5 text-xs ${free?"text-white/70":"text-slate-500"}`}>{subtitle}</p></div>
      </div>
      <div className="flex shrink-0 items-center gap-2"><span className={`hidden text-[10px] font-bold sm:inline ${free?"text-[#d6ad63]":"text-slate-400"}`}>{hint}</span><ChevronDown className={`h-5 w-5 transition-transform group-open:rotate-180 ${free?"text-[#d6ad63]":"text-[#a77b2e]"}`}/></div>
    </summary>
    <div className="border-t border-slate-100 bg-[#fffdf8] p-4 sm:p-5">{children}</div>
  </details>;
}

export function AcademicDrawers({locale}:{locale:Locale}){
  const t=COPY[locale];
  const postgrads=Object.entries(POSTGRADUATE_COURSES);
  const freeCourses=FREE_COURSES[locale];
  return <section className="space-y-3" aria-label={`${t.free}, ${t.undergrad} e ${t.postgrad}`}>
    <style>{`#catalogo-ldr a[href="/cliente/cursos/organizar-carreira"],#catalogo-ldr a[href="/cliente/cursos/frances-negocios-a1"],#catalogo-ldr a[href="/cliente/cursos/primeiros-socorros"],#catalogo-ldr a[href="/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud"],#catalogo-ldr a[href="/cliente/cursos/academy/orientacao-trabalho-cientifico"],#catalogo-ldr a[href="/cliente/cursos/academy/modelos-documentos-psicanaliticos"]{display:none!important}`}</style>
    <Drawer title={t.free} subtitle={t.freeSub} hint={t.freeHint} free>
      <div className="mb-4"><span className="inline-flex rounded-full bg-[#0b2341] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-white">{t.freeBadge}</span><h4 className="mt-3 font-serif text-2xl text-[#0b2341]">{t.freeTitle}</h4><p className="mt-1 text-sm text-slate-500">{t.freeIntro}</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {freeCourses.map(course=><a key={course.href} href={course.href} className="group/card min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3"><span className="text-2xl">{course.icon}</span><span className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white" style={{backgroundColor:course.tone}}>{t.free}</span></div>
          <h5 className="mt-3 font-serif text-lg leading-snug text-[#0b2341]">{course.title}</h5><p className="mt-2 text-xs text-slate-500">{course.meta}</p><span className="mt-4 inline-flex text-xs font-black" style={{color:course.tone}}>{t.open} →</span>
        </a>)}
      </div>
    </Drawer>
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
