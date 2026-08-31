import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

const COPY = {
  pt: { title: "Painel Profissional — Sistema S8 / Mentoria", subtitle: "Grupo LDR Essence • 8 sessões individuais • 50 minutos • PDE final", home: "Início", form: "Formulário", client: "Área do cliente", panel: "Painel" },
  en: { title: "Professional Panel — S8 System / Mentorship", subtitle: "Grupo LDR Essence • 8 individual sessions • 50 minutes • final PDE", home: "Home", form: "Form", client: "Client area", panel: "Panel" },
  fr: { title: "Espace Professionnel — Système S8 / Mentorat", subtitle: "Grupo LDR Essence • 8 séances individuelles • 50 minutes • PDE final", home: "Accueil", form: "Formulaire", client: "Espace client", panel: "Tableau de bord" },
  es: { title: "Panel Profesional — Sistema S8 / Mentoría", subtitle: "Grupo LDR Essence • 8 sesiones individuales • 50 minutos • PDE final", home: "Inicio", form: "Formulario", client: "Área del cliente", panel: "Panel" },
} as const;

export function SiteHeader({ actions }: { actions?: ReactNode }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  return (
    <header
      className="no-print sticky top-0 z-20 text-primary-foreground shadow-[var(--shadow-header)]"
      style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="break-words font-serif text-xl leading-tight text-primary-foreground sm:text-2xl">{copy.title}</p>
          <p className="mt-1 break-words text-sm opacity-85">{copy.subtitle}</p>
        </div>
        <nav className="flex max-w-full flex-wrap items-center gap-2">
          <HeaderLink to="/">{copy.home}</HeaderLink>
          <HeaderLink to="/formulario">{copy.form}</HeaderLink>
          <HeaderLink to="/cliente">{copy.client}</HeaderLink>
          <HeaderLink to="/painel-profissional">{copy.panel}</HeaderLink>
          {actions}
          <div className="min-w-[8rem]"><LanguageSelect /></div>
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="rounded-lg bg-secondary px-3 py-2 text-center text-sm font-bold text-secondary-foreground transition-opacity hover:opacity-90 sm:px-4">{children}</Link>;
}
