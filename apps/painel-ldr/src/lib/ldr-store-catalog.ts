import { academyUnifiedCatalog } from "./academy-unified-catalog";
import { PSYCHOANALYSIS_EBOOKS } from "./psychoanalysis-ebooks.catalog";

export const STORE_CATEGORIES = {
  ebooks: "eBooks",
  psicanalise: "Psicanálise e saúde",
  negocios: "Negócios",
  carreira: "Carreira e desenvolvimento",
  rh: "Recursos humanos",
  ia: "Inteligência artificial",
} as const;

export type StoreCategory = keyof typeof STORE_CATEGORIES;
export type StoreMarket = "INTL" | "BR";

export const STORE_PRODUCTS = [
  ...PSYCHOANALYSIS_EBOOKS.map((ebook) => ({
    ...ebook,
    category: "ebooks" as const,
    accent: ebook.color,
    kind: "ebook" as const,
  })),
  ...academyUnifiedCatalog().map((academy) => ({
    ...academy,
    slug: academy.key,
  })),
];

export function findStoreProducts(query: string, category: StoreCategory | "") {
  const normalized = (text: string) =>
    text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("pt");
  const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
  return STORE_PRODUCTS.filter((item) => {
    if (category && item.category !== category) return false;
    const text = normalized(`${item.title} ${item.description} ${STORE_CATEGORIES[item.category]}`);
    return terms.every((term) => text.includes(term));
  });
}

export function ebookStorePrice(item: (typeof PSYCHOANALYSIS_EBOOKS)[number], market: StoreMarket) {
  const currency = market === "BR" ? "BRL" : "EUR";
  const cents = market === "BR" ? item.priceBrlCents : item.priceEurCents;
  return new Intl.NumberFormat(market === "BR" ? "pt-BR" : "pt-PT", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
