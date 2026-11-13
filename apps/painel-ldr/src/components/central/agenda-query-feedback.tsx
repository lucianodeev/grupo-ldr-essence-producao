import { useI18n } from "@/lib/i18n";

const COPY = {
  pt: { loading: "Carregando agenda…", error: "Não foi possível carregar os dados da agenda.", help: "Verifique a conexão e tente novamente.", retry: "Tentar novamente", retrying: "Tentando novamente…", catalogLoading: "Carregando serviços…", catalogError: "Não foi possível carregar os serviços." },
  en: { loading: "Loading schedule…", error: "We could not load the schedule data.", help: "Check your connection and try again.", retry: "Try again", retrying: "Trying again…", catalogLoading: "Loading services…", catalogError: "We could not load the services." },
  fr: { loading: "Chargement de l’agenda…", error: "Impossible de charger les données de l’agenda.", help: "Vérifiez votre connexion et réessayez.", retry: "Réessayer", retrying: "Nouvelle tentative…", catalogLoading: "Chargement des services…", catalogError: "Impossible de charger les services." },
  es: { loading: "Cargando agenda…", error: "No se pudieron cargar los datos de la agenda.", help: "Comprueba la conexión e inténtalo de nuevo.", retry: "Intentar de nuevo", retrying: "Intentando de nuevo…", catalogLoading: "Cargando servicios…", catalogError: "No se pudieron cargar los servicios." },
} as const;

/** A failed read must never look like a successfully loaded empty schedule. */
export function AgendaQueryFeedback({ error, retrying, onRetry, resource = "agenda" }: {
  resource?: "agenda" | "catalog";
  error: boolean;
  retrying: boolean;
  onRetry: () => void;
}) {
  const { locale } = useI18n();
  const c = COPY[locale];
  if (!error) return <p className="s8-card" role="status">{resource === "catalog" ? c.catalogLoading : c.loading}</p>;

  return <section className="s8-card" role="alert">
    <p className="font-semibold">{resource === "catalog" ? c.catalogError : c.error}</p>
    <p className="mt-2 text-sm text-muted-foreground">{c.help}</p>
    <button type="button" onClick={onRetry} disabled={retrying}
      className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-bold disabled:opacity-60">
      {retrying ? c.retrying : c.retry}
    </button>
  </section>;
}
