import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { clientDigitalProductContent } from "@/lib/digital-content.functions";
import { useI18n } from "@/lib/i18n";

type Locale = "pt" | "en" | "fr" | "es";
type SpecialProductKey = "ebook_falar_com_quem_feriu" | "ebook_da_pobreza_ao_primeiro_contrato";
type EbookPage = { titulo?: string; texto?: string };
type ReaderPayload = { kind: "ebook"; pages: EbookPage[] };

const COPY = {
  pt: { back: "Voltar à Biblioteca", loading: "Carregando conteúdo…", unavailable: "Conteúdo indisponível ou compra ainda não confirmada.", page: "Página", previous: "Anterior", next: "Próximo", progress: "Progresso", fallback: "A tradução selecionada ainda não está disponível; exibindo a versão em português." },
  en: { back: "Back to Library", loading: "Loading content…", unavailable: "Content unavailable or purchase not confirmed yet.", page: "Page", previous: "Previous", next: "Next", progress: "Progress", fallback: "The selected translation is not available yet; showing the Portuguese version." },
  fr: { back: "Retour à la Bibliothèque", loading: "Chargement…", unavailable: "Contenu indisponible ou achat pas encore confirmé.", page: "Page", previous: "Précédent", next: "Suivant", progress: "Progression", fallback: "La traduction sélectionnée n’est pas encore disponible ; version portugaise affichée." },
  es: { back: "Volver a la Biblioteca", loading: "Cargando…", unavailable: "Contenido no disponible o compra aún no confirmada.", page: "Página", previous: "Anterior", next: "Siguiente", progress: "Progreso", fallback: "La traducción seleccionada aún no está disponible; se muestra la versión en portugués." },
} as const;

const THEME: Record<SpecialProductKey, { accent: string; soft: string; dark: string }> = {
  ebook_falar_com_quem_feriu: { accent: "#9f4568", soft: "#fff0f6", dark: "#351629" },
  ebook_da_pobreza_ao_primeiro_contrato: { accent: "#1f4e79", soft: "#eef6ff", dark: "#10243a" },
};

export function SpecialEbookReader({ productKey }: { productKey: SpecialProductKey }) {
  const { locale: raw } = useI18n();
  const locale = (raw === "pt" || raw === "en" || raw === "fr" || raw === "es" ? raw : "pt") as Locale;
  const copy = COPY[locale];
  const theme = THEME[productKey];
  const contentFn = useServerFn(clientDigitalProductContent);
  const [pageIndex, setPageIndex] = useState(0);

  const query = useQuery({
    queryKey: ["special-ebook-reader", productKey, locale],
    queryFn: () => contentFn({ data: { productKey, locale } }),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const payload = query.data?.content as ReaderPayload | undefined;
  const pages = Array.isArray(payload?.pages) ? payload.pages : [];
  const safeIndex = Math.min(pageIndex, Math.max(0, pages.length - 1));
  const page = pages[safeIndex];
  const progress = useMemo(() => pages.length ? Math.round(((safeIndex + 1) / pages.length) * 100) : 0, [pages.length, safeIndex]);

  if (query.isLoading) return <section className="s8-card">{copy.loading}</section>;
  if (query.error || !query.data || payload?.kind !== "ebook" || !pages.length) return <section className="s8-card">{copy.unavailable}</section>;

  return (
    <main className="min-h-[calc(100vh-2rem)] rounded-[28px] p-4 sm:p-7" style={{ background: theme.soft, color: theme.dark }}>
      <header className="sticky top-2 z-20 rounded-3xl border bg-white/90 p-4 shadow-sm backdrop-blur">
        <a href="/cliente/biblioteca" className="inline-flex min-h-11 items-center gap-2 text-sm font-black" style={{ color: theme.accent }}>
          <ArrowLeft className="h-4 w-4" />{copy.back}
        </a>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: theme.accent }}>eBook · Biblioteca LDR</p>
            <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{query.data.title}</h1>
            {query.data.requestedLocale !== query.data.locale ? <p className="mt-2 text-xs opacity-70">{copy.fallback}</p> : null}
          </div>
          <div className="rounded-full border px-3 py-2 text-xs font-black" style={{ borderColor: theme.accent, color: theme.accent }}>{copy.progress}: {progress}%</div>
        </div>
      </header>

      <article className="mx-auto mt-6 max-w-4xl rounded-[28px] border bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl text-white" style={{ backgroundColor: theme.accent }}><BookOpen className="h-5 w-5" /></span>
          <span className="text-sm font-black opacity-70">{copy.page} {safeIndex + 1} / {pages.length}</span>
        </div>
        <h2 className="font-serif text-2xl font-bold sm:text-3xl">{page?.titulo}</h2>
        <div className="mt-5 whitespace-pre-line text-lg leading-9 text-slate-700">{page?.texto}</div>
      </article>

      <nav className="mx-auto mt-5 flex max-w-4xl justify-between gap-3">
        <button disabled={safeIndex <= 0} onClick={() => setPageIndex((v) => Math.max(0, v - 1))} className="inline-flex min-h-12 items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-black disabled:opacity-40"><ChevronLeft className="h-4 w-4" />{copy.previous}</button>
        <button disabled={safeIndex >= pages.length - 1} onClick={() => setPageIndex((v) => Math.min(pages.length - 1, v + 1))} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white disabled:opacity-40" style={{ backgroundColor: theme.accent }}>{copy.next}<ChevronRight className="h-4 w-4" /></button>
      </nav>
    </main>
  );
}
