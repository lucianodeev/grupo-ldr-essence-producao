import { Link, createFileRoute } from "@tanstack/react-router";

type Hub = {
  name: string;
  url: string;
  tag: string;
  desc: string;
  featured?: "academy" | "pass" | "network" | "career";
  cta?: string;
};

export const Route = createFileRoute("/ecossistema")({
  head: () => ({
    meta: [
      { title: "Mapa do Ecossistema LDR" },
      { name: "description", content: "Mapa público do ecossistema LDR: Academy, LDR PASS, Biblioteca, cursos gratuitos, Rede Acadêmica, LDR Carreira, divulgação gratuita de vagas, Clínica Social, LDR RH & Estratégia e Human Room." },
    ],
  }),
  component: EcosystemMap,
});

const hubs: Hub[] = [
  {
    name: "LDR Academy",
    url: "https://ldracademy.online/",
    tag: "Entrada principal",
    featured: "academy",
    desc: "A entrada central do ecossistema LDR para cursos, formações, biblioteca digital, conteúdos gratuitos, desenvolvimento profissional e acesso às principais soluções educacionais.",
  },
  {
    name: "LDR PASS",
    url: "/ldr-pass",
    tag: "Assinatura digital",
    featured: "pass",
    desc: "Assinatura digital do ecossistema para acessar conteúdos elegíveis, trilhas, eBooks e formações online selecionadas, preservando compras antigas e assinaturas separadas.",
    cta: "Conhecer o LDR PASS",
  },
  {
    name: "Biblioteca LDR",
    url: "/cliente/biblioteca",
    tag: "Conteúdos e assinatura",
    desc: "Biblioteca digital com cursos, eBooks, publicações, materiais gratuitos, formações e conteúdos para estudo contínuo.",
    cta: "Acessar Biblioteca",
  },
  {
    name: "Cursos Gratuitos",
    url: "/cliente/biblioteca/cursos-gratuitos",
    tag: "Acesso livre",
    desc: "Cursos gratuitos para entrada no ecossistema, incluindo idiomas, carreira, primeiros socorros e conteúdos introdutórios.",
    cta: "Ver Cursos Gratuitos",
  },
  {
    name: "Recrutamento & Seleção",
    url: "/falar-com-ecossistema?assunto=Empreendedorismo%2C%20neg%C3%B3cios%20e%20novas%20oportunidades&source=recrutamento_escala",
    tag: "Para empresas",
    featured: "career",
    desc: "Divulgue vagas, acesse talentos e conte com soluções para recrutamento. Projetos de contratação em grande volume são personalizados e não estão incluídos nas assinaturas, recebendo proposta separada conforme volume, perfil das vagas e escopo do processo.",
    cta: "Falar com o Comercial",
  },
  {
    name: "Rede Acadêmica LDR",
    url: "/cliente/rede-academica",
    tag: "Comunidade acadêmica",
    featured: "network",
    desc: "Comunidade acadêmica para estudantes, professores, profissionais e instituições compartilharem conhecimento, publicações, experiências, comentários, conexões e oportunidades.",
  },
  {
    name: "LDR Carreira",
    url: "/carreira",
    tag: "Vagas e desenvolvimento",
    featured: "career",
    desc: "Área de carreira para conectar talentos, empresas e oportunidades. Inclui orientação profissional, desenvolvimento de carreira e conexão com o mercado de trabalho.",
  },
  {
    name: "Divulgação de Vaga Gratuita",
    url: "/carreira?audience=company",
    tag: "Para empresas",
    featured: "career",
    desc: "Empresas podem divulgar vagas gratuitamente e ampliar o alcance para talentos conectados ao ecossistema LDR.",
  },
  {
    name: "Clínica Social LDR",
    url: "https://ldracademy.online/clinica-social",
    tag: "Cuidado social",
    desc: "Projeto social do ecossistema LDR para ampliar acesso a cuidado, acolhimento e encaminhamento, preservando confidencialidade e responsabilidade profissional.",
  },
  {
    name: "LDR RH & Estratégia",
    url: "https://ldrrhestrategia.com/",
    tag: "Institucional",
    desc: "Portal institucional da LDR com soluções para empresas, saúde mental e bem-estar corporativo, carreira, projetos educacionais, mentoria, RH e desenvolvimento humano.",
  },
  {
    name: "Human Room",
    url: "https://www.humanroom.online/",
    tag: "Projeto público",
    desc: "Espaço global de escuta, humanidade, reflexão e histórias reais, conectado ao propósito social e humano do ecossistema LDR.",
  },
  {
    name: "Instagram LDR Academy",
    url: "https://www.instagram.com/ldracademy.online",
    tag: "Social",
    desc: "Canal oficial da LDR Academy no Instagram para acompanhar conteúdos, novidades e conexões do ecossistema.",
  },
  {
    name: "Instagram Human Room",
    url: "https://www.instagram.com/humanroom.world",
    tag: "Social",
    desc: "Canal social do Human Room para conteúdos, reflexões e comunicação pública do projeto.",
  },
];

