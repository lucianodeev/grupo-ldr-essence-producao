import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, Library, Newspaper, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type L = "pt"|"en"|"fr"|"es";

const COPY = {
  pt:{eyebrow:"VISÃO 360° DA BIBLIOTECA",title:"Encontre tudo sem precisar rolar a página inteira",sub:"Formações, conteúdos gratuitos, livros, orientações e assinaturas em uma visão rápida.",search:"O que você quer aprender?",all:"Todos",formations:"Formações",free:"Grátis",books:"Livros",guidance:"Orientações",publications:"Publicações",subscriptions:"Assinaturas",seeAll:"Ver catálogo completo",from:"a partir de",month:"mês",week:"semana",online:"100% online",formationList:"Vendas · Marketing · RH · Gestão · Comunicação · Psicanálise · Massoterapia · IA e mais",freeText:"Comece por conteúdos gratuitos antes de escolher uma formação.",booksText:"eBooks e livros digitais para leitura no seu ritmo.",guidanceText:"Orientação Psicanalítica e Profissional por texto.",publicationText:"Jornal LDR · Revista LDR · LDR Ciência.",subText:"Acesse vários conteúdos digitais com a Biblioteca LDR.",noResult:"Nenhuma categoria encontrada."},
  en:{eyebrow:"360° LIBRARY VIEW",title:"Find everything without scrolling through the whole page",sub:"Training, free content, books, guidance and subscriptions in one quick view.",search:"What do you want to learn?",all:"All",formations:"Training",free:"Free",books:"Books",guidance:"Guidance",publications:"Publications",subscriptions:"Subscriptions",seeAll:"View full catalogue",from:"from",month:"month",week:"week",online:"100% online",formationList:"Sales · Marketing · HR · Management · Communication · Psychoanalysis · Massage Therapy · AI and more",freeText:"Start with free content before choosing a training program.",booksText:"eBooks and digital books to read at your own pace.",guidanceText:"Psychoanalytic and Career Guidance by text.",publicationText:"LDR Newspaper · LDR Magazine · LDR Science.",subText:"Access multiple digital contents with the LDR Library.",noResult:"No category found."},
  fr:{eyebrow:"VUE 360° DE LA BIBLIOTHÈQUE",title:"Trouvez tout sans faire défiler toute la page",sub:"Formations, contenus gratuits, livres, orientations et abonnements en un seul aperçu.",search:"Que voulez-vous apprendre ?",all:"Tout",formations:"Formations",free:"Gratuit",books:"Livres",guidance:"Orientations",publications:"Publications",subscriptions:"Abonnements",seeAll:"Voir tout le catalogue",from:"à partir de",month:"mois",week:"semaine",online:"100% en ligne",formationList:"Vente · Marketing · RH · Gestion · Communication · Psychanalyse · Massothérapie · IA et plus",freeText:"Commencez par des contenus gratuits avant de choisir une formation.",booksText:"eBooks et livres numériques à lire à votre rythme.",guidanceText:"Orientation psychanalytique et professionnelle par écrit.",publicationText:"Journal LDR · Magazine LDR · LDR Science.",subText:"Accédez à plusieurs contenus numériques avec la Bibliothèque LDR.",noResult:"Aucune catégorie trouvée."},
  es:{eyebrow:"VISTA 360° DE LA BIBLIOTECA",title:"Encuentra todo sin recorrer toda la página",sub:"Formaciones, contenidos gratuitos, libros, orientaciones y suscripciones en una vista rápida.",search:"¿Qué quieres aprender?",all:"Todo",formations:"Formaciones",free:"Gratis",books:"Libros",guidance:"Orientaciones",publications:"Publicaciones",subscriptions:"Suscripciones",seeAll:"Ver catálogo completo",from:"desde",month:"mes",week:"semana",online:"100% online",formationList:"Ventas · Marketing · RR. HH. · Gestión · Comunicación · Psicoanálisis · Masoterapia · IA y más",freeText:"Empieza con contenidos gratuitos antes de elegir una formación.",booksText:"eBooks y libros digitales para leer a tu ritmo.",guidanceText:"Orientación Psicoanalítica y Profesional por texto.",publicationText:"Periódico LDR · Revista LDR · LDR Ciencia.",subText:"Accede a varios contenidos digitales con la Biblioteca LDR.",noResult:"No se encontró ninguna categoría."}
} as const;

