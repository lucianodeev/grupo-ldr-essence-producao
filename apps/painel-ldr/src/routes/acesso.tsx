import { Link, createFileRoute } from "@tanstack/react-router";
import { Building2, BriefcaseBusiness, UserRound, UsersRound } from "lucide-react";
import { LanguageSelect } from "@/lib/i18n";

export const Route = createFileRoute("/acesso")({
  head: () => ({ meta: [{ title: "Acessos — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: AccessPage,
});

const ACCESS = [
  { to: "/empresa/login", title: "Empresa", text: "Gerencie funcionários, benefícios, serviços e pagamentos corporativos.", icon: Building2 },
  { to: "/funcionario/login", title: "Funcionário", text: "Veja e utilize os benefícios disponibilizados pela sua empresa.", icon: UsersRound },
  { to: "/login", title: "Profissional", text: "Central operacional para profissionais autorizados do Grupo LDR Essence.", icon: BriefcaseBusiness },
  { to: "/cliente/login", title: "Cliente individual", text: "Acompanhe compras, agenda, biblioteca, mentoria e serviços individuais.", icon: UserRound },
] as const;

function AccessPage() {
  return <div className="min-h-screen" style={{ background: "var(--cream)" }}>
    <header className="text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--wine-deep), var(--wine))" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6">
        <div><p className="font-serif text-2xl">Grupo LDR Essence</p><p className="text-sm opacity-85">Escolha sua área de acesso</p></div>
        <LanguageSelect />
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {ACCESS.map(({ to, title, text, icon: Icon }) => <Link key={to} to={to} className="s8-card group block transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start gap-4"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></span><div className="min-w-0"><h2 className="font-serif text-2xl">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p><span className="mt-4 inline-block text-sm font-bold text-primary">Entrar →</span></div></div>
        </Link>)}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">Cada perfil acessa somente as informações autorizadas para sua função.</p>
    </main>
  </div>;
}
