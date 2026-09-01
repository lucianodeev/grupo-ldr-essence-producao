import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BriefcaseBusiness, Building2, Sparkles, UserRound, UsersRound } from "lucide-react";
import { LanguageSelect } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grupo LDR Essence — Acessos e Sistema S8" },
      { name: "description", content: "Acesse sua área no ecossistema Grupo LDR Essence: cliente individual, empresa, funcionário ou profissional." },
      { property: "og:title", content: "Grupo LDR Essence — Acessos" },
      { property: "og:description", content: "Áreas organizadas para clientes, empresas, funcionários e profissionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ACCESS = [
  { to:"/cliente/login", title:"Área do Cliente", text:"Compras, agenda, serviços, biblioteca, e-book, treinamentos e acompanhamento.", icon:UserRound, featured:true },
  { to:"/empresa/login", title:"Área da Empresa", text:"Gerencie funcionários, benefícios, contratação, pagamentos e agenda corporativa.", icon:Building2 },
  { to:"/funcionario/login", title:"Área do Funcionário", text:"Consulte benefícios, créditos, agenda, notificações e conteúdos disponibilizados.", icon:UsersRound },
  { to:"/profissional/login", title:"Área do Profissional", text:"Perfil, agenda, serviços, atendimentos, financeiro, treinamentos e recursos da Rede LDR.", icon:BriefcaseBusiness },
] as const;

function Home() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="text-primary-foreground shadow-sm" style={{background:"linear-gradient(135deg, var(--wine-deep), var(--wine))"}}><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6"><div className="min-w-0"><p className="break-words font-serif text-2xl">Grupo LDR Essence</p><p className="mt-1 text-sm opacity-85">Serviços, benefícios, desenvolvimento e bem-estar</p></div><LanguageSelect/></div></header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="s8-card min-w-0 overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Grupo LDR Essence</p><h1 className="mt-2 break-words font-serif text-3xl sm:text-4xl">Escolha sua área</h1><p className="mt-3 max-w-3xl text-[0.98rem] leading-7 text-muted-foreground">Cada perfil encontra apenas o que precisa. Cliente individual, empresa, funcionário e profissional têm acessos organizados a serviços, agenda, conteúdos e benefícios.</p></div><Link to="/profissionais" className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-primary-foreground">Encontrar profissionais <ArrowUpRight className="h-4 w-4"/></Link></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{ACCESS.map(({to,title,text,icon:Icon,featured})=><Link key={to} to={to} className={`group min-w-0 rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${featured?"border-primary bg-primary text-primary-foreground":"bg-card hover:border-primary/25"}`}><div className={`grid h-11 w-11 place-items-center rounded-2xl ${featured?"bg-white/15":"bg-primary/10 text-primary"}`}><Icon className="h-6 w-6"/></div><h2 className="mt-4 break-words font-serif text-2xl">{title}</h2><p className={`mt-2 break-words text-sm leading-6 ${featured?"opacity-85":"text-muted-foreground"}`}>{text}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-black">Entrar <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/></span></Link>)}</div>
      </section>

      <section className="relative mt-4 overflow-hidden rounded-[2rem] bg-primary p-7 text-primary-foreground shadow-xl shadow-primary/10 sm:p-9"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"/><div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.16em]"><Sparkles className="h-4 w-4 text-secondary"/>Rede de Profissionais LDR</div><h2 className="mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">Você é profissional? Faça parte de uma rede criada para organizar e fortalecer sua presença.</h2><p className="mt-3 max-w-3xl text-sm leading-7 opacity-85 sm:text-base">Conheça os planos, recursos, comunidade, treinamentos e ferramentas da Rede LDR antes de criar seu perfil.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link to="/para-profissionais" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-4 text-sm font-black text-secondary-foreground shadow-lg transition hover:-translate-y-0.5">Conhecer a Rede <ArrowUpRight className="h-4 w-4"/></Link><Link to="/profissional/login" className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-6 py-4 text-sm font-black transition hover:bg-white/10">Já sou profissional</Link></div></div></section>

      <a data-card="ebook-home-ldr" href="https://www.lucianoempreendendor.com/" target="_blank" rel="noreferrer" className="mt-4 block rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><p className="text-xs font-black uppercase tracking-[.16em]">PLATAFORMA PARA EMPREENDEDORES</p><h2 className="mt-2 font-serif text-2xl">E-book e biblioteca — A Coragem de Começar</h2><p className="mt-2 text-sm">Acesse o e-book, conteúdos e recursos da plataforma.</p></a>
      <section className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="s8-card"><h2 className="font-serif text-2xl">Sistema S8 / Mentoria</h2><p className="mt-3 text-sm leading-6">Um percurso de oito encontros individuais de 50 minutos, conduzido pela LDR RH &amp; Estratégia, que estrutura o projeto de negócio do participante e conclui com um Plano de Desenvolvimento (PDE) personalizado.</p><Link to="/formulario" className="mt-5 inline-block rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">Quero participar</Link></div>
        <div className="s8-card"><h2 className="font-serif text-2xl">Outras páginas do ecossistema</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Conheça serviços, soluções corporativas e conteúdos para empreendedores.</p><div className="mt-4 grid gap-2"><a href="https://ldrrhestrategia.com/" target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-3 text-sm font-bold text-primary">Grupo LDR Essence</a><a href="https://www.lucianoempreendendor.com/" target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-3 text-sm font-bold text-primary">Luciano Empreendedor</a></div></div>
      </section>
    </main>
  </div>;
}
