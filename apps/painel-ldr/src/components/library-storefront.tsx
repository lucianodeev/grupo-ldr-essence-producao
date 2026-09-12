import { BookOpen, GraduationCap, Newspaper, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type Locale="pt"|"en"|"fr"|"es";

type Item={
  title:string;
  subtitle:string;
  href:string;
  icon:string;
  price?:string;
  tag:string;
  group:"banca"|"livraria"|"formacoes"|"gratis";
  color:string;
};

const COPY={
  pt:{eyebrow:"BIBLIOTECA LDR",title:"Sua banca, livraria e escola digital",desc:"Encontre rapidamente jornais, revistas, livros, cursos e formações. Os produtos de entrada ficam em destaque para facilitar por onde começar.",search:"Buscar cursos, formações, livros, revistas ou jornais…",featured:"Destaques da semana",featuredDesc:"Conteúdos de entrada para começar agora",newsstand:"Banca LDR",bookstore:"Livraria LDR",formations:"Formações",free:"Cursos gratuitos",all:"Todos",open:"ABRIR",entry:"ACESSO SEMANAL",browse:"Explorar catálogo completo",my:"Meus conteúdos"},
  en:{eyebrow:"LDR LIBRARY",title:"Your digital newsstand, bookstore and school",desc:"Quickly find newspapers, magazines, books, courses and professional programs. Entry products are highlighted to make it easy to start.",search:"Search courses, programs, books, magazines or newspapers…",featured:"Weekly highlights",featuredDesc:"Entry content to start now",newsstand:"LDR Newsstand",bookstore:"LDR Bookstore",formations:"Programs",free:"Free courses",all:"All",open:"OPEN",entry:"WEEKLY ACCESS",browse:"Browse full catalog",my:"My content"},
  fr:{eyebrow:"BIBLIOTHÈQUE LDR",title:"Votre kiosque, librairie et école numérique",desc:"Trouvez rapidement journaux, magazines, livres, cours et formations. Les produits d'entrée sont mis en avant pour faciliter le premier choix.",search:"Rechercher cours, formations, livres, magazines ou journaux…",featured:"À la une cette semaine",featuredDesc:"Contenus d'entrée pour commencer maintenant",newsstand:"Kiosque LDR",bookstore:"Librairie LDR",formations:"Formations",free:"Cours gratuits",all:"Tous",open:"OUVRIR",entry:"ACCÈS HEBDOMADAIRE",browse:"Explorer tout le catalogue",my:"Mes contenus"},
  es:{eyebrow:"BIBLIOTECA LDR",title:"Tu quiosco, librería y escuela digital",desc:"Encuentra rápidamente periódicos, revistas, libros, cursos y formaciones. Los productos de entrada tienen mayor destaque para facilitar por dónde empezar.",search:"Buscar cursos, formaciones, libros, revistas o periódicos…",featured:"Destacados de la semana",featuredDesc:"Contenidos de entrada para empezar ahora",newsstand:"Quiosco LDR",bookstore:"Librería LDR",formations:"Formaciones",free:"Cursos gratuitos",all:"Todos",open:"ABRIR",entry:"ACCESO SEMANAL",browse:"Explorar catálogo completo",my:"Mis contenidos"}
} as const;

const ITEMS:Item[]=[
  {title:"Jornal LDR",subtitle:"Notícias, economia, tecnologia e mundo",href:"/cliente/biblioteca/jornal-ldr",icon:"📰",price:"R$ 0,90 · € 0,90 / semana",tag:"jornal",group:"banca",color:"#0b2341"},
  {title:"Revista LDR",subtitle:"Carreira, negócios, comportamento e inovação",href:"/cliente/biblioteca/revista-ldr",icon:"📖",price:"R$ 0,90 · € 0,90 / semana",tag:"revista",group:"banca",color:"#5b0824"},
  {title:"LDR Ciência",subtitle:"Análises científicas com fontes e referências",href:"/cliente/biblioteca/ldr-ciencia",icon:"🔬",price:"R$ 0,90 · € 0,90 / semana",tag:"ciência",group:"banca",color:"#403566"},
  {title:"Publicações LDR",subtitle:"Jornais e revistas temáticos",href:"/cliente/biblioteca/publicacoes",icon:"🗞️",tag:"publicações",group:"banca",color:"#173f6b"},
  {title:"eBooks",subtitle:"Leituras digitais da Biblioteca LDR",href:"#catalogo-ldr",icon:"📘",tag:"ebook",group:"livraria",color:"#5b0824"},
  {title:"Livros",subtitle:"Livros e projetos editoriais",href:"#catalogo-ldr",icon:"📚",tag:"livros",group:"livraria",color:"#35101e"},
  {title:"Formação em IA",subtitle:"IA aplicada aos negócios e à carreira",href:"/cliente/treinamentos/ia-negocios-carreira",icon:"🤖",tag:"ia formação",group:"formacoes",color:"#143d59"},
  {title:"Formações profissionais",subtitle:"Psicanálise, carreira, liderança, RH e mais",href:"#catalogo-ldr",icon:"🎓",tag:"formações cursos",group:"formacoes",color:"#0b5cab"},
  {title:"Cursos gratuitos",subtitle:"RH, carreira, francês, primeiros socorros e mais",href:"#catalogo-ldr",icon:"🎁",tag:"grátis gratuito",group:"gratis",color:"#047857"}
];

export function LibraryStorefront({locale}:{locale:Locale}){
  const t=COPY[locale];
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState<"all"|Item["group"]>("all");
  const filtered=useMemo(()=>ITEMS.filter(item=>(filter==="all"||item.group===filter)&&(`${item.title} ${item.subtitle} ${item.tag}`).toLowerCase().includes(q.trim().toLowerCase())),[q,filter]);
  const featured=ITEMS.slice(0,3);
  const tabs=[
    ["all",t.all],["banca",t.newsstand],["livraria",t.bookstore],["formacoes",t.formations],["gratis",t.free]
  ] as const;
  return <section className="space-y-6" aria-label={t.title}>
    <div className="overflow-hidden rounded-[30px] border border-[#d6ad63]/30 bg-[#fffdf8] shadow-sm">
      <div className="bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#173f6b] px-5 py-8 text-white sm:px-8">
        <div className="flex items-center gap-2 text-[#d6ad63]"><Sparkles className="h-4 w-4"/><p className="text-[10px] font-black uppercase tracking-[.24em]">{t.eyebrow}</p></div>
        <h2 className="mt-3 max-w-4xl font-serif text-3xl leading-tight !text-[#fff7e7] sm:text-5xl">{t.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 !text-white/75 sm:text-base">{t.desc}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href="#destaques-ldr" className="rounded-full bg-[#d6ad63] px-4 py-2 text-xs font-black text-[#281605]">{t.featured}</a>
          <a href="/cliente/biblioteca/publicacoes" className="rounded-full bg-white/10 px-4 py-2 text-xs font-black !text-white">{t.newsstand}</a>
          <a href="#catalogo-ldr" className="rounded-full bg-white/10 px-4 py-2 text-xs font-black !text-white">{t.browse}</a>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search} className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#d6ad63] focus:ring-2 focus:ring-[#d6ad63]/20"/></div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{tabs.map(([key,label])=><button key={key} onClick={()=>setFilter(key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${filter===key?"bg-[#0b2341] text-white":"bg-[#f4efe3] text-[#0b2341]"}`}>{label}</button>)}</div>
      </div>
    </div>

    {!q&&filter==="all"&&<section id="destaques-ldr">
      <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#a77b2e]">{t.entry}</p><h2 className="mt-1 font-serif text-3xl text-[#0b2341]">{t.featured}</h2><p className="mt-1 text-sm text-slate-500">{t.featuredDesc}</p></div><Newspaper className="hidden h-8 w-8 text-[#a77b2e] sm:block"/></div>
      <div className="grid gap-4 md:grid-cols-3">{featured.map(item=><a key={item.title} href={item.href} className="group overflow-hidden rounded-[26px] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="min-h-[190px] p-6 text-white" style={{background:`linear-gradient(145deg,${item.color},#071426)`}}><div className="flex items-start justify-between gap-3"><span className="text-4xl">{item.icon}</span><span className="rounded-full bg-white/15 px-3 py-1 text-[9px] font-black uppercase tracking-wider">{t.entry}</span></div><h3 className="mt-7 font-serif text-3xl !text-white">{item.title}</h3><p className="mt-2 text-sm leading-5 !text-white/75">{item.subtitle}</p></div><div className="p-5"><p className="font-black text-[#0b2341]">{item.price}</p><span className="mt-4 inline-flex rounded-xl bg-[#f4efe3] px-4 py-2 text-xs font-black text-[#0b2341]">{t.open}</span></div></a>)}</div>
    </section>}

    <section>
      <div className="mb-4 flex items-center gap-2">{filter==="banca"?<Newspaper className="h-5 w-5 text-[#a77b2e]"/>:filter==="livraria"?<BookOpen className="h-5 w-5 text-[#a77b2e]"/>:<GraduationCap className="h-5 w-5 text-[#a77b2e]"/>}<h2 className="font-serif text-2xl text-[#0b2341]">{filter==="banca"?t.newsstand:filter==="livraria"?t.bookstore:filter==="formacoes"?t.formations:filter==="gratis"?t.free:t.browse}</h2></div>
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 xl:grid-cols-4">{filtered.map(item=><a key={`${filter}-${item.title}`} href={item.href} className="min-w-[220px] rounded-[22px] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:min-w-0"><div className="flex items-start justify-between gap-3"><span className="text-3xl">{item.icon}</span>{item.price&&<span className="rounded-full bg-[#fff6df] px-2.5 py-1 text-[9px] font-black text-[#8a611c]">{t.entry}</span>}</div><h3 className="mt-4 font-serif text-xl text-[#0b2341]">{item.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{item.subtitle}</p>{item.price&&<p className="mt-4 text-xs font-black text-[#0b2341]">{item.price}</p>}</a>)}</div>
    </section>
  </section>;
}
