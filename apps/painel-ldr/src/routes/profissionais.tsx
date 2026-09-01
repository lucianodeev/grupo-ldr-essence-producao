import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, Filter, Globe2, Languages, MapPin, Monitor, Search, Sparkles, UserRound, UsersRound, X } from "lucide-react";
import { LanguageSelect, useI18n } from "@/lib/i18n";
import { networkLanding } from "@/lib/professional-network.functions";

export const Route = createFileRoute("/profissionais")({
  loader: () => networkLanding(),
  head: () => ({ meta: [
    { title: "Encontre Profissionais | Rede de Profissionais LDR" },
    { name: "description", content: "Encontre profissionais da Rede LDR por área, localização, idioma e modalidade de atendimento." },
    { property: "og:title", content: "Encontre Profissionais | Rede LDR" },
    { property: "og:description", content: "Pesquise profissionais por área, localização, idioma e modalidade de atendimento." },
  ] }),
  component: Directory,
});

type AnyRow = Record<string, any>;

const COPY = {
  pt: {
    eyebrow: "REDE DE PROFISSIONAIS LDR",
    title: "ENCONTRE O PROFISSIONAL CERTO PARA O SEU MOMENTO",
    sub: "Pesquise profissionais por área, localização, idioma e modalidade de atendimento.",
    professionalCta: "Você é profissional? Conheça a Rede LDR",
    search: "Qual profissional você procura?",
    area: "Área",
    country: "País",
    language: "Idioma",
    all: "Todos",
    online: "Online",
    present: "Presencial",
    filters: "Filtros",
    categories: "Explore por área",
    results: "profissionais encontrados",
    oneResult: "profissional encontrado",
    clear: "Limpar filtros",
    profile: "VER PERFIL",
    empty: "Nenhum profissional encontrado com estes filtros.",
    active: "Perfil ativo",
    verified: "Perfil validado",
    networkTitle: "VOCÊ É PROFISSIONAL?",
    networkText: "Crie sua presença profissional, organize seus serviços e faça parte de um ecossistema de desenvolvimento, tecnologia e conexões profissionais.",
    networkPrimary: "CONHECER A REDE LDR",
    networkSecondary: "JÁ SOU PROFISSIONAL",
    visualTitle: "Profissionais organizados em um só lugar",
    visualText: "Encontre perfis ativos com informações claras para tomar uma decisão com mais rapidez.",
  },
  en: {
    eyebrow: "LDR PROFESSIONAL NETWORK",
    title: "FIND THE RIGHT PROFESSIONAL FOR YOUR MOMENT",
    sub: "Search professionals by area, location, language and service modality.",
    professionalCta: "Are you a professional? Discover the LDR Network",
    search: "What professional are you looking for?",
    area: "Area",
    country: "Country",
    language: "Language",
    all: "All",
    online: "Online",
    present: "In person",
    filters: "Filters",
    categories: "Explore by area",
    results: "professionals found",
    oneResult: "professional found",
    clear: "Clear filters",
    profile: "VIEW PROFILE",
    empty: "No professionals match these filters.",
    active: "Active profile",
    verified: "Verified profile",
    networkTitle: "ARE YOU A PROFESSIONAL?",
    networkText: "Build your professional presence, organize your services and join an ecosystem of development, technology and professional connections.",
    networkPrimary: "DISCOVER THE LDR NETWORK",
    networkSecondary: "I'M ALREADY A PROFESSIONAL",
    visualTitle: "Organized professionals in one place",
    visualText: "Find active profiles with clear information so you can decide faster.",
  },
  fr: {
    eyebrow: "RÉSEAU DE PROFESSIONNELS LDR",
    title: "TROUVEZ LE PROFESSIONNEL ADAPTÉ À VOTRE MOMENT",
    sub: "Recherchez par domaine, localisation, langue et modalité de service.",
    professionalCta: "Vous êtes professionnel ? Découvrez le Réseau LDR",
    search: "Quel professionnel recherchez-vous ?",
    area: "Domaine",
    country: "Pays",
    language: "Langue",
    all: "Tous",
    online: "En ligne",
    present: "Présentiel",
    filters: "Filtres",
    categories: "Explorer par domaine",
    results: "professionnels trouvés",
    oneResult: "professionnel trouvé",
    clear: "Effacer les filtres",
    profile: "VOIR LE PROFIL",
    empty: "Aucun professionnel ne correspond à ces filtres.",
    active: "Profil actif",
    verified: "Profil validé",
    networkTitle: "VOUS ÊTES PROFESSIONNEL ?",
    networkText: "Créez votre présence professionnelle, organisez vos services et rejoignez un écosystème de développement, technologie et connexions professionnelles.",
    networkPrimary: "DÉCOUVRIR LE RÉSEAU LDR",
    networkSecondary: "JE SUIS DÉJÀ PROFESSIONNEL",
    visualTitle: "Des professionnels organisés au même endroit",
    visualText: "Trouvez des profils actifs avec des informations claires pour décider plus rapidement.",
  },
  es: {
    eyebrow: "RED DE PROFESIONALES LDR",
    title: "ENCUENTRA AL PROFESIONAL ADECUADO PARA TU MOMENTO",
    sub: "Busca profesionales por área, ubicación, idioma y modalidad de atención.",
    professionalCta: "¿Eres profesional? Conoce la Red LDR",
    search: "¿Qué profesional buscas?",
    area: "Área",
    country: "País",
    language: "Idioma",
    all: "Todos",
    online: "Online",
    present: "Presencial",
    filters: "Filtros",
    categories: "Explora por área",
    results: "profesionales encontrados",
    oneResult: "profesional encontrado",
    clear: "Limpiar filtros",
    profile: "VER PERFIL",
    empty: "No hay profesionales con estos filtros.",
    active: "Perfil activo",
    verified: "Perfil validado",
    networkTitle: "¿ERES PROFESIONAL?",
    networkText: "Crea tu presencia profesional, organiza tus servicios y forma parte de un ecosistema de desarrollo, tecnología y conexiones profesionales.",
    networkPrimary: "CONOCER LA RED LDR",
    networkSecondary: "YA SOY PROFESIONAL",
    visualTitle: "Profesionales organizados en un solo lugar",
    visualText: "Encuentra perfiles activos con información clara para decidir más rápido.",
  },
} as const;

