import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, BriefcaseBusiness, Building2, GraduationCap, Mic2, Newspaper, Search, Users } from "lucide-react";

export const Route = createFileRoute("/imprensa/")({
  head: () => ({
    meta: [
      { title: "LDR Imprensa | Informação, Educação, Carreira e Sociedade" },
      { name: "description", content: "LDR Imprensa conecta informação, conhecimento, jornalistas, especialistas, universidades, profissionais e sociedade." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: ImprensaHome,
});

const categories = ["Educação", "Universidades", "Carreira", "Empregabilidade", "Mercado de Trabalho", "Ciência", "Saúde e Bem-Estar", "Empreendedorismo", "Sociedade", "Internacional"];

function ImprensaHome() {
  return <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
    <header className="border-b border-[#d9d2c0] bg-[#071f36] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link reloadDocument to="/imprensa" className="flex items-center gap-3 font-black tracking-wide"><Newspaper aria-hidden="true" /> LDR IMPRENSA</Link>
        <nav className="hidden gap-6 text-sm md:flex" aria-label="Navegação da imprensa">
          <a href="#noticias" className="hover:underline">Notícias</a><a href="#categorias" className="hover:underline">Categorias</a>
          <Link reloadDocument to="/imprensa/fontes" className="hover:underline">Fontes</Link><Link reloadDocument to="/imprensa/jornalistas" className="hover:underline">Jornalistas</Link>
        </nav>
      </div>
    </header>

    <section className="bg-[#071f36] text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="text-sm font-bold uppercase tracking-[.22em] text-[#d9b85f]">Informação • Educação • Carreira • Sociedade</p>
        <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">Informação que conecta conhecimento, carreira e sociedade.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">Um novo espaço do ecossistema LDR para aproximar jornalistas, especialistas, universidades, profissionais e pessoas interessadas em compreender o que está transformando educação, trabalho e sociedade.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#noticias" className="rounded-full bg-[#d9b85f] px-6 py-3 font-bold text-[#071f36]">Explorar notícias</a>
          <Link reloadDocument to="/imprensa/jornalistas" className="rounded-full border border-white/35 px-6 py-3 font-bold">Sou jornalista</Link>
          <Link reloadDocument to="/imprensa/fontes" className="rounded-full border border-white/35 px-6 py-3 font-bold">Quero ser fonte</Link>
        </div>
      </div>
    </section>

    <section id="noticias" className="mx-auto max-w-7xl px-5 py-14">
      <div className="flex items-end justify-between gap-5 border-b border-slate-300 pb-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[#8b6c1f]">Em lançamento</p><h2 className="mt-1 text-3xl font-black">LDR Imprensa</h2></div><span className="text-sm text-slate-500">Conteúdo editorial em preparação</span></div>
      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <EditorialCard icon={<GraduationCap />} kicker="Educação" title="Conhecimento que atravessa a universidade e chega à sociedade" text="Cobertura e análises sobre educação, permanência estudantil, formação e novas possibilidades de aprendizagem." />
        <EditorialCard icon={<BriefcaseBusiness />} kicker="Carreira" title="Trabalho, oportunidades e as transformações do mercado" text="Um espaço para acompanhar empregabilidade, profissões, desenvolvimento e relações entre formação e mercado." />
        <EditorialCard icon={<Mic2 />} kicker="Entrevistas" title="Especialistas e experiências que ajudam a compreender o presente" text="A LDR Imprensa nasce também como ponte entre jornalistas e pessoas com conhecimento para contribuir com pautas." />
      </div>
    </section>

    <section id="categorias" className="border-y border-[#d9d2c0] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14"><h2 className="text-3xl font-black">Editorias</h2><div className="mt-7 flex flex-wrap gap-3">{categories.map(c => <span key={c} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">{c}</span>)}</div></div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
      <Callout icon={<Search />} title="Procura uma fonte?" text="Jornalistas poderão solicitar especialistas, pesquisadores, professores e profissionais para contribuir com reportagens e entrevistas." to="/imprensa/fontes" action="Procurar uma fonte" />
      <Callout icon={<Users />} title="Faça parte do LDR Imprensa" text="Jornalistas, comunicadores, estudantes, correspondentes, editores e veículos podem manifestar interesse em participar desta nova rede." to="/imprensa/jornalistas" action="Sou jornalista" />
    </section>

    <section className="bg-[#0b2c4b] text-white"><div className="mx-auto max-w-7xl px-5 py-14"><p className="text-sm font-bold uppercase tracking-widest text-[#d9b85f]">Um ecossistema conectado</p><h2 className="mt-2 max-w-3xl text-3xl font-black">Informação pode abrir caminhos para conhecimento e oportunidades.</h2><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Rede Acadêmica", <Users />],["LDR Academy", <BookOpen />],["LDR Carreira", <BriefcaseBusiness />],["Universidades e sociedade", <Building2 />]].map(([label,icon]) => <div key={String(label)} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">{icon}<strong>{label}</strong></div>)}</div></div></section>

    <footer className="bg-[#061725] text-white/70"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between"><div><strong className="text-white">LDR Imprensa</strong><p className="mt-1 text-sm">Informação • Educação • Carreira • Sociedade</p></div><Link reloadDocument to="/imprensa/sala-de-imprensa" className="text-sm font-bold text-white">Sala de Imprensa →</Link></div></footer>
  </main>;
}

function EditorialCard({icon,kicker,title,text}:{icon:React.ReactNode;kicker:string;title:string;text:string}) { return <article className="rounded-3xl border border-[#d9d2c0] bg-white p-7 shadow-sm"><div className="text-[#8b6c1f]">{icon}</div><p className="mt-8 text-xs font-black uppercase tracking-widest text-[#8b6c1f]">{kicker}</p><h3 className="mt-2 text-2xl font-black leading-tight">{title}</h3><p className="mt-4 leading-7 text-slate-600">{text}</p></article> }
function Callout({icon,title,text,to,action}:{icon:React.ReactNode;title:string;text:string;to:string;action:string}) { return <div className="rounded-3xl border border-[#d9d2c0] bg-white p-7"><div className="text-[#8b6c1f]">{icon}</div><h2 className="mt-5 text-2xl font-black">{title}</h2><p className="mt-3 leading-7 text-slate-600">{text}</p><Link reloadDocument to={to} className="mt-6 inline-flex items-center gap-2 font-black text-[#07345b]">{action}<ArrowRight size={18}/></Link></div> }
