import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/empresas/ldr-one')({ component: EmpresaPage })

function EmpresaPage() {
  return <main className="min-h-screen bg-slate-950 px-5 py-16 text-white"><div className="mx-auto max-w-4xl"><Link to="/empresas" className="text-sm text-amber-300">← Central Empresas LDR</Link><p className="mt-12 text-sm uppercase tracking-widest text-amber-300">Ecossistema LDR · Empresas</p><h1 className="mt-4 text-4xl font-bold md:text-6xl">LDR ONE para Empresas</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Soluções de acesso e benefícios corporativos. Disponibilidade e condições sujeitas a validação comercial.</p><div className="mt-10 flex flex-wrap gap-4"><Link to="/planos-empresas" className="rounded-xl border border-amber-400/50 px-6 py-3 text-amber-200 hover:bg-amber-400/10">Conhecer planos existentes</Link><Link to="/empresas/proposta" className="rounded-xl border border-amber-400/50 px-6 py-3 text-amber-200 hover:bg-amber-400/10">Solicitar proposta</Link></div><p className="mt-16 text-sm text-slate-400">Uma página filha do Ecossistema LDR. Sem pagamentos ou novas contas nesta etapa.</p></div></main>
}
