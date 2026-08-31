import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  professionalCancelSubscription,
  professionalMySubscription,
  professionalReactivateSubscription,
} from "@/lib/professional-subscription.functions";

export const Route = createFileRoute("/profissional-assinatura")({
  head: () => ({ meta: [{ title: "Minha Assinatura — Rede LDR" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SubscriptionPage,
});

function money(c: number, currency: string) {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "pt-PT", { style: "currency", currency }).format((c || 0) / 100);
}

function dateLabel(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function SubscriptionPage() {
  const load = useServerFn(professionalMySubscription);
  const cancel = useServerFn(professionalCancelSubscription);
  const reactivate = useServerFn(professionalReactivateSubscription);
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => setData(await load());
  useEffect(() => { void refresh().catch(() => window.location.replace("/profissional/login")); }, []);

  async function doCancel() {
    if (!window.confirm("Deseja cancelar a renovação automática? Você continuará usando a assinatura normalmente até o último dia deste ciclo já pago.")) return;
    setBusy(true);
    try {
      const result = await cancel();
      const until = result.currentPeriodEnd ? ` até ${dateLabel(result.currentPeriodEnd)}` : " até o fim do período atual";
      toast.success(`Renovação cancelada. Seu acesso continua ativo${until}.`);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a assinatura.");
    } finally {
      setBusy(false);
    }
  }

  async function doReactivate() {
    setBusy(true);
    try {
      await reactivate();
      toast.success("Renovação automática reativada.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível reativar a assinatura.");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando assinatura…</div>;

  const s = data.subscription;
  const p = s?.subscription_plans;
  const activeThrough = dateLabel(s?.current_period_end);

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div><p className="font-serif text-2xl">Minha Assinatura</p><p className="text-xs opacity-80">Rede de Profissionais LDR</p></div>
        <Link to="/profissional-painel" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-bold">Voltar ao painel</Link>
      </div>
    </header>

    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <section className="rounded-3xl border bg-card p-6">
        {!s ? <>
          <h1 className="font-serif text-3xl">Nenhuma assinatura encontrada</h1>
          <p className="mt-3 text-sm text-muted-foreground">Escolha um plano pelo painel profissional para concluir sua entrada na Rede.</p>
          <Link to="/profissional-painel" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 font-black text-primary-foreground">ESCOLHER PLANO</Link>
        </> : <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-primary">PLANO ATUAL</p>
              <h1 className="mt-1 font-serif text-3xl">{p?.name || "Plano Profissional"}</h1>
              <p className="mt-2 text-2xl font-black">{p ? `${money(p.amount_cents, p.currency)}/mês` : ""}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">{String(s.status).toUpperCase()}</span>
          </div>

          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-6">
            <strong className="text-foreground">Funciona como uma assinatura mensal de streaming:</strong> após o pagamento, o acesso permanece ativo durante todo o ciclo já pago. Você pode cancelar a renovação quando quiser e continuar usando normalmente até <strong>{activeThrough}</strong>. Não existe corte imediato por cancelar a renovação.
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label="Início do período" value={dateLabel(s.current_period_start)} />
            <Info label="Acesso ativo até" value={activeThrough} />
            <Info label="Renovação" value={s.cancel_at_period_end ? "Cancelada para o próximo ciclo" : "Automática mensal"} />
            <Info label="Mercado" value={p?.market === "BR" ? "Brasil" : "Europa"} />
          </div>

          <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-sm leading-6">
            <strong>Importante:</strong> cancelar a renovação não apaga sua conta, histórico, pagamentos ou documentos. O acesso do ciclo já pago continua até a data final acima. Somente depois dessa data, se não houver nova renovação, a assinatura fica inativa e o perfil deixa de operar como assinatura ativa.
          </div>

          {s.status === "active" && !s.cancel_at_period_end && <button disabled={busy} onClick={doCancel} className="mt-6 rounded-xl border border-destructive px-5 py-3 font-bold text-destructive disabled:opacity-50">CANCELAR RENOVAÇÃO</button>}

          {s.status === "active" && s.cancel_at_period_end && <div className="mt-6 rounded-xl border p-4 text-sm">
            <p className="font-semibold">Sua renovação está cancelada, mas seu acesso continua ativo até <strong>{activeThrough}</strong>.</p>
            <button disabled={busy} onClick={doReactivate} className="mt-4 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">REATIVAR RENOVAÇÃO AUTOMÁTICA</button>
          </div>}
        </>}
      </section>
    </main>
  </div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border p-4"><p className="text-xs font-black uppercase text-muted-foreground">{label}</p><p className="mt-2 font-bold">{value}</p></div>;
}
