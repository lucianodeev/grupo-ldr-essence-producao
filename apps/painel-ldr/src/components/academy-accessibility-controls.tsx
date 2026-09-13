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

function findProductHero() {
  const shell = document.querySelector<HTMLElement>(".academy-accessibility-shell");
  if (!shell) return null;

  const nodes = new Set<HTMLElement>();
  shell.querySelectorAll<HTMLElement>("header, section").forEach((node) => nodes.add(node));

  shell.querySelectorAll<HTMLElement>("h1").forEach((heading) => {
    let node: HTMLElement | null = heading.parentElement;
    for (let depth = 0; node && node !== shell && depth < 5; depth += 1, node = node.parentElement) {
      nodes.add(node);
    }
  });

  let best: HTMLElement | null = null;
  let bestScore = 0;

  for (const node of nodes) {
    if (node.closest("[data-academy-accessibility-host]")) continue;

    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!text) continue;

    let score = 0;
    if (node.querySelector("h1")) score += 2;
    if (/progresso|progress|progression|progressión|concluído|concluída|completed|terminée|completada/.test(text)) score += 6;
    if (/\b\d{1,3}%\b/.test(text)) score += 3;
    if (/acesso liberado|access granted|accès autorisé|acceso liberado/.test(text)) score += 5;
    if (/módulos|modules|module|aulas|lessons|leçons|clases|unidades|units|unités|unidades/.test(text)) score += 3;
    if (/formação|formation|training|curso|course|treinamento/.test(text)) score += 2;

    if (score > bestScore) {
      best = node;
      bestScore = score;
    }
  }

  return bestScore >= 4 ? best : null;
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
    let observer: MutationObserver | null = null;

    const place = () => {
      const hero = findProductHero();
      if (!hero) return false;

      const existing = document.querySelector<HTMLElement>("[data-academy-accessibility-host='true']");
      if (existing) existing.remove();

      host = document.createElement("div");
      host.dataset.academyAccessibilityHost = "true";
      host.className = "academy-product-accessibility-host";
      hero.insertAdjacentElement("afterend", host);
      setPortalHost(host);
      return true;
    };

    if (!place()) {
      observer = new MutationObserver(() => {
        if (place()) observer?.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
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
