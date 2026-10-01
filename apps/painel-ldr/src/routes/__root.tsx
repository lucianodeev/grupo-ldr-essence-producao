import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Building2, Check, Sparkles, UsersRound } from "lucide-react";

import { AcademyChatbot } from "@/components/academy-chatbot";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { isUnifiedEcosystemHost, unifiedPreviewTarget } from "@/lib/unified-preview";

import appCss from "../styles.css?url";
import responsiveCss from "../responsive-v3.css?url";
import carreiraCss from "../carreira-hardening.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const ADSENSE_SCRIPT_ID = "ldr-adsense-script";
const ADSENSE_SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4298173894748549";

const GLOBAL_COPY = {
  pt: { plansAria:"Planos empresariais", eyebrow:"Assinatura empresarial LDR", plansTitle:"Planos mensais para sua empresa", plansText:"A assinatura funciona com renovação mensal automática. O catálogo de serviços individuais continua disponível separadamente para compras extras, pacotes e futuros produtos.", manage:"Gerenciar assinatura", essentialRange:"Até 10 funcionários", month:"/mês", or:"ou", essentialCredit:"4 créditos mensais", employeeBenefits:"Gestão de funcionários e benefícios", subscribe:"Ver e assinar", proRange:"De 11 a 50 funcionários", proCredit:"12 créditos mensais", proBenefits:"Benefícios recorrentes para equipes em crescimento", customRange:"A partir de 51 funcionários", customPrice:"Calculado na plataforma", customHint:"conforme equipe, serviços e créditos", customServices:"Escolha de serviços e créditos", realtime:"Preço mensal calculado em tempo real", configure:"Configurar plano", enter:"Entrar", enterAria:"Entrar na plataforma", whatsappAria:"Falar com a LDR pelo WhatsApp" },
  en: { plansAria:"Company plans", eyebrow:"LDR company subscription", plansTitle:"Monthly plans for your company", plansText:"The subscription renews automatically each month. The individual service catalog remains available separately for extra purchases, packages and future products.", manage:"Manage subscription", essentialRange:"Up to 10 employees", month:"/month", or:"or", essentialCredit:"4 monthly credits", employeeBenefits:"Employee and benefit management", subscribe:"View and subscribe", proRange:"11 to 50 employees", proCredit:"12 monthly credits", proBenefits:"Recurring benefits for growing teams", customRange:"From 51 employees", customPrice:"Calculated in the platform", customHint:"based on team, services and credits", customServices:"Choose services and credits", realtime:"Monthly price calculated in real time", configure:"Configure plan", enter:"Sign in", enterAria:"Sign in to the platform", whatsappAria:"Contact LDR on WhatsApp" },
  fr: { plansAria:"Forfaits entreprise", eyebrow:"Abonnement entreprise LDR", plansTitle:"Forfaits mensuels pour votre entreprise", plansText:"L’abonnement se renouvelle automatiquement chaque mois. Le catalogue de services individuels reste disponible séparément pour les achats supplémentaires, forfaits et futurs produits.", manage:"Gérer l’abonnement", essentialRange:"Jusqu’à 10 collaborateurs", month:"/mois", or:"ou", essentialCredit:"4 crédits mensuels", employeeBenefits:"Gestion des collaborateurs et avantages", subscribe:"Voir et souscrire", proRange:"De 11 à 50 collaborateurs", proCredit:"12 crédits mensuels", proBenefits:"Avantages récurrents pour les équipes en croissance", customRange:"À partir de 51 collaborateurs", customPrice:"Calculé sur la plateforme", customHint:"selon l’équipe, les services et les crédits", customServices:"Choix de services et de crédits", realtime:"Prix mensuel calculé en temps réel", configure:"Configurer le forfait", enter:"Se connecter", enterAria:"Se connecter à la plateforme", whatsappAria:"Contacter LDR sur WhatsApp" },
  es: { plansAria:"Planes empresariales", eyebrow:"Suscripción empresarial LDR", plansTitle:"Planes mensuales para tu empresa", plansText:"La suscripción se renueva automáticamente cada mes. El catálogo de servicios individuales sigue disponible por separado para compras extras, paquetes y futuros productos.", manage:"Gestionar suscripción", essentialRange:"Hasta 10 empleados", month:"/mes", or:"o", essentialCredit:"4 créditos mensuales", employeeBenefits:"Gestión de empleados y beneficios", subscribe:"Ver y suscribirse", proRange:"De 11 a 50 empleados", proCredit:"12 créditos mensuales", proBenefits:"Beneficios recurrentes para equipos en crecimiento", customRange:"A partir de 51 empleados", customPrice:"Calculado en la plataforma", customHint:"según equipo, servicios y créditos", customServices:"Elección de servicios y créditos", realtime:"Precio mensual calculado en tiempo real", configure:"Configurar plan", enter:"Entrar", enterAria:"Entrar en la plataforma", whatsappAria:"Hablar con LDR por WhatsApp" },
} as const;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Acho que pegamos o caminho errado</h2>
        <p className="mt-2 text-sm text-muted-foreground">O endereço acessado não existe ou foi movido.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90">
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Esta página não carregou</h1>
        <p className="mt-2 text-sm text-muted-foreground">Algo não funcionou como esperado. Tente novamente ou volte ao início.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Tentar novamente
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold">
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LDR RH & Estratégia | Ecossistema LDR" },
      { name: "description", content: "Ecossistema LDR para educação, carreira, oportunidades, saúde e bem-estar, soluções para empresas e desenvolvimento profissional." },
      { name: "author", content: "LDR RH & Estratégia" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: responsiveCss },
      { rel: "stylesheet", href: carreiraCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function CompanyPlanCards() {
  const { locale } = useI18n();
  const text = {
    pt:{eyebrow:"LDR ONE BUSINESS",title:"Uma assinatura digital para toda a equipe",desc:"Cursos, formações, eBooks e conteúdos digitais pagos elegíveis para cada colaborador. Mínimo de 2 colaboradores.",monthly:"€19,90 por colaborador/mês",annual:"€199 por colaborador/ano",cta:"VER LDR ONE BUSINESS",note:"Serviços humanos e atendimentos continuam contratados separadamente."},
    en:{eyebrow:"LDR ONE BUSINESS",title:"One digital subscription for the whole team",desc:"Eligible paid courses, training, eBooks and digital content for each employee. Minimum 2 employees.",monthly:"€19.90 per employee/month",annual:"€199 per employee/year",cta:"VIEW LDR ONE BUSINESS",note:"Human services and appointments remain separate."},
    fr:{eyebrow:"LDR ONE BUSINESS",title:"Un abonnement numérique pour toute l’équipe",desc:"Cours, formations, eBooks et contenus numériques payants éligibles pour chaque collaborateur. Minimum 2 collaborateurs.",monthly:"19,90 € par collaborateur/mois",annual:"199 € par collaborateur/an",cta:"VOIR LDR ONE BUSINESS",note:"Les services humains et rendez-vous restent séparés."},
    es:{eyebrow:"LDR ONE BUSINESS",title:"Una suscripción digital para todo el equipo",desc:"Cursos, formaciones, eBooks y contenidos digitales de pago elegibles para cada empleado. Mínimo 2 empleados.",monthly:"€19,90 por empleado/mes",annual:"€199 por empleado/año",cta:"VER LDR ONE BUSINESS",note:"Los servicios humanos y las citas se contratan por separado."}
  }[locale];
  return <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8"><div className="rounded-[2rem] border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8"><p className="text-xs font-black uppercase tracking-[.16em] text-primary">{text.eyebrow}</p><h2 className="mt-2 font-serif text-3xl">{text.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{text.desc}</p><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border bg-background p-5"><p className="text-2xl font-black">{text.monthly}</p></div><div className="rounded-2xl border bg-background p-5"><p className="text-2xl font-black">{text.annual}</p></div></div><p className="mt-4 text-sm text-muted-foreground">{text.note}</p><Link to="/ldr-pass" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"><Sparkles className="mr-2 h-4 w-4"/>{text.cta}</Link></div></section>;
}

function GlobalLdrOneCard() {
  const { locale } = useI18n();
  const t={pt:{title:"LDR ONE",text:"Cursos, formações, eBooks e conteúdos digitais pagos em uma única assinatura.",individual:"Individual · €39,90/mês ou €399/ano",business:"Business · €19,90/colaborador/mês ou €199/ano · mínimo 2",cta:"ASSINAR LDR ONE"},en:{title:"LDR ONE",text:"Paid courses, training, eBooks and digital content in one subscription.",individual:"Individual · €39.90/month or €399/year",business:"Business · €19.90/employee/month or €199/year · minimum 2",cta:"SUBSCRIBE TO LDR ONE"},fr:{title:"LDR ONE",text:"Cours, formations, eBooks et contenus numériques payants dans un seul abonnement.",individual:"Individuel · 39,90 €/mois ou 399 €/an",business:"Business · 19,90 €/collaborateur/mois ou 199 €/an · minimum 2",cta:"S’ABONNER À LDR ONE"},es:{title:"LDR ONE",text:"Cursos, formaciones, eBooks y contenidos digitales de pago en una sola suscripción.",individual:"Individual · €39,90/mes o €399/año",business:"Business · €19,90/empleado/mes ou €199/año · mínimo 2",cta:"SUSCRIBIRME A LDR ONE"}}[locale];
  return <section className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8"><div className="overflow-hidden rounded-[24px] border border-[#d6ad63]/50 bg-gradient-to-r from-[#071426] via-[#0b2341] to-[#123a67] p-5 text-white shadow-xl sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#f5cc82]">{t.title}</p><p className="mt-2 max-w-2xl text-sm text-white/80">{t.text}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full border border-[#d6ad63]/40 bg-white/10 px-3 py-2">{t.individual}</span><span className="rounded-full border border-[#d6ad63]/40 bg-white/10 px-3 py-2">{t.business}</span></div></div><Link to="/ldr-pass" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#f5cc82] bg-[#d6ad63] px-6 py-3 text-sm font-black text-[#071426] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f5cc82]"><Sparkles className="mr-2 h-4 w-4"/>{t.cta}</Link></div></div></section>;
}

function LazyAdSenseScript() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: VoidFunction, options?: { timeout?: number }) => number;
    };

    let timeoutId: number | undefined;

    const injectScript = () => {
      if (document.getElementById(ADSENSE_SCRIPT_ID)) return;
      const script = document.createElement("script");
      script.id = ADSENSE_SCRIPT_ID;
      script.async = true;
      script.src = ADSENSE_SCRIPT_SRC;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    };

    const scheduleScript = () => {
      if (idleWindow.requestIdleCallback) {
        idleWindow.requestIdleCallback(injectScript, { timeout: 5000 });
        return;
      }
      timeoutId = window.setTimeout(injectScript, 2500);
    };

    if (document.readyState === "complete") {
      scheduleScript();
    } else {
      window.addEventListener("load", scheduleScript, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleScript);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return null;
}

