import { Link, createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { serializeCookieHeader } from "@supabase/ssr";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { ACADEMIC_RETURN_COOKIE, ACADEMY_ORIGIN, academicLoginHref, academicReturnPath } from "@/lib/academic-login-return";

type ClientLoginSearch = {
  portal?: "services";
  v?: string;
  next?: string;
  auth_error?: string;
};

export const Route = createFileRoute("/cliente/login")({
  validateSearch: (search: Record<string, unknown>): ClientLoginSearch => {
    const next = academicReturnPath(search["next"]);
    return {
      ...(search["portal"] === "services" ? { portal: "services" as const } : {}),
      ...(typeof search["v"] === "string" ? { v: search["v"] } : {}),
      ...(next ? { next } : {}),
      ...(typeof search["auth_error"] === "string" ? { auth_error: search["auth_error"] } : {}),
    };
  },
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

function isServicePortalHost() {
  if (typeof window === "undefined") return false;
  return /^portal\.ldrrhestrategia\.com$/i.test(window.location.hostname);
}

function clientDestination(next: string | null) {
  if (isAcademyHost() && next) return next;
  if (isAcademyHost()) return "https://ldracademy.online/cliente/biblioteca";
  if (isServicePortalHost()) return "/cliente?portal=services&v=4";
  return "/cliente";
}

function oauthReturnUrl() {
  if (typeof window === "undefined") return "/api/auth/callback";

  // PKCE must return to the origin that owns the verifier cookie.
  if (isAcademyHost()) {
    return `${ACADEMY_ORIGIN}/api/auth/callback`;
  }

  // Use one exact production callback for the Services Portal. Supabase Auth
  // requires redirectTo URLs to be present in Authentication > URL Configuration.
  if (isServicePortalHost()) {
    return "https://portal.ldrrhestrategia.com/api/auth/callback";
  }

  return `${window.location.origin}/api/auth/callback`;
}

async function syncBrowserSession(session: Session) {
  const response = await fetch("/api/auth/session-sync", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  });
  return response.ok;
}

function ClientLogin() {
  const search = Route.useSearch();
  const academicNext = academicReturnPath(search.next);
  const [busy, setBusy] = useState(false);
  const [servicePortal, setServicePortal] = useState(search.portal === "services");
  const redirecting = useRef(false);

  useEffect(() => {
    if (isAcademyHost() && window.location.origin !== ACADEMY_ORIGIN) {
      window.location.replace(`${ACADEMY_ORIGIN}${academicLoginHref(academicNext)}`);
      return;
    }
    if (cameFromCorporateBenefits()) {
      window.location.replace("/empresa/login");
      return;
    }

    if (isServicePortalHost()) setServicePortal(true);
    let active = true;

    const redirectToClient = async (session: Session) => {
      if (!active || redirecting.current) return;
      redirecting.current = true;
      setBusy(true);

      try {
        const synced = await syncBrowserSession(session);
        if (!active) return;
        if (!synced) {
          redirecting.current = false;
          setBusy(false);
          toast.error("Sua sessão precisa ser renovada. Entre novamente com o Google.");
          return;
        }
        window.location.replace(clientDestination(academicNext));
      } catch {
        if (!active) return;
        redirecting.current = false;
        setBusy(false);
        toast.error("Não foi possível sincronizar sua sessão. Tente entrar novamente.");
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        active &&
        session &&
        (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        void redirectToClient(session);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void redirectToClient(data.session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [academicNext]);

  async function handleGoogle() {
    if (busy) return;
    setBusy(true);

    if (isAcademyHost()) {
      document.cookie = serializeCookieHeader(ACADEMIC_RETURN_COOKIE, academicNext ?? "", {
        path: "/", sameSite: "lax", secure: true, maxAge: academicNext ? 600 : 0,
      });
      if (academicNext) {
        // A fresh academic login supersedes an abandoned portal login on this origin.
        for (const name of ["ldr_admin_oauth", "ldr_portal_oauth"]) {
          document.cookie = serializeCookieHeader(name, "", { path: "/", sameSite: "lax", secure: true, maxAge: 0 });
        }
      }
    }

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

  const title = servicePortal ? "Portal de Serviços" : "Minha Área";
  const subtitle = servicePortal
    ? "Entre com sua conta Google para agendar serviços e acompanhar seus atendimentos."
    : "Entre com sua conta Google para acessar biblioteca, formações, agenda, atendimentos, pedidos e serviços.";

  return (
    <ClientAuthShell title={title} subtitle={subtitle} areaLabel={title}>
      {search.auth_error && <p role="alert" className="mb-3 text-sm text-destructive">Não foi possível concluir o login. Entre novamente com o Google para continuar.</p>}
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
  areaLabel = "Minha Área",
  children,
}: {
  title: string;
  subtitle: string;
  areaLabel?: string;
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
          <p className="text-sm opacity-85">{areaLabel}</p>
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
