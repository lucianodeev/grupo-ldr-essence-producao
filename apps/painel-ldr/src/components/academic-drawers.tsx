import { ChevronDown, GraduationCap } from "lucide-react";
import { UNDERGRADUATE_COURSES } from "@/lib/undergraduate.catalog";
import { POSTGRADUATE_COURSES } from "@/lib/postgraduate-interest.catalog";
import { postgraduateCardTitle, undergraduateCardTitle } from "@/lib/library-card-i18n";

type Locale="pt"|"en"|"fr"|"es";

const COPY={
  pt:{undergrad:"Graduação",undergradSub:"Cursos superiores · Em breve",postgrad:"Pós-graduação",postgradSub:"Especializações · Em breve",soon:"EM BREVE",hint:"Toque para ver todos"},
  en:{undergrad:"Undergraduate",undergradSub:"Higher education · Coming soon",postgrad:"Postgraduate",postgradSub:"Specializations · Coming soon",soon:"COMING SOON",hint:"Tap to view all"},
  fr:{undergrad:"Graduation",undergradSub:"Études supérieures · Bientôt",postgrad:"Post-graduation",postgradSub:"Spécialisations · Bientôt",soon:"BIENTÔT",hint:"Touchez pour tout afficher"},
  es:{undergrad:"Grado",undergradSub:"Educación superior · Próximamente",postgrad:"Posgrado",postgradSub:"Especializaciones · Próximamente",soon:"PRÓXIMAMENTE",hint:"Toca para ver todo"}
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

export function AcademicDrawers({locale}:{locale:Locale}){
  const t=COPY[locale];
  const postgrads=Object.entries(POSTGRADUATE_COURSES);
  return <section className="space-y-3" aria-label={`${t.undergrad} e ${t.postgrad}`}>
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
