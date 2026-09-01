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
import { I18nProvider } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const WHATSAPP_URL = "https://wa.me/32492923605?text=Olá%2C%20vim%20pelo%20Grupo%20LDR%20Essence%20e%20gostaria%20de%20mais%20informações.";

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
  return (
    <section aria-label="Planos empresariais" className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border bg-card p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-primary">Assinatura empresarial LDR</p>
            <h2 className="mt-2 font-serif text-3xl">Planos mensais para sua empresa</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              A assinatura funciona com renovação mensal automática. O catálogo de serviços individuais continua disponível separadamente para compras extras, pacotes e futuros produtos.
            </p>
          </div>
          <Link to="/assinatura-empresa" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-md transition hover:-translate-y-0.5">
            <Sparkles className="h-4 w-4" /> Gerenciar assinatura
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border bg-background p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-primary">Essencial</p><h3 className="mt-1 font-serif text-2xl">LDR Empresa Essencial</h3></div><UsersRound className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-sm text-muted-foreground">Até 10 funcionários</p>
            <p className="mt-3 text-2xl font-black">€149 <span className="text-sm font-semibold text-muted-foreground">/mês</span></p>
            <p className="text-sm font-semibold text-muted-foreground">ou R$ 699/mês</p>
            <div className="mt-4 space-y-2 text-sm"><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>4 créditos mensais</p><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Gestão de funcionários e benefícios</p></div>
            <Link to="/assinatura-empresa" className="mt-5 inline-flex w-full justify-center rounded-xl border border-primary px-4 py-3 text-sm font-black text-primary">Ver e assinar</Link>
          </article>

          <article className="rounded-2xl border-2 border-primary bg-primary/5 p-5 shadow-md">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-primary">Pro</p><h3 className="mt-1 font-serif text-2xl">LDR Empresa Pro</h3></div><Building2 className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-sm text-muted-foreground">De 11 a 50 funcionários</p>
            <p className="mt-3 text-2xl font-black">€349 <span className="text-sm font-semibold text-muted-foreground">/mês</span></p>
            <p className="text-sm font-semibold text-muted-foreground">ou R$ 1.690/mês</p>
            <div className="mt-4 space-y-2 text-sm"><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>12 créditos mensais</p><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Benefícios recorrentes para equipes em crescimento</p></div>
            <Link to="/assinatura-empresa" className="mt-5 inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground">Ver e assinar</Link>
          </article>

          <article className="rounded-2xl border bg-background p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em] text-primary">Personalizado</p><h3 className="mt-1 font-serif text-2xl">LDR Empresa Personalizado</h3></div><Sparkles className="h-6 w-6 text-primary" /></div>
            <p className="mt-3 text-sm text-muted-foreground">A partir de 51 funcionários</p>
            <p className="mt-3 text-2xl font-black">Sob configuração</p>
            <p className="text-sm font-semibold text-muted-foreground">valor calculado na plataforma</p>
            <div className="mt-4 space-y-2 text-sm"><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Escolha de serviços e créditos</p><p className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Preço mensal calculado em tempo real</p></div>
            <Link to="/assinatura-empresa" className="mt-5 inline-flex w-full justify-center rounded-xl border border-primary px-4 py-3 text-sm font-black text-primary">Configurar plano</Link>
          </article>
        </div>
      </div>
    </section>
  );
}

function PersistentActions() {
  const location = useLocation();
  const pathname = location.pathname;
  const protectedPrefixes = ["/empresa", "/funcionario", "/cliente", "/profissional", "/painel-profissional", "/admin", "/assinatura-empresa"];
  const isProtectedArea = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {!isProtectedArea && (
        <Link
          to="/acesso"
          aria-label="Entrar na plataforma"
          className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-3 text-sm font-black text-primary shadow-xl transition hover:-translate-y-0.5"
        >
          <LogIn className="h-5 w-5" /> <span>Entrar</span>
        </Link>
      )}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a LDR pelo WhatsApp"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:brightness-95"
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
        <Outlet />
        {showCompanyPlans && <CompanyPlanCards />}
        <PersistentActions />
        <Toaster richColors position="top-center" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
