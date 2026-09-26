import { Link, createFileRoute } from "@tanstack/react-router";
import { useAccess } from "@/lib/central-data";

export const Route = createFileRoute("/_authenticated/admin/rede")({ component: RedeAdmin });

function RedeAdmin() {
  const access = useAccess();
  if (access.isLoading) return <div className="s8-card mx-auto max-w-md text-center">Carregando...</div>;
  if (access.isError) return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">Sessão expirada</h1><p className="mt-2 text-sm text-muted-foreground">Falha na validação do acesso. Informe o código abaixo para corrigirmos a origem.</p><p className="mt-3 break-all rounded-lg bg-slate-100 p-3 text-xs text-slate-800">{access.error instanceof Error ? access.error.message : "ACCESS_UNKNOWN"}</p><a href="/login" className="mt-5 inline-flex rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white">Entrar novamente</a></div>;
  if (!access.data?.authorized || access.data.role !== "superadmin") return <div className="s8-card mx-auto max-w-xl text-center"><h1 className="font-serif text-3xl">Acesso restrito</h1><p className="mt-2 text-sm text-muted-foreground">Área exclusiva do administrador Master.</p><a href="/login" className="mt-5 inline-flex rounded-xl border px-5 py-3 text-sm font-bold">Trocar de conta</a></div>;

  const links = [
    ["Profissionais", "/admin/profissionais"],
    ["Serviços", "/admin/profissionais-servicos"],
    ["Planos", "/admin/profissionais-planos"],
    ["Financeiro", "/admin/profissionais-financeiro"],
    ["Repasses", "/admin/profissionais-repasses"],
    ["Conformidade", "/admin/profissionais-conformidade"],
    ["Treinamentos / Comunidade", "/admin/profissionais-conteudo"],
    ["Avaliações", "/painel-profissional/rede-avaliacoes"],
  ] as const;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-[#C7A33B]/60 bg-[#F8F3E8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C7A33B]">Painel Master LDR</p><h1 className="mt-2 font-serif text-3xl text-[#0B1F3A]">Rede de Profissionais LDR</h1><p className="mt-3 text-sm text-slate-600">Administração central da rede, preservando as funções seguras e regras de acesso existentes.</p></section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{links.map(([label,to]) => <Link key={to} to={to} className="rounded-2xl border border-[#C7A33B]/40 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#0B1F3A]">{label}</h2><span className="mt-4 inline-block text-sm font-bold text-[#0B1F3A]">Abrir →</span></Link>)}</section>
    <Link to="/admin" className="inline-flex rounded-xl border border-[#C7A33B] bg-white px-4 py-3 text-sm font-bold text-[#0B1F3A]">← Painel Master</Link>
  </div>;
}
