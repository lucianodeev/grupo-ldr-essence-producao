import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cliente/login")({
  head: () => ({
    meta: [
      { title: "Minha Área — Grupo LDR Essence" },
      {
        name: "description",
        content:
          "Acesse sua área no Grupo LDR Essence para acompanhar biblioteca, formações, agenda, atendimentos, pedidos e serviços.",
      },
      { property: "og:title", content: "Minha Área — Grupo LDR Essence" },
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
    const referrer = new URL(document.referrer);
    return (
      /(^|\.)ldrrhestrategia\.com$/i.test(referrer.hostname) &&
      referrer.pathname.replace(/\/$/, "") === "/beneficios-corporativos"
    );
  } catch {
    return false;
  }
}

function isAcademyHost() {
  if (typeof window === "undefined") return false;
  return /(^|\.)ldracademy\.online$/i.test(window.location.hostname);
}

function academyDestination() {
  return isAcademyHost() ? "https://ldracademy.online/biblioteca" : "/cliente";
}

function oauthReturnUrl() {
  if (typeof window === "undefined") return "/cliente/login";

  // Supabase may fall back to its configured Site URL when a newly-added
  // custom domain is not yet present in the redirect allow-list. The legacy
  // learn host is already part of the established auth flow; server.ts then
  // immediately canonicalizes it back to ldracademy.online while preserving
  // the OAuth query parameters. The PKCE verifier remains on the academy
  // domain, where the code is exchanged after the redirect.
  if (isAcademyHost()) {
    return "https://learn.lucianoconecta.online/cliente/login?academy=1";
  }

  return `${window.location.origin}/cliente/login`;
}

function ClientLogin() {
  const [busy, setBusy] = useState(false);
  const redirecting = useRef(false);

  useEffect(() => {
    if (cameFromCorporateBenefits()) {
      window.location.replace("/empresa/login");
      return;
    }

    let active = true;
    let retryTimer: number | undefined;

    const redirectToClient = () => {
      if (!active || redirecting.current) return;
      redirecting.current = true;
      setBusy(true);
      // Give @supabase/ssr a brief moment to persist the session cookies before
      // the protected library route is requested by the browser.
      window.setTimeout(() => {
        window.location.replace(academyDestination());
      }, 150);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        active &&
        session &&
        (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        redirectToClient();
      }
    });

    const verifySession = async (attempt = 0) => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        redirectToClient();
        return;
      }

      const hasOAuthCode = new URLSearchParams(window.location.search).has("code");
      if (hasOAuthCode && attempt < 5) {
        retryTimer = window.setTimeout(() => {
          void verifySession(attempt + 1);
        }, 300);
      }
    };

    void verifySession();

    return () => {
      active = false;
      if (retryTimer) window.clearTimeout(retryTimer);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleGoogle() {
    if (busy) return;
    setBusy(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: oauthReturnUrl(),
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      setBusy(false);
      toast.error("Não foi possível entrar com o Google.");
      return;
    }

    window.location.replace(data.url);
  }

  return (
    <ClientAuthShell
      title="Minha Área"
      subtitle="Entre com sua conta Google para acessar biblioteca, formações, agenda, atendimentos, pedidos e serviços."
    >
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="w-full rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-bold text-primary shadow-sm transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? "Entrando…" : "Entrar com Google"}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
        Use a mesma conta Google informada na sua compra.{" "}
        <Link to="/" className="font-semibold underline underline-offset-2">
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
          <p className="text-sm opacity-85">Minha Área</p>
        </div>
      </header>
      <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
        <section className="s8-card">
          <h1 className="font-serif text-2xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-5">{children}</div>
        </section>
      </main>
    </div>
  );
}
