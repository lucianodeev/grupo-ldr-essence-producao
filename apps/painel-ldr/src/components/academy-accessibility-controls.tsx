import { Minus, Moon, Plus, RotateCcw, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { useI18n } from "@/lib/i18n";

type Theme = "light" | "dark";
type Locale = "pt" | "en" | "fr" | "es";

type Props = {
  visible?: boolean;
  inline?: boolean;
};

const COPY = {
  pt: { decrease: "Diminuir texto", reset: "Tamanho padrão", increase: "Aumentar texto", light: "Claro", dark: "Escuro", language: "Idioma", popular: "MAIS PROCURADO" },
  en: { decrease: "Decrease text", reset: "Default size", increase: "Increase text", light: "Light", dark: "Dark", language: "Language", popular: "MOST POPULAR" },
  fr: { decrease: "Réduire le texte", reset: "Taille par défaut", increase: "Agrandir le texte", light: "Clair", dark: "Sombre", language: "Langue", popular: "LE PLUS RECHERCHÉ" },
  es: { decrease: "Reducir texto", reset: "Tamaño predeterminado", increase: "Aumentar texto", light: "Claro", dark: "Oscuro", language: "Idioma", popular: "MÁS BUSCADO" },
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
  if (document.getElementById(CARD_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = CARD_STYLE_ID;
  style.textContent = `
    #catalogo-ldr .grid.grid-cols-4 {
      align-items: stretch !important;
      grid-auto-rows: 1fr;
    }
    #catalogo-ldr .grid.grid-cols-4 > a,
    #catalogo-ldr .grid.grid-cols-4 > button {
      width: 100%;
      height: 100% !important;
      min-height: 7.6rem !important;
      aspect-ratio: 0.78 / 1 !important;
      padding: 0.85rem 0.42rem !important;
      justify-content: center !important;
      touch-action: manipulation;
    }
    #catalogo-ldr .grid.grid-cols-4 > a > p,
    #catalogo-ldr .grid.grid-cols-4 > button > p {
      min-height: 3.35em !important;
      padding-inline: 0.1rem;
      font-size: 0.58rem !important;
      line-height: 1.15 !important;
      letter-spacing: -0.005em;
      -webkit-line-clamp: 3 !important;
    }
    #catalogo-ldr .grid.grid-cols-4 > a > span,
    #catalogo-ldr .grid.grid-cols-4 > button > span {
      margin-top: 0.42rem !important;
      padding: 0.22rem 0.42rem !important;
      font-size: 0.49rem !important;
      line-height: 1.05 !important;
      white-space: nowrap;
    }
    #catalogo-ldr [data-ldr-popular="true"] {
      padding-top: 2.25rem !important;
    }
    #catalogo-ldr [data-ldr-popular="true"]::before {
      top: 0.52rem !important;
      max-width: calc(100% - 0.95rem) !important;
      padding: 0.28rem 0.5rem !important;
      font-size: 0.5rem !important;
      line-height: 1.05 !important;
      letter-spacing: 0.03em !important;
    }
    #catalogo-ldr [data-ldr-popular="true"]::after {
      top: 0.56rem !important;
      right: 0.42rem !important;
    }
    @media (min-width: 641px) {
      #catalogo-ldr .grid.grid-cols-4 > a,
      #catalogo-ldr .grid.grid-cols-4 > button {
        min-height: 8.4rem !important;
        padding-inline: 0.55rem !important;
      }
      #catalogo-ldr .grid.grid-cols-4 > a > p,
      #catalogo-ldr .grid.grid-cols-4 > button > p {
        font-size: 0.66rem !important;
        line-height: 1.18 !important;
      }
      #catalogo-ldr .grid.grid-cols-4 > a > span,
      #catalogo-ldr .grid.grid-cols-4 > button > span {
        font-size: 0.53rem !important;
      }
      #catalogo-ldr [data-ldr-popular="true"]::before {
        font-size: 0.54rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function textOf(node: Element) {
  return (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function isCompactProgressNode(node: HTMLElement) {
  const text = textOf(node);
  if (!text || text.length > 180) return false;
  return /progresso|progress|progression|progressión|concluído|concluída|completed|terminée|completada|\b\d{1,3}%\b/.test(text);
}

function findProductAnchor() {
  const shell = document.querySelector<HTMLElement>(".academy-accessibility-shell");
  if (!shell) return null;

  const heading = Array.from(shell.querySelectorAll<HTMLElement>("h1")).find(
    (node) => !node.closest("[data-academy-accessibility-host]"),
  );
  if (!heading) return null;

  const scopes: HTMLElement[] = [];
  const semantic = heading.closest<HTMLElement>("header, section, article");
  if (semantic && semantic !== shell) scopes.push(semantic);

  let parent = heading.parentElement;
  for (let depth = 0; parent && parent !== shell && depth < 3; depth += 1, parent = parent.parentElement) {
    if (!scopes.includes(parent)) scopes.push(parent);
  }

  for (const scope of scopes) {
    const candidates = Array.from(scope.querySelectorAll<HTMLElement>("p, span, div")).filter(
      (node) => !node.closest("[data-academy-accessibility-host]") && isCompactProgressNode(node),
    );
    if (candidates.length) {
      candidates.sort((a, b) => textOf(a).length - textOf(b).length);
      return candidates[0];
    }
  }

  if (semantic && semantic !== shell) {
    const progressInSemantic = Array.from(semantic.children).find(
      (node): node is HTMLElement => node instanceof HTMLElement && isCompactProgressNode(node),
    );
    if (progressInSemantic) return progressInSemantic;
  }

  return heading;
}

export function AcademyAccessibilityControls({ visible = true, inline = false }: Props) {
  const { locale: rawLocale, setLocale } = useI18n();
  const locale = (rawLocale === "pt" || rawLocale === "en" || rawLocale === "fr" || rawLocale === "es" ? rawLocale : "pt") as Locale;
  const t = COPY[locale];
  const [theme, setTheme] = useState<Theme>("light");
  const [scale, setScale] = useState(1);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
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

  useEffect(() => {
    if (!visible || !inline) {
      setPortalHost(null);
      return;
    }

    let host: HTMLElement | null = null;
    let scheduled = false;

    const place = () => {
      scheduled = false;
      if (host?.isConnected) return;

      const anchor = findProductAnchor();
      if (!anchor) return;

      document.querySelectorAll<HTMLElement>("[data-academy-accessibility-host='true']").forEach((node) => node.remove());

      host = document.createElement("div");
      host.dataset.academyAccessibilityHost = "true";
      host.className = "academy-product-accessibility-host";
      anchor.insertAdjacentElement("afterend", host);
      setPortalHost(host);
    };

    const schedulePlace = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(place);
    };

    schedulePlace();
    const shell = document.querySelector<HTMLElement>(".academy-accessibility-shell") ?? document.body;
    const observer = new MutationObserver(() => {
      if (!host?.isConnected) schedulePlace();
    });
    observer.observe(shell, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      host?.remove();
      setPortalHost(null);
    };
  }, [visible, inline]);

  const decrease = () => setScale(SCALES[Math.max(0, scaleIndex - 1)]);
  const increase = () => setScale(SCALES[Math.min(SCALES.length - 1, scaleIndex + 1)]);

  if (!visible) return null;

  if (inline) {
    const buttonClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-current/35 px-4 py-3 text-sm font-black transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[132px]";
    const controls = (
      <section className="no-print mx-auto my-4 w-full rounded-[28px] border border-slate-300/35 bg-[#0d263d] p-4 text-white shadow-sm sm:my-5 sm:p-5" aria-label="Academy accessibility controls">
        <div className="flex flex-wrap items-center gap-3" role="group">
          <button type="button" onClick={() => setTheme("light")} aria-pressed={theme === "light"} className={`${buttonClass} ${theme === "light" ? "bg-white/12 ring-1 ring-white/35" : ""}`}>
            <Sun className="h-5 w-5" aria-hidden="true" /><strong>{t.light}</strong>
          </button>
          <button type="button" onClick={() => setTheme("dark")} aria-pressed={theme === "dark"} className={`${buttonClass} ${theme === "dark" ? "bg-white/12 ring-1 ring-white/35" : ""}`}>
            <Moon className="h-5 w-5" aria-hidden="true" /><strong>{t.dark}</strong>
          </button>
          <button type="button" onClick={decrease} disabled={scaleIndex === 0} aria-label={t.decrease} title={t.decrease} className={buttonClass}>
            <Minus className="h-5 w-5" aria-hidden="true" /><strong>A−</strong>
          </button>
          <button type="button" onClick={increase} disabled={scaleIndex === SCALES.length - 1} aria-label={t.increase} title={t.increase} className={buttonClass}>
            <Plus className="h-5 w-5" aria-hidden="true" /><strong>A+</strong>
          </button>
          <button type="button" onClick={() => setScale(1)} aria-label={t.reset} title={t.reset} className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-current/35 px-3 py-3 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2">
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <label className="mt-3 inline-flex min-h-12 min-w-[190px] items-center gap-4 rounded-2xl border border-white/35 px-4 py-3 text-sm font-black">
          <span className="whitespace-nowrap">{t.language}</span>
          <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t.language} className="min-w-20 bg-transparent font-black text-white outline-none">
            <option className="text-slate-950" value="pt">PT</option>
            <option className="text-slate-950" value="en">EN</option>
            <option className="text-slate-950" value="fr">FR</option>
            <option className="text-slate-950" value="es">ES</option>
          </select>
        </label>
      </section>
    );

    return portalHost ? createPortal(controls, portalHost) : null;
  }

  return null;
}
