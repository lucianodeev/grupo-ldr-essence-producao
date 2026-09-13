import { Minus, Moon, Plus, RotateCcw, Sun, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useI18n } from "@/lib/i18n";

type Theme = "light" | "dark";
type Locale = "pt" | "en" | "fr" | "es";

type Props = {
  visible?: boolean;
  inline?: boolean;
};

const COPY = {
  pt: { decrease: "Diminuir texto", reset: "Tamanho padrão", increase: "Aumentar texto", light: "Claro", dark: "Escuro", language: "Idioma", popular: "MAIS PROCURADO", accessibility: "Acessibilidade", close: "Fechar acessibilidade" },
  en: { decrease: "Decrease text", reset: "Default size", increase: "Increase text", light: "Light", dark: "Dark", language: "Language", popular: "MOST POPULAR", accessibility: "Accessibility", close: "Close accessibility" },
  fr: { decrease: "Réduire le texte", reset: "Taille par défaut", increase: "Agrandir texte", light: "Clair", dark: "Sombre", language: "Langue", popular: "LE PLUS RECHERCHÉ", accessibility: "Accessibilité", close: "Fermer l’accessibilité" },
  es: { decrease: "Reducir texto", reset: "Tamaño predeterminado", increase: "Aumentar texto", light: "Claro", dark: "Oscuro", language: "Idioma", popular: "MÁS BUSCADO", accessibility: "Accesibilidad", close: "Cerrar accesibilidad" },
} as const;

const POPULAR_HREFS = [
  "/cliente/biblioteca/ebook_estudos_caso_psicanalise",
  "/cliente/ebooks/ebook_estudos_caso_psicanalise",
  "/cliente/cursos/academy/clinica-psicanalitica-sigmund-freud",
  "/cliente/treinamentos/psicanalise-internacional",
  "/cliente/psicanalista-alta-performance",
  "/cliente/treinamentos/formacao-profissional/aba-autismo",
  "/cliente/treinamentos/formacao-profissional/ciencias-felicidade",
  "/cliente/treinamentos/tricologia-terapia-capilar",
  "/cliente/treinamentos/curso-avulso/sexologia-humana-terapia-sexual",
  "/cliente/treinamentos/curso-avulso/analise-dos-sonhos-psicanalitica",
  "/cliente/treinamentos/curso-avulso/psicanalise-contemporanea-clinicas-atuais",
];

const STORAGE_THEME = "ldr_academy_theme";
const STORAGE_SCALE = "ldr_academy_font_scale";
const SCALES = [0.9, 1, 1.1, 1.2] as const;
const CARD_STYLE_ID = "ldr-academy-library-card-polish";

function safeScale(value: string | null) {
  const parsed = Number(value);
  return SCALES.includes(parsed as (typeof SCALES)[number]) ? parsed : 1;
}

function markPopularCards(label: string) {
  const catalog = document.querySelector("#catalogo-ldr");
  if (!catalog) return;
  catalog.querySelectorAll<HTMLElement>("[data-ldr-popular]").forEach((node) => {
    node.removeAttribute("data-ldr-popular");
    node.removeAttribute("data-popular-label");
  });
  for (const href of POPULAR_HREFS) {
    catalog.querySelectorAll<HTMLElement>(`a[href="${href}"]`).forEach((node) => {
      node.dataset.ldrPopular = "true";
      node.dataset.popularLabel = label;
    });
  }
  catalog.querySelectorAll<HTMLElement>("a,button").forEach((node) => {
    const href = node.getAttribute("href") || "";
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (href === "/cliente/treinamentos/ia-negocios-carreira" || /^IA(?:\s|$)/i.test(text)) {
      node.dataset.ldrPopular = "true";
      node.dataset.popularLabel = label;
    }
  });
}

