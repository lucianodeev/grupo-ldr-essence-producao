import { useI18n } from "@/lib/i18n";
import { PROFESSIONAL_FORMATIONS,pfText,type PFLocale } from "@/lib/professional-formations.catalog";

const UI={
  pt:{eyebrow:"FORMAÇÕES PROFISSIONAIS",title:"Formações profissionais 100% online",online:"100% ONLINE",hours:"600H",lessons:"AULAS",modules:"MÓDULOS",project:"PROJETO FINAL"},
  en:{eyebrow:"PROFESSIONAL TRAINING",title:"100% online professional training",online:"100% ONLINE",hours:"600H",lessons:"LESSONS",modules:"MODULES",project:"FINAL PROJECT"},
  fr:{eyebrow:"FORMATIONS PROFESSIONNELLES",title:"Formations professionnelles 100% en ligne",online:"100% EN LIGNE",hours:"600H",lessons:"LEÇONS",modules:"MODULES",project:"PROJET FINAL"},
  es:{eyebrow:"FORMACIONES PROFESIONALES",title:"Formaciones profesionales 100% online",online:"100% ONLINE",hours:"600H",lessons:"CLASES",modules:"MÓDULOS",project:"PROYECTO FINAL"}
} as const;

export function FiveProfessionalFormationCards({compact=false}:{compact?:boolean}){
  const {locale:raw}=useI18n();
  const locale=(raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as PFLocale;
  const u=UI[locale];
  return <section className={compact?"mt-5":"mx-auto max-w-7xl px-4 py-14 sm:px-6"}>
    <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#a06f1c]">{u.eyebrow}</p><h2 className="mt-2 font-serif text-3xl text-[#071426]">{u.title}</h2></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{PROFESSIONAL_FORMATIONS.map(f=>{const t=pfText(f,locale);return <a key={f.slug} href={compact?f.learnerPath:f.publicPath} className="rounded-[24px] border border-[#d6ad63]/30 bg-white p-5 text-[#071426] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="text-3xl">{f.icon}</div><span className="mt-4 inline-block rounded-full bg-[#071426] px-3 py-1 text-[10px] font-black text-white">{u.online}</span><h3 className="mt-3 font-serif text-xl font-bold">{t.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t.description}</p><div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black"><span className="rounded-full bg-[#f7f3e9] px-2 py-1">{u.hours}</span><span className="rounded-full bg-[#f7f3e9] px-2 py-1">150 {u.lessons}</span><span className="rounded-full bg-[#f7f3e9] px-2 py-1">10 {u.modules}</span><span className="rounded-full bg-[#f7f3e9] px-2 py-1">{u.project}</span></div><p className="mt-4 font-black">R$ 299,99 · € 49,90</p></a>})}</div>
  </section>;
}
