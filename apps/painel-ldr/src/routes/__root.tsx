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
import { useEffect, type ReactNode } from "react";
import { Building2, Check, LogIn, MessageCircle, Sparkles, UsersRound } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const WHATSAPP_URL = "https://wa.me/32492923605?text=Olá%2C%20vim%20pelo%20Grupo%20LDR%20Essence%20e%20gostaria%20de%20mais%20informações.";

const GLOBAL_COPY = {
  pt: { plansAria:"Planos empresariais", eyebrow:"Assinatura empresarial LDR", plansTitle:"Planos mensais para sua empresa", plansText:"A assinatura funciona com renovação mensal automática. O catálogo de serviços individuais continua disponível separadamente para compras extras, pacotes e futuros produtos.", manage:"Gerenciar assinatura", essentialRange:"Até 10 funcionários", month:"/mês", or:"ou", essentialCredit:"4 créditos mensais", employeeBenefits:"Gestão de funcionários e benefícios", subscribe:"Ver e assinar", proRange:"De 11 a 50 funcionários", proCredit:"12 créditos mensais", proBenefits:"Benefícios recorrentes para equipes em crescimento", customRange:"A partir de 51 funcionários", customPrice:"Calculado na plataforma", customHint:"conforme equipe, serviços e créditos", customServices:"Escolha de serviços e créditos", realtime:"Preço mensal calculado em tempo real", configure:"Configurar plano", enter:"Entrar", enterAria:"Entrar na plataforma", whatsappAria:"Falar com a LDR pelo WhatsApp" },
  en: { plansAria:"Company plans", eyebrow:"LDR company subscription", plansTitle:"Monthly plans for your company", plansText:"The subscription renews automatically each month. The individual service catalog remains available separately for extra purchases, packages and future products.", manage:"Manage subscription", essentialRange:"Up to 10 employees", month:"/month", or:"or", essentialCredit:"4 monthly credits", employeeBenefits:"Employee and benefit management", subscribe:"View and subscribe", proRange:"11 to 50 employees", proCredit:"12 monthly credits", proBenefits:"Recurring benefits for growing teams", customRange:"From 51 employees", customPrice:"Calculated in the platform", customHint:"based on team, services and credits", customServices:"Choose services and credits", realtime:"Monthly price calculated in real time", configure:"Configure plan", enter:"Sign in", enterAria:"Sign in to the platform", whatsappAria:"Contact LDR on WhatsApp" },
  fr: { plansAria:"Forfaits entreprise", eyebrow:"Abonnement entreprise LDR", plansTitle:"Forfaits mensuels pour votre entreprise", plansText:"L’abonnement se renouvelle automatiquement chaque mois. Le catalogue de services individuels reste disponible séparément pour les achats supplémentaires, forfaits et futurs produits.", manage:"Gérer l’abonnement", essentialRange:"Jusqu’à 10 collaborateurs", month:"/mois", or:"ou", essentialCredit:"4 crédits mensuels", employeeBenefits:"Gestion des collaborateurs et avantages", subscribe:"Voir et souscrire", proRange:"De 11 à 50 collaborateurs", proCredit:"12 crédits mensuels", proBenefits:"Avantages récurrents pour les équipes en croissance", customRange:"À partir de 51 collaborateurs", customPrice:"Calculé sur la plateforme", customHint:"selon l’équipe, les services et les crédits", customServices:"Choix des services et crédits", realtime:"Prix mensuel calculé en temps réel", configure:"Configurer le forfait", enter:"Se connecter", enterAria:"Se connecter à la plateforme", whatsappAria:"Contacter LDR sur WhatsApp" },
  es: { plansAria:"Planes empresariales", eyebrow:"Suscripción empresarial LDR", plansTitle:"Planes mensuales para tu empresa", plansText:"La suscripción se renueva automáticamente cada mes. El catálogo de servicios individuales sigue disponible por separado para compras extras, paquetes y futuros productos.", manage:"Gestionar suscripción", essentialRange:"Hasta 10 empleados", month:"/mes", or:"o", essentialCredit:"4 créditos mensuales", employeeBenefits:"Gestión de empleados y beneficios", subscribe:"Ver y suscribirse", proRange:"De 11 a 50 empleados", proCredit:"12 créditos mensuales", proBenefits:"Beneficios recurrentes para equipos en crecimiento", customRange:"A partir de 51 empleados", customPrice:"Calculado en la plataforma", customHint:"según equipo, servicios y créditos", customServices:"Elección de servicios y créditos", realtime:"Precio mensual calculado en tiempo real", configure:"Configurar plan", enter:"Entrar", enterAria:"Entrar en la plataforma", whatsappAria:"Hablar con LDR por WhatsApp" },
} as const;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
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
        <p className="mt-2 text-sm text-muted-foreground">
          Algo não funcionou como esperado. Tente novamente ou volte ao início.
        </p>
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
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold"
          >
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
      { title: "Grupo LDR Essence — Plataforma e Painéis" },
      {
        name: "description",
        content:
          "Plataforma Grupo LDR Essence para clientes, profissionais, empresas, funcionários e administração do ecossistema LDR.",
      },
      { name: "author", content: "Grupo LDR Essence" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap",
      },
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
    <html lang="pt-BR">
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
  const copy = GLOBAL_COPY[locale];
  return (
    <section aria-label={copy.plansAria} className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-primary">{copy.eyebrow}</p>
            <h2 className="mt-2 font-serif text-3xl">{copy.plansTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy.plansText}
            </p>
          </div>
          <Link to="/assinatura-empresa" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-md transition hover:-translate-y-0.5">
            <Sparkles className="h-4 w-4" /> {copy.manage}
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border bg-background p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-primary">Essencial</p><h3 className="mt-1 font-serif text-2xl">LDR Empresa Essencial</h3></div><UsersRound className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-sm text-muted-foreground">{copy.essentialRange}</p>
            <p className="mt-3 text-2xl font-black">€149 <span className="text-sm font-semibold text-muted-foreground">{copy.month}</span></p>
            <p className="text-sm font-semibold text-muted-foreground">{copy.or} R$ 699{copy.month}</p>
            <div className="mt-4 space-y-2 text-sm"><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>{copy.essentialCredit}</p><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>{copy.employeeBenefits}</p></div>
            <Link to="/assinatura-empresa" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-primary px-4 py-3 text-sm font-black text-primary">{copy.subscribe}</Link>
          </article>

          <article className="rounded-2xl border-2 border-primary bg-primary/5 p-5 shadow-md">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-primary">Pro</p><h3 className="mt-1 font-serif text-2xl">LDR Empresa Pro</h3></div><Building2 className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-sm text-muted-foreground">{copy.proRange}</p>
            <p className="mt-3 text-2xl font-black">€349 <span className="text-sm font-semibold text-muted-foreground">{copy.month}</span></p>
            <p className="text-sm font-semibold text-muted-foreground">{copy.or} R$ 1.690{copy.month}</p>
            <div className="mt-4 space-y-2 text-sm"><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>{copy.proCredit}</p><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>{copy.proBenefits}</p></div>
            <Link to="/assinatura-empresa" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground">{copy.subscribe}</Link>
          </article>

          <article className="rounded-2xl border bg-background p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-primary">Personalizado</p><h3 className="mt-1 font-serif text-2xl">LDR Empresa Personalizado</h3></div><Sparkles className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-sm text-muted-foreground">{copy.customRange}</p>
            <p className="mt-3 text-2xl font-black">{copy.customPrice}</p>
            <p className="text-sm font-semibold text-muted-foreground">{copy.customHint}</p>
            <div className="mt-4 space-y-2 text-sm"><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>{copy.customServices}</p><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>{copy.realtime}</p></div>
            <Link to="/assinatura-empresa" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-primary px-4 py-3 text-sm font-black text-primary">{copy.configure}</Link>
          </article>
        </div>
      </div>
    </section>
  );
}

function PersistentActions() {
  const location = useLocation();
  const { locale } = useI18n();
  const copy = GLOBAL_COPY[locale];
  const pathname = location.pathname;
  const protectedPrefixes = ["/empresa", "/funcionario", "/cliente", "/painel-profissional", "/admin", "/assinatura-empresa"];
  const isProtectedArea = pathname === "/profissional/login" || protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const hasVisibleAccessHub = pathname === "/" || pathname === "/acesso";

  return (
    <div className="fixed z-[80] flex flex-col items-end gap-2" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))", right: "calc(1rem + env(safe-area-inset-right))" }}>
      {!isProtectedArea && !hasVisibleAccessHub && (
        <Link
          to="/acesso"
          aria-label={copy.enterAria}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-4 py-3 text-sm font-black text-primary shadow-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <LogIn className="h-5 w-5" /> <span>{copy.enter}</span>
        </Link>
      )}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={copy.whatsappAria}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-5 w-5" /> <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  const showCompanyPlans = location.pathname === "/empresa";

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <div className="pb-24 sm:pb-28">
          <Outlet />
          {showCompanyPlans && <CompanyPlanCards />}
        </div>
        <PersistentActions />
        <Toaster richColors position="top-center" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
