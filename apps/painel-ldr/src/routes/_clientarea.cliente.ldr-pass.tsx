import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_clientarea/cliente/ldr-pass")({
  component: ClientLdrPass,
});

const benefits = [
  { title: "Conteúdos digitais elegíveis", desc: "Cursos digitais, eBooks e materiais aprovados para o PASS aparecem como liberáveis pela camada de elegibilidade." },
  { title: "Compras antigas preservadas", desc: "Aquilo que o cliente já comprou ou recebeu como vitalício continua funcionando fora do PASS." },
  { title: "Separação segura", desc: "Biblioteca legacy, revista/editorial, clínica, serviços humanos, B2B e aulas ao vivo continuam separados." },
];

const access = [
  { label: "Página comercial do PASS", url: "/ldr-pass" },
  { label: "Mapa do ecossistema", url: "/ecossistema" },
  { label: "Minha Biblioteca", url: "/cliente/biblioteca" },
  { label: "Rede Acadêmica", url: "/cliente/rede-academica" },
  { label: "Cursos gratuitos", url: "/cliente/biblioteca/cursos-gratuitos" },
  { label: "Pedidos e pagamentos", url: "/cliente/pedidos" },
];

function ClientLdrPass() {
  return (
    <div className="space-y-6">
      <Link to="/cliente/biblioteca" className="text-sm font-bold text-[#9a4828]">← Minha Biblioteca</Link>
      <section className="rounded-[30px] border border-[#d6ad63]/40 bg-gradient-to-br from-[#081326] via-[#102c55] to-[#5f2b16] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#f4c76b]">Meu LDR PASS</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="font-serif text-4xl font-bold">Seu painel de acesso digital LDR.</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/75">Aqui o cliente acompanha a proposta do PASS, os benefícios elegíveis e os atalhos para navegar pelo ecossistema sem misturar produtos separados.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[.16em] text-white/50">Status comercial</p>
            <p className="mt-1 text-xl font-black text-[#f4c76b]">Pronto para ativação Stripe</p>
            <p className="mt-2 text-xs text-white/65">A fundação técnica está publicada; o checkout próprio deve ser ligado somente quando o produto/preço final for aprovado.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {benefits.map((item) => (
          <article key={item.title} className="rounded-[24px] border bg-white p-5 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#5d2917]">{item.title}</h2>
            <p className="mt-2 text-sm text-[#64748b]">{item.desc}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border bg-[#fffaf7] p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-bold text-[#5d2917]">Links do ecossistema para o cliente</h2>
        <p className="mt-2 text-sm text-[#64748b]">Use estes atalhos como central de navegação enquanto o checkout específico do PASS é preparado com segurança.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {access.map((item) => (
            <Link key={item.url} to={item.url} className="rounded-2xl border border-[#ead6c7] bg-white p-4 text-sm font-black text-[#7b351f] transition hover:border-[#b85c2e] hover:shadow-md">{item.label}<span className="mt-1 block text-xs font-medium text-[#94a3b8]">{item.url}</span></Link>
          ))}
        </div>
      </section>
    </div>
  );
}
