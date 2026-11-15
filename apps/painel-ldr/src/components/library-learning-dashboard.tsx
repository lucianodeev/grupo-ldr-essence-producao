import { useMemo, useState } from "react";
import { BookOpen, GraduationCap, Search, ArrowUpRight } from "lucide-react";
import {
  libraryContinueItems,
  libraryMatches,
  libraryOwned,
  type DashboardItem,
  type DashboardProgress,
} from "@/lib/library-dashboard";

const COPY = {
  pt: {
    title: "O seu próximo capítulo começa aqui.",
    panel: "Painel do aluno",
    intro: "Retome os seus estudos, encontre uma nova leitura e acompanhe o seu percurso.",
    continue: "Continuar a aprender",
    explore: "Explorar catálogo",
    courses: "Meus cursos",
    formations: "Minhas formações",
    ebooks: "Meus eBooks",
    free: "Cursos gratuitos",
    progress: "Progresso e certificados",
    search: "Pesquisar por título ou tema",
    all: "Todos os formatos",
    course: "Cursos",
    formation: "Formações",
    ebook: "eBooks e livros",
    granted: "Acesso disponível",
    freeAccess: "Gratuito",
    offer: "Ver condições de acesso",
    verify: "Verificar o meu acesso",
    open: "Abrir conteúdo",
    empty: "Nenhum conteúdo corresponde a esta seleção.",
    noProgress: "O seu percurso aparece aqui quando houver progresso registado.",
    subscription: "Assinatura LDR ONE",
    subscriptionText: "Consulte os conteúdos elegíveis, os planos e o estado da sua assinatura.",
    subscriptionCta: "Ver LDR ONE",
    orders: "Compras e pagamentos",
    catalogNote:
      "O acesso e a revisão pedagógica são apresentados separadamente. Consulte o estado editorial de cada conteúdo.",
    certificateNote:
      "O progresso de leitura não equivale a certificação. Certificados existentes continuam nas respetivas formações; os novos lotes em revisão não emitem certificados.",
    legacy: "Ver restantes serviços e acessos",
  },
  en: {
    title: "Your next chapter starts here.",
    panel: "Student dashboard",
    intro: "Resume your studies, find a new book and follow your learning journey.",
    continue: "Continue learning",
    explore: "Explore catalog",
    courses: "My courses",
    formations: "My programs",
    ebooks: "My eBooks",
    free: "Free courses",
    progress: "Progress and certificates",
    search: "Search by title or topic",
    all: "All formats",
    course: "Courses",
    formation: "Programs",
    ebook: "eBooks and books",
    granted: "Access available",
    freeAccess: "Free",
    offer: "View access conditions",
    verify: "Check my access",
    open: "Open content",
    empty: "No content matches this selection.",
    noProgress: "Your journey appears here once study progress has been recorded.",
    subscription: "LDR ONE subscription",
    subscriptionText: "Review eligible content, plans and your subscription status.",
    subscriptionCta: "View LDR ONE",
    orders: "Orders and payments",
    catalogNote:
      "Access and editorial review are shown separately. Check each item’s editorial status.",
    certificateNote:
      "Reading progress is not certification. Existing certificates remain in their programs; new batches under review do not issue certificates.",
    legacy: "Other services and access",
  },
  fr: {
    title: "Votre prochain chapitre commence ici.",
    panel: "Tableau de bord étudiant",
    intro: "Reprenez vos études, trouvez une nouvelle lecture et suivez votre parcours.",
    continue: "Continuer à apprendre",
    explore: "Explorer le catalogue",
    courses: "Mes cours",
    formations: "Mes formations",
    ebooks: "Mes eBooks",
    free: "Cours gratuits",
    progress: "Progression et certificats",
    search: "Rechercher par titre ou sujet",
    all: "Tous les formats",
    course: "Cours",
    formation: "Formations",
    ebook: "eBooks et livres",
    granted: "Accès disponible",
    freeAccess: "Gratuit",
    offer: "Voir les conditions d’accès",
    verify: "Vérifier mon accès",
    open: "Ouvrir le contenu",
    empty: "Aucun contenu ne correspond à cette sélection.",
    noProgress: "Votre parcours apparaît après enregistrement de votre progression.",
    subscription: "Abonnement LDR ONE",
    subscriptionText: "Consultez les contenus éligibles, les offres et votre abonnement.",
    subscriptionCta: "Voir LDR ONE",
    orders: "Achats et paiements",
    catalogNote:
      "L’accès et la révision éditoriale sont présentés séparément. Consultez le statut de chaque contenu.",
    certificateNote:
      "La progression de lecture ne vaut pas certification. Les certificats existants restent dans leurs formations ; les nouveaux lots en révision ne délivrent pas de certificat.",
    legacy: "Autres services et accès",
  },
  es: {
    title: "Tu próximo capítulo comienza aquí.",
    panel: "Panel del alumno",
    intro: "Retoma tus estudios, encuentra una nueva lectura y sigue tu recorrido.",
    continue: "Continuar aprendiendo",
    explore: "Explorar catálogo",
    courses: "Mis cursos",
    formations: "Mis formaciones",
    ebooks: "Mis eBooks",
    free: "Cursos gratuitos",
    progress: "Progreso y certificados",
    search: "Buscar por título o tema",
    all: "Todos los formatos",
    course: "Cursos",
    formation: "Formaciones",
    ebook: "eBooks y libros",
    granted: "Acceso disponible",
    freeAccess: "Gratis",
    offer: "Ver condiciones de acceso",
    verify: "Verificar mi acceso",
    open: "Abrir contenido",
    empty: "Ningún contenido coincide con esta selección.",
    noProgress: "Tu recorrido aparece cuando haya progreso registrado.",
    subscription: "Suscripción LDR ONE",
    subscriptionText: "Consulta los contenidos elegibles, los planes y tu suscripción.",
    subscriptionCta: "Ver LDR ONE",
    orders: "Compras y pagos",
    catalogNote:
      "El acceso y la revisión editorial se presentan por separado. Consulta el estado de cada contenido.",
    certificateNote:
      "El progreso de lectura no equivale a certificación. Los certificados existentes siguen en sus formaciones; los nuevos lotes en revisión no emiten certificados.",
    legacy: "Otros servicios y accesos",
  },
} as const;
type View = "explore" | "courses" | "formations" | "ebooks" | "free" | "progress";
export function LibraryLearningDashboard({
  locale,
  items,
  progress = [],
}: {
  locale: keyof typeof COPY;
  items: DashboardItem[];
  progress?: DashboardProgress[];
}) {
  const t = COPY[locale];
  const [view, setView] = useState<View>("explore");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const continuing = useMemo(() => libraryContinueItems(items, progress), [items, progress]);
  const selected = items.filter(
    (item) =>
      libraryMatches(item, query) &&
      (kind === "all" || item.kind === kind) &&
      (view === "explore" ||
        view === "progress" ||
        (view === "free"
          ? item.access === "free"
          : libraryOwned(item, progress) &&
            item.kind ===
              ({ courses: "course", formations: "formation", ebooks: "ebook" } as const)[view])),
  );
  const views: View[] = ["explore", "courses", "formations", "ebooks", "free", "progress"];
  const accessLabel = (item: DashboardItem) =>
    item.access === "granted"
      ? t.granted
      : item.access === "free"
        ? t.freeAccess
        : item.access === "offer"
          ? t.offer
          : t.verify;
  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-[#d6ad63]/40 bg-[#071426] p-6 text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d6ad63]">
          Biblioteca LDR · {t.panel}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-200">{t.intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/cliente/pedidos"
            className="rounded-xl border border-white/30 px-4 py-3 text-sm font-bold"
          >
            {t.orders}
          </a>
          <a
            href="/ldr-pass"
            className="rounded-xl bg-[#d6ad63] px-4 py-3 text-sm font-bold text-[#071426]"
          >
            {t.subscription}
          </a>
        </div>
      </header>
      <section aria-labelledby="continue-heading">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#775516]" />
          <h2 id="continue-heading" className="font-serif text-2xl text-[#102d50]">
            {t.continue}
          </h2>
        </div>
        {continuing.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {continuing.slice(0, 4).map((p) => (
              <a
                key={p.product_key}
                href={p.item.href}
                className="rounded-2xl border bg-white p-5 shadow-sm focus-visible:outline-2 focus-visible:outline-[#775516]"
              >
                <p className="text-xs font-bold uppercase text-[#775516]">{accessLabel(p.item)}</p>
                <h3 className="mt-2 font-serif text-xl">{p.item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.current_location}</p>
                <label
                  htmlFor={`progress-${p.product_key}`}
                  className="mt-4 block text-xs font-bold"
                >
                  {Math.max(0, Math.min(100, p.progress_percent))}%
                </label>
                <progress
                  id={`progress-${p.product_key}`}
                  max={100}
                  value={p.progress_percent}
                  className="mt-2 h-2 w-full accent-[#b18435]"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed bg-white p-6 text-sm text-slate-600">
            {t.noProgress}
          </p>
        )}
      </section>
      <section className="rounded-3xl border bg-white p-4 sm:p-6" aria-label={t.explore}>
        <nav aria-label={t.panel} className="flex flex-wrap gap-2">
          {views.map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`min-h-11 rounded-xl px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#775516] ${view === v ? "bg-[#102d50] text-white" : "bg-slate-100 text-[#102d50]"}`}
            >
              {t[v]}
            </button>
          ))}
        </nav>
        <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="block text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {t.search}
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-base"
            />
          </label>
          <label className="block text-sm font-semibold">
            {t.all}
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base"
            >
              <option value="all">{t.all}</option>
              <option value="course">{t.course}</option>
              <option value="formation">{t.formation}</option>
              <option value="ebook">{t.ebook}</option>
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {view === "progress" ? t.certificateNote : t.catalogNote}
        </p>
        <p aria-live="polite" className="mt-3 text-sm text-slate-600">
          {selected.length}{" "}
          {locale === "pt"
            ? "conteúdos"
            : locale === "fr"
              ? "contenus"
              : locale === "es"
                ? "contenidos"
                : "items"}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selected.map((item) => (
            <article
              key={item.key}
              className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-[#fcfcfd] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                {item.kind === "ebook" ? (
                  <BookOpen className="h-6 w-6 text-[#775516]" />
                ) : (
                  <GraduationCap className="h-6 w-6 text-[#775516]" />
                )}
                <span className="rounded-full border bg-white px-3 py-1 text-xs font-bold text-[#102d50]">
                  {accessLabel(item)}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-xl leading-snug text-[#102d50]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <p className="mt-4 rounded-lg bg-[#f4eddf] p-3 text-xs leading-5 text-[#624615]">
                {item.editorial}
              </p>
              {view === "progress" && (
                <p className="mt-3 text-sm">
                  {progress.find((p) => p.product_key === item.key)?.progress_percent ?? 0}%
                </p>
              )}
              <a
                href={item.href}
                className="mt-auto flex min-h-12 items-center justify-between gap-2 pt-5 text-sm font-bold text-[#102d50] underline underline-offset-4"
              >
                {item.access === "offer" ? t.offer : item.access === "verify" ? t.verify : t.open}
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>
            </article>
          ))}
        </div>
        {!selected.length && <p className="py-12 text-center text-slate-600">{t.empty}</p>}
      </section>
      <aside className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-[#d6ad63] bg-[#fbf7ef] p-6">
        <div>
          <h2 className="font-serif text-2xl text-[#102d50]">{t.subscription}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.subscriptionText}</p>
        </div>
        <a
          href="/ldr-pass"
          className="rounded-xl bg-[#102d50] px-5 py-3 text-sm font-bold text-white"
        >
          {t.subscriptionCta}
        </a>
      </aside>
    </div>
  );
}
