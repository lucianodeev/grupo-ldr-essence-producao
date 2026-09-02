import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { professionalConnectDashboard, professionalConnectOnboarding, professionalConnectStatus } from "@/lib/professional-network.functions";

export const Route = createFileRoute("/profissional-repasses")({
  head: () => ({ meta: [{ title: "Repasses — Rede de Profissionais LDR" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ProfessionalPayoutsPage,
});

function label(value: string | undefined) {
  return ({
    not_started: "NÃO CONFIGURADO",
    onboarding_pending: "CADASTRO PENDENTE",
    requirements_due: "DADOS PENDENTES",
    ready: "PRONTO PARA RECEBER",
    missing: "CONTA BANCÁRIA PENDENTE",
    pending: "EM CONFIGURAÇÃO",
  } as Record<string, string>)[value || ""] || String(value || "—").toUpperCase();
}

function ProfessionalPayoutsPage() {
  const load = useServerFn(professionalConnectStatus);
  const start = useServerFn(professionalConnectOnboarding);
  const dashboard = useServerFn(professionalConnectDashboard);
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try { setData(await load()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível consultar o Stripe."); }
  }
  useEffect(() => { void refresh(); }, []);

  async function openOnboarding() {
    setBusy(true);
    try {
      const result = await start();
      window.location.assign(result.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível abrir o Stripe.");
      setBusy(false);
    }
  }

  async function openDashboard() {
    setBusy(true);
    try {
      const result = await dashboard();
      window.location.assign(result.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível abrir o Stripe Express.");
      setBusy(false);
    }
  }

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div><p className="font-serif text-2xl">Repasses e conta bancária</p><p className="text-xs opacity-80">Rede de Profissionais LDR • Stripe Connect</p></div>
        <Link to="/profissional-painel" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-bold">Voltar ao painel</Link>
      </div>
    </header>

    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h1 className="font-serif text-3xl">Receba seus repasses com segurança</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">A LDR usa o Stripe Connect para validar os dados do profissional e cadastrar a conta bancária de recebimento. Seus dados bancários são informados diretamente no ambiente seguro do Stripe e não ficam armazenados no painel LDR.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Status title="Stripe Connect" value={label(data?.connectStatus)} />
        <Status title="Conta de recebimento" value={label(data?.payoutMethodStatus)} />
        <Status title="Repasses habilitados" value={data?.payoutsEnabled ? "SIM" : "AINDA NÃO"} />
      </section>

      <section className="rounded-3xl border bg-card p-6">
        <h2 className="font-serif text-2xl">Configurar recebimentos</h2>
        <p className="mt-2 text-sm text-muted-foreground">Use o primeiro botão para criar ou concluir sua conta conectada. O Stripe solicitará apenas os dados necessários para identidade, atividade profissional e conta bancária.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={busy} onClick={openOnboarding} className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground disabled:opacity-60"><CreditCard className="mr-2 inline h-4 w-4" />{data?.connected ? "Concluir / atualizar cadastro Stripe" : "Configurar conta de recebimento"}</button>
          {data?.connected && <button disabled={busy} onClick={openDashboard} className="rounded-xl border px-5 py-3 text-sm font-black disabled:opacity-60"><ExternalLink className="mr-2 inline h-4 w-4" />Abrir Stripe Express</button>}
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-6">
        <h2 className="font-serif text-2xl">Trocar a conta bancária depois</h2>
        <p className="mt-2 text-sm text-muted-foreground">Depois que o cadastro estiver concluído, clique em <strong>Abrir Stripe Express</strong>. Lá você poderá alterar a conta bancária diretamente no Stripe. Não envie IBAN, número de conta ou outros dados bancários pelo WhatsApp, e-mail ou painel LDR.</p>
      </section>

      {Array.isArray(data?.requirementsDue) && data.requirementsDue.length > 0 && <section className="rounded-3xl border bg-amber-50 p-6 text-amber-950">
        <p className="font-black">O Stripe ainda precisa de algumas informações.</p>
        <p className="mt-1 text-sm">Clique em “Concluir / atualizar cadastro Stripe” para preencher os dados pendentes.</p>
      </section>}
    </main>
  </div>;
}

function Status({ title, value }: { title: string; value: string }) {
  return <div className="rounded-2xl border bg-card p-5"><p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{title}</p><p className="mt-2 text-lg font-black text-primary">{value}</p></div>;
}
