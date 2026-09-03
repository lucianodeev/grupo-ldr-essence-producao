import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ChevronLeft, ChevronRight, Moon, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { clientDigitalProductContent } from "@/lib/digital-content.functions";
import { clientSaveProgress } from "@/lib/learning.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_clientarea/cliente/biblioteca/$productKey")({ component: DigitalReader });

type Locale = "pt" | "en" | "fr" | "es";
type EbookPage = { titulo?: string; texto?: string };
type BookChapter = [string | number, string, string[]];

type ReaderPayload =
  | { kind: "ebook"; pages: EbookPage[] }
  | {
      kind: "book";
      data: {
        flag?: string;
        name?: string;
        title?: string;
        subtitle?: string;
        dedication?: string;
        labels?: Record<string, string>;
        chapters?: BookChapter[];
      };
    };

const COPY = {
  pt: { back:"Voltar à Biblioteca", light:"Claro", dark:"Escuro", smaller:"Diminuir letra", larger:"Aumentar letra", language:"Idioma", chapter:"Capítulo", page:"Página", previous:"Anterior", next:"Próximo", loading:"Carregando conteúdo…", unavailable:"Não foi possível abrir este conteúdo. Confirme que a compra já foi aprovada.", fallback:"A tradução selecionada ainda não está disponível; exibindo a versão original.", progress:"Progresso" },
  en: { back:"Back to Library", light:"Light", dark:"Dark", smaller:"Smaller text", larger:"Larger text", language:"Language", chapter:"Chapter", page:"Page", previous:"Previous", next:"Next", loading:"Loading content…", unavailable:"This content could not be opened. Confirm that your purchase has been approved.", fallback:"The selected translation is not available yet; showing the original version.", progress:"Progress" },
  fr: { back:"Retour à la bibliothèque", light:"Clair", dark:"Sombre", smaller:"Réduire le texte", larger:"Agrandir le texte", language:"Langue", chapter:"Chapitre", page:"Page", previous:"Précédent", next:"Suivant", loading:"Chargement du contenu…", unavailable:"Impossible d’ouvrir ce contenu. Vérifiez que votre achat a été confirmé.", fallback:"La traduction sélectionnée n’est pas encore disponible ; affichage de la version originale.", progress:"Progression" },
  es: { back:"Volver a la Biblioteca", light:"Claro", dark:"Oscuro", smaller:"Reducir letra", larger:"Aumentar letra", language:"Idioma", chapter:"Capítulo", page:"Página", previous:"Anterior", next:"Siguiente", loading:"Cargando contenido…", unavailable:"No fue posible abrir este contenido. Confirma que la compra ya fue aprobada.", fallback:"La traducción seleccionada aún no está disponible; se muestra la versión original.", progress:"Progreso" },
} as const;

function normalizeProductKey(value: string) {
  if (value === "ebook_coragem_comecar" || value === "livro_menino_mamao") return value;
  return null;
}

function ReaderControls({ theme, setTheme, scale, setScale, locale, setLocale, copy }: any) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Controles de leitura">
      <button type="button" aria-pressed={theme === "light"} aria-label={copy.light} onClick={() => setTheme("light")} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><Sun className="h-4 w-4" /> {copy.light}</button>
      <button type="button" aria-pressed={theme === "dark"} aria-label={copy.dark} onClick={() => setTheme("dark")} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><Moon className="h-4 w-4" /> {copy.dark}</button>
      <button type="button" aria-label={copy.smaller} onClick={() => setScale((v: number) => Math.max(.9, +(v - .1).toFixed(1)))} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><ZoomOut className="h-4 w-4" /> A−</button>
      <button type="button" aria-label={copy.larger} onClick={() => setScale((v: number) => Math.min(1.4, +(v + .1).toFixed(1)))} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"><ZoomIn className="h-4 w-4" /> A+</button>
      <label className="ml-0 flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold sm:ml-1">
        <span>{copy.language}</span>
        <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="bg-transparent font-bold outline-none" aria-label={copy.language}>
          <option value="pt">PT</option><option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option>
        </select>
      </label>
    </div>
  );
}