type Theme = {
  card:string;
  border:string;
  icon:string;
  badge:string;
  price:string;
  arrow:string;
  glow:string;
};

type Card = {key:string;label:string;desc:string;meta:string;href:string;icon:any;kind:string;theme:Theme};

const THEMES = {
  formations:{
    card:"from-[#0b3764] via-[#0a2e55] to-[#061c35] text-white",
    border:"border-[#3c78b0]/50",
    icon:"bg-[#1c5a94]/90 text-white ring-1 ring-white/15",
    badge:"bg-[#f3cc77] text-[#2b1b05]",
    price:"bg-[#f6d98f] text-[#291b08]",
    arrow:"bg-white text-[#071426]",
    glow:"bg-[radial-gradient(circle_at_85%_20%,rgba(87,162,224,.28),transparent_36%)]",
  },
  free:{
    card:"from-[#0c6b4f] via-[#07513d] to-[#05382d] text-white",
    border:"border-[#55caa3]/40",
    icon:"bg-[#2a9b75]/90 text-white ring-1 ring-white/15",
    badge:"bg-[#8ce3bd] text-[#083d2d]",
    price:"bg-[#b9f0d8] text-[#083d2d]",
    arrow:"bg-white text-[#064131]",
    glow:"bg-[radial-gradient(circle_at_85%_20%,rgba(126,239,184,.22),transparent_36%)]",
  },
  books:{
    card:"from-[#b4441f] via-[#8e2f17] to-[#5b1e13] text-white",
    border:"border-[#e88b68]/45",
    icon:"bg-[#cf5b35]/90 text-white ring-1 ring-white/15",
    badge:"bg-[#f5c58a] text-[#4b210f]",
    price:"bg-[#f8d6ac] text-[#4b210f]",
    arrow:"bg-white text-[#5b1e13]",
    glow:"bg-[radial-gradient(circle_at_85%_20%,rgba(255,190,130,.20),transparent_36%)]",
  },
  guidance:{
    card:"from-[#5420a0] via-[#37146f] to-[#201044] text-white",
    border:"border-[#9c6bdd]/45",
    icon:"bg-[#6f3ab9]/90 text-white ring-1 ring-white/15",
    badge:"bg-[#caa2ff] text-[#28134e]",
    price:"bg-[#d9bfff] text-[#28134e]",
    arrow:"bg-white text-[#2d1454]",
    glow:"bg-[radial-gradient(circle_at_85%_20%,rgba(188,142,255,.24),transparent_36%)]",
  },
  publications:{
    card:"from-[#ad1f24] via-[#7b1017] to-[#470b0d] text-white",
    border:"border-[#df686c]/45",
    icon:"bg-[#c73a40]/90 text-white ring-1 ring-white/15",
    badge:"bg-[#f0be84] text-[#4a120e]",
    price:"bg-[#f6d5ad] text-[#4a120e]",
    arrow:"bg-white text-[#5b1012]",
    glow:"bg-[radial-gradient(circle_at_85%_20%,rgba(255,160,140,.20),transparent_36%)]",
  },
  subscriptions:{
    card:"from-[#e4b84c] via-[#c9962a] to-[#8a6015] text-[#18140d]",
    border:"border-[#f1d180]/70",
    icon:"bg-[#b07d19]/80 text-white ring-1 ring-white/20",
    badge:"bg-[#7a4e0b] text-white",
    price:"bg-[#fff0ba] text-[#2b1d08]",
    arrow:"bg-white text-[#5f3f09]",
    glow:"bg-[radial-gradient(circle_at_85%_20%,rgba(255,248,211,.40),transparent_38%)]",
  },
} as const;

