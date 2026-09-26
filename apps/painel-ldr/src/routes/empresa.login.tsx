import { Link, createFileRoute, useLocation } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { COMPANY_RETURN_COOKIE, COMPANY_RETURN_KEY, companyReturnPath } from "@/lib/company-login-return";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/empresa/login")({
  head: () => ({ meta: [{ title: "Área da Empresa — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: CompanyLogin,
});

const COPY = {
  pt: { portal: "Portal corporativo", title: "Área da Empresa", subtitle: "Configure funcionários, benefícios e pagamentos corporativos.", opening: "Abrindo…", google: "Entrar com Google", help: "Use a conta Google responsável pela gestão da empresa.", back: "Voltar aos acessos", error: "Não foi possível entrar com o Google.", referral: "Você entrou por um link de venda da Rede Comercial LDR. Após o login, continue a configuração da empresa e o pagamento do plano indicado." },
  en: { portal: "Corporate portal", title: "Company Area", subtitle: "Configure employees, benefits and corporate payments.", opening: "Opening…", google: "Continue with Google", help: "Use the Google account responsible for managing the company.", back: "Back to access options", error: "Could not sign in with Google.", referral: "You came from an LDR Commercial Network sales link. After signing in, continue company setup and payment for the selected plan." },
  fr: { portal: "Portail entreprise", title: "Espace Entreprise", subtitle: "Configurez les collaborateurs, les avantages et les paiements de l’entreprise.", opening: "Ouverture…", google: "Continuer avec Google", help: "Utilisez le compte Google responsable de la gestion de l’entreprise.", back: "Retour aux accès", error: "Impossible de se connecter avec Google.", referral: "Vous venez d’un lien de vente du Réseau Comercial LDR. Après connexion, poursuivez la configuration de l’entreprise et le paiement du plan indiqué." },
  es: { portal: "Portal corporativo", title: "Área de Empresa", subtitle: "Configura empleados, beneficios y pagos corporativos.", opening: "Abriendo…", google: "Continuar con Google", help: "Usa la cuenta Google responsable de la gestión de la empresa.", back: "Volver a los accesos", error: "No fue posible iniciar sesión con Google.", referral: "Llegaste mediante un enlace de venta de la Red Comercial LDR. Después de iniciar sesión, continúa la configuración de la empresa y el pago del plan indicado." },
} as const;

const CAREER_LOGIN_RETURN_KEY = COMPANY_RETURN_KEY;

function oauthReturnUrl() {
  if (typeof window === "undefined") return "/api/auth/callback";
  return `https://ldrrhestrategia.com/api/auth/callback`;
}

function getSafeNext() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  if (params.has("next")) return companyReturnPath(params.get("next")) || "";
  if (params.get("auth_complete") !== "1" && !params.has("auth_error")) return "";
  try {
    return companyReturnPath(sessionStorage.getItem(CAREER_LOGIN_RETURN_KEY)) || "";
  } catch {
    return "";
  }
}

async function syncBrowserSession(session: Session) {
  const response = await fetch("/api/auth/session-sync", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
  });
  return response.ok;
}

function CompanyLogin() {
  const { locale } = useI18n();
  const baseCopy = COPY[locale];
  const copy = baseCopy;
  const [busy, setBusy] = useState(false);
  const redirecting = useRef(false);
  const location = useLocation();
  const safeNext = useMemo(getSafeNext, [location.searchStr]);
  const sellerRef = useMemo(() => {
    if (typeof window === "undefined") return "";
    const queryRef = new URLSearchParams(window.location.search).get("seller_ref") || "";
    if (queryRef) return queryRef;
    try { return sessionStorage.getItem("ldr_seller_referral") || ""; } catch { return ""; }
  }, []);
  const afterLogin = safeNext || (sellerRef ? `/assinatura-empresa?seller_ref=${encodeURIComponent(sellerRef)}` : "/empresa");

  useEffect(() => {
    if (sellerRef) { try { sessionStorage.setItem("ldr_seller_referral", sellerRef); } catch { /* optional */ } }
    let active = true;

    const finish = async (session: Session) => {
      if (!active || redirecting.current) return;
      redirecting.current = true;
      setBusy(true);
      const synced = await syncBrowserSession(session).catch(() => false);
      if (!active) return;
      if (!synced) {
        redirecting.current = false;
        setBusy(false);
        toast.error(copy.error);
        return;
      }
      try { sessionStorage.removeItem(CAREER_LOGIN_RETURN_KEY); } catch { /* optional */ }
      document.cookie = `${COMPANY_RETURN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
      window.location.replace(afterLogin);
    };

    void supabase.auth.getSession().then(({ data }) => { if (active && data.session) void finish(data.session); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) void finish(session);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [afterLogin, copy.error, sellerRef]);

  async function signIn() {
    setBusy(true);
    document.cookie = "ldr_portal_oauth=company; Max-Age=600; Path=/; SameSite=Lax; Secure";
    document.cookie = `${COMPANY_RETURN_COOKIE}=${encodeURIComponent(safeNext || "")}; Max-Age=${safeNext ? 600 : 0}; Path=/; SameSite=Lax; Secure`;
    try { if (safeNext) sessionStorage.setItem(CAREER_LOGIN_RETURN_KEY, safeNext); else sessionStorage.removeItem(CAREER_LOGIN_RETURN_KEY); } catch { /* optional */ }
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: oauthReturnUrl(), skipBrowserRedirect: true } });
    if (error || !data.url) {
      document.cookie = "ldr_portal_oauth=; Max-Age=0; Path=/; SameSite=Lax; Secure";
      setBusy(false);
      toast.error(copy.error);
      return;
    }
    window.location.assign(data.url);
  }

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6"><div className="min-w-0 flex-1"><p className="break-words font-serif text-xl sm:text-2xl">Grupo LDR Essence</p><p className="break-words text-sm opacity-85">{copy.portal}</p></div><div className="shrink-0"><LanguageSelect /></div></div></header>
    <main className="mx-auto flex max-w-md flex-col px-4 py-8 sm:px-6 sm:py-10"><section className="s8-card min-w-0"><h1 className="break-words font-serif text-2xl">{copy.title}</h1><p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{copy.subtitle}</p>{sellerRef && <div className="mt-4 rounded-xl border border-secondary/40 bg-secondary/10 p-3 text-sm leading-6">{copy.referral}</div>}<div className="mt-5"><button type="button" disabled={busy} onClick={signIn} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-bold text-primary hover:bg-accent disabled:opacity-60">{busy ? copy.opening : copy.google}</button><p className="mt-4 break-words text-xs leading-5 text-muted-foreground">{copy.help} <Link to="/acesso" className="font-semibold underline">{copy.back}</Link></p></div></section></main>
  </div>;
}
