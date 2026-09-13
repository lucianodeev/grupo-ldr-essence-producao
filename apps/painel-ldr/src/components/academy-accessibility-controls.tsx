import { Minus, Moon, Plus, RotateCcw, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useI18n } from "@/lib/i18n";

type Theme = "light" | "dark";
type Locale = "pt" | "en" | "fr" | "es";

const COPY = {
  pt: { decrease: "Diminuir texto", reset: "Tamanho padrão", increase: "Aumentar texto", light: "Modo claro", dark: "Modo escuro", popular: "MAIS PROCURADO" },
  en: { decrease: "Decrease text", reset: "Default size", increase: "Increase text", light: "Light mode", dark: "Dark mode", popular: "MOST POPULAR" },
  fr: { decrease: "Réduire le texte", reset: "Taille par défaut", increase: "Agrandir le texte", light: "Mode clair", dark: "Mode sombre", popular: "LE PLUS RECHERCHÉ" },
  es: { decrease: "Reducir texto", reset: "Tamaño predeterminado", increase: "Aumentar texto", light: "Modo claro", dark: "Modo oscuro", popular: "MÁS BUSCADO" },
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

  // A formação de IA pode ser um link (acesso liberado) ou botão (oferta fechada).
  catalog.querySelectorAll<HTMLElement>("a,button").forEach((node) => {
    const href = node.getAttribute("href") || "";
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (href === "/cliente/treinamentos/ia-negocios-carreira" || /^IA(?:\s|$)/i.test(text)) {
      node.dataset.ldrPopular = "true";
      node.dataset.popularLabel = label;
    }
  });
}

export function AcademyAccessibilityControls() {
  const { locale: rawLocale } = useI18n();
  const locale = (rawLocale === "pt" || rawLocale === "en" || rawLocale === "fr" || rawLocale === "es" ? rawLocale : "pt") as Locale;
  const t = COPY[locale];
  const [theme, setTheme] = useState<Theme>("light");
  const [scale, setScale] = useState(1);
  const scaleIndex = useMemo(() => Math.max(0, SCALES.indexOf(scale as (typeof SCALES)[number])), [scale]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_THEME);
    const preferredDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredDark ? "dark" : "light");
    setScale(safeScale(window.localStorage.getItem(STORAGE_SCALE)));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.academyTheme = theme;
    window.localStorage.setItem(STORAGE_THEME, theme);
    return () => {
      root.classList.remove("dark");
      delete root.dataset.academyTheme;
    };
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.academyFontScale = String(Math.round(scale * 100));
    root.style.setProperty("--academy-font-scale", String(scale));
    window.localStorage.setItem(STORAGE_SCALE, String(scale));
    return () => {
      delete root.dataset.academyFontScale;
      root.style.removeProperty("--academy-font-scale");
    };
  }, [scale]);

  useEffect(() => {
    const apply = () => markPopularCards(t.popular);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [t.popular]);

  const decrease = () => setScale(SCALES[Math.max(0, scaleIndex - 1)]);
  const increase = () => setScale(SCALES[Math.min(SCALES.length - 1, scaleIndex + 1)]);

  return (
    <div className="academy-accessibility-controls no-print" role="group" aria-label="Academy accessibility controls">
      <button type="button" onClick={decrease} disabled={scaleIndex === 0} aria-label={t.decrease} title={t.decrease}>
        <Minus aria-hidden="true" /> <span>A</span>
      </button>
      <button type="button" onClick={() => setScale(1)} aria-label={t.reset} title={t.reset}>
        <RotateCcw aria-hidden="true" />
      </button>
      <button type="button" onClick={increase} disabled={scaleIndex === SCALES.length - 1} aria-label={t.increase} title={t.increase}>
        <Plus aria-hidden="true" /> <span>A</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        aria-label={theme === "dark" ? t.light : t.dark}
        title={theme === "dark" ? t.light : t.dark}
      >
        {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </button>
    </div>
  );
}
