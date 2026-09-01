import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/rede")({ component: RedeAdmin });

function RedeAdmin() {
  const access = useAccess();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">403</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador master.</p></div>;

  const links = [
    ["Profissionais", "/painel-profissional/rede-profissionais"],
    ["Serviços", "/painel-profissional/rede-servicos"],
    ["Planos", "/painel-profissional/rede-planos"],
    ["Financeiro", "/painel-profissional/rede-profissionais-financeiro"],
    ["Repasses", "/painel-profissional/rede-profissionais-repasses"],
    ["Conformidade", "/painel-profissional/rede-profissionais-conformidade"],
    ["Treinamentos / Comunidade", "/painel-profissional/rede-profissionais-conteudo"],
    ["Avaliações", "/painel-profissional/rede-avaliacoes"],
  ] as const;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p><h1 className="mt-2 font-serif text-3xl text-[#0B1F3A]">Rede de Profissionais LDR</h1><p className="mt-3 text-sm text-slate-600">Administração central da rede, preservando as funções seguras e regras de acesso existentes.</p></section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{links.map(([label,to]) => <Link key={to} to={to} className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">{label}</h2><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>)}</section>
    <Link to="/admin" className="inline-flex rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link>
  </div>;
}