const features = [
  "Cursos e formações online",
  "Biblioteca digital",
  "eBooks e publicações",
  "Cursos gratuitos",
  "Rede Acadêmica",
  "Divulgação gratuita de vagas",
  "Desenvolvimento de carreira",
  "Projetos para empresas",
  "Clínica Social",
  "Human Room",
  "LDR PASS",
];

function external(url: string) {
  return url.startsWith("http");
}

function hubClasses(hub: Hub) {
  if (hub.featured === "network") {
    return {
      card: "group rounded-[26px] border border-[#7c5cff]/35 bg-gradient-to-br from-[#351073] via-[#4b1b91] to-[#6a36c9] p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
      tag: "inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-white ring-1 ring-white/25",
      title: "mt-4 font-serif text-2xl font-bold text-white",
      desc: "mt-2 text-sm text-white/90",
      link: "mt-4 break-all text-xs font-bold text-[#f8e28a] group-hover:underline",
    };
  }

  if (hub.featured === "pass") {
    return {
      card: "group rounded-[26px] border border-[#1d3158]/25 bg-[#071426] p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
      tag: "inline-flex rounded-full bg-[#f4c76b] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#1f1303]",
      title: "mt-4 font-serif text-2xl font-bold text-white",
      desc: "mt-2 text-sm text-white/80",
      link: "mt-4 break-all text-xs font-bold text-[#f4c76b] group-hover:underline",
    };
  }

  if (hub.featured === "career") {
    return {
      card: "group rounded-[26px] border border-[#b7d2ff] bg-[#eef5ff] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
      tag: "inline-flex rounded-full bg-[#1d3158] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-white",
      title: "mt-4 font-serif text-2xl font-bold text-[#071426]",
      desc: "mt-2 text-sm text-[#42526b]",
      link: "mt-4 break-all text-xs font-bold text-[#1d3158] group-hover:underline",
    };
  }

  return {
    card: "group rounded-[26px] border border-[#e5d1ac] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
    tag: "inline-flex rounded-full bg-[#f2e3c3] px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-[#7a4d14]",
    title: "mt-4 font-serif text-2xl font-bold text-[#25170f]",
    desc: "mt-2 text-sm text-[#6f6358]",
    link: "mt-4 break-all text-xs font-bold text-[#1d3158] group-hover:underline",
  };
}

