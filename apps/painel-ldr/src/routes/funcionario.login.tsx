import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelect } from "@/lib/i18n";

export const Route = createFileRoute("/funcionario/login")({
  head: () => ({ meta: [{ title: "Área do Funcionário — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: EmployeeLogin,
});

function EmployeeLogin() {
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
    if (error || !data.url) { setBusy(false); toast.error("Não foi possível entrar com o Google."); return; }
    window.location.assign(data.url);
  }

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6"><div><p className="font-serif text-xl sm:text-2xl">Grupo LDR Essence</p><p className="text-sm opacity-85">Benefícios corporativos</p></div><LanguageSelect /></div></header>
    <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6"><section className="s8-card"><h1 className="font-serif text-2xl">Área do Funcionário</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Entre com a mesma conta Google do e-mail cadastrado pela sua empresa.</p><button type="button" disabled={busy} onClick={signIn} className="mt-5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-primary hover:bg-accent disabled:opacity-60">{busy ? "Abrindo…" : "Entrar com Google"}</button><p className="mt-4 text-xs text-muted-foreground">Seu acesso só mostra os benefícios atribuídos a você. <Link to="/acesso" className="underline">Voltar aos acessos</Link></p></section></main>
  </div>;
}
