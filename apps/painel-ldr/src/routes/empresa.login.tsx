import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/empresa/login")({
  head: () => ({ meta: [{ title: "Área da Empresa — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: CompanyLogin,
});

const COPY = {
  pt: { portal: "Portal corporativo", title: "Área da Empresa", subtitle: "Configure funcionários, benefícios e pagamentos corporativos.", opening: "Abrindo…", google: "Entrar com Google", help: "Use a conta Google responsável pela gestão da empresa.", back: "Voltar aos acessos", error: "Não foi possível entrar com o Google." },
  en: { portal: "Corporate portal", title: "Company Area", subtitle: "Configure employees, benefits and corporate payments.", opening: "Opening…", google: "Continue with Google", help: "Use the Google account responsible for managing the company.", back: "Back to access options", error: "Could not sign in with Google." },
  fr: { portal: "Portail entreprise", title: "Espace Entreprise", subtitle: "Configurez les collaborateurs, les avantages et les paiements de l’entreprise.", opening: "Ouverture…", google: "Continuer avec Google", help: "Utilisez le compte Google responsable de la gestion de l’entreprise.", back: "Retour aux accès", error: "Impossible de se connecter avec Google." },
  es: { portal: "Portal corporativo", title: "Área de Empresa", subtitle: "Configura empleados, beneficios y pagos corporativos.", opening: "Abriendo…", google: "Continuar con Google", help: "Usa la cuenta de Google responsable de la gestión de la empresa.", back: "Volver a los accesos", error: "No fue posible iniciar sesión con Google." },
} as const;

function CompanyLogin() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active && data.session) window.location.replace("/empresa"); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) window.location.replace("/empresa");
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function signIn() {
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/empresa/login`, skipBrowserRedirect: true } });
    if (error || !data.url) { setBusy(false); toast.error(copy.error); return; }
    window.location.assign(data.url);
  }

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6"><div><p className="font-serif text-xl sm:text-2xl">Grupo LDR Essence</p><p className="text-sm opacity-85">{copy.portal}</p></div><LanguageSelect /></div></header>
    <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6"><section className="s8-card"><h1 className="font-serif text-2xl">{copy.title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.subtitle}</p><div className="mt-5"><button type="button" disabled={busy} onClick={signIn} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-primary hover:bg-accent disabled:opacity-60">{busy ? copy.opening : copy.google}</button><p className="mt-4 text-xs text-muted-foreground">{copy.help} <Link to="/acesso" className="underline">{copy.back}</Link></p></div></section></main>
  </div>;
}