const NAVY = "#0b1428";
const GOLD = "#c9a63a";
const CREAM = "#fbf8f1";
const MUTED = "#667085";

function Directory() {
  const { locale } = useI18n();
  const c = COPY[locale];
  const data = Route.useLoaderData() as any;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [country, setCountry] = useState("");
  const [lang, setLang] = useState("");
  const [mode, setMode] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = (data?.categories ?? []) as AnyRow[];
  const profiles = (data?.profiles ?? []) as AnyRow[];
  const catMap = useMemo(() => new Map(categories.map((x) => [x.id, x])), [categories]);
  const countries = [...new Set(profiles.map((p) => p.country_code).filter(Boolean))].sort();
  const languages = [...new Set(profiles.flatMap((p) => p.languages ?? []))].sort();

  const filtered = profiles.filter((p) => {
    const hay = `${p.display_name} ${p.professional_title} ${(p.specialties ?? []).join(" ")} ${p.city ?? ""}`.toLowerCase();
    return (!q || hay.includes(q.toLowerCase())) &&
      (!cat || p.category_id === cat) &&
      (!country || p.country_code === country) &&
      (!lang || (p.languages ?? []).includes(lang)) &&
      (!mode || (mode === "online" ? p.online_enabled : p.in_person_enabled));
  });

  const hasFilters = Boolean(q || cat || country || lang || mode);
  const clear = () => { setQ(""); setCat(""); setCountry(""); setLang(""); setMode(""); };

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: NAVY }}>
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-xl" style={{ borderColor: "rgba(201,166,58,.28)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="font-serif text-xl font-bold tracking-tight">Grupo LDR Essence</Link>
          <div className="flex items-center gap-2">
            <Link to="/para-profissionais" className="hidden rounded-full border px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 sm:inline-flex" style={{ borderColor: GOLD, color: NAVY }}>
              {c.professionalCta} <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
            <LanguageSelect />
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b bg-white" style={{ borderColor: "rgba(201,166,58,.2)" }}>
          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(201,166,58,.12)" }} />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.18fr_.82fr] lg:items-center lg:py-20">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em]" style={{ color: GOLD }}>{c.eyebrow}</p>
              <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.04] sm:text-5xl lg:text-6xl">{c.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 sm:text-lg" style={{ color: MUTED }}>{c.sub}</p>
              <Link to="/para-profissionais" className="mt-7 inline-flex items-center gap-2 text-sm font-black underline-offset-4 hover:underline" style={{ color: NAVY }}>
                {c.professionalCta}<ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border bg-white p-7 shadow-xl" style={{ borderColor: "rgba(201,166,58,.45)" }}>
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: GOLD }} />
              <div className="grid h-14 w-14 place-items-center rounded-full" style={{ background: NAVY, color: GOLD }}><UsersRound className="h-6 w-6" /></div>
              <h2 className="mt-6 font-serif text-3xl">{c.visualTitle}</h2>
              <p className="mt-3 text-sm leading-7" style={{ color: MUTED }}>{c.visualText}</p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-bold">
                <div className="rounded-2xl p-3" style={{ background: CREAM }}><BriefcaseBusiness className="mx-auto h-5 w-5" /><span className="mt-2 block">{c.area}</span></div>
                <div className="rounded-2xl p-3" style={{ background: CREAM }}><Globe2 className="mx-auto h-5 w-5" /><span className="mt-2 block">{c.country}</span></div>
                <div className="rounded-2xl p-3" style={{ background: CREAM }}><Languages className="mx-auto h-5 w-5" /><span className="mt-2 block">{c.language}</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="rounded-[2rem] border bg-white p-4 shadow-lg sm:p-6" style={{ borderColor: "rgba(201,166,58,.4)" }}>
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: GOLD }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.search} aria-label={c.search} className="w-full rounded-2xl border bg-white py-4 pl-12 pr-4 text-sm outline-none transition focus:ring-2" style={{ borderColor: "rgba(11,20,40,.18)" }} />
            </label>

            <button type="button" onClick={() => setFiltersOpen((v) => !v)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black lg:hidden" style={{ borderColor: GOLD }}>
              <Filter className="h-4 w-4" /> {c.filters}
            </button>

            <div className={`${filtersOpen ? "grid" : "hidden"} mt-3 gap-3 sm:grid-cols-3 lg:grid lg:grid-cols-5`}>
              <select aria-label={c.area} value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-2xl border bg-white px-4 py-3.5 text-sm outline-none" style={{ borderColor: "rgba(11,20,40,.18)" }}><option value="">{c.area}: {c.all}</option>{categories.map((x) => <option key={x.id} value={x.id}>{x[`name_${locale}`] || x.name_pt}</option>)}</select>
              <select aria-label={c.country} value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-2xl border bg-white px-4 py-3.5 text-sm outline-none" style={{ borderColor: "rgba(11,20,40,.18)" }}><option value="">{c.country}: {c.all}</option>{countries.map((x) => <option key={x} value={x}>{x}</option>)}</select>
              <select aria-label={c.language} value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-2xl border bg-white px-4 py-3.5 text-sm outline-none" style={{ borderColor: "rgba(11,20,40,.18)" }}><option value="">{c.language}: {c.all}</option>{languages.map((x) => <option key={x} value={x}>{x.toUpperCase()}</option>)}</select>
              <button onClick={() => setMode(mode === "online" ? "" : "online")} className="rounded-2xl border px-4 py-3.5 text-sm font-black" style={{ borderColor: mode === "online" ? NAVY : "rgba(11,20,40,.18)", background: mode === "online" ? NAVY : "white", color: mode === "online" ? "white" : NAVY }}><Monitor className="mr-2 inline h-4 w-4" />{c.online}</button>
              <button onClick={() => setMode(mode === "present" ? "" : "present")} className="rounded-2xl border px-4 py-3.5 text-sm font-black" style={{ borderColor: mode === "present" ? NAVY : "rgba(11,20,40,.18)", background: mode === "present" ? NAVY : "white", color: mode === "present" ? "white" : NAVY }}><MapPin className="mr-2 inline h-4 w-4" />{c.present}</button>
            </div>

            {hasFilters ? <button onClick={clear} className="mt-4 inline-flex items-center gap-2 text-sm font-black" style={{ color: MUTED }}><X className="h-4 w-4" />{c.clear}</button> : null}
          </div>

          {categories.length ? <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-[.18em]" style={{ color: GOLD }}>{c.categories}</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              <button onClick={() => setCat("")} className="shrink-0 rounded-full border px-4 py-2 text-sm font-black" style={{ borderColor: !cat ? NAVY : "rgba(11,20,40,.15)", background: !cat ? NAVY : "white", color: !cat ? "white" : NAVY }}>{c.all}</button>
              {categories.map((x) => <button key={x.id} onClick={() => setCat(x.id)} className="shrink-0 rounded-full border px-4 py-2 text-sm font-black" style={{ borderColor: cat === x.id ? NAVY : "rgba(11,20,40,.15)", background: cat === x.id ? NAVY : "white", color: cat === x.id ? "white" : NAVY }}>{x[`name_${locale}`] || x.name_pt}</button>)}
            </div>
          </div> : null}

          <div className="mt-8 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em]" style={{ color: GOLD }}>{c.eyebrow}</p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}><strong style={{ color: NAVY }}>{filtered.length}</strong> {filtered.length === 1 ? c.oneResult : c.results}</p>
            </div>
          </div>

          <section className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const category = catMap.get(p.category_id);
              const isVerified = Boolean(p.profile_verified || p.identity_verified || p.documents_verified);
              return <article key={p.id} className="group relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ borderColor: "rgba(201,166,58,.4)" }}>
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: GOLD }} />
                <div className="flex items-start gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl" style={{ background: CREAM }}>
                    {p.photo_url ? <img src={p.photo_url} alt={p.display_name || "Profissional da Rede LDR"} loading="lazy" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" style={{ color: NAVY }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div><h2 className="break-words font-serif text-2xl leading-tight">{p.display_name}</h2><p className="mt-1 text-sm font-black" style={{ color: GOLD }}>{p.professional_title}</p></div>
                      {isVerified ? <BadgeCheck className="mt-1 h-5 w-5 shrink-0" aria-label={c.verified} style={{ color: GOLD }} /> : null}
                    </div>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide" style={{ color: MUTED }}>{c.active}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl p-4" style={{ background: CREAM }}>
                  <p className="text-sm font-semibold">{category?.[`name_${locale}`] || category?.name_pt || p.professional_title}</p>
                  <div className="mt-3 grid gap-2 text-sm" style={{ color: MUTED }}>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" style={{ color: GOLD }} />{p.city ? `${p.city} · ` : ""}{p.country_code}</p>
                    {(p.languages ?? []).length ? <p className="flex items-center gap-2"><Languages className="h-4 w-4 shrink-0" style={{ color: GOLD }} />{(p.languages ?? []).map((x: string) => x.toUpperCase()).join(" · ")}</p> : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.online_enabled ? <span className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black" style={{ borderColor: "rgba(201,166,58,.4)", background: "rgba(201,166,58,.10)" }}><Monitor className="mr-1.5 h-3.5 w-3.5" />{c.online.toUpperCase()}</span> : null}
                  {p.in_person_enabled ? <span className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black" style={{ borderColor: "rgba(11,20,40,.14)" }}><Globe2 className="mr-1.5 h-3.5 w-3.5" />{c.present.toUpperCase()}</span> : null}
                </div>

                {p.about ? <p className="mt-4 line-clamp-3 text-sm leading-6" style={{ color: MUTED }}>{p.about}</p> : null}
                <Link to="/profissional/$slug" params={{ slug: p.slug }} className="mt-6 flex items-center justify-between rounded-full px-5 py-4 text-sm font-black text-white transition group-hover:-translate-y-0.5" style={{ background: NAVY }}><span>{c.profile}</span><ArrowUpRight className="h-4 w-4" /></Link>
              </article>;
            })}
          </section>

          {filtered.length === 0 ? <div className="mt-8 rounded-[2rem] border border-dashed bg-white p-10 text-center" style={{ borderColor: "rgba(201,166,58,.55)" }}><div className="mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ background: NAVY, color: GOLD }}><Search className="h-5 w-5" /></div><p className="mt-4 text-sm" style={{ color: MUTED }}>{c.empty}</p>{hasFilters ? <button onClick={clear} className="mt-4 rounded-full border px-4 py-2 text-sm font-black" style={{ borderColor: GOLD }}>{c.clear}</button> : null}</div> : null}

          <section className="relative mt-12 overflow-hidden rounded-[2.25rem] p-8 text-white shadow-2xl sm:p-10 lg:p-12" style={{ background: NAVY }}>
            <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(201,166,58,.2)" }} />
            <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><p className="text-xs font-black uppercase tracking-[.18em]" style={{ color: GOLD }}>{c.eyebrow}</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">{c.networkTitle}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">{c.networkText}</p></div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link to="/para-profissionais" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black" style={{ background: GOLD, color: NAVY }}>{c.networkPrimary}<ArrowUpRight className="h-4 w-4" /></Link>
                <Link to="/profissional/login" className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-4 text-sm font-black text-white">{c.networkSecondary}</Link>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
