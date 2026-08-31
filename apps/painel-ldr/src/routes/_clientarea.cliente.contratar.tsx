import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Field, PageHeader } from "@/components/central/ui";
import { useClientContractCatalog } from "@/lib/client-portal-data";
import { formatMoney, safeUrl } from "@/lib/central";
import type { ContractItem } from "@/lib/contract-catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/contratar")({
  head: () => ({ meta: [{ title: "Contratar e agendar — Grupo LDR Essence" }, { name: "robots", content: "noindex" }] }),
  component: ClientContract,
});

type CategoryId = "sites" | "marketing" | "monthly" | "career" | "mentorship" | "other";

const CATEGORY_BY_KEY: Record<string, CategoryId> = {
  landing_page: "sites", site_one_page: "sites", site_institucional_entrada: "sites",
  site_empresarial_entrada: "sites", catalogo_digital_entrada: "sites", loja_virtual_entrada: "sites",
  diagnostico_digital: "marketing", plano_marketing: "marketing", identidade_visual_entrada: "marketing",
  criativos_5: "marketing", criativos_10: "marketing", email_marketing_conteudo: "marketing",
  meta_ads_setup: "marketing", google_ads_setup: "marketing",
  manutencao_essencial: "monthly", manutencao_profissional: "monthly", manutencao_empresarial: "monthly",
  social_inicial: "monthly", social_crescimento: "monthly", social_profissional: "monthly", social_empresarial: "monthly",
  ads_uma_plataforma: "monthly", ads_meta_google: "monthly",
  orientacao_profissional_eu: "career", orientacao_profissional_br: "career",
  plano_carreira_eu: "career", plano_carreira_br: "career",
  transicao_carreira_eu: "career", transicao_carreira_br: "career",
  carreira_internacional_eu: "career", carreira_internacional_br: "career",
  diagnostico_projeto: "mentorship",
};

