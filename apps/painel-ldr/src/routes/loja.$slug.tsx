import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { commerceAction, LdrCommercePage } from "@/components/ldr-commerce-page";
import { academySubscriptionLabel } from "@/lib/academy-unified-catalog";
import { ebookStorePrice, STORE_CATEGORIES, STORE_PRODUCTS } from "@/lib/ldr-store-catalog";
import { ldrStoreSandboxCheckout, ldrStoreSandboxStatus } from "@/lib/ldr-store.functions";

type StoreDetail = { product: (typeof STORE_PRODUCTS)[number]; sandboxEnabled: boolean };

export const Route = createFileRoute("/loja/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    market: search["market"] === "BR" ? ("BR" as const) : ("INTL" as const),
  }),
  loader: async ({ params }): Promise<StoreDetail> => {
    const product = STORE_PRODUCTS.find((item) => item.slug === params.slug);
    if (!product) throw notFound();
    return {
      product,
      sandboxEnabled: product.kind === "ebook" && (await ldrStoreSandboxStatus()).enabled,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.product.title} | LDR Store`
          : "Produto indisponível | LDR Store",
      },
    ],
  }),
  notFoundComponent: () => (
    <LdrCommercePage
      section="loja"
      title="Produto indisponível"
      intro="Consulte as edições disponíveis no catálogo."
    >
      <a href="/loja" className={commerceAction}>
        Voltar à loja
      </a>
    </LdrCommercePage>
  ),
  component: StoreProduct,
});

function StoreProduct() {
  const { product, sandboxEnabled }: StoreDetail = Route.useLoaderData();
  const { market } = Route.useSearch();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function checkout() {
    setPending(true);
    setError(false);
    try {
      const result = await ldrStoreSandboxCheckout({ data: { productKey: product.key, market } });
      window.location.assign(result.url);
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <LdrCommercePage section="loja" title={product.title} intro={product.description}>
      <a href="/loja" className="font-semibold underline underline-offset-4">
        Voltar à loja
      </a>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="min-w-0 rounded-2xl border border-[#cfd7cd] bg-white p-6">
          {product.kind === "ebook" ? (
            <>
              <h2 className="font-serif text-3xl">{product.subtitle}</h2>
              <p className="mt-3 leading-7">{product.audience}</p>
              <details className="mt-5 border-t border-[#cfd7cd] pt-4">
                <summary className="cursor-pointer font-semibold">Índice da edição</summary>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                  {product.chapters.map((chapter) => (
                    <li key={chapter}>{chapter}</li>
                  ))}
                </ol>
              </details>
            </>
          ) : (
            <>
              <h2 className="font-serif text-3xl">{STORE_CATEGORIES[product.category]}</h2>
              <p className="mt-3 leading-7">
                {product.kind === "course" ? "Curso digital" : "Formação digital"}
              </p>
              {product.publicPath !== product.learnerPath && (
                <a
                  className="mt-5 inline-block font-semibold underline underline-offset-4"
                  href={product.publicPath}
                >
                  Consultar o programa
                </a>
              )}
            </>
          )}
        </section>
        <section className="rounded-2xl border border-[#cfd7cd] bg-[#e5ece3] p-6">
          <h2 className="font-serif text-2xl">Acesso digital</h2>
          <p className="mt-3 text-lg font-bold">
            {product.kind === "ebook"
              ? ebookStorePrice(product, market)
              : academySubscriptionLabel()}
          </p>
          {product.kind === "ebook" && (
            <p className="mt-2 text-sm">eBook em português · Leitura online na Biblioteca</p>
          )}
          {sandboxEnabled && (
            <div className="mt-5 flex flex-col items-start gap-3">
              <a className="text-sm font-semibold underline" href="/cliente/login">
                Entrar com a conta de teste
              </a>
              <button
                type="button"
                disabled={pending}
                className={commerceAction}
                onClick={() => void checkout()}
              >
                {pending ? "A preparar…" : "Abrir checkout de teste"}
              </button>
              {error && (
                <p role="alert" className="text-sm text-red-900">
                  Confirme a sessão de teste e a disponibilidade da edição.
                </p>
              )}
            </div>
          )}
          <a
            className={`mt-5 ${commerceAction}`}
            href={product.kind === "ebook" ? product.readerPath : product.learnerPath}
          >
            {product.kind === "ebook"
              ? "Abrir leitor na Biblioteca"
              : "Aceder ao percurso de estudo"}
          </a>
        </section>
      </div>
    </LdrCommercePage>
  );
}
