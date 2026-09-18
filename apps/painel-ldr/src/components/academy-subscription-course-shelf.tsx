import { Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, LockKeyhole, Sparkles } from "lucide-react";
import { ACADEMY_SUBSCRIPTION_COURSES, ACADEMY_SUBSCRIPTION_TRACKS, type AcademyLocale } from "@/lib/academy-subscription-courses.catalog";

const COPY={
  pt:{eyebrow:"CURSOS · ASSINATURA",title:"50 cursos livres incluídos na assinatura",sub:"De 60h a 300h · 100% online · certificado · trilhas organizadas por carreira, IA, vendas, escritório, redação e desenvolvimento pessoal.",included:"INCLUÍDO NA ASSINATURA",open:"INICIAR CURSO",locked:"ASSINE PARA ACESSAR",formation:"FORMAÇÃO · 600H",formationTitle:"Formação em Gestão de Projetos",formationText:"20 módulos · 180 aulas · 600 horas · 100% online · 5 projetos progressivos, incluindo Projeto Integrador Final.",formationCta:"CONHECER FORMAÇÃO"},
  en:{eyebrow:"COURSES · SUBSCRIPTION",title:"50 non-degree courses included in the subscription",sub:"60h to 300h · 100% online · certificate · learning tracks for career, AI, sales, office routines, writing and personal development.",included:"INCLUDED IN SUBSCRIPTION",open:"START COURSE",locked:"SUBSCRIBE TO ACCESS",formation:"TRAINING · 600H",formationTitle:"Project Management Professional Training",formationText:"20 modules · 180 lessons · 600 hours · 100% online · 5 progressive projects, including a final integrative project.",formationCta:"VIEW TRAINING"},
  fr:{eyebrow:"COURS · ABONNEMENT",title:"50 cours libres inclus dans l’abonnement",sub:"De 60h à 300h · 100% en ligne · certificat · parcours organisés pour carrière, IA, vente, bureau, rédaction et développement personnel.",included:"INCLUS DANS L’ABONNEMENT",open:"COMMENCER",locked:"S’ABONNER POUR ACCÉDER",formation:"FORMATION · 600H",formationTitle:"Formation en Gestion de Projets",formationText:"20 modules · 180 leçons · 600 heures · 100% en ligne · 5 projets progressifs, dont un projet intégratif final.",formationCta:"VOIR LA FORMATION"},
  es:{eyebrow:"CURSOS · SUSCRIPCIÓN",title:"50 cursos libres incluidos en la suscripción",sub:"De 60h a 300h · 100% online · certificado · rutas organizadas para carrera, IA, ventas, oficina, redacción y desarrollo personal.",included:"INCLUIDO EN LA SUSCRIPCIÓN",open:"INICIAR CURSO",locked:"SUSCRÍBETE PARA ACCEDER",formation:"FORMACIÓN · 600H",formationTitle:"Formación en Gestión de Proyectos",formationText:"20 módulos · 180 clases · 600 horas · 100% online · 5 proyectos progresivos, incluido el proyecto integrador final.",formationCta:"VER FORMACIÓN"},
} as const;

type Props={locale:AcademyLocale;active?:boolean;publicView?:boolean};

export function AcademySubscriptionCourseShelf({locale,active=false,publicView=false}:Props){
  if(!publicView)return null;
  const t=COPY[locale];
  const groups=ACADEMY_SUBSCRIPTION_TRACKS.map((track)=>({
    key:track,
    title:track,
    items:ACADEMY_SUBSCRIPTION_COURSES.filter((course)=>course.track===track),
  }));
  return <section className="rounded-[30px] border border-[#d6ad63]/35 bg-[#fbf7ef] p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl"><p className="text-xs font-black tracking-[.18em] text-[#9a6b20]">{t.eyebrow}</p><h2 className="mt-2 font-serif text-3xl text-[#071426] sm:text-4xl">{t.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.sub}</p></div>
      <span className="inline-flex items-center gap-2 rounded-full bg-[#071426] px-4 py-2 text-xs font-black text-white"><Sparkles className="h-4 w-4"/>{t.included}</span>
    </div>
    <Link to="/formacoes/gestao-projetos-600h" className="mt-6 block rounded-2xl border border-[#d6ad63]/45 bg-[#071426] p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><GraduationCap className="mt-1 h-6 w-6 text-[#d6ad63]"/><div><p className="text-[11px] font-black tracking-[.16em] text-[#d6ad63]">{t.formation}</p><h3 className="mt-1 font-serif text-2xl text-[#fff7e7]">{t.formationTitle}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">{t.formationText}</p></div></div><span className="rounded-xl bg-[#d6ad63] px-4 py-2 text-xs font-black text-[#281605]">{t.formationCta}</span></div></Link>
    <div className="mt-7 space-y-6">{groups.map(group=><div key={group.key}><h3 className="mb-3 font-serif text-2xl text-[#071426]">{group.title}</h3><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{group.items.map(course=>{
      const href=publicView||!active?"/cliente/biblioteca":`/cliente/cursos/assinatura/${course.slug}`;
      return <Link key={course.slug} to={href} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3"><BookOpen className="h-5 w-5 text-[#b18435]"/><span className="rounded-full bg-[#f4ead7] px-2 py-1 text-[10px] font-black text-[#6e4b13]">{course.hours}H</span></div>
        <h4 className="mt-3 font-bold leading-5 text-slate-900">{course.name[locale]}</h4><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{course.description[locale]}</p>
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs font-black text-[#071426]"><span>{active&&!publicView?t.open:t.locked}</span>{active&&!publicView?null:<LockKeyhole className="h-4 w-4"/>}</div>
      </Link>})}</div></div>)}</div>
  </section>;
}