function ensureLibraryCardPolish() {
  document.getElementById(CARD_STYLE_ID)?.remove();
  const style = document.createElement("style");
  style.id = CARD_STYLE_ID;
  style.textContent = `
    #catalogo-ldr .grid.grid-cols-4 {
      align-items: stretch !important;
      grid-auto-rows: 1fr;
      column-gap: 8px !important;
      row-gap: 10px !important;
      padding-inline: 2px !important;
    }
    #catalogo-ldr .grid.grid-cols-4 > a,
    #catalogo-ldr .grid.grid-cols-4 > button {
      width: 100%;
      height: 100% !important;
      min-height: 7.6rem !important;
      aspect-ratio: 0.72 / 1 !important;
      padding: 0.9rem 0.5rem !important;
      justify-content: center !important;
      border-radius: 18px !important;
      touch-action: manipulation;
    }
    #catalogo-ldr .grid.grid-cols-4 > a > p,
    #catalogo-ldr .grid.grid-cols-4 > button > p {
      min-height: 3.4em !important;
      padding-inline: 0.18rem !important;
      font-size: 0.62rem !important;
      line-height: 1.16 !important;
      letter-spacing: 0 !important;
      -webkit-line-clamp: 3 !important;
    }
    #catalogo-ldr .grid.grid-cols-4 > a > span,
    #catalogo-ldr .grid.grid-cols-4 > button > span {
      margin-top: 0.5rem !important;
      padding: 0.24rem 0.46rem !important;
      font-size: 0.5rem !important;
      line-height: 1.05 !important;
      white-space: nowrap;
    }
    #catalogo-ldr [data-ldr-popular="true"] { padding-top: 2.4rem !important; }
    #catalogo-ldr [data-ldr-popular="true"]::before {
      top: 0.48rem !important;
      left: 50% !important;
      right: auto !important;
      transform: translateX(-50%) !important;
      width: max-content !important;
      max-width: calc(100% - 10px) !important;
      padding: 0.3rem 0.46rem !important;
      font-size: 0.48rem !important;
      line-height: 1.05 !important;
      letter-spacing: 0.02em !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    #catalogo-ldr [data-ldr-popular="true"]::after { top: 0.53rem !important; right: 0.4rem !important; }
    @media (min-width: 641px) {
      #catalogo-ldr .grid.grid-cols-4 { column-gap: 12px !important; row-gap: 14px !important; padding-inline: 4px !important; }
      #catalogo-ldr .grid.grid-cols-4 > a,
      #catalogo-ldr .grid.grid-cols-4 > button { min-height: 8.4rem !important; padding-inline: 0.6rem !important; }
      #catalogo-ldr .grid.grid-cols-4 > a > p,
      #catalogo-ldr .grid.grid-cols-4 > button > p { font-size: 0.68rem !important; line-height: 1.18 !important; }
      #catalogo-ldr .grid.grid-cols-4 > a > span,
      #catalogo-ldr .grid.grid-cols-4 > button > span { font-size: 0.54rem !important; }
      #catalogo-ldr [data-ldr-popular="true"]::before { font-size: 0.54rem !important; }
    }
  `;
  document.head.appendChild(style);
}