const COPY = {
  pt: {
    pageSubtitle: "Escolha, pague com segurança e acompanhe tudo pelo painel.",
    allServices: "Todos os serviços em um só lugar",
    heroText: "Os serviços com checkout mantêm contratação direta e segura. Na Hora de Bem-Estar LDR, escolha o período e pague 50% para solicitar a reserva; a disponibilidade definitiva será confirmada pelo atendimento.",
    regionCurrency: "Região e moeda",
    europe: "Europa — EUR",
    brazilCurrency: "Brasil — BRL",
    findService: "Encontrar um serviço",
    searchPlaceholder: "Ex.: carreira, site, marketing, massagem...",
    brazil: "Brasil",
    europeShort: "Europa",
    service: "Serviço",
    session: "sessão",
    sessions: "sessões",
    discount: "valor com desconto",
    paymentText: "Pagamento seguro. Após a contratação, acompanhe os próximos passos pela sua Área do Cliente.",
    buyNow: "Contratar agora",
    unavailable: "Checkout temporariamente indisponível",
    wellbeingEyebrow: "Bem-estar corporativo",
    wellbeingTitle: "Massagem Laboral e Hora de Bem-Estar LDR",
    availability: "🇧🇪 Bélgica · 🇵🇹 Portugal · 🇧🇷 Brasil · outros países sob demanda e agendamento",
    wellbeingIntro: "A Massagem Laboral utiliza a mesma proposta de relaxamento e bem-estar da Massagem Relaxante, adaptada à rotina de empresas, equipes, colaboradores e eventos corporativos. Os atendimentos podem ser organizados de forma escalonada para não interromper toda a operação.",
    popular: "Um dos serviços mais procurados",
    massage: "Massagem Laboral",
    chooseTime: "Escolha o tempo por colaborador:",
    perEmployee: "por colaborador",
    minimum: "Contratação mínima: €150 por ação/deslocamento na tabela atual em EUR.",
    localQuote: "Para Portugal, Brasil e outros países, disponibilidade, deslocamento e valores finais são confirmados conforme local, demanda e agendamento.",
    timing: "O horário de almoço costuma ser uma ótima opção. Também pode ser organizado pela manhã, à tarde, no início/final do expediente ou em eventos corporativos.",
    quoteWhatsapp: "Solicitar orçamento no WhatsApp",
    wellbeingHour: "Hora de Bem-Estar LDR",
    tagline: "Sua empresa escolhe o tempo. Nós organizamos a experiência.",
    depositText: "Pagamento de 50% para solicitar a reserva. Os 50% restantes são pagos após a ação. A disponibilidade definitiva será confirmada pelo atendimento.",
    hours2: "2 horas", hours4: "4 horas", halfDay: "Meio período · 5 horas", corporateDay: "Dia Corporativo · até 8 horas",
    deposit: "Entrada", mostChosen: "MAIS ESCOLHIDO", choosePeriod: "Escolher período e pagar 50%",
    serviceSolutions: "Soluções LDR", attendance: "Atendimento", mentorshipStrategy: "Mentoria e estratégia",
    massageMessage: "Olá! Vim pelo painel da LDR RH & Estratégia e gostaria de saber mais sobre a Massagem Laboral para minha empresa/equipe.",
    categories: { sites: "Sites e tecnologia", marketing: "Marketing e presença digital", monthly: "Planos mensais", career: "Carreira e desenvolvimento", mentorship: "Mentoria e estratégia", other: "Outros serviços" },
  },
  en: {
    pageSubtitle: "Choose, pay securely and follow everything from your dashboard.",
    allServices: "All services in one place",
    heroText: "Services with checkout keep direct and secure purchasing. For LDR Wellbeing Hour, choose the period and pay 50% to request the booking; final availability is confirmed by our team.",
    regionCurrency: "Region and currency", europe: "Europe — EUR", brazilCurrency: "Brazil — BRL", findService: "Find a service", searchPlaceholder: "E.g. career, website, marketing, massage...",
    brazil: "Brazil", europeShort: "Europe", service: "Service", session: "session", sessions: "sessions", discount: "discounted price",
    paymentText: "Secure payment. After purchase, follow the next steps in your Client Area.", buyNow: "Buy now", unavailable: "Checkout temporarily unavailable",
    wellbeingEyebrow: "Corporate wellbeing", wellbeingTitle: "Workplace Massage and LDR Wellbeing Hour",
    availability: "🇧🇪 Belgium · 🇵🇹 Portugal · 🇧🇷 Brazil · other countries on demand and by appointment",
    wellbeingIntro: "Workplace Massage brings the same relaxation and wellbeing approach as Relaxing Massage, adapted to companies, teams, employees and corporate events. Sessions can be staggered so the whole operation does not need to stop.",
    popular: "One of our most requested services", massage: "Workplace Massage", chooseTime: "Choose the time per employee:", perEmployee: "per employee",
    minimum: "Current EUR table: minimum booking of €150 per action/travel.", localQuote: "For Portugal, Brazil and other countries, availability, travel and final prices are confirmed according to location, demand and scheduling.",
    timing: "Lunch time is often a great option. It can also be arranged in the morning, afternoon, at the beginning/end of the workday or during corporate events.", quoteWhatsapp: "Request a quote on WhatsApp",
    wellbeingHour: "LDR Wellbeing Hour", tagline: "Your company chooses the time. We organize the experience.", depositText: "Pay 50% to request the booking. The remaining 50% is paid after the action. Final availability is confirmed by our team.",
    hours2: "2 hours", hours4: "4 hours", halfDay: "Half day · 5 hours", corporateDay: "Corporate Day · up to 8 hours", deposit: "Deposit", mostChosen: "MOST CHOSEN", choosePeriod: "Choose period and pay 50%",
    serviceSolutions: "LDR Solutions", attendance: "Care", mentorshipStrategy: "Mentorship and strategy",
    massageMessage: "Hello! I came from the LDR RH & Strategy dashboard and would like to know more about Workplace Massage for my company/team.",
    categories: { sites: "Websites and technology", marketing: "Marketing and digital presence", monthly: "Monthly plans", career: "Career and development", mentorship: "Mentorship and strategy", other: "Other services" },
  },
  fr: {
    pageSubtitle: "Choisissez, payez en toute sécurité et suivez tout depuis votre espace.",
    allServices: "Tous les services au même endroit",
    heroText: "Les services avec checkout permettent une souscription directe et sécurisée. Pour l’Heure Bien-Être LDR, choisissez la durée et payez 50 % pour demander la réservation ; la disponibilité finale est confirmée par notre équipe.",
    regionCurrency: "Région et devise", europe: "Europe — EUR", brazilCurrency: "Brésil — BRL", findService: "Trouver un service", searchPlaceholder: "Ex. : carrière, site, marketing, massage...",
    brazil: "Brésil", europeShort: "Europe", service: "Service", session: "séance", sessions: "séances", discount: "prix remisé",
    paymentText: "Paiement sécurisé. Après l’achat, suivez les prochaines étapes dans votre Espace Client.", buyNow: "Souscrire maintenant", unavailable: "Checkout temporairement indisponible",
    wellbeingEyebrow: "Bien-être en entreprise", wellbeingTitle: "Massage en entreprise et Heure Bien-Être LDR",
    availability: "🇧🇪 Belgique · 🇵🇹 Portugal · 🇧🇷 Brésil · autres pays selon la demande et sur rendez-vous",
    wellbeingIntro: "Le Massage en entreprise reprend la même approche de détente et de bien-être que le Massage Relaxant, adaptée aux entreprises, équipes, collaborateurs et événements professionnels. Les séances peuvent être organisées de manière échelonnée afin de ne pas interrompre toute l’activité.",
    popular: "L’un de nos services les plus demandés", massage: "Massage en entreprise", chooseTime: "Choisissez la durée par collaborateur :", perEmployee: "par collaborateur",
    minimum: "Tarif actuel en EUR : réservation minimale de 150 € par intervention/déplacement.", localQuote: "Pour le Portugal, le Brésil et les autres pays, la disponibilité, le déplacement et le prix final sont confirmés selon le lieu, la demande et le rendez-vous.",
    timing: "La pause déjeuner est souvent une excellente option. Le service peut aussi être organisé le matin, l’après-midi, au début/à la fin de la journée ou lors d’événements d’entreprise.", quoteWhatsapp: "Demander un devis sur WhatsApp",
    wellbeingHour: "Heure Bien-Être LDR", tagline: "Votre entreprise choisit la durée. Nous organisons l’expérience.", depositText: "Payez 50 % pour demander la réservation. Les 50 % restants sont payés après l’intervention. La disponibilité finale est confirmée par notre équipe.",
    hours2: "2 heures", hours4: "4 heures", halfDay: "Demi-journée · 5 heures", corporateDay: "Journée entreprise · jusqu’à 8 heures", deposit: "Acompte", mostChosen: "LE PLUS CHOISI", choosePeriod: "Choisir la durée et payer 50 %",
    serviceSolutions: "Solutions LDR", attendance: "Accompagnement", mentorshipStrategy: "Mentorat et stratégie",
    massageMessage: "Bonjour ! Je viens de l’espace LDR RH & Stratégie et je souhaite en savoir plus sur le Massage en entreprise pour mon entreprise/équipe.",
    categories: { sites: "Sites et technologie", marketing: "Marketing et présence numérique", monthly: "Forfaits mensuels", career: "Carrière et développement", mentorship: "Mentorat et stratégie", other: "Autres services" },
  },
  es: {
    pageSubtitle: "Elige, paga de forma segura y sigue todo desde tu panel.",
    allServices: "Todos los servicios en un solo lugar",
    heroText: "Los servicios con checkout mantienen una contratación directa y segura. En la Hora de Bienestar LDR, elige el período y paga el 50 % para solicitar la reserva; la disponibilidad final será confirmada por nuestro equipo.",
    regionCurrency: "Región y moneda", europe: "Europa — EUR", brazilCurrency: "Brasil — BRL", findService: "Encontrar un servicio", searchPlaceholder: "Ej.: carrera, sitio, marketing, masaje...",
    brazil: "Brasil", europeShort: "Europa", service: "Servicio", session: "sesión", sessions: "sesiones", discount: "valor con descuento",
    paymentText: "Pago seguro. Después de contratar, sigue los próximos pasos desde tu Área de Cliente.", buyNow: "Contratar ahora", unavailable: "Checkout temporalmente no disponible",
    wellbeingEyebrow: "Bienestar corporativo", wellbeingTitle: "Masaje Laboral y Hora de Bienestar LDR",
    availability: "🇧🇪 Bélgica · 🇵🇹 Portugal · 🇧🇷 Brasil · otros países según demanda y con cita previa",
    wellbeingIntro: "El Masaje Laboral utiliza la misma propuesta de relajación y bienestar del Masaje Relajante, adaptada a empresas, equipos, colaboradores y eventos corporativos. Las sesiones pueden organizarse de forma escalonada para no interrumpir toda la operación.",
    popular: "Uno de nuestros servicios más solicitados", massage: "Masaje Laboral", chooseTime: "Elige el tiempo por colaborador:", perEmployee: "por colaborador",
    minimum: "Tarifa actual en EUR: contratación mínima de 150 € por acción/desplazamiento.", localQuote: "Para Portugal, Brasil y otros países, la disponibilidad, el desplazamiento y los valores finales se confirman según el lugar, la demanda y la agenda.",
    timing: "La hora del almuerzo suele ser una excelente opción. También puede organizarse por la mañana, por la tarde, al inicio/final de la jornada o en eventos corporativos.", quoteWhatsapp: "Solicitar presupuesto por WhatsApp",
    wellbeingHour: "Hora de Bienestar LDR", tagline: "Tu empresa elige el tiempo. Nosotros organizamos la experiencia.", depositText: "Paga el 50 % para solicitar la reserva. El 50 % restante se paga después de la acción. La disponibilidad final será confirmada por nuestro equipo.",
    hours2: "2 horas", hours4: "4 horas", halfDay: "Medio día · 5 horas", corporateDay: "Día Corporativo · hasta 8 horas", deposit: "Entrada", mostChosen: "MÁS ELEGIDO", choosePeriod: "Elegir período y pagar 50 %",
    serviceSolutions: "Soluciones LDR", attendance: "Atención", mentorshipStrategy: "Mentoría y estrategia",
    massageMessage: "¡Hola! Vengo del panel LDR RH & Estrategia y me gustaría saber más sobre el Masaje Laboral para mi empresa/equipo.",
    categories: { sites: "Sitios y tecnología", marketing: "Marketing y presencia digital", monthly: "Planes mensuales", career: "Carrera y desarrollo", mentorship: "Mentoría y estrategia", other: "Otros servicios" },
  },
} as const;

