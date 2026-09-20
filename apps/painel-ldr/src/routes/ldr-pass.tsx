import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { clientCreateLdrPassCheckout } from "@/lib/ldr-pass.functions";

export const Route = createFileRoute("/ldr-pass")({
  head: () => ({
    meta: [
      { title: "LDR PASS | Planos do ecossistema LDR" },
      { name: "description", content: "Conheça LDR PASS, LDR PASS PRO e LDR PASS BUSINESS. O que é gratuito no Ecossistema LDR continua gratuito." },
      { property: "og:title", content: "LDR PASS | Seu acesso ao ecossistema LDR" },
      { property: "og:description", content: "Três planos para aprendizagem, carreira e empresas, preservando recursos gratuitos, compras antigas e serviços humanos separados." },
    ],
  }),
  component: LdrPassPage,
});

const plans = [
  { key: "pass" as const, name: "LDR PASS", br: "R$ 49,90/mês", brAnnual: "R$ 499/ano", eu: "€ 9,90/mês", euAnnual: "€ 99/ano", desc: "Conteúdo, aprendizagem e desenvolvimento.", items: ["Cursos digitais elegíveis", "eBooks e materiais elegíveis", "Trilhas de carreira, IA e empreendedorismo", "Benefícios digitais identificados como PASS"] },
  { key: "pro" as const, name: "LDR PASS PRO", br: "R$ 149,90/mês", brAnnual: "R$ 1.499/ano", eu: "€ 29,90/mês", euAnnual: "€ 299/ano", desc: "Carreira e recursos profissionais premium.", items: ["Tudo que for elegível no PASS", "Recursos avançados de carreira", "Avaliações e ferramentas profissionais", "Créditos somente para serviços elegíveis quando configurados"] },
  { key: "business" as const, name: "LDR PASS BUSINESS", br: "R$ 499/mês", brAnnual: "R$ 4.990/ano", eu: "€ 99/mês", euAnnual: "€ 990/ano", desc: "Recursos premium para empresas, talentos e recrutamento.", items: ["Ferramentas empresariais premium", "Gestão de candidaturas e triagem responsável", "Banco e reaproveitamento de talentos", "Serviço humano de recrutamento permanece separado ou por créditos"] },
];

const protectedItems = [
  "Recursos que já são gratuitos continuam gratuitos",
  "Compras antigas e acessos vitalícios permanecem preservados",
  "Biblioteca LDR legacy e editorial continuam separados",
  "Sessões humanas, clínica, mentoria e recrutamento humano não são ilimitados",
];