export function AcademyAccessibilityControls({ visible = true }: Props) {
  const { locale: rawLocale, setLocale } = useI18n();
  const locale = (rawLocale === "pt" || rawLocale === "en" || rawLocale === "fr" || rawLocale === "es" ? rawLocale : "pt") as Locale;
  const t = COPY[locale];
  const [theme, setTheme] = useState<Theme>("light");
  const [scale, setScale] = useState(1);
  const [open, setOpen] = useState(false);
  const scaleIndex = useMemo(() => Math.max(0, SCALES.indexOf(scale as (typeof SCALES)[number])), [scale]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_THEME);
    const preferredDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredDark ? "dark" : "light");
    setScale(safeScale(window.localStorage.getItem(STORAGE_SCALE)));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.classList.remove("dark");
      delete root.dataset.academyTheme;
      return;
    }
    root.classList.toggle("dark", theme === "dark");
    root.dataset.academyTheme = theme;
    window.localStorage.setItem(STORAGE_THEME, theme);
    return () => {
      root.classList.remove("dark");
      delete root.dataset.academyTheme;
    };
  }, [theme, visible]);

  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      delete root.dataset.academyFontScale;
      root.style.removeProperty("--academy-font-scale");
      return;
    }
    root.dataset.academyFontScale = String(Math.round(scale * 100));
    root.style.setProperty("--academy-font-scale", String(scale));
    window.localStorage.setItem(STORAGE_SCALE, String(scale));
    return () => {
      delete root.dataset.academyFontScale;
      root.style.removeProperty("--academy-font-scale");
    };
  }, [scale, visible]);

  useEffect(() => {
    ensureLibraryCardPolish();
    const apply = () => markPopularCards(t.popular);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [t.popular]);

  useEffect(() => { if (!visible) setOpen(false); }, [visible]);

  const decrease = () => setScale(SCALES[Math.max(0, scaleIndex - 1)]);
  const increase = () => setScale(SCALES[Math.min(SCALES.length - 1, scaleIndex + 1)]);
  if (!visible) return null;

  const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/30 px-3 py-2.5 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="no-print fixed right-3 top-[36vh] z-[65] flex items-start justify-end" data-academy-accessibility-drawer="true">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} aria-label={t.accessibility} title={t.accessibility} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#0d263d] text-xl text-white shadow-xl transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"><span aria-hidden="true">♿</span></button>
      ) : (
        <aside className="w-[min(300px,calc(100vw-32px))] rounded-[24px] border border-white/20 bg-[#0d263d] p-4 text-white shadow-2xl" aria-label={t.accessibility}>
          <div className="flex items-center justify-between gap-3"><strong className="text-sm uppercase tracking-[0.12em]">{t.accessibility}</strong><button type="button" onClick={() => setOpen(false)} aria-label={t.close} title={t.close} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 hover:bg-white/10"><X className="h-4 w-4" aria-hidden="true" /></button></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setTheme("light")} aria-pressed={theme === "light"} className={`${buttonClass} ${theme === "light" ? "bg-white/15 ring-1 ring-white/35" : ""}`}><Sun className="h-4 w-4" aria-hidden="true" />{t.light}</button>
            <button type="button" onClick={() => setTheme("dark")} aria-pressed={theme === "dark"} className={`${buttonClass} ${theme === "dark" ? "bg-white/15 ring-1 ring-white/35" : ""}`}><Moon className="h-4 w-4" aria-hidden="true" />{t.dark}</button>
            <button type="button" onClick={decrease} disabled={scaleIndex === 0} aria-label={t.decrease} title={t.decrease} className={buttonClass}><Minus className="h-4 w-4" aria-hidden="true" /><span>A−</span></button>
            <button type="button" onClick={increase} disabled={scaleIndex === SCALES.length - 1} aria-label={t.increase} title={t.increase} className={buttonClass}><Plus className="h-4 w-4" aria-hidden="true" /><span>A+</span></button>
          </div>
          <button type="button" onClick={() => setScale(1)} aria-label={t.reset} title={t.reset} className={`${buttonClass} mt-2 w-full`}><RotateCcw className="h-4 w-4" aria-hidden="true" />{t.reset}</button>
          <label className="mt-3 flex min-h-11 w-full items-center justify-between gap-4 rounded-xl border border-white/30 px-3 py-2.5 text-sm font-black"><span className="whitespace-nowrap">{t.language}</span><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.language} className="min-w-20 bg-transparent text-right font-black text-white outline-none"><option className="text-slate-950" value="pt">PT</option><option className="text-slate-950" value="en">EN</option><option className="text-slate-950" value="fr">FR</option><option className="text-slate-950" value="es">ES</option></select></label>
        </aside>
      )}
    </div>
  );
}