const WHATSAPP = "https://wa.me/32492923605";

type Copy = (typeof COPY)[keyof typeof COPY];
type Locale = keyof typeof COPY;

function Card({ item, copy }: { item: ContractItem; copy: Copy }) {
  const link = safeUrl(item.paymentUrl);
  const category = CATEGORY_BY_KEY[item.catalogKey] ?? "other";
  return (
    <li className="group flex h-full min-w-0 flex-col rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-flex max-w-full rounded-full bg-accent px-2.5 py-1 text-center text-[11px] font-extrabold uppercase tracking-wide text-accent-foreground break-words">
            {item.region === "br" ? copy.brazil : item.region === "eu" ? copy.europeShort : copy.categories[category]}
          </span>
          <h3 className="mt-3 break-words font-serif text-lg leading-snug">{item.name}</h3>
          {item.sessions > 0 && <p className="mt-1 text-xs font-bold text-muted-foreground">{item.sessions} {item.sessions === 1 ? copy.session : copy.sessions}</p>}
        </div>
        <div className="shrink-0 text-right">
          {item.originalCents ? <p className="whitespace-nowrap text-xs text-muted-foreground line-through">{formatMoney(item.originalCents, item.currency)}</p> : null}
          <p className="whitespace-nowrap text-xl font-extrabold text-primary">{formatMoney(item.amountCents, item.currency)}</p>
          {item.originalCents ? <span className="text-[11px] font-bold text-primary">{copy.discount}</span> : null}
        </div>
      </div>
      <p className="mt-3 flex-1 break-words text-sm leading-relaxed text-muted-foreground">{copy.paymentText}</p>
      {link ? (
        <a className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-sm font-extrabold leading-snug text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={link} target="_blank" rel="noreferrer noopener">
          {copy.buyNow}
        </a>
      ) : <p className="mt-4 rounded-xl bg-muted p-3 text-center text-xs text-muted-foreground">{copy.unavailable}</p>}
    </li>
  );
}