function LdrPassPage() {
  const [market,setMarket]=useState<"BR"|"EU">("BR"); const [billing,setBilling]=useState<"monthly"|"annual">("monthly"); const [loading,setLoading]=useState<string|null>(null); const [error,setError]=useState("");
  async function checkout(plan:"pass"|"pro"|"business"){setLoading(plan);setError("");try{const r=await clientCreateLdrPassCheckout({data:{plan,market,billing,source:"academy"}});window.location.assign(r.url)}catch(e){setError(e instanceof Error?e.message:"Não foi possível abrir o checkout.");setLoading(null)}}
  return (
    <main className="min-h-screen bg-[#070b17] text-white">
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <Link to="/" className="text-sm font-bold text-[#f4c76b]">← LDR Academy</Link>
        <div className="mt-8 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#f4c76b]">LDR PASS</p>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-6xl">Um PASS. Três formas de ampliar sua experiência no Ecossistema LDR.</h1>
          <p className="mt-5 text-lg text-white/75">Escolha entre PASS, PRO e BUSINESS. O LDR PASS adiciona benefícios e recursos premium sem retirar o acesso ao que já é gratuito.</p>
          <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-300/[.08] p-4 text-emerald-100"><strong>O que é gratuito no Ecossistema LDR continua gratuito.</strong> O LDR PASS amplia sua experiência com benefícios, conteúdos e recursos adicionais.</div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/cliente/ldr-pass" className="rounded-full bg-[#f4c76b] px-6 py-3 text-sm font-black uppercase tracking-[.12em] text-[#1f1303]">Ver meu PASS</Link>
            <Link to="/ecossistema" className="rounded-full border border-white/20 px-6 py-3 text-sm font-black uppercase tracking-[.12em]">Mapa do ecossistema</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-6 flex flex-wrap gap-3"><button onClick={()=>setMarket("BR")} className={`rounded-full px-5 py-2 font-bold ${market==="BR"?"bg-[#f4c76b] text-black":"border border-white/20"}`}>Brasil · BRL</button><button onClick={()=>setMarket("EU")} className={`rounded-full px-5 py-2 font-bold ${market==="EU"?"bg-[#f4c76b] text-black":"border border-white/20"}`}>Europa · EUR</button><button onClick={()=>setBilling("monthly")} className={`rounded-full px-5 py-2 font-bold ${billing==="monthly"?"bg-white text-black":"border border-white/20"}`}>Mensal</button><button onClick={()=>setBilling("annual")} className={`rounded-full px-5 py-2 font-bold ${billing==="annual"?"bg-white text-black":"border border-white/20"}`}>Anual</button></div>{error&&<p className="mb-5 rounded-xl border border-red-300/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p>}
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <article key={plan.name} className={`rounded-[28px] border p-6 ${index === 2 ? "border-[#f4c76b]/60 bg-[#f4c76b]/[.09]" : "border-white/15 bg-white/[.06]"}`}>
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#f4c76b]">{index === 2 ? "Empresas" : index === 1 ? "Profissional" : "Essencial"}</p>
              <h2 className="mt-3 font-serif text-3xl font-bold">{plan.name}</h2>
              <p className="mt-2 min-h-12 text-sm text-white/65">{plan.desc}</p>
              <div className="mt-5 rounded-2xl bg-black/25 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/45">Brasil</p>
                <p className="mt-1 text-xl font-black">{plan.br}</p><p className="text-sm text-white/60">{plan.brAnnual}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/45">Europa</p>
                <p className="mt-1 text-xl font-black">{plan.eu}</p><p className="text-sm text-white/60">{plan.euAnnual}</p>
              </div>
              <div className="mt-5 space-y-3">{plan.items.map((item) => <p key={item} className="text-sm text-white/75">✓ {item}</p>)}</div>
              <button disabled={loading!==null} onClick={()=>checkout(plan.key)} className="mt-6 w-full rounded-xl bg-[#f4c76b] px-5 py-3 font-black text-[#1f1303] disabled:opacity-50">{loading===plan.key?"Abrindo checkout…":`Assinar ${plan.name}`}</button><p className="mt-3 text-center text-xs text-white/50">{market==="BR"?(billing==="monthly"?plan.br:plan.brAnnual):(billing==="monthly"?plan.eu:plan.euAnnual)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-16 lg:grid-cols-2">
        <div className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/[.06] p-6">
          <h2 className="font-serif text-2xl font-bold text-emerald-200">Gratuito permanece gratuito</h2>
          <div className="mt-5 space-y-3"><p className="rounded-2xl bg-white/[.06] p-4 text-sm text-white/80">✓ Vagas e candidaturas mantêm as regras gratuitas já existentes</p><p className="rounded-2xl bg-white/[.06] p-4 text-sm text-white/80">✓ Cursos e recursos identificados como gratuitos não dependem do PASS</p><p className="rounded-2xl bg-white/[.06] p-4 text-sm text-white/80">✓ Áreas públicas do ecossistema permanecem acessíveis</p></div>
        </div>
        <div className="rounded-[28px] border border-[#f4c76b]/20 bg-[#f4c76b]/[.06] p-6">
          <h2 className="font-serif text-2xl font-bold text-[#f4c76b]">Separado e protegido</h2>
          <div className="mt-5 space-y-3">{protectedItems.map((item) => <p key={item} className="rounded-2xl bg-white/[.06] p-4 text-sm text-white/80">• {item}</p>)}</div>
        </div>
      </section>
    </main>
  );
}
