import { BookOpen, GraduationCap, Newspaper, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type Locale="pt"|"en"|"fr"|"es";
type Item={title:string;subtitle:string;href:string;icon:string;price?:string;tag:string;group:"banca"|"livraria"|"formacoes"|"gratis";color:string};

const COPY={
  pt:{eyebrow:"BIBLIOTECA LDR",title:"Sua banca, livraria e escola digital",desc:"Encontre jornais, revistas, livros, cursos e formações de forma rápida e organizada.",search:"Buscar cursos, formações, livros, revistas ou jornais…",featured:"Destaques da Semana",featuredDesc:"Comece agora com conteúdos acessíveis e de alto valor.",newsstand:"Banca LDR",bookstore:"Livraria LDR",formations:"Formações",free:"Gratuitos",all:"Todos",open:"ACESSAR",entry:"ACESSO SEMANAL",browse:"Explorar catálogo completo"},
  en:{eyebrow:"LDR LIBRARY",title:"Your digital newsstand, bookstore and school",desc:"Find newspapers, magazines, books, courses and programs quickly and clearly.",search:"Search courses, programs, books, magazines or newspapers…",featured:"Weekly Highlights",featuredDesc:"Start now with accessible, high-value content.",newsstand:"LDR Newsstand",bookstore:"LDR Bookstore",formations:"Programs",free:"Free",all:"All",open:"OPEN",entry:"WEEKLY ACCESS",browse:"Browse full catalog"},
  fr:{eyebrow:"BIBLIOTHÈQUE LDR",title:"Votre kiosque, librairie et école numérique",desc:"Trouvez rapidement journaux, magazines, livres, cours et formations.",search:"Rechercher cours, formations, livres, magazines ou journaux…",featured:"À la une",featuredDesc:"Commencez avec des contenus accessibles et de grande valeur.",newsstand:"Kiosque LDR",bookstore:"Librairie LDR",formations:"Formations",free:"Gratuits",all:"Tous",open:"ACCÉDER",entry:"ACCÈS HEBDOMADAIRE",browse:"Explorer le catalogue"},
  es:{eyebrow:"BIBLIOTECA LDR",title:"Tu quiosco, librería y escuela digital",desc:"Encuentra periódicos, revistas, libros, cursos y formaciones de forma rápida y organizada.",search:"Buscar cursos, formaciones, libros, revistas o periódicos…",featured:"Destacados de la Semana",featuredDesc:"Empieza con contenidos accesibles y de gran valor.",newsstand:"Quiosco LDR",bookstore:"Librería LDR",formations:"Formaciones",free:"Gratuitos",all:"Todos",open:"ACCEDER",entry:"ACCESO SEMANAL",browse:"Explorar catálogo completo"}
} as const;

const ITEMS:Item[]=[
  {title:"Jornal LDR",subtitle:"Notícias, economia e tecnologia",href:"/cliente/biblioteca/jornal-ldr",icon:"📰",price:"R$ 0,90 · € 0,90 / semana",tag:"jornal notícias economia",group:"banca",color:"#0b2341"},
  {title:"Revista LDR",subtitle:"Carreira, negócios e tendências",href:"/cliente/biblioteca/revista-ldr",icon:"📖",price:"R$ 0,90 · € 0,90 / semana",tag:"revista carreira negócios",group:"banca",color:"#5b0824"},
  {title:"LDR Ciência",subtitle:"Artigos, pesquisas e análises",href:"/cliente/biblioteca/ldr-ciencia",icon:"🔬",price:"R$ 0,90 · € 0,90 / semana",tag:"ciência artigos pesquisa",group:"banca",color:"#403566"},
  {title:"Publicações LDR",subtitle:"Jornais e revistas temáticos",href:"/cliente/biblioteca/publicacoes",icon:"🗞️",tag:"publicações jornais revistas",group:"banca",color:"#173f6b"},
  {title:"eBooks",subtitle:"Leituras digitais da Biblioteca LDR",href:"#catalogo-ldr",icon:"📘",tag:"ebook digital",group:"livraria",color:"#5b0824"},
  {title:"Livros",subtitle:"Livros e projetos editoriais",href:"#catalogo-ldr",icon:"📚",tag:"livros editorial",group:"livraria",color:"#35101e"},
  {title:"Formação em IA",subtitle:"IA aplicada aos negócios e à carreira",href:"/cliente/treinamentos/ia-negocios-carreira",icon:"🤖",tag:"ia formação inteligência artificial",group:"formacoes",color:"#143d59"},
  {title:"Formações profissionais",subtitle:"Psicanálise, carreira, liderança e RH",href:"#catalogo-ldr",icon:"🎓",tag:"formações cursos carreira rh",group:"formacoes",color:"#0b5cab"},
  {title:"Cursos gratuitos",subtitle:"RH, carreira, francês e primeiros socorros",href:"#catalogo-ldr",icon:"🎁",tag:"grátis gratuito",group:"gratis",color:"#047857"}
];

function ProductCard({item,t,featured=false}:{item:Item;t:(typeof COPY)[Locale];featured?:boolean}){
  return <a href={item.href} className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className={featured?"p-5 text-white":"p-5"} style={featured?{background:`linear-gradient(145deg,${item.color},#071426)`}:undefined}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <span className="shrink-0 text-3xl leading-none">{item.icon}</span>
        {item.price&&<span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${featured?"bg-white/15 text-white":"bg-[#fff6df] text-[#8a611c]"}`}>{t.entry}</span>}
      </div>
      <h3 className={`mt-4 break-normal font-serif text-xl leading-tight ${featured?"!text-white":"text-[#0b2341]"}`}>{item.title}</h3>
      <p className={`mt-2 line-clamp-2 break-normal text-xs leading-5 ${featured?"!text-white/75":"text-slate-500"}`}>{item.subtitle}</p>
    </div>
    <div className="mt-auto p-5 pt-3">
      {item.price&&<p className="break-normal text-sm font-black leading-5 text-[#0b2341]">{item.price}</p>}
      {featured&&<span className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#f4efe3] px-4 py-2.5 text-xs font-black text-[#0b2341]">{t.open}</span>}
    </div>
  </a>;
}

export function LibraryStorefront({locale}:{locale:Locale}){
  const t=COPY[locale];
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState<"all"|Item["group"]>("all");
  const filtered=useMemo(()=>ITEMS.filter(item=>(filter==="all"||item.group===filter)&&(`${item.title} ${item.subtitle} ${item.tag}`).toLowerCase().includes(q.trim().toLowerCase())),[q,filter]);
  const featured=ITEMS.slice(0,3);
  const tabs=[["all",t.all],["banca",t.newsstand],["livraria",t.bookstore],["formacoes",t.formations],["gratis",t.free]] as const;

  return <section className="min-w-0 space-y-7" aria-label={t.title}>
    <div className="overflow-hidden rounded-[28px] border border-[#d6ad63]/30 bg-[#fffdf8] shadow-sm">
      <div className="bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#173f6b] px-5 py-7 text-white sm:px-8">
        <div className="flex items-center gap-2 text-[#d6ad63]"><Sparkles className="h-4 w-4 shrink-0"/><p className="text-[10px] font-black uppercase tracking-[.22em]">{t.eyebrow}</p></div>
        <h2 className="mt-3 max-w-4xl break-normal font-serif text-3xl leading-tight !text-[#fff7e7] sm:text-5xl">{t.title}</h2>
        <p className="mt-3 max-w-3xl break-normal text-sm leading-6 !text-white/75 sm:text-base">{t.desc}</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search} className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#d6ad63] focus:ring-2 focus:ring-[#d6ad63]/20"/></div>
        <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{tabs.map(([key,label])=><button key={key} onClick={()=>setFilter(key)} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${filter===key?"bg-[#0b2341] text-white":"bg-[#f4efe3] text-[#0b2341]"}`}>{label}</button>)}</div>
      </div>
    </div>

    {!q&&filter==="all"&&<section id="destaques-ldr" className="min-w-0 scroll-mt-24">
      <div className="mb-4 flex min-w-0 items-end justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#a77b2e]">{t.entry}</p><h2 className="mt-1 break-normal font-serif text-3xl leading-tight text-[#0b2341]">{t.featured}</h2><p className="mt-1 break-normal text-sm text-slate-500">{t.featuredDesc}</p></div><Newspaper className="hidden h-8 w-8 shrink-0 text-[#a77b2e] sm:block"/></div>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.map(item=><ProductCard key={item.title} item={item} t={t} featured/>)}</div>
    </section>}

    <section className="min-w-0">
      <div className="mb-4 flex min-w-0 items-center gap-2">{filter==="banca"?<Newspaper className="h-5 w-5 shrink-0 text-[#a77b2e]"/>:filter==="livraria"?<BookOpen className="h-5 w-5 shrink-0 text-[#a77b2e]"/>:<GraduationCap className="h-5 w-5 shrink-0 text-[#a77b2e]"/>}<h2 className="break-normal font-serif text-2xl leading-tight text-[#0b2341]">{filter==="banca"?t.newsstand:filter==="livraria"?t.bookstore:filter==="formacoes"?t.formations:filter==="gratis"?t.free:t.browse}</h2></div>
      <div className="grid min-w-0 grid-cols-1 gap-3 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(item=><ProductCard key={`${filter}-${item.title}`} item={item} t={t}/>)}</div>
    </section>
  </section>;
}
