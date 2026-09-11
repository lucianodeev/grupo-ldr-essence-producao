import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, FlaskConical, Newspaper, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EDITORIAL_CATALOG } from "@/lib/editorial-catalog";

export const Route=createFileRoute("/_clientarea/cliente/biblioteca/publicacoes")({component:PublicacoesHub});

function money(c:number,cur:"BRL"|"EUR"){return new Intl.NumberFormat(cur==="BRL"?"pt-BR":"pt-PT",{style:"currency",currency:cur}).format(c/100)}

function PublicacoesHub(){
  const [q,setQ]=useState("");
  const [tab,setTab]=useState<"todos"|"jornal"|"revista">("todos");
  const items=useMemo(()=>EDITORIAL_CATALOG.filter(x=>(tab==="todos"||x.kind===tab)&&(`${x.title} ${x.description} ${x.topics.join(" ")}`).toLowerCase().includes(q.toLowerCase())),[q,tab]);
  return <div className="space-y-7 pb-10">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/cliente/biblioteca" className="text-sm font-black text-[#0b2341]">← Minha Biblioteca</Link><Link to="/cliente/biblioteca/artigos-cientificos" className="rounded-full border border-[#d6ad63] px-4 py-2 text-xs font-black text-[#0b2341]">ARTIGOS CIENTÍFICOS</Link></div>
    <section className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[#071426] via-[#0b2341] to-[#163b67] p-7 text-white shadow-xl sm:p-10">
      <p className="text-xs font-black uppercase tracking-[.25em] text-[#d6ad63]">Central editorial LDR</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-6xl">Jornais, revistas & conhecimento</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">Publicações semanais independentes sobre economia, política, migração, tecnologia, saúde, negócios, viagem, carreira internacional e outros temas. Cada assinatura é separada da assinatura principal da Biblioteca.</p>
      <div className="mt-6 flex flex-wrap gap-2"><button onClick={()=>setTab("todos")} className={`rounded-full px-4 py-2 text-xs font-black ${tab==="todos"?"bg-[#d6ad63] text-[#281605]":"bg-white/10"}`}>TODOS</button><button onClick={()=>setTab("jornal")} className={`rounded-full px-4 py-2 text-xs font-black ${tab==="jornal"?"bg-[#d6ad63] text-[#281605]":"bg-white/10"}`}>JORNAIS</button><button onClick={()=>setTab("revista")} className={`rounded-full px-4 py-2 text-xs font-black ${tab==="revista"?"bg-[#d6ad63] text-[#281605]":"bg-white/10"}`}>REVISTAS</button></div>
    </section>

    <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por tema, publicação ou assunto" className="w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#d6ad63]"/></div>

    <section><div className="mb-4 flex items-center gap-2"><Newspaper className="h-5 w-5 text-[#a77b2e]"/><h2 className="font-serif text-3xl text-[#0b2341]">Publicações semanais</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(item=><Link key={item.productKey} to="/cliente/biblioteca/publicacoes/$slug" params={{slug:item.slug}} className="group overflow-hidden rounded-[26px] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="p-5 text-white" style={{background:`linear-gradient(135deg,${item.color},#071426)`}}><div className="flex items-start justify-between gap-3"><span className="text-3xl">{item.icon}</span><span className="rounded-full bg-white/15 px-3 py-1 text-[9px] font-black uppercase tracking-wider">Semanal</span></div><h3 className="mt-5 font-serif text-2xl leading-tight">{item.title}</h3><p className="mt-2 text-xs leading-5 text-white/70">{item.subtitle}</p></div><div className="p-5"><p className="text-sm leading-6 text-slate-600">{item.description}</p><div className="mt-4 flex flex-wrap gap-1.5">{item.topics.slice(0,4).map(t=><span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">{t}</span>)}</div><div className="mt-5 border-t pt-4"><p className="text-xs font-bold text-slate-500">Assinatura independente</p><p className="mt-1 font-black text-[#0b2341]">{money(item.priceEurCents,"EUR")} / semana <span className="font-medium text-slate-400">· Brasil {money(item.priceBrlCents,"BRL")}</span></p></div></div></Link>)}</div></section>

    <section className="grid gap-4 lg:grid-cols-2"><Link to="/cliente/biblioteca/artigos-cientificos" className="rounded-[26px] border border-[#d6ad63]/40 bg-[#fffaf0] p-6 shadow-sm"><FlaskConical className="h-7 w-7 text-[#a77b2e]"/><p className="mt-4 text-[10px] font-black uppercase tracking-[.2em] text-[#a77b2e]">Pesquisa acadêmica</p><h2 className="mt-2 font-serif text-3xl text-[#0b2341]">Artigos Científicos & Pesquisa</h2><p className="mt-3 text-sm leading-6 text-slate-600">Atalhos por área, fontes de acesso aberto e orientação para localizar DOI, autores, periódico e referências para trabalhos acadêmicos.</p></Link><div className="rounded-[26px] bg-[#5b0824] p-6 text-white"><BookOpen className="h-7 w-7 text-[#f0c775]"/><p className="mt-4 text-[10px] font-black uppercase tracking-[.2em] text-[#f0c775]">Edição especial premium</p><h2 className="mt-2 font-serif text-3xl">A Vida de Luciano</h2><p className="mt-3 text-sm leading-6 text-white/75">Uma história real em novos capítulos toda semana. Assinatura de €5,00 ou R$29,90 por semana.</p><Link to="/cliente/biblioteca/publicacoes/$slug" params={{slug:"a-vida-de-luciano"}} className="mt-5 inline-block rounded-xl bg-[#f0c775] px-4 py-3 text-xs font-black text-[#35101e]">CONHECER A REVISTA</Link></div></section>
  </div>
}
