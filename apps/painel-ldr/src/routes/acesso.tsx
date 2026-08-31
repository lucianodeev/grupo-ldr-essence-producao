import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2, BriefcaseBusiness, UserRound, UsersRound } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/acesso")({
  head: () => ({ meta: [{ title: "Acessos — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: AccessPage,
});

const COPY = {
  pt: {
    choose: "Escolha sua área de acesso",
    enter: "Entrar →",
    privacy: "Cada perfil acessa somente as informações autorizadas para sua função.",
    company: "Empresa",
    companyText: "Gerencie funcionários, benefícios, serviços e pagamentos corporativos.",
    employee: "Funcionário",
    employeeText: "Veja e utilize os benefícios disponibilizados pela sua empresa.",
    professional: "Profissional",
    professionalText: "Central operacional para profissionais autorizados do Grupo LDR Essence.",
    client: "Cliente individual",
    clientText: "Acompanhe compras, agenda, biblioteca, mentoria e serviços individuais.",
  },
  en: {
    choose: "Choose your access area",
    enter: "Enter →",
    privacy: "Each profile can only access information authorized for its role.",
    company: "Company",
    companyText: "Manage employees, benefits, services and corporate payments.",
    employee: "Employee",
    employeeText: "View and use the benefits made available by your company.",
    professional: "Professional",
    professionalText: "Operations hub for authorized Grupo LDR Essence professionals.",
    client: "Individual client",
    clientText: "Track purchases, schedule, library, mentorship and individual services.",
  },
  fr: {
    choose: "Choisissez votre espace d’accès",
    enter: "Entrer →",
    privacy: "Chaque profil accède uniquement aux informations autorisées pour son rôle.",
    company: "Entreprise",
    companyText: "Gérez les collaborateurs, avantages, services et paiements de l’entreprise.",
    employee: "Collaborateur",
    employeeText: "Consultez et utilisez les avantages mis à disposition par votre entreprise.",
    professional: "Professionnel",
    professionalText: "Centre opérationnel réservé aux professionnels autorisés du Grupo LDR Essence.",
    client: "Client individuel",
    clientText: "Suivez vos achats, rendez-vous, bibliothèque, mentorat et services individuels.",
  },
  es: {
    choose: "Elige tu área de acceso",
    enter: "Entrar →",
    privacy: "Cada perfil accede únicamente a la información autorizada para su función.",
    company: "Empresa",
    companyText: "Gestiona empleados, beneficios, servicios y pagos corporativos.",
    employee: "Empleado",
    employeeText: "Consulta y utiliza los beneficios ofrecidos por tu empresa.",
    professional: "Profesional",
    professionalText: "Centro operativo para profesionales autorizados de Grupo LDR Essence.",
    client: "Cliente individual",
    clientText: "Sigue compras, agenda, biblioteca, mentoría y servicios individuales.",
  },
} as const;

function AccessPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const access = [
    { to: "/empresa/login", title: copy.company, text: copy.companyText, icon: Building2 },
    { to: "/funcionario/login", title: copy.employee, text: copy.employeeText, icon: UsersRound },
    { to: "/login", title: copy.professional, text: copy.professionalText, icon: BriefcaseBusiness },
    { to: "/cliente/login", title: copy.client, text: copy.clientText, icon: UserRound },
  ] as const;

  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6">
        <div><p className="font-serif text-2xl">Grupo LDR Essence</p><p className="text-sm opacity-85">{copy.choose}</p></div>
        <LanguageSelect />
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {access.map(({ to, title, text, icon: Icon }) => <Link key={to} to={to} className="s8-card group block transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start gap-4"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></span><div className="min-w-0"><h2 className="font-serif text-2xl">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p><span className="mt-4 inline-block text-sm font-bold text-primary">{copy.enter}</span></div></div>
        </Link>)}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">{copy.privacy}</p>
    </main>
  </div>;
}