export function SalesCatalog360(){
  const {locale:raw}=useI18n();
  const locale=(raw==="en"||raw==="fr"||raw==="es"?raw:"pt") as L;
  const t=COPY[locale];
  const [q,setQ]=useState("");
  const [kind,setKind]=useState("all");
  const cards:Card[]=[
    {key:"formations",label:t.formations,desc:t.formationList,meta:`${t.online} · R$ 299,99 · € 49,90`,href:"#formacoes",icon:GraduationCap,kind:"formations",theme:THEMES.formations},
    {key:"free",label:t.free,desc:t.freeText,meta:"R$ 0 · € 0",href:"/cliente/biblioteca",icon:Sparkles,kind:"free",theme:THEMES.free},
    {key:"books",label:t.books,desc:t.booksText,meta:locale==="en"?"eBooks · Books":locale==="fr"?"eBooks · Livres":locale==="es"?"eBooks · Libros":"eBooks · Livros",href:"/cliente/biblioteca",icon:BookOpen,kind:"books",theme:THEMES.books},
    {key:"guidance",label:t.guidance,desc:t.guidanceText,meta:`${t.from} € 0,90`,href:"/cliente/orientacao-profissional",icon:BriefcaseBusiness,kind:"guidance",theme:THEMES.guidance},
    {key:"publications",label:t.publications,desc:t.publicationText,meta:`€ 0,90 / ${t.week}`,href:"#editorial-ldr-sales",icon:Newspaper,kind:"publications",theme:THEMES.publications},
    {key:"subscriptions",label:t.subscriptions,desc:t.subText,meta:`R$ 19,95 · € 4,95 / 1º ${t.month}`,href:"/cliente/biblioteca",icon:Library,kind:"subscriptions",theme:THEMES.subscriptions},
  ];
  const filtered=useMemo(()=>cards.filter(c=>(kind==="all"||c.kind===kind)&&(!q||`${c.label} ${c.desc} ${c.meta}`.toLocaleLowerCase(locale).includes(q.toLocaleLowerCase(locale)))),[q,kind,locale]);
  const chips=[['all',t.all],['formations',t.formations],['free',t.free],['books',t.books],['guidance',t.guidance],['publications',t.publications],['subscriptions',t.subscriptions]];

  return <section id="catalogo-360" className="border-y border-[#d6ad63]/20 bg-[#fffdf8] py-8 sm:py-10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-[#a06f1c]">{t.eyebrow}</p><h2 className="mt-2 font-serif text-3xl leading-tight text-[#071426] sm:text-4xl">{t.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{t.sub}</p></div>
        <Link to="/cliente/biblioteca" className="w-full rounded-2xl bg-[#071426] px-5 py-3.5 text-center text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 lg:w-auto lg:min-w-[220px]">{t.seeAll}</Link>
      </div>

      <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label className="relative block"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search} className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-[#d6ad63] focus:ring-2 focus:ring-[#d6ad63]/15"/></label>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">{chips.map(([k,l])=><button key={k} onClick={()=>setKind(k)} className={`min-h-11 rounded-xl px-3 py-2.5 text-center text-xs font-black leading-tight transition ${kind===k?"bg-[#071426] text-white shadow-sm":"bg-[#f1eadc] text-[#071426] hover:bg-[#e9dfca]"}`}>{l}</button>)}</div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {filtered.map(c=>{
          const Icon=c.icon;
          const inner=<div className={`relative min-h-[184px] overflow-hidden rounded-[28px] border bg-gradient-to-br p-5 shadow-[0_16px_35px_rgba(7,20,38,.16)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(7,20,38,.24)] sm:p-6 ${c.theme.card} ${c.theme.border}`}>
            <div className={`pointer-events-none absolute inset-0 ${c.theme.glow}`} />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10 bg-white/5" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-lg backdrop-blur ${c.theme.icon}`}><Icon className="h-7 w-7"/></span>
                <span className={`max-w-[72%] rounded-full px-3 py-1.5 text-right text-[11px] font-black leading-4 shadow-sm ${c.theme.badge}`}>{c.meta}</span>
              </div>
              <div className="mt-5 pr-12 sm:pr-20">
                <h3 className="font-serif text-3xl font-bold leading-none sm:text-[34px]">{c.label}</h3>
                <p className="mt-3 max-w-xl text-sm font-medium leading-6 opacity-85 sm:text-[15px]">{c.desc}</p>
              </div>
              <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                <span className={`rounded-xl px-3 py-2 text-xs font-black shadow-sm ${c.theme.price}`}>{c.meta}</span>
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-lg ${c.theme.arrow}`}><ArrowRight className="h-5 w-5"/></span>
              </div>
            </div>
          </div>;
          return c.href.startsWith('#')?<a key={c.key} href={c.href} className="block">{inner}</a>:<Link key={c.key} to={c.href as any} className="block">{inner}</Link>;
        })}
      </div>
      {!filtered.length?<p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{t.noResult}</p>:null}
    </div>
  </section>;
}
