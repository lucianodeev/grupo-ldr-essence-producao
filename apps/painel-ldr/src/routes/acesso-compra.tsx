import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/acesso-compra")({
  head: () => ({
    meta: [
      { title: "Acesso à compra — Grupo LDR Essence" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PurchaseAccessPage,
});

type AccessResult = {
  ok?: boolean;
  status?: "pending" | "ready";
  target?: string;
  portal_kind?: "client" | "company" | "employee" | "professional";
  activation_required?: boolean;
  activation_sent?: boolean;
  activation_email?: string;
  email_masked?: string;
  error?: string;
};

function portalLabel(kind?: AccessResult["portal_kind"]) {
  if (kind === "company") return "Área da Empresa";
  if (kind === "employee") return "Minha Área";
  if (kind === "professional") return "Área do Profissional";
  return "Minha Área";
}

function PurchaseAccessPage() {
  const sessionId = useMemo(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("session_id") || "", []);
  const [state, setState] = useState<"checking" | "pending" | "ready" | "error">("checking");
  const [result, setResult] = useState<AccessResult | null>(null);

  useEffect(() => {
    if (!sessionId) { setState("error"); return; }
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    async function check() {
      try {
        const response = await fetch(`/api/seller-purchase-access?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const data = await response.json() as AccessResult;
        if (!active) return;
        setResult(data);
        if (!response.ok) { setState("error"); return; }
        if (data.status === "pending") {
          setState("pending");
          attempts += 1;
          if (attempts < 30) timer = setTimeout(check, 1800);
          else setState("error");
          return;
        }
        setState("ready");
      } catch {
        if (active) setState("error");
      }
    }
    void check();
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [sessionId]);

  useEffect(() => {
    if (state !== "ready" || !result?.target) return;
    const timer = setTimeout(() => {
      if (result.activation_required) {
        const params = new URLSearchParams({ purchase: "success", next: result.target || "/cliente" });
        if (result.activation_email) params.set("email", result.activation_email);
        window.location.href = `/cliente/ativar?${params.toString()}`;
      } else {
        window.location.href = result.target || "/cliente";
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [state, result]);

  const target = result?.target || "/cliente";
  const activationUrl = useMemo(() => {
    const params = new URLSearchParams({ purchase: "success", next: target });
    if (result?.activation_email) params.set("email", result.activation_email);
    return `/cliente/ativar?${params.toString()}`;
  }, [result?.activation_email, target]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10">
      <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Grupo LDR Essence</p>
        <h1 className="mt-2 font-serif text-3xl">Sua compra e seu acesso</h1>

        {state === "checking" && <p className="mt-4 text-sm text-muted-foreground">Validando seu pagamento diretamente com a Stripe…</p>}
        {state === "pending" && <p className="mt-4 text-sm text-muted-foreground">Pagamento recebido. Estamos aguardando a confirmação final para liberar seu acesso.</p>}
        {state === "error" && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Não foi possível concluir a liberação agora.</strong><br />{result?.error || "Tente novamente em alguns instantes. Seu pagamento não será perdido."}</div>}

        {state === "ready" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <strong>Pagamento confirmado.</strong><br />Seu produto ou serviço já foi associado à {portalLabel(result?.portal_kind)}.
            </div>
            {result?.activation_required ? (
              <>
                <p className="text-sm text-muted-foreground">{result.activation_sent ? `Enviamos um link seguro para ${result.email_masked || "o e-mail da compra"} para você definir sua senha.` : "Use o mesmo e-mail da compra para ativar seu acesso."} Você será direcionado automaticamente.</p>
                <a className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground" href={activationUrl}>Ativar meu acesso</a>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Seu cadastro já existe. Você será levado para a área correspondente à compra.</p>
                <a className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground" href={target}>Entrar no meu painel</a>
              </>
            )}
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">O acesso só é liberado depois da validação do pagamento no servidor. A página de retorno, sozinha, não libera nenhum conteúdo.</p>
      </section>
    </main>
  );
}
