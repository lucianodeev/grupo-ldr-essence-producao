import { Link } from "@tanstack/react-router";
import { BookOpen, BriefcaseBusiness, GraduationCap, Library, Newspaper, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type L = "pt"|"en"|"fr"|"es";

const COPY = {
  pt:{eyebrow:"VISÃO 360° DA BIBLIOTECA",title:"Encontre tudo sem precisar rolar a página inteira",sub:"Formações, conteúdos gratuitos, livros, orientações e assinaturas em uma visão rápida.",search:"O que você quer aprender?",all:"Todos",formations:"Formações",free:"Grátis",books:"Livros",guidance:"Orientações",publications:"Publicações",subscriptions:"Assinaturas",seeAll:"Ver catálogo completo",from:"a partir de",month:"mês",week:"semana",online:"100% online",formationList:"Vendas · Marketing · RH · Gestão · Comunicação · Psicanálise · Massoterapia · IA e mais",freeText:"Comece por conteúdos gratuitos antes de escolher uma formação.",booksText:"eBooks e livros digitais para leitura no seu ritmo.",guidanceText:"Orientação Psicanalítica e Profissional por texto.",publicationText:"Jornal LDR · Revista LDR · LDR Ciência.",subText:"Acesse vários conteúdos digitais com a Biblioteca LDR.",noResult:"Nenhuma categoria encontrada."},
  en:{eyebrow:"360° LIBRARY VIEW",title:"Find everything without scrolling through the whole page",sub:"Training, free content, books, guidance and subscriptions in one quick view.",search:"What do you want to learn?",all:"All",formations:"Training",free:"Free",books:"Books",guidance:"Guidance",publications:"Publications",subscriptions:"Subscriptions",seeAll:"View full catalogue",from:"from",month:"month",week:"week",online:"100% online",formationList:"Sales · Marketing · HR · Management · Communication · Psychoanalysis · Massage Therapy · AI and more",freeText:"Start with free content before choosing a training program.",booksText:"eBooks and digital books to read at your own pace.",guidanceText:"Psychoanalytic and Career Guidance by text.",publicationText:"LDR Newspaper · LDR Magazine · LDR Science.",subText:"Access multiple digital contents with the LDR Library.",noResult:"No category found."},
  fr:{eyebrow:"VUE 360° DE LA BIBLIOTHÈQUE",title:"Trouvez tout sans faire défiler toute la page",sub:"Formations, contenus gratuits, livres, orientations et abonnements en un seul aperçu.",search:"Que voulez-vous apprendre ?",all:"Tout",formations:"Formations",free:"Gratuit",books:"Livres",guidance:"Orientations",publications:"Publications",subscriptions:"Abonnements",seeAll:"Voir tout le catalogue",from:"à partir de",month:"mois",week:"semaine",online:"100% en ligne",formationList:"Vente · Marketing · RH · Gestion · Communication · Psychanalyse · Massothérapie · IA et plus",freeText:"Commencez par des contenus gratuits avant de choisir une formation.",booksText:"eBooks et livres numériques à lire à votre rythme.",guidanceText:"Orientation psychanalytique et professionnelle par écrit.",publicationText:"Journal LDR · Magazine LDR · LDR Science.",subText:"Accédez à plusieurs contenus numériques avec la Bibliothèque LDR.",noResult:"Aucune catégorie trouvée."},
  es:{eyebrow:"VISTA 360° DE LA BIBLIOTECA",title:"Encuentra todo sin recorrer toda la página",sub:"Formaciones, contenidos gratuitos, libros, orientaciones y suscripciones en una vista rápida.",search:"¿Qué quieres aprender?",all:"Todo",formations:"Formaciones",free:"Gratis",books:"Libros",guidance:"Orientaciones",publications:"Publicaciones",subscriptions:"Suscripciones",seeAll:"Ver catálogo completo",from:"desde",month:"mes",week:"semana",online:"100% online",formationList:"Ventas · Marketing · RR. HH. · Gestión · Comunicación · Psicoanálisis · Masoterapia · IA y más",freeText:"Empieza con contenidos gratuitos antes de elegir una formación.",booksText:"eBooks y libros digitales para leer a tu ritmo.",guidanceText:"Orientación Psicoanalítica y Profesional por texto.",publicationText:"Periódico LDR · Revista LDR · LDR Ciencia.",subText:"Accede a varios contenidos digitales con la Biblioteca LDR.",noResult:"No se encontró ninguna categoría."}
} as const;

type Card = {key:string;label:string;desc:string;meta:string;href:string;icon:any;kind:string};

export function SalesCatalog360(){
  const {locale:raw}=useI18n();
  const locale=(raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as L;
  const t=COPY[locale];
  const [q,setQ]=useState("");
  const [kind,setKind]=useState("all");
  const cards:Card[]=[
    {key:"formations",label:t.formations,desc:t.formationList,meta:`${t.online} · R$ 299,99 · € 49,90`,href:"#formacoes",icon:GraduationCap,kind:"formations"},
    {key:"free",label:t.free,desc:t.freeText,meta:"R$ 0 · € 0",href:"/cliente/biblioteca",icon:Sparkles,kind:"free"},
    {key:"books",label:t.books,desc:t.booksText,meta:"eBooks · Livros",href:"/cliente/biblioteca",icon:BookOpen,kind:"books"},
    {key:"guidance",label:t.guidance,desc:t.guidanceText,meta:`${t.from} € 0,90`,href:"/cliente/orientacao-profissional",icon:BriefcaseBusiness,kind:"guidance"},
    {key:"publications",label:t.publications,desc:t.publicationText,meta:`€ 0,90 / ${t.week}`,href:"#editorial-ldr-sales",icon:Newspaper,kind:"publications"},
    {key:"subscriptions",label:t.subscriptions,desc:t.subText,meta:`R$ 19,95 · € 4,95 / 1º ${t.month}`,href:"/cliente/biblioteca",icon:Library,kind:"subscriptions"},
  ];
  const filtered=useMemo(()=>cards.filter(c=>(kind==="all"||c.kind===kind)&&(!q||`${c.label} ${c.desc} ${c.meta}`.toLocaleLowerCase(locale).includes(q.toLocaleLowerCase(locale)))),[q,kind,locale]);
  const chips=[['all',t.all],['formations',t.formations],['free',t.free],['books',t.books],['guidance',t.guidance],['publications',t.publications],['subscriptions',t.subscriptions]];
  return <section id="catalogo-360" className="border-y border-[#d6ad63]/20 bg-[#fffdf8] py-8 sm:py-10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-[#a06f1c]">{t.eyebrow}</p><h2 className="mt-2 font-serif text-3xl text-[#071426] sm:text-4xl">{t.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.sub}</p></div>
        <Link to="/cliente/biblioteca" className="rounded-xl bg-[#071426] px-5 py-3 text-center text-xs font-black text-white">{t.seeAll}</Link>
      </div>
      <div className="mt-6 rounded-[24px] border bg-white p-4 shadow-sm">
        <label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search} className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d6ad63]"/></label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{chips.map(([k,l])=><button key={k} onClick={()=>setKind(k)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-black ${kind===k?"bg-[#071426] text-white":"bg-[#f1eadc] text-[#071426]"}`}>{l}</button>)}</div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(c=>{const Icon=c.icon; const inner=<><div className="flex items-center justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#071426] text-white"><Icon className="h-5 w-5"/></span><span className="text-right text-xs font-black text-[#8a5d17]">{c.meta}</span></div><h3 className="mt-4 text-lg font-black text-[#071426]">{c.label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{c.desc}</p></>; return c.href.startsWith('#')?<a key={c.key} href={c.href} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">{inner}</a>:<Link key={c.key} to={c.href as any} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">{inner}</Link>})}</div>
      {!filtered.length?<p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{t.noResult}</p>:null}
    </div>
  </section>;
}
