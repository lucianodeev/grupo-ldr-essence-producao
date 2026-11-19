import { Link } from "@tanstack/react-router";
import type { Locale } from "@/lib/i18n";

const labels = {
  pt: ["Por onde começar", "Quero contratar um serviço", "Quero aprender", "Quero divulgar meu negócio"],
  en: ["Where to start", "Hire a service", "I want to learn", "Promote my business"],
  fr: ["Par où commencer", "Faire appel à un prestataire", "Je veux apprendre", "Promouvoir mon activité"],
  es: ["Por dónde empezar", "Contratar un servicio", "Quiero aprender", "Promocionar mi negocio"],
} as const satisfies Record<Locale, readonly [string, string, string, string]>;

const link = "flex min-h-12 items-center justify-center rounded-xl border border-[#d6ad63] px-4 py-4 text-center font-bold";

export function EcosystemJourneyLinks({ locale = "pt" }: { locale?: Locale }) {
  const [navigation, hire, learn, promote] = labels[locale];
  return (
    <nav aria-label={navigation} className="mx-auto grid max-w-6xl gap-3 px-4 py-5 sm:grid-cols-3">
      <Link to="/feira360" hash="pedido" className={`${link} bg-[#10223b] text-white`}>{hire}</Link>
      <Link to="/" search={{ area: "academy" }} className={link}>{learn}</Link>
      <Link to="/feira360/parceiro" className={link}>{promote}</Link>
    </nav>
  );
}
