import { BookOpen, GraduationCap, Newspaper, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type Locale="pt"|"en"|"fr"|"es";
type Group="banca"|"livraria"|"formacoes"|"gratis";
type Item={title:string;subtitle:string;href:string;icon:string;price?:string;tag:string;group:Group;color:string;badge?:string};

const COPY={
  pt:{eyebrow:"BIBLIOTECA LDR",title:"Bem-vindo à sua Biblioteca LDR",desc:"Conhecimento, bem-estar e oportunidades em um só lugar.",motto:"Aprenda hoje. Construa o seu amanhã.",search:"Buscar cursos, formações, livros, revistas ou jornais…",featured:"Destaques da Semana",featuredDesc:"Comece agora com conteúdos acessíveis e de alto valor.",newsstand:"Banca LDR",newsstandDesc:"Jornais, revistas e publicações especiais.",bookstore:"Livraria LDR",bookstoreDesc:"eBooks, livros e produções especiais.",formations:"Formações",formationsDesc:"Construa novas habilidades e avance na sua carreira.",free:"Gratuitos",freeDesc:"Conteúdos gratuitos para começar agora.",all:"Todos",open:"Acessar",entry:"ACESSO SEMANAL",seeAll:"Ver todos"},
  en:{eyebrow:"LDR LIBRARY",title:"Welcome to your LDR Library",desc:"Knowledge, well-being and opportunities in one place.",motto:"Learn today. Build your tomorrow.",search:"Search courses, programs, books, magazines or newspapers…",featured:"Weekly Highlights",featuredDesc:"Start now with accessible, high-value content.",newsstand:"LDR Newsstand",newsstandDesc:"Newspapers, magazines and special publications.",bookstore:"LDR Bookstore",bookstoreDesc:"eBooks, books and special productions.",formations:"Programs",formationsDesc:"Build new skills and move your career forward.",free:"Free",freeDesc:"Free content to start now.",all:"All",open:"Open",entry:"WEEKLY ACCESS",seeAll:"See all"},
  fr:{eyebrow:"BIBLIOTHÈQUE LDR",title:"Bienvenue dans votre Bibliothèque LDR",desc:"Connaissance, bien-être et opportunités au même endroit.",motto:"Apprenez aujourd'hui. Construisez demain.",search:"Rechercher cours, formations, livres, magazines ou journaux…",featured:"À la une",featuredDesc:"Commencez avec des contenus accessibles et de grande valeur.",newsstand:"Kiosque LDR",newsstandDesc:"Journaux, magazines et publications spéciales.",bookstore:"Librairie LDR",bookstoreDesc:"eBooks, livres et productions spéciales.",formations:"Formations",formationsDesc:"Développez vos compétences et votre carrière.",free:"Gratuits",freeDesc:"Des contenus gratuits pour commencer.",all:"Tous",open:"Accéder",entry:"ACCÈS HEBDOMADAIRE",seeAll:"Voir tout"},
  es:{eyebrow:"BIBLIOTECA LDR",title:"Bienvenido a tu Biblioteca LDR",desc:"Conocimiento, bienestar y oportunidades en un solo lugar.",motto:"Aprende hoy. Construye tu mañana.",search:"Buscar cursos, formaciones, libros, revistas o periódicos…",featured:"Destacados de la Semana",featuredDesc:"Empieza con contenidos accesibles y de gran valor.",newsstand:"Quiosco LDR",newsstandDesc:"Periódicos, revistas y publicaciones especiales.",bookstore:"Librería LDR",bookstoreDesc:"eBooks, libros y producciones especiales.",formations:"Formaciones",formationsDesc:"Desarrolla habilidades y avanza en tu carrera.",free:"Gratuitos",freeDesc:"Contenidos gratuitos para empezar ahora.",all:"Todos",open:"Acceder",entry:"ACCESO SEMANAL",seeAll:"Ver todos"}
} as const;

const ITEMS:Item[]=[
  {title:"Jornal LDR",subtitle:"Notícias, economia, tecnologia e mundo.",href:"/cliente/biblioteca/jornal-ldr",icon:"📰",price:"R$ 0,90 · € 0,90 / semana",tag:"jornal notícias economia tecnologia",group:"banca",color:"#0b2341",badge:"ACESSO SEMANAL"},
  {title:"Revista LDR",subtitle:"Carreira, bem-estar, negócios e tendências.",href:"/cliente/biblioteca/revista-ldr",icon:"📖",price:"R$ 0,90 · € 0,90 / semana",tag:"revista carreira negócios tendências",group:"banca",color:"#5b0824",badge:"ACESSO SEMANAL"},
  {title:"LDR Ciência",subtitle:"Artigos científicos, pesquisas e análises.",href:"/cliente/biblioteca/ldr-ciencia",icon:"🔬",price:"R$ 0,90 · € 0,90 / semana",tag:"ciência artigos pesquisa",group:"banca",color:"#403566",badge:"ACESSO SEMANAL"},
  {title:"Revista Negócios",subtitle:"Mercado, inovação e empreendedorismo.",href:"/cliente/biblioteca/publicacoes/revista-negocios",icon:"💼",price:"R$ 0,90 · € 0,90 / semana",tag:"revista negócios mercado inovação",group:"banca",color:"#5b2b86"},
  {title:"Jornal Europa",subtitle:"Europa em foco toda semana.",href:"/cliente/biblioteca/publicacoes/jornal-europa",icon:"🇪🇺",price:"R$ 0,90 · € 0,90 / semana",tag:"jornal europa",group:"banca",color:"#24476f"},
  {title:"eBook A Coragem de Começar",subtitle:"Leitura digital para transformar coragem em ação.",href:"/acoragemdecomecar",icon:"📘",price:"R$ 9,90 · € 4,90",tag:"ebook coragem começar",group:"livraria",color:"#5b0824"},
  {title:"Livros LDR",subtitle:"Livros e projetos editoriais do ecossistema.",href:"/livros",icon:"📚",tag:"livros editorial",group:"livraria",color:"#35101e"},
  {title:"Filme LDR",subtitle:"Produção audiovisual do ecossistema.",href:"/cliente/biblioteca",icon:"🎬",tag:"filme produção",group:"livraria",color:"#35101e"},
  {title:"Formação em IA",subtitle:"IA aplicada aos negócios e à carreira.",href:"/cliente/treinamentos/ia-negocios-carreira",icon:"🤖",tag:"ia formação inteligência artificial",group:"formacoes",color:"#143d59"},
  {title:"Psicanálise",subtitle:"Formação online em Psicanálise.",href:"/formacao-psicanalise",icon:"🧠",tag:"psicanálise formação",group:"formacoes",color:"#5b2b86"},
  {title:"Formações profissionais",subtitle:"Carreira, liderança, RH e outras formações.",href:"#formacoes-profissionais",icon:"🎓",tag:"formações cursos carreira liderança rh",group:"formacoes",color:"#0b5cab"},
  {title:"RH 600h",subtitle:"Formação gratuita em Gestão de Pessoas e RH.",href:"/cliente/formacoes/gestao-pessoas-rh",icon:"👥",tag:"rh gratuito gestão pessoas",group:"gratis",color:"#047857"},
  {title:"Carreira",subtitle:"Curso gratuito para organizar sua carreira.",href:"/cliente/cursos/organizar-carreira",icon:"💼",tag:"carreira gratuito",group:"gratis",color:"#b85c2e"},
  {title:"Francês A1",subtitle:"Francês básico para negócios.",href:"/cliente/cursos/frances-negocios-a1",icon:"🇫🇷",tag:"francês gratuito a1",group:"gratis",color:"#123f73"},
  {title:"Primeiros Socorros",subtitle:"Noções básicas de primeiros socorros.",href:"/cliente/cursos/primeiros-socorros",icon:"⛑️",tag:"primeiros socorros gratuito",group:"gratis",color:"#b4232a"}
];

function ShelfCard({item,t,large=false}:{item:Item;t:(typeof COPY)[Locale];large?:boolean}){
  return <a href={item.href} className={`group flex shrink-0 snap-start flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${large?"w-[210px] sm:w-auto":"w-[168px] sm:w-auto"}`}>
    <div className={`${large?"p-5":"p-4"} text-white`} style={{background:`linear-gradient(145deg,${item.color},#071426)`}}>
      <div className="flex min-w-0 items-start justify-between gap-2"><span className="shrink-0 text-3xl leading-none">{item.icon}</span>{item.badge&&<span className="rounded-full bg-[#d6ad63] px-2 py-1 text-[8px] font-black text-[#281605]">{item.badge}</span>}</div>
      <h3 className="mt-4 break-normal font-serif text-lg leading-tight !text-white">{item.title}</h3>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <p className="line-clamp-2 break-normal text-xs leading-5 text-slate-500">{item.subtitle}</p>
      {item.price&&<p className="mt-3 break-normal text-sm font-black leading-5 text-[#0b2341]">{item.price}</p>}
      {large&&<span className="mt-auto pt-4"><span className="inline-flex w-full justify-center rounded-xl bg-[#14518b] px-4 py-2.5 text-xs font-black text-white">{t.open}</span></span>}
    </div>
  </a>;
}

function Heading({icon,title,desc,href,label}:{icon:React.ReactNode;title:string;desc:string;href?:string;label:string}){
  return <div className="mb-4 flex items-end justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><div className="mt-1 shrink-0 text-[#b1842c]">{icon}</div><div className="min-w-0"><h2 className="break-normal font-serif text-3xl leading-tight text-[#0b2341]">{title}</h2><p className="mt-1 break-normal text-sm text-slate-500">{desc}</p></div></div>{href&&<a href={href} className="hidden shrink-0 rounded-full bg-[#f4efe3] px-4 py-2 text-xs font-black text-[#0b2341] sm:inline-flex">{label} →</a>}</div>;
}

export function LibraryStorefront({locale}:{locale:Locale}){
  const t=COPY[locale];
  const [q,setQ]=useState("");
  const [filter,setFilter]=useState<"all"|Group>("all");
  const filtered=useMemo(()=>ITEMS.filter(item=>(filter==="all"||item.group===filter)&&(`${item.title} ${item.subtitle} ${item.tag}`).toLowerCase().includes(q.trim().toLowerCase())),[q,filter]);
  const tabs:[["all"|Group,string],...(readonly ["all"|Group,string])[]]=[["all",t.all],["banca",t.newsstand],["livraria",t.bookstore],["formacoes",t.formations],["gratis",t.free]];
  const by=(group:Group)=>ITEMS.filter(i=>i.group===group);
  const highlights=[ITEMS[0],ITEMS[1],ITEMS[2],ITEMS[5]].filter(Boolean) as Item[];
  const searching=q.trim().length>0||filter!=="all";

  return <section className="min-w-0 space-y-8" aria-label={t.title}>
    <div className="overflow-hidden rounded-[26px] border border-[#d6ad63]/25 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#173f6b] px-5 py-6 text-white sm:px-8">
        <div className="flex items-center gap-4"><BookOpen className="h-12 w-12 shrink-0 text-[#d6ad63] sm:h-14 sm:w-14"/><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#d6ad63]">{t.eyebrow}</p><h2 className="mt-1 break-normal text-2xl font-black leading-tight !text-white sm:text-4xl">{t.title}</h2><p className="mt-1 break-normal text-sm !text-white/80">{t.desc}</p><p className="mt-1 text-sm font-black text-[#d6ad63]">{t.motto}</p></div></div>
      </div>
      <div className="p-4 sm:p-5"><div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0b2341]"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search} className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#d6ad63] focus:ring-2 focus:ring-[#d6ad63]/20"/></div><div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{tabs.map(([key,label])=><button key={key} onClick={()=>setFilter(key)} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${filter===key?"bg-[#0b2341] text-white":"bg-[#f4efe3] text-[#0b2341]"}`}>{label}</button>)}</div></div>
    </div>

    {searching?<section><Heading icon={<Search className="h-6 w-6"/>} title={filter==="all"?t.all:filter==="banca"?t.newsstand:filter==="livraria"?t.bookstore:filter==="formacoes"?t.formations:t.free} desc={t.featuredDesc} label={t.seeAll}/><div className="grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(item=><ShelfCard key={item.title} item={item} t={t}/>)}</div></section>:<>
      <section id="destaques-ldr" className="scroll-mt-24"><Heading icon={<Sparkles className="h-7 w-7"/>} title={t.featured} desc={t.featuredDesc} href="/cliente/biblioteca/publicacoes" label={t.seeAll}/><div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">{highlights.map(item=><ShelfCard key={item.title} item={item} t={t} large/>)}</div></section>

      <section><Heading icon={<Newspaper className="h-7 w-7"/>} title={t.newsstand} desc={t.newsstandDesc} href="/cliente/biblioteca/publicacoes" label={t.seeAll}/><div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible">{by("banca").map(item=><ShelfCard key={item.title} item={item} t={t}/>)}</div></section>

      <section><Heading icon={<BookOpen className="h-7 w-7"/>} title={t.bookstore} desc={t.bookstoreDesc} href="/livros" label={t.seeAll}/><div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 lg:grid-cols-3 sm:overflow-visible">{by("livraria").map(item=><ShelfCard key={item.title} item={item} t={t}/>)}</div></section>

      <section><Heading icon={<GraduationCap className="h-8 w-8"/>} title={t.formations} desc={t.formationsDesc} href="#formacoes-profissionais" label={t.seeAll}/><div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible">{by("formacoes").map(item=><ShelfCard key={item.title} item={item} t={t}/>)}</div></section>

      <section><Heading icon={<Sparkles className="h-7 w-7"/>} title={t.free} desc={t.freeDesc} label={t.seeAll}/><div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">{by("gratis").map(item=><ShelfCard key={item.title} item={item} t={t}/>)}</div></section>
    </>}
  </section>;
}
