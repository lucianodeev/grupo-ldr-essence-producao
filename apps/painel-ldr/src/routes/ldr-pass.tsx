import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { clientCreateLdrOneCheckout } from "@/lib/ldr-one.functions";
import { LDR_ONE_LAUNCH_ENABLED } from "@/lib/ldr-one.catalog";

export const Route = createFileRoute("/ldr-pass")({
  head: () => ({
    meta: [
      { title: "LDR ONE | Assinatura única do Ecossistema LDR" },
      { name: "description", content: "Uma assinatura para todos os conteúdos digitais do Ecossistema LDR. Os serviços gratuitos continuam gratuitos." },
    ],
  }),
  component: LdrOnePage,
});

const offers = [
  { name: "LDR FREE", description: "O que já é gratuito continua gratuito.", monthly: "Grátis", annual: "Grátis", items: ["Cadastro e perfil gratuitos", "Rede Acadêmica e recursos gratuitos", "Vagas e candidaturas gratuitas", "Cursos e conteúdos abertos"] },
  { name: "LDR ONE Individual", description: "Uma assinatura para o catálogo digital completo.", monthly: "€ 39,90 / mês", annual: "€ 399 / ano", items: ["Todos os cursos e formações digitais disponíveis", "Todos os eBooks e publicações digitais", "Ferramentas e benefícios do ecossistema", "Acesso aos serviços profissionais conforme créditos contratados"] },
  { name: "LDR ONE Business", description: "Uma assinatura por colaborador, com recursos empresariais.", monthly: "€ 19,90 / colaborador / mês", annual: "€ 199 / colaborador / ano", items: ["Todo o catálogo digital para colaboradores elegíveis", "Painel e ferramentas empresariais", "Recursos de carreira e desenvolvimento", "Serviços humanos conforme créditos e contrato"] },
];

function LdrOnePage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [seats, setSeats] = useState(5);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  async function checkout(audience: "individual" | "business") {
    if (!LDR_ONE_LAUNCH_ENABLED || checkoutBusy) return;
    setCheckoutBusy(true);
    setCheckoutError("");
    try {
      const result = await clientCreateLdrOneCheckout({ data: { audience, billing, seats: audience === "business" ? seats : 1 } });
      if (!result.url.startsWith("https://checkout.stripe.com/")) throw new Error("Endereço de pagamento inválido.");
      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.");
    } finally {
      setCheckoutBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#070b17] text-white">
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <Link to="/ecossistema" className="text-sm font-bold text-[#f4c76b]">← Ecossistema LDR</Link>
        <p className="mt-10 text-xs font-black uppercase tracking-[.22em] text-[#f4c76b]">Assinatura única</p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight sm:text-6xl">LDR ONE. Todo o ecossistema, uma assinatura.</h1>
        <p className="mt-5 max-w-3xl text-lg text-white/75">Todos os cursos e formações digitais disponíveis, eBooks e publicações em uma única assinatura. Os recursos gratuitos permanecem gratuitos. Profissionais da clínica continuam com cadastro gratuito e recebem 80% dos atendimentos elegíveis; 20% correspondem à plataforma.</p>
        <div className="mt-8 flex flex-wrap gap-3" aria-label="Periodicidade">
          <button type="button" aria-pressed={billing === "monthly"} onClick={() => setBilling("monthly")} className={`rounded-full px-6 py-3 font-bold ${billing === "monthly" ? "bg-[#f4c76b] text-[#1f1303]" : "border border-white/30"}`}>Mensal</button>
          <button type="button" aria-pressed={billing === "annual"} onClick={() => setBilling("annual")} className={`rounded-full px-6 py-3 font-bold ${billing === "annual" ? "bg-[#f4c76b] text-[#1f1303]" : "border border-white/30"}`}>Anual</button>
        </div>
        <p className="mt-3 text-sm text-white/60">Valores de referência em euros. A contratação dos novos planos será liberada após a validação dos pagamentos e benefícios.</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-16 lg:grid-cols-3">
        {offers.map((offer, i) => (
          <article key={offer.name} className={`flex flex-col rounded-[28px] border p-7 ${i === 1 ? "border-[#f4c76b] bg-[#f4c76b]/[.08]" : "border-white/20 bg-white/[.05]"}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-[#f4c76b]">{i === 0 ? "Acesso aberto" : i === 1 ? "Pessoas" : "Empresas"}</p>
            <h2 className="mt-3 font-serif text-3xl font-bold">{offer.name}</h2>
            <p className="mt-3 min-h-14 text-white/70">{offer.description}</p>
            <p className="mt-6 text-2xl font-black">{billing === "monthly" ? offer.monthly : offer.annual}</p>
            {i === 2 && <div className="mt-4 rounded-xl border border-white/20 p-4"><label htmlFor="ldr-one-seats" className="block text-sm font-semibold">Quantidade de colaboradores (mínimo 5)</label><input id="ldr-one-seats" type="number" min={5} max={10000} step={1} value={seats} onChange={event => { const value = Number(event.target.value); if (Number.isSafeInteger(value)) setSeats(Math.max(5, Math.min(10000, value))); }} className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-[#081326]" /><p className="mt-3 text-sm text-white/80" aria-live="polite">Total {billing === "monthly" ? "mensal" : "anual"}: {(seats * (billing === "monthly" ? 19.9 : 199)).toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}</p></div>}
            <ul className="mt-7 flex-1 space-y-4">{offer.items.map(item => <li key={item} className="text-sm leading-6 text-white/80">✓ {item}</li>)}</ul>
            {i === 0 ? <Link to="/ecossistema" className="mt-8 rounded-xl bg-[#f4c76b] px-5 py-3 text-center font-black text-[#1f1303]">Explorar gratuitamente</Link> : <button type="button" disabled={!LDR_ONE_LAUNCH_ENABLED || checkoutBusy} onClick={() => checkout(i === 1 ? "individual" : "business")} className="mt-8 rounded-xl bg-[#f4c76b] px-5 py-3 text-center font-black text-[#1f1303] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/70">{LDR_ONE_LAUNCH_ENABLED ? (checkoutBusy ? "Abrindo pagamento…" : i === 1 ? "Assinar Individual" : "Assinar Business") : "Checkout em validação"}</button>}
          </article>
        ))}
      </section>
      {checkoutError && <p role="alert" className="mx-auto max-w-6xl px-5 pb-4 text-red-200">{checkoutError}</p>}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-[28px] border border-white/20 p-7">
          <h2 className="font-serif text-2xl font-bold">Parcerias e serviços profissionais</h2>
          <p className="mt-3 text-white/75">Profissionais podem cadastrar-se gratuitamente. Empresas e instituições interessadas em parcerias podem entrar em contato pelos canais oficiais do ecossistema.</p>
          <Link to="/falar-com-ecossistema?assunto=Parceria&source=LDR%20ONE" className="mt-5 inline-block rounded-xl border border-[#f4c76b] px-5 py-3 font-bold text-[#f4c76b]">Propor parceria pelo suporte</Link>
          <p className="mt-4 text-xs text-white/60">Atendimentos humanos dependem de créditos, disponibilidade e condições contratuais. Valores em outras moedas serão apresentados quando o checkout correspondente estiver disponível.</p>
        </div>
      </section>
    </main>
  );
}
