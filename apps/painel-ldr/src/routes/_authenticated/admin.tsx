import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin")({ component: MasterAdmin });

const sections = [
  { title: "Meus atendimentos", description: "Acesse sua operação diária, sessões, agenda e clientes próprios.", links: [
    ["Central de atendimentos", "/admin/meus-atendimentos"],
    ["Minha agenda", "/painel-profissional/agenda"],
    ["Meus clientes", "/painel-profissional/clientes"],
    ["Meus pedidos", "/painel-profissional/pedidos"],
  ]},
  { title: "Rede de Profissionais LDR", description: "Administre profissionais, serviços, planos, financeiro, repasses, conformidade e conteúdo.", links: [
    ["Profissionais", "/painel-profissional/rede-profissionais"],
    ["Serviços da rede", "/painel-profissional/rede-servicos"],
    ["Planos da rede", "/painel-profissional/rede-planos"],
    ["Financeiro da rede", "/painel-profissional/rede-profissionais-financeiro"],
    ["Repasses", "/painel-profissional/rede-profissionais-repasses"],
    ["Conformidade", "/painel-profissional/rede-profissionais-conformidade"],
    ["Treinamentos / Comunidade", "/painel-profissional/rede-profissionais-conteudo"],
    ["Avaliações", "/painel-profissional/rede-avaliacoes"],
  ]},
  { title: "Empresas, funcionários e operação", description: "Centralize empresas, colaboradores, equipe, catálogo, entregas e acessos.", links: [
    ["Empresas / Funcionários", "/painel-profissional/empresas"],
    ["Equipe LDR", "/painel-profissional/equipe"],
    ["Catálogo de serviços", "/painel-profissional/catalogo"],
    ["Entregas", "/painel-profissional/entregas"],
    ["Notificações", "/painel-profissional/notificacoes"],
    ["Gestão de acessos", "/painel-profissional/acessos"],
  ]},
  { title: "Clientes e desenvolvimento", description: "Acompanhe clientes, mentorias, S8, treinamentos e conteúdos do ecossistema.", links: [
    ["Clientes", "/painel-profissional/clientes"],
    ["Mentoria", "/painel-profissional/mentoria"],
    ["Sistema S8", "/painel-profissional/s8"],
    ["Treinamentos", "/painel-profissional/treinamentos"],
    ["Comentários / Fórum", "/painel-profissional/comentarios"],
  ]},
] as const;

function MasterAdmin() {
  const access = useAccess();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando painel master...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") {
    return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Esta área é exclusiva do administrador master da LDR.</p></div>;
  }

  return <div className="space-y-7">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p>
      <h1 className="mt-2 font-serif text-3xl text-[#0B1F3A] sm:text-4xl">Central de administração e atendimentos</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Um único ponto de acesso para administrar o ecossistema LDR e chegar rapidamente aos seus próprios atendimentos, mantendo os painéis de profissionais, empresas, funcionários e clientes separados por permissão.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/admin/meus-atendimentos" className="rounded-xl bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white">Meus atendimentos</Link>
        <Link to="/painel-profissional/agenda" className="rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Abrir minha agenda</Link>
        <Link to="/painel-profissional" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">Central operacional</Link>
      </div>
    </section>

    <section className="grid gap-5 md:grid-cols-2">
      {sections.map(section => <article key={section.title} className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-2xl text-[#0B1F3A]">{section.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {section.links.map(([label,to]) => <Link key={to} to={to} className="rounded-xl border border-[#C7A33B]/35 bg-[#F8F3E8] px-3 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#C7A33B] hover:bg-white">{label} →</Link>)}
        </div>
      </article>)}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-serif text-2xl text-[#0B1F3A]">Separação de acesso</h2>
      <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
        <p><strong className="text-[#0B1F3A]">Master:</strong> visão administrativa global.</p>
        <p><strong className="text-[#0B1F3A]">Profissional:</strong> somente dados e operação próprios.</p>
        <p><strong className="text-[#0B1F3A]">Empresa:</strong> somente sua organização e funcionários.</p>
        <p><strong className="text-[#0B1F3A]">Funcionário:</strong> somente seus benefícios e serviços.</p>
        <p><strong className="text-[#0B1F3A]">Cliente:</strong> somente seus pedidos, agenda e dados.</p>
      </div>
    </section>
  </div>;
}
