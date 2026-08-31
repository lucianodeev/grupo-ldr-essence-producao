import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, UserRound, UsersRound } from "lucide-react";
import { LanguageSelect } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grupo LDR Essence — Acessos e Sistema S8" },
      { name: "description", content: "Acesse sua área no ecossistema Grupo LDR Essence: cliente individual, empresa ou funcionário." },
      { property: "og:title", content: "Grupo LDR Essence — Acessos" },
      { property: "og:description", content: "Áreas organizadas para clientes, empresas e funcionários." },
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
] as const;

function Home() {
  return <div className="min-h-screen">
    <header className="text-primary-foreground shadow-sm" style={{background:"linear-gradient(135deg, var(--wine-deep), var(--wine))"}}><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6"><div className="min-w-0"><p className="break-words font-serif text-2xl">Grupo LDR Essence</p><p className="mt-1 text-sm opacity-85">Serviços, benefícios, desenvolvimento e bem-estar</p></div><LanguageSelect/></div></header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="s8-card min-w-0">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Grupo LDR Essence</p>
        <h1 className="mt-2 break-words font-serif text-3xl sm:text-4xl">Escolha sua área</h1>
        <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 text-muted-foreground">Cada perfil encontra apenas o que precisa. Cliente individual, empresa e funcionário têm acesso organizado a serviços, agenda, conteúdos e benefícios.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{ACCESS.map(({to,title,text,icon:Icon,featured})=><Link key={to} to={to} className={`min-w-0 rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${featured?"border-primary bg-primary text-primary-foreground":"bg-card"}`}><Icon className="h-7 w-7"/><h2 className="mt-3 break-words font-serif text-2xl">{title}</h2><p className={`mt-2 break-words text-sm leading-6 ${featured?"opacity-85":"text-muted-foreground"}`}>{text}</p><span className="mt-4 inline-block text-sm font-bold">Entrar →</span></Link>)}</div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="s8-card"><h2 className="font-serif text-2xl">Sistema S8 / Mentoria</h2><p className="mt-3 text-sm leading-6">Um percurso de oito encontros individuais de 50 minutos, conduzido pela LDR RH &amp; Estratégia, que estrutura o projeto de negócio do participante e conclui com um Plano de Desenvolvimento (PDE) personalizado.</p><Link to="/formulario" className="mt-5 inline-block rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">Quero participar</Link></div>
        <div className="s8-card"><h2 className="font-serif text-2xl">Outras páginas do ecossistema</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Conheça serviços, soluções corporativas e conteúdos para empreendedores.</p><div className="mt-4 grid gap-2"><a href="https://ldrrhestrategia.com/" target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-3 text-sm font-bold text-primary">Grupo LDR Essence</a><a href="https://www.lucianoempreendedor.com/" target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-3 text-sm font-bold text-primary">Luciano Empreendedor</a></div></div>
      </section>
    </main>
  </div>;
}