function EcosystemMap() {
  return (
    <main className="min-h-screen bg-[#f8f1e7] text-[#25170f]">
      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <Link to="/" className="text-sm font-bold text-[#8a4c18]">← Voltar para LDR Academy</Link>
        <div className="mt-7 rounded-[34px] border border-[#d6ad63]/40 bg-white p-6 shadow-xl sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">Mapa central</p>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Ecossistema LDR organizado por entradas.</h1>
          <p className="mt-4 max-w-3xl text-base text-[#6f6358]">
            A LDR Academy conecta educação, carreira, biblioteca digital, rede acadêmica, projetos sociais, soluções para empresas e iniciativas humanas em um único ecossistema. Cada projeto mantém sua identidade, mas todos se conectam por caminhos claros.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/falar-com-ecossistema" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#9a6a20] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-white">💬 Falar com o Ecossistema</Link>
            <Link to="/ldr-pass" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1d3158] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-white">Ver LDR PASS</Link>
            <Link to="/cliente/biblioteca" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d6ad63] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-[#7a4d14]">Entrar na Biblioteca</Link>
            <Link to="/cliente/rede-academica" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#351073] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-[#351073]">Conhecer a Rede Acadêmica</Link>
            <a href="/carreira?audience=company" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#1d3158] px-5 py-3 text-sm font-black uppercase tracking-[.12em] text-[#1d3158]">Divulgar vaga gratuita</a>
          </div>
        </div>

        <section className="mt-8 rounded-[28px] border border-[#b7d2ff] bg-[#eef5ff] p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#1d3158]">Oportunidades</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#071426]">Empresas e candidatos conectados em uma única jornada.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#42526b]">O Ecossistema LDR conecta quem oferece oportunidades a quem está procurando trabalho. A publicação básica de vagas é gratuita e candidatos podem consultar oportunidades sem precisar assinar.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <a href="/carreira/empresa/publicar" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#b7d2ff] transition hover:-translate-y-0.5">
              <span className="text-2xl" aria-hidden="true">🏢</span><h3 className="mt-2 text-lg font-black text-[#07345b]">Sou empresa</h3><p className="mt-2 text-sm text-[#42526b]">Divulgue sua vaga gratuitamente e conecte sua empresa a profissionais do Ecossistema LDR.</p><span className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[#07345b] px-5 py-3 text-sm font-black text-white">Divulgar vaga gratuita</span>
            </a>
            <a href="/carreira/vagas" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#b7d2ff] transition hover:-translate-y-0.5">
              <span className="text-2xl" aria-hidden="true">👤</span><h3 className="mt-2 text-lg font-black text-[#07345b]">Sou candidato</h3><p className="mt-2 text-sm text-[#42526b]">Encontre vagas e use o Ecossistema para desenvolver sua preparação profissional.</p><span className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[#07345b] px-5 py-3 text-sm font-black text-white">Encontrar vagas</span>
            </a>
          </div>
          <div className="mt-5 rounded-2xl bg-white/80 p-4 text-sm leading-6 text-[#42526b]"><strong className="text-[#07345b]">LDR Academy + Carreira:</strong> assinantes podem acessar recursos adicionais de desenvolvimento profissional conforme o plano contratado. A assinatura não garante contratação e não é necessária para consultar vagas abertas.</div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#d6ad63]/50 bg-[#fffaf2] p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">Empreendedorismo e negócios</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#25170f]">Quer conversar sobre empreendedorismo ou negócios?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f6358]">O Ecossistema LDR também é um espaço para novas ideias, conexões e oportunidades. Estamos desenvolvendo novos projetos e algumas iniciativas ainda não foram apresentadas publicamente.</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f6358]">Se você é empreendedor, empresa, profissional, investidor ou simplesmente tem uma boa ideia, fale comigo pelo suporte. Talvez exista uma conversa que valha a pena começar.</p>
          <Link to="/falar-com-ecossistema" search={{ assunto: "Empreendedorismo, negócios e novas oportunidades", source: "ecossistema_negocios" } as any} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1d3158] px-5 py-3 text-sm font-black text-white">Quero conversar sobre negócios</Link>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#e5d1ac] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#9a6a20]">O que você encontra no ecossistema</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl bg-[#f8f1e7] px-4 py-3 text-sm font-bold text-[#25170f]">
                {feature}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hubs.map((hub) => {
            const styles = hubClasses(hub);
            return (
              <a key={hub.name} href={hub.url} target={external(hub.url) ? "_blank" : undefined} rel={external(hub.url) ? "noreferrer" : undefined} className={styles.card}>
                <span className={styles.tag}>{hub.tag}</span>
                <h2 className={styles.title}>{hub.name}</h2>
                <p className={styles.desc}>{hub.desc}</p>
                <span className={styles.link}>{hub.cta ?? `Conhecer ${hub.name}`} →</span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
