import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ecossistema")({
  head: () => ({
    meta: [
      { title: "Mapa do Ecossistema LDR" },
      { name: "description", content: "Mapa central com os principais links públicos do ecossistema LDR: Academy, LDR PASS, Biblioteca, Rede Acadêmica, Clínica Social, LDR RH & Estratégia e Human Room." },
    ],
  }),
  component: EcosystemMap,
});

const hubs = [
  { name: "Entrada central de vendas", url: "https://ldracademy.online/", tag: "Entrada principal", desc: "Página principal para apresentar o ecossistema e conduzir para LDR PASS, Biblioteca, Rede Acadêmica e produtos digitais." },
  { name: "Mapa do Ecossistema", url: "/ecossistema", tag: "Central de links", desc: "Página que conecta todas as entradas públicas do ecossistema e evita páginas soltas." },
  { name: "LDR PASS", url: "/ldr-pass", tag: "Venda principal", desc: "Página comercial da assinatura digital elegível do ecossistema LDR." },
  { name: "Meu LDR PASS", url: "/cliente/ldr-pass", tag: "Área do cliente", desc: "Painel para visualizar status, benefícios e links de acesso do PASS." },
  { name: "Biblioteca LDR", url: "/cliente/biblioteca", tag: "Assinatura separada", desc: "Biblioteca atual com conteúdos, compras e assinatura própria preservada." },
  { name: "Rede Acadêmica LDR", url: "/cliente/rede-academica", tag: "Comunidade", desc: "Rede social acadêmica para estudantes, professores e profissionais." },
  { name: "Treinamentos LDR", url: "https://ldracademy.online/ecossistema", tag: "Centralizado na Academy", desc: "A antiga página pública /treinamento foi ocultada. Formações e treinamentos agora passam pela Academy, Biblioteca e LDR PASS." },
  { name: "Landing auxiliar", url: "https://learn.lucianoconecta.online/", tag: "Apoio comercial", desc: "Página auxiliar/legada de apoio. A entrada principal de vendas fica na LDR Academy e no LDR PASS." },
  { name: "LDR RH & Estratégia", url: "https://ldrrhestrategia.com/", tag: "Institucional", desc: "Portal institucional. A página pública de treinamento foi ocultada e direcionada para a LDR Academy." },
  { name: "Clínica Social LDR", url: "https://clinicasocial.ldrrhestrategia.com/", tag: "Cuidado social", desc: "Acesso social e rede de acolhimento, separado de assinatura ilimitada." },
  { name: "Human Room", url: "https://www.humanroom.online/", tag: "Projeto público", desc: "Espaço global de reflexão, humanidade, histórias e escuta." },
  { name: "Instagram Human Room", url: "https://www.instagram.com/humanroom.world", tag: "Social", desc: "Canal social do Human Room." },
];

function external(url: string) {
  return url.startsWith("http");
}

function EcosystemMap() {
  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#25170f]">
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <Link to="/" className="text-sm font-bold text-[#8a4c18]">← Voltar para LDR Academy</Link>
        <div className="mt-7 rounded-[34px] border border-[#d6ad63]/40 bg-white p-6 shadow-xl sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">Mapa central</p>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Ecossistema LDR organizado por entradas.</h1>
          <p className="mt-4 max-w-3xl text-base text-[#6f6358]">Cada projeto mantém sua individualidade, mas todas as entradas públicas agora se referenciam: vendas, LDR PASS, Biblioteca, Rede Acadêmica, Clínica Social, LDR RH & Estratégia e Human Room.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/ldr-pass" className="rounded-full bg-[#1d3158] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-white">Ver LDR PASS</Link>
            <Link to="/cliente/biblioteca" className="rounded-full border border-[#d6ad63] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-[#7a4d14]">Entrar na Biblioteca</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hubs.map((hub) => (
            <a key={hub.name} href={hub.url} target={external(hub.url) ? "_blank" : undefined} rel={external(hub.url) ? "noreferrer" : undefined} className="group rounded-[26px] border border-[#e5d1ac] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <span className="inline-flex rounded-full bg-[#f2e3c3] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#7a4d14]">{hub.tag}</span>
              <h2 className="mt-4 font-serif text-2xl font-bold text-[#25170f]">{hub.name}</h2>
              <p className="mt-2 text-sm text-[#6f6358]">{hub.desc}</p>
              <p className="mt-4 break-all text-xs font-bold text-[#1d3158] group-hover:underline">{hub.url}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