function CorporateWellbeing({ copy, locale }: { copy: Copy; locale: Locale }) {
  const massageMessage = `${WHATSAPP}?text=${encodeURIComponent(copy.massageMessage)}`;
  const wellbeingUrl = `https://ldrrhestrategia.com/bem-estar?lang=${locale}#hora-bem-estar-ldr`;
  return (
    <section className="min-w-0 rounded-3xl border border-primary/20 bg-card p-5 shadow-sm sm:p-6">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[1.05fr_1.95fr] lg:items-stretch">
        <figure className="group min-w-0 overflow-hidden rounded-2xl border border-primary/25 bg-muted shadow-sm">
          <img src="/massagem-laboral-corporativa.webp" alt={copy.wellbeingTitle} width={1600} height={900} loading="lazy" decoding="async" className="h-full min-h-64 w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]" />
        </figure>
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">{copy.wellbeingEyebrow}</p>
          <h2 className="mt-1 break-words font-serif text-2xl leading-tight">{copy.wellbeingTitle}</h2>
          <div className="mt-3 inline-flex max-w-full rounded-full bg-accent px-3 py-1.5 text-center text-xs font-extrabold leading-snug text-accent-foreground break-words">{copy.availability}</div>
          <p className="mt-4 break-words text-sm leading-relaxed text-muted-foreground">{copy.wellbeingIntro}</p>
          <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-2">
            <article className="relative min-w-0 rounded-2xl border-2 border-primary/30 bg-background p-4 shadow-sm">
              <span className="inline-flex max-w-full rounded-full bg-accent px-2.5 py-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground break-words">{copy.popular}</span>
              <h3 className="mt-3 break-words font-serif text-lg">{copy.massage}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{copy.chooseTime}</p>
              <ul className="mt-3 grid gap-1.5 text-sm">
                <li><strong>10 min — €25</strong> {copy.perEmployee}</li>
                <li><strong>15 min — €35</strong> {copy.perEmployee}</li>
                <li><strong>20 min — €50</strong> {copy.perEmployee}</li>
                <li><strong>30 min — €75</strong> {copy.perEmployee}</li>
                <li><strong>40 min — €90</strong> {copy.perEmployee}</li>
              </ul>
              <p className="mt-3 break-words text-xs font-bold text-muted-foreground">{copy.minimum}</p>
              <p className="mt-2 break-words text-xs text-muted-foreground">{copy.localQuote}</p>
              <p className="mt-2 break-words text-xs text-muted-foreground">{copy.timing}</p>
              <a className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-center text-sm font-extrabold leading-snug text-[#063d20] shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={massageMessage} target="_blank" rel="noreferrer noopener">{copy.quoteWhatsapp}</a>
            </article>
            <article className="min-w-0 rounded-2xl border border-primary/25 bg-background p-4">
              <h3 className="break-words font-serif text-lg">{copy.wellbeingHour}</h3>
              <p className="mt-2 break-words text-sm font-bold text-primary">{copy.tagline}</p>
              <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground">{copy.depositText}</p>
              <div className="mt-4 grid gap-2">
                <div className="rounded-xl border border-border/70 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{copy.hours2}</strong><b className="whitespace-nowrap text-primary">€300</b></div><p className="mt-1 text-xs text-muted-foreground">{copy.deposit}: <strong>€150</strong></p></div>
                <div className="relative rounded-xl border-2 border-primary bg-accent/40 p-3 pt-8"><span className="absolute left-3 top-0 max-w-[calc(100%-1.5rem)] rounded-b-lg bg-primary px-2 py-1 text-center text-[9px] font-extrabold leading-snug text-primary-foreground break-words">{copy.mostChosen}</span><div className="flex flex-wrap items-center justify-between gap-2"><strong>{copy.hours4}</strong><b className="whitespace-nowrap text-primary">€550</b></div><p className="mt-1 text-xs text-muted-foreground">{copy.deposit}: <strong>€275</strong></p></div>
                <div className="rounded-xl border border-border/70 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{copy.halfDay}</strong><b className="whitespace-nowrap text-primary">€700</b></div><p className="mt-1 text-xs text-muted-foreground">{copy.deposit}: <strong>€350</strong></p></div>
                <div className="rounded-xl border border-border/70 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{copy.corporateDay}</strong><b className="whitespace-nowrap text-primary">€1.050</b></div><p className="mt-1 text-xs text-muted-foreground">{copy.deposit}: <strong>€525</strong></p></div>
              </div>
              <a className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-sm font-extrabold leading-snug text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href={wellbeingUrl} target="_blank" rel="noreferrer noopener">{copy.choosePeriod}</a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientContract() {
  const { t, locale } = useI18n();
  const copy = COPY[locale];
  const catalog = useClientContractCatalog();
  const [region, setRegion] = useState<"eu" | "br">("eu");
  const [search, setSearch] = useState("");
  const items = catalog.data?.items ?? [];
  const psicanalise = items.filter((i) => i.group === "psicanalise" && i.region === region);
  const mentoria = items.filter((i) => i.group === "mentoria");
  const services = items.filter((i) => i.group === "servicos");
  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase(locale);
    return services.filter((item) => {
      if (item.region && item.region !== region) return false;
      const category = CATEGORY_BY_KEY[item.catalogKey] ?? "other";
      return !q || `${item.name} ${copy.categories[category]}`.toLocaleLowerCase(locale).includes(q);
    });
  }, [services, region, search, copy, locale]);
  const grouped = useMemo(() => {
    const map = new Map<CategoryId, ContractItem[]>();
    for (const item of filtered) {
      const category = CATEGORY_BY_KEY[item.catalogKey] ?? "other";
      map.set(category, [...(map.get(category) ?? []), item]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (catalog.isLoading) return <p className="text-sm text-muted-foreground">{t("state.loading")}</p>;

  return <div className="grid min-w-0 gap-8">
    <PageHeader title={t("contract.title")} subtitle={copy.pageSubtitle} />
    <section className="min-w-0 rounded-3xl border border-primary/15 bg-gradient-to-br from-card via-card to-accent/25 p-5 shadow-sm sm:p-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Grupo LDR Essence</p>
      <h2 className="mt-2 max-w-2xl break-words font-serif text-2xl leading-tight sm:text-3xl">{copy.allServices}</h2>
      <p className="mt-2 max-w-3xl break-words text-sm leading-relaxed text-muted-foreground">{copy.heroText}</p>
      <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
        <Field label={copy.regionCurrency} htmlFor="contract-region"><select id="contract-region" className="s8-field" value={region} onChange={(e) => setRegion(e.target.value as "eu" | "br")}><option value="eu">{copy.europe}</option><option value="br">{copy.brazilCurrency}</option></select></Field>
        <Field label={copy.findService} htmlFor="service-search"><input id="service-search" className="s8-field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={copy.searchPlaceholder} /></Field>
      </div>
    </section>

    <CorporateWellbeing copy={copy} locale={locale} />

    <section className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">{copy.attendance}</p><h2 className="mt-1 break-words font-serif text-2xl">{t("contract.psychoanalysis")}</h2><ul className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">{psicanalise.map((i) => <Card key={i.catalogKey} item={i} copy={copy} />)}</ul></section>
    <section className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">{copy.mentorshipStrategy}</p><h2 className="mt-1 break-words font-serif text-2xl">{t("contract.mentorship")}</h2><ul className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">{mentoria.map((i) => <Card key={i.catalogKey} item={i} copy={copy} />)}</ul></section>

    {grouped.map(([category, categoryItems]) => <section key={category} className="min-w-0 rounded-3xl border border-border/70 bg-card p-5 sm:p-6"><div className="mb-4 min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">{copy.serviceSolutions}</p><h2 className="mt-1 break-words font-serif text-2xl">{copy.categories[category]}</h2></div><ul className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">{categoryItems.map((i) => <Card key={i.catalogKey} item={i} copy={copy} />)}</ul></section>)}
  </div>;
}
