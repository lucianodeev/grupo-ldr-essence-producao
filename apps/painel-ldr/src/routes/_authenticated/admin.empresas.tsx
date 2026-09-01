import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/empresas")({ component: EmpresasAdmin });

function EmpresasAdmin() {
  const access = useAccess();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p><h1 className="mt-2 font-serif text-3xl text-[#0B1F3A]">Empresas e funcionários</h1><p className="mt-3 text-sm text-slate-600">Acesso central às áreas administrativas de empresas, funcionários, equipe e permissões.</p></section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Link to="/painel-profissional/empresas" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Empresas / Funcionários</h2><p className="mt-2 text-sm text-slate-600">Gerenciar organizações e colaboradores vinculados.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/painel-profissional/equipe" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Equipe LDR</h2><p className="mt-2 text-sm text-slate-600">Consultar equipe interna autorizada.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/painel-profissional/acessos" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Gestão de acessos</h2><p className="mt-2 text-sm text-slate-600">Administrar permissões e acessos autorizados.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
      <Link to="/painel-profissional/catalogo" className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">Catálogo</h2><p className="mt-2 text-sm text-slate-600">Gerenciar serviços disponíveis na operação.</p><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>
    </section>
    <Link to="/admin" className="inline-flex rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link>
  </div>;
}
