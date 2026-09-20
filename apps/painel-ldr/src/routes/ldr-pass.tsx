import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ldr-pass")({
  head: () => ({
    meta: [
      { title: "LDR PASS | Acesso digital ao ecossistema LDR" },
      { name: "description", content: "Conheça o LDR PASS: uma assinatura digital para reunir cursos, eBooks, biblioteca digital elegível e caminhos de aprendizagem dentro do ecossistema LDR." },
      { property: "og:title", content: "LDR PASS | Seu acesso digital ao ecossistema LDR" },
      { property: "og:description", content: "Cursos digitais, eBooks, trilhas e recursos elegíveis em uma experiência organizada, sem misturar serviços humanos, Biblioteca legacy ou editorial." },
    ],
  }),
  component: LdrPassPage,
});

const included = [
  "Cursos digitais e formações 100% online marcados como elegíveis",
  "eBooks, livros digitais e materiais de estudo aprovados para o PASS",
  "Trilhas de carreira, IA, empreendedorismo e desenvolvimento profissional",
  "Mapa do ecossistema para acessar LDR Academy, Rede Acadêmica, Biblioteca, Clínica Social e Human Room",
];

const separated = [
  "Compras antigas e acessos vitalícios continuam preservados",
  "Biblioteca LDR legacy continua com assinatura própria",
  "Revista Psicanálise no Mundo/editorial continua separada",
  "Sessões humanas, clínica, mentoria ao vivo, B2B e serviços premium não entram como ilimitados",
];

function LdrPassPage() {
  return (
    <main className="min-h-screen bg-[#070b17] text-white">
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <Link to="/" className="text-sm font-bold text-[#f4c76b]">← LDR Academy</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#f4c76b]">LDR PASS</p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-6xl">Um acesso digital para navegar pelo ecossistema LDR.</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/75">O LDR PASS organiza conteúdos digitais elegíveis em uma assinatura simples, com segurança para não quebrar compras antigas, assinaturas existentes ou serviços humanos do ecossistema.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/cliente/ldr-pass" className="rounded-full bg-[#f4c76b] px-6 py-3 text-sm font-black uppercase tracking-[.12em] text-[#1f1303] shadow-lg">Ver meu PASS</Link>
              <Link to="/ecossistema" className="rounded-full border border-white/20 px-6 py-3 text-sm font-black uppercase tracking-[.12em] text-white hover:bg-white/10">Mapa do ecossistema</Link>
              <Link to="/cliente/biblioteca" className="rounded-full border border-[#f4c76b]/50 px-6 py-3 text-sm font-black uppercase tracking-[.12em] text-[#f4c76b] hover:bg-[#f4c76b]/10">Biblioteca atual</Link>
            </div>
          </div>
          <aside className="rounded-[32px] border border-white/15 bg-white/[.06] p-6 shadow-2xl backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#f4c76b]">Produto comercial</p>
            <h2 className="mt-3 font-serif text-3xl font-bold">PASS Digital</h2>
            <p className="mt-3 text-sm text-white/70">Camada preparada para checkout próprio no Stripe. Até a ativação comercial final, a página mostra a arquitetura, benefícios e separações de segurança.</p>
            <div className="mt-6 rounded-2xl bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[.16em] text-white/50">Status</p>
              <p className="mt-1 text-lg font-black text-emerald-300">Fundação pronta + elegibilidade ativa</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-16 lg:grid-cols-2">
        <div className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/[.06] p-6">
          <h2 className="font-serif text-2xl font-bold text-emerald-200">Inclui no PASS</h2>
          <div className="mt-5 space-y-3">{included.map((item) => <p key={item} className="rounded-2xl bg-white/[.06] p-4 text-sm text-white/80">✓ {item}</p>)}</div>
        </div>
        <div className="rounded-[28px] border border-[#f4c76b]/20 bg-[#f4c76b]/[.06] p-6">
          <h2 className="font-serif text-2xl font-bold text-[#f4c76b]">Separado e protegido</h2>
          <div className="mt-5 space-y-3">{separated.map((item) => <p key={item} className="rounded-2xl bg-white/[.06] p-4 text-sm text-white/80">• {item}</p>)}</div>
        </div>
      </section>
    </main>
  );
}