function GlobalLucianoReference() {
  const location = useLocation();
  const hidden = ["/luciano", "/luciano-rodrigues-almeida", "/cliente/login", "/empresa/login", "/funcionario/login", "/painel-profissional/login", "/admin/login"].some((path) => location.pathname.startsWith(path));
  if (hidden) return null;
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
      <Link to="/luciano" className="inline-flex items-center gap-2 text-[11px] font-semibold text-muted-foreground/80 transition hover:text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d6ad63]" aria-hidden="true" />
        Fundador · Luciano Rodrigues Almeida — biografia e trajetória
      </Link>
    </div>
  );
}

function LazyAcademyChatbot() {
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsMounted(true), 2500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (location.pathname === "/falar-com-ecossistema") return null;
  return isMounted ? <AcademyChatbot /> : null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hostname === "suporte.ldrrhestrategia.com" && window.location.pathname === "/") {
      window.location.replace("/falar-com-ecossistema" + window.location.search + window.location.hash);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isUnifiedEcosystemHost(window.location.hostname)) return;

    const onInternalLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const next = unifiedPreviewTarget(href, window.location.origin, window.location.hostname);
      if (!next) return;
      event.preventDefault();
      if (anchor.target && anchor.target !== "_self") {
        window.open(next, anchor.target, "noopener,noreferrer");
        return;
      }
      window.location.assign(next);
    };

    document.addEventListener("click", onInternalLinkClick, true);
    return () => document.removeEventListener("click", onInternalLinkClick, true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onImageError = (event: Event) => {
      const img = event.target as HTMLImageElement | null;
      if (!img || img.tagName !== "IMG" || img.dataset.ldrFallback === "1") return;
      img.dataset.ldrFallback = "1";
      img.src = "/ldr/image-placeholder.svg";
    };
    window.addEventListener("error", onImageError, true);
    return () => window.removeEventListener("error", onImageError, true);
  }, []);

  useEffect(() => {
    // The Render LDR ONE sandbox intentionally has no Supabase credentials.
    // Keep public portal routes usable there while preserving Supabase auth
    // whenever the integration is configured.
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      subscription = data.subscription;
    } catch (error) {
      console.warn("[Supabase] Auth listener unavailable; continuing without Supabase auth.", error);
    }
    return () => subscription?.unsubscribe();
  }, [router, queryClient]);

  const showCompanyPlans = location.pathname === "/empresa";
  const showLdrOneCard = !["/ldr-pass","/cliente/login","/empresa/login","/funcionario/login","/painel-profissional/login","/admin/login"].some((path)=>location.pathname.startsWith(path));

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <div className="pb-24 sm:pb-28">
          <Outlet />
          {showCompanyPlans && <CompanyPlanCards />}
          {showLdrOneCard && <GlobalLdrOneCard />}
          <GlobalLucianoReference />
        </div>

        <LazyAdSenseScript />
        <LazyAcademyChatbot />
        <Toaster richColors position="top-center" />
      </I18nProvider>
    </QueryClientProvider>
  );
}