function DigitalReader() {
  const { productKey: rawKey } = Route.useParams();
  const productKey = normalizeProductKey(rawKey);
  const { locale: appLocale } = useI18n();
  const initialLocale = (appLocale === "pt" || appLocale === "en" || appLocale === "fr" || appLocale === "es" ? appLocale : "pt") as Locale;
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scale, setScale] = useState(1);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const contentFn = useServerFn(clientDigitalProductContent);
  const progressFn = useServerFn(clientSaveProgress);
  const copy = COPY[locale];

  const query = useQuery({
    queryKey: ["digital-reader", productKey, locale],
    enabled: Boolean(productKey),
    queryFn: () => contentFn({ data: { productKey: productKey!, locale } }),
  });

  useEffect(() => { setChapterIndex(0); setPageIndex(0); }, [locale, productKey]);

  const payload = query.data?.content as ReaderPayload | undefined;
  const book = payload?.kind === "book" ? payload.data : null;
  const ebookPages = payload?.kind === "ebook" && Array.isArray(payload.pages) ? payload.pages : [];
  const chapters = book?.chapters ?? [];
  const activeChapter = chapters[chapterIndex];
  const bookPages = Array.isArray(activeChapter?.[2]) ? activeChapter[2] : [];
  const totalUnits = payload?.kind === "ebook" ? Math.max(ebookPages.length, 1) : Math.max(chapters.reduce((n, c) => n + (Array.isArray(c?.[2]) ? c[2].length : 0), 0), 1);
  const passedUnits = useMemo(() => {
    if (payload?.kind === "ebook") return Math.min(pageIndex + 1, totalUnits);
    let count = 0;
    for (let i = 0; i < chapterIndex; i += 1) count += chapters[i]?.[2]?.length ?? 0;
    return Math.min(count + pageIndex + 1, totalUnits);
  }, [payload, pageIndex, chapterIndex, chapters, totalUnits]);
  const progressPercent = Math.max(1, Math.min(100, Math.round((passedUnits / totalUnits) * 100)));

  useEffect(() => {
    if (!productKey || !query.data) return;
    const currentLocation = payload?.kind === "ebook"
      ? `${copy.page} ${pageIndex + 1}`
      : `${copy.chapter} ${chapterIndex + 1} · ${copy.page} ${pageIndex + 1}`;
    const timer = window.setTimeout(() => {
      progressFn({ data: { productKey, progressPercent, currentLocation } }).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [productKey, query.data, payload?.kind, pageIndex, chapterIndex, progressPercent, copy.page, copy.chapter, progressFn]);

  if (!productKey) return <section className="s8-card">Produto inválido.</section>;
  if (query.isLoading) return <section className="s8-card"><p>{copy.loading}</p></section>;
  if (query.error || !query.data || !payload) return <section className="s8-card"><h1 className="font-serif text-2xl">{rawKey}</h1><p className="mt-2 text-sm text-muted-foreground">{copy.unavailable}</p><a href="/cliente/biblioteca" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">{copy.back}</a></section>;

  const isDark = theme === "dark";
  const surface = isDark ? "bg-slate-950 text-slate-100" : "bg-[#fffaf2] text-[#352018]";
  const card = isDark ? "border-slate-700 bg-slate-900" : "border-[#e4d8ca] bg-white";
  const muted = isDark ? "text-slate-300" : "text-[#6e625d]";
  const requestedFallback = query.data.requestedLocale !== query.data.locale;

  const previous = () => {
    if (payload.kind === "ebook") return setPageIndex((v) => Math.max(0, v - 1));
    if (pageIndex > 0) return setPageIndex((v) => v - 1);
    if (chapterIndex > 0) {
      const prev = chapters[chapterIndex - 1]?.[2] ?? [];
      setChapterIndex((v) => v - 1); setPageIndex(Math.max(0, prev.length - 1));
    }
  };
  const next = () => {
    if (payload.kind === "ebook") return setPageIndex((v) => Math.min(ebookPages.length - 1, v + 1));
    if (pageIndex < bookPages.length - 1) return setPageIndex((v) => v + 1);
    if (chapterIndex < chapters.length - 1) { setChapterIndex((v) => v + 1); setPageIndex(0); }
  };

  const title = query.data.title;
  const ebookPage = ebookPages[Math.min(pageIndex, Math.max(0, ebookPages.length - 1))];
  const bookText = bookPages[Math.min(pageIndex, Math.max(0, bookPages.length - 1))] ?? "";

  return (
    <div className={`min-h-[calc(100vh-2rem)] rounded-2xl p-3 transition-colors sm:p-5 ${surface}`} style={{ fontSize: `${scale}em` }}>
      <header className={`sticky top-2 z-20 rounded-2xl border p-3 shadow-sm sm:p-4 ${card}`}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <a href="/cliente/biblioteca" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold underline"><ArrowLeft className="h-4 w-4" /> {copy.back}</a>
            <h1 className={`mt-1 break-words font-serif text-2xl sm:text-3xl ${isDark ? "!text-amber-100" : ""}`}>{title}</h1>
            <p className={`mt-1 text-xs ${muted}`}>{copy.progress}: {progressPercent}%</p>
          </div>
          <ReaderControls theme={theme} setTheme={setTheme} scale={scale} setScale={setScale} locale={locale} setLocale={setLocale} copy={copy} />
        </div>
      </header>

      {requestedFallback ? <div className="mx-auto mt-4 max-w-4xl rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{copy.fallback}</div> : null}

      <main className="mx-auto grid max-w-6xl gap-4 py-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`min-w-0 rounded-2xl border p-3 ${card}`}>
          {payload.kind === "ebook" ? (
            <nav className="grid max-h-[72vh] gap-1 overflow-y-auto" aria-label="Sumário">
              {ebookPages.map((p, i) => <button key={`${i}-${p.titulo}`} type="button" onClick={() => setPageIndex(i)} className={`min-h-11 rounded-xl px-3 py-2 text-left text-sm ${i === pageIndex ? "bg-primary font-bold text-primary-foreground" : "hover:bg-black/5"}`}>{i + 1}. {p.titulo || `${copy.page} ${i + 1}`}</button>)}
            </nav>
          ) : (
            <nav className="grid max-h-[72vh] gap-1 overflow-y-auto" aria-label="Sumário">
              {chapters.map((c, i) => <button key={`${i}-${String(c[0])}`} type="button" onClick={() => { setChapterIndex(i); setPageIndex(0); }} className={`min-h-11 rounded-xl px-3 py-2 text-left text-sm ${i === chapterIndex ? "bg-primary font-bold text-primary-foreground" : "hover:bg-black/5"}`}><span className="block font-bold">{c[0]}</span><span className="block text-xs opacity-80">{c[1]}</span></button>)}
            </nav>
          )}
        </aside>

        <article className={`min-w-0 rounded-2xl border p-5 shadow-sm sm:p-7 lg:p-10 ${card}`}>
          {payload.kind === "ebook" ? (
            <><p className="text-xs font-black uppercase tracking-[.14em] text-amber-600">{copy.page} {pageIndex + 1} / {ebookPages.length}</p><h2 className={`mt-2 break-words font-serif text-2xl sm:text-3xl ${isDark ? "!text-amber-100" : ""}`}>{ebookPage?.titulo}</h2><div className={`mt-6 whitespace-pre-line text-base leading-8 sm:text-lg ${muted}`}>{ebookPage?.texto}</div></>
          ) : (
            <><p className="text-xs font-black uppercase tracking-[.14em] text-amber-600">{String(activeChapter?.[0] ?? `${copy.chapter} ${chapterIndex + 1}`)} · {copy.page} {pageIndex + 1} / {Math.max(bookPages.length,1)}</p><h2 className={`mt-2 break-words font-serif text-2xl sm:text-3xl ${isDark ? "!text-amber-100" : ""}`}>{activeChapter?.[1]}</h2><div className={`mt-6 whitespace-pre-line text-base leading-8 sm:text-lg ${muted}`}>{bookText}</div></>
          )}

          <div className="mt-10 flex flex-wrap justify-between gap-3 border-t pt-5">
            <button type="button" onClick={previous} disabled={payload.kind === "ebook" ? pageIndex === 0 : chapterIndex === 0 && pageIndex === 0} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> {copy.previous}</button>
            <button type="button" onClick={next} disabled={payload.kind === "ebook" ? pageIndex >= ebookPages.length - 1 : chapterIndex >= chapters.length - 1 && pageIndex >= bookPages.length - 1} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-40">{copy.next} <ChevronRight className="h-4 w-4" /></button>
          </div>
        </article>
      </main>
    </div>
  );
}
