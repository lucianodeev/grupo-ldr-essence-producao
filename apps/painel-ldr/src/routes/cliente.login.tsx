import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cliente/login")({
  head: () => ({
    meta: [
      { title: "Área do Cliente — Grupo LDR Essence" },
      {
        name: "description",
        content:
          "Acesse sua área de cliente da Grupo LDR Essence para acompanhar pedidos, mentoria, sessões e entregas.",
      },
      { property: "og:title", content: "Área do Cliente — Grupo LDR Essence" },
      {
        property: "og:description",
        content: "Acompanhe seus pedidos, mentorias e entregas em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientLogin,
});

function cameFromCorporateBenefits() {
  if (typeof document === "undefined") return false;
  try {
    if (!document.referrer) return false;
    const referrer = new URL(document.referrer);
    const normalizedPath = referrer.pathname.replace(/\/$/, "") || "/";

    // O botão legado de Benefícios Corporativos ainda aponta para /cliente.
    // Em navegação anônima, /cliente redireciona para /cliente/login e o navegador
    // pode preservar apenas a origem do site público ou usar /cliente como referrer.
    const fromPublicLdr = /(^|\.)ldrrhestrategia\.com$/i.test(referrer.hostname);
    const fromLegacyClientHop =
      /(^|\.)painel\.ldrrhestrategia\.com$/i.test(referrer.hostname) && normalizedPath === "/cliente";

    return (
      fromLegacyClientHop ||
      (fromPublicLdr && (normalizedPath === "/beneficios-corporativos" || normalizedPath === "/"))
    );
  } catch {
    return false;
  }
}

function ClientLogin() {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cameFromCorporateBenefits()) {
      window.location.replace("/empresa/login");
      return;
    }

    let active = true;

    const redirectToClient = () => {
      window.location.replace("/cliente");
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) redirectToClient();
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        active &&
        session &&
        (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        redirectToClient();
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleGoogle() {
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/cliente/login`,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url) {
      setBusy(false);
      toast.error("Não foi possível entrar com o Google.");
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <ClientAuthShell
      title="Área do Cliente"
      subtitle="Entre com sua conta Google para acompanhar pedidos, mentorias e entregas."
    >
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-bold text-primary hover:bg-accent disabled:opacity-60"
      >
        Entrar com Google
      </button>

      <p className="mt-2 text-xs text-muted-foreground">
        Use a mesma conta Google informada na sua compra.{" "}
        <Link to="/" className="underline">
          Voltar ao início
        </Link>
      </p>
    </ClientAuthShell>
  );
}

export function ClientAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header
        className="text-primary-foreground shadow-[var(--shadow-header)]"
        style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <p className="font-serif text-xl leading-tight sm:text-2xl">Grupo LDR Essence</p>
          <p className="text-sm opacity-85">Área do Cliente</p>
        </div>
      </header>
      <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
        <section className="s8-card">
          <h1 className="font-serif text-2xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-4">{children}</div>
        </section>
      </main>
    </div>
  );
}
