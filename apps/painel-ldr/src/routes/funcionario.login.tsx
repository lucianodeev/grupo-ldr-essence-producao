import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/funcionario/login")({
  head: () => ({ meta: [{ title: "Área do Funcionário — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: EmployeeLogin,
});

const COPY = {
  pt: { portal: "Benefícios corporativos", title: "Área do Funcionário", subtitle: "Entre com a mesma conta Google do e-mail cadastrado pela sua empresa.", opening: "Abrindo…", google: "Entrar com Google", privacy: "Seu acesso só mostra os benefícios atribuídos a você.", back: "Voltar aos acessos", error: "Não foi possível entrar com o Google." },
  en: { portal: "Corporate benefits", title: "Employee Area", subtitle: "Sign in with the same Google account as the email registered by your company.", opening: "Opening…", google: "Continue with Google", privacy: "Your access only shows benefits assigned to you.", back: "Back to access options", error: "Could not sign in with Google." },
  fr: { portal: "Avantages entreprise", title: "Espace Collaborateur", subtitle: "Connectez-vous avec le même compte Google que l’adresse e-mail enregistrée par votre entreprise.", opening: "Ouverture…", google: "Continuer avec Google", privacy: "Votre accès affiche uniquement les avantages qui vous sont attribués.", back: "Retour aux accès", error: "Impossible de se connecter avec Google." },
  es: { portal: "Beneficios corporativos", title: "Área del Empleado", subtitle: "Entra con la misma cuenta de Google del correo registrado por tu empresa.", opening: "Abriendo…", google: "Continuar con Google", privacy: "Tu acceso solo muestra los beneficios que tienes asignados.", back: "Volver a los accesos", error: "No fue posible iniciar sesión con Google." },
} as const;

function EmployeeLogin() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active && data.session) window.location.replace("/funcionario"); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) window.location.replace("/funcionario");
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function signIn() {
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/funcionario/login`, skipBrowserRedirect: true } });
    if (error || !data.url) { setBusy(false); toast.error(copy.error); return; }
    window.location.assign(data.url);
  }

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6"><div><p className="font-serif text-xl sm:text-2xl">Grupo LDR Essence</p><p className="text-sm opacity-85">{copy.portal}</p></div><LanguageSelect /></div></header>
    <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6"><section className="s8-card"><h1 className="font-serif text-2xl">{copy.title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.subtitle}</p><button type="button" disabled={busy} onClick={signIn} className="mt-5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-primary hover:bg-accent disabled:opacity-60">{busy ? copy.opening : copy.google}</button><p className="mt-4 text-xs text-muted-foreground">{copy.privacy} <Link to="/acesso" className="underline">{copy.back}</Link></p></section></main>
  </div>;
}
