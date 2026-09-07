import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/seller-referral")({
  head: () => ({ meta: [{ title: "Compra indicada — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: SellerReferralPage,
});

type Referral = {
  ok?: boolean;
  id?: string;
  name?: string;
  portal_kind?: "company" | "professional";
  plan_code?: string;
  market?: "EU" | "BR";
  customer_name?: string;
  email_hint?: string;
  amount_cents?: number | null;
  currency?: "EUR" | "BRL";
  variable_price?: boolean;
  expires_at?: string;
  error?: string;
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "pt-PT", { style: "currency", currency }).format(cents / 100);
}

function SellerReferralPage() {
  const ref = useMemo(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("ref") || "", []);
  const [data, setData] = useState<Referral | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!ref) { setState("error"); return; }
    void fetch(`/api/seller-referral?ref=${encodeURIComponent(ref)}`, { cache: "no-store" })
      .then(async (response) => ({ response, body: await response.json() as Referral }))
      .then(({ response, body }) => {
        setData(body);
        setState(response.ok ? "ready" : "error");
      })
      .catch(() => setState("error"));
  }, [ref]);

  const target = data?.portal_kind === "professional" ? "/profissional/login" : "/empresa/login";
  const continueUrl = ref ? `${target}?seller_ref=${encodeURIComponent(ref)}` : target;

  function proceed() {
    try { sessionStorage.setItem("ldr_seller_referral", ref); sessionStorage.setItem("ldr_seller_referral_data", JSON.stringify(data)); } catch { /* storage optional */ }
    window.location.assign(continueUrl);
  }

  return <div className="min-h-screen bg-background text-foreground">
    <header className="bg-primary text-primary-foreground"><div className="mx-auto max-w-5xl px-4 py-5 sm:px-6"><p className="font-serif text-2xl">Grupo LDR Essence</p><p className="text-sm opacity-85">Compra segura indicada pela Rede Comercial LDR</p></div></header>
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        {state === "loading" && <p className="text-sm text-muted-foreground">Validando seu link…</p>}
        {state === "error" && <><h1 className="font-serif text-3xl">Link indisponível</h1><p className="mt-3 text-sm text-muted-foreground">{data?.error || "Este link não pôde ser validado. Peça ao vendedor um novo link."}</p></>}
        {state === "ready" && data && <>
          <p className="text-xs font-black uppercase tracking-[.16em] text-primary">Link validado</p>
          <h1 className="mt-2 font-serif text-3xl">{data.name}</h1>
          <div className="mt-5 grid gap-3 rounded-2xl border bg-background p-4 text-sm">
            <p><strong>Cliente:</strong> {data.customer_name}</p>
            {data.email_hint && <p><strong>E-mail informado:</strong> {data.email_hint}</p>}
            <p><strong>Mercado:</strong> {data.market === "BR" ? "Brasil" : "Portugal / Europa"}</p>
            <p><strong>Valor:</strong> {data.variable_price ? "calculado dentro do painel conforme a configuração escolhida" : money(Number(data.amount_cents || 0), String(data.currency || "EUR"))}</p>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">Você continuará para a área oficial do Grupo LDR Essence. O pagamento será processado pela Stripe dentro do fluxo seguro da sua área. Use o mesmo e-mail informado ao vendedor.</p>
          <button type="button" onClick={proceed} className="mt-6 min-h-12 w-full rounded-xl bg-primary px-5 py-3 font-black text-primary-foreground">{data.portal_kind === "professional" ? "Continuar para Área do Profissional" : "Continuar para Área da Empresa"}</button>
        </>}
      </section>
    </main>
  </div>;
}
