import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";
import { AcademyCatalogCard } from "@/components/academy-catalog-card";
import { commerceField, LdrCommercePage } from "@/components/ldr-commerce-page";
import { academySubscriptionLabel } from "@/lib/academy-unified-catalog";
import {
  ebookStorePrice,
  findStoreProducts,
  STORE_CATEGORIES,
  type StoreCategory,
  type StoreMarket,
} from "@/lib/ldr-store-catalog";

export const Route = createFileRoute("/loja/")({
  head: () => ({
    meta: [
      { title: "LDR Store | eBooks, cursos e formações" },
      {
        name: "description",
        content:
          "Explore o catálogo de eBooks, cursos e formações da LDR. Consulte preços e opções de acesso pela Biblioteca.",
      },
    ],
  }),
  component: Store,
});

function Store() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StoreCategory | "">("");
  const [market, setMarket] = useState<StoreMarket>("INTL");
  const products = findStoreProducts(useDeferredValue(query), category);
  return (
    <LdrCommercePage
      section="loja"
      title="LDR Store"
      intro="Encontre eBooks, cursos e formações por tema. O acesso digital é feito na Biblioteca LDR."
    >
      <div className="grid gap-4 rounded-2xl border border-[#cfd7cd] bg-white p-5 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="text-sm font-semibold">
          Pesquisar no catálogo
          <input
            type="search"
            value={query}
            maxLength={120}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: liderança, recrutamento, escrita"
            className={commerceField}
          />
        </label>
        <label className="text-sm font-semibold">
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as StoreCategory | "")}
            className={commerceField}
          >
            <option value="">Todas as categorias</option>
            {Object.entries(STORE_CATEGORIES).map(([key, title]) => (
              <option key={key} value={key}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Moeda
          <select
            value={market}
            onChange={(event) => setMarket(event.target.value as StoreMarket)}
            className={commerceField}
          >
            <option value="INTL">Euro (EUR)</option>
            <option value="BR">Real (BRL)</option>
          </select>
        </label>
      </div>
      <p className="my-5 text-sm font-semibold" role="status">
        {products.length === 1 ? "1 produto" : `${products.length} produtos`}
      </p>
      {products.length === 0 ? (
        <p className="rounded-2xl border border-[#cfd7cd] p-6">
          Experimente outro termo ou escolha uma categoria diferente.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.key}>
              <AcademyCatalogCard
                catalogKey={product.key}
                title={product.title}
                description={product.description}
                detail={
                  product.kind === "ebook"
                    ? "eBook · Português"
                    : STORE_CATEGORIES[product.category]
                }
                icon={product.kind === "ebook" ? "📖" : product.icon}
                accent={product.accent}
                subscription={product.kind !== "ebook"}
                accessLabel={
                  product.kind === "ebook"
                    ? ebookStorePrice(product, market)
                    : academySubscriptionLabel()
                }
                cta="Ver detalhes"
                href={`/loja/${encodeURIComponent(product.slug)}?market=${market}`}
              />
            </li>
          ))}
        </ul>
      )}
    </LdrCommercePage>
  );
}
