import { createFileRoute } from "@tanstack/react-router";

import { getProtectedDigitalContent } from "@/lib/digital-content.server";

export const Route = createFileRoute("/api/diag-digital-reader")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (process.env.VERCEL_ENV === "production") {
          return new Response(JSON.stringify({ ok: false, disabled: true }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        }

        const url = new URL(request.url);
        const productKey = url.searchParams.get("product") ?? "ebook_estudos_caso_psicanalise";
        const allowed = new Set([
          "ebook_coragem_comecar",
          "livro_menino_mamao",
          "ebook_pratica_clinica_psicanalise",
          "ebook_psicanalise_no_mundo",
          "ebook_estudos_caso_psicanalise",
          "ebook_psicanalise_autismo",
        ]);
        if (!allowed.has(productKey)) {
          return new Response(JSON.stringify({ ok: false, error: "invalid_product" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const result = await getProtectedDigitalContent(
            "7a8892f1-b129-4f98-9512-537cd5055e7b",
            "llucianouam@gmail.com",
            productKey as Parameters<typeof getProtectedDigitalContent>[2],
            "pt",
          );
          const content = result.content as any;
          return new Response(
            JSON.stringify({
              ok: true,
              productKey: result.productKey,
              locale: result.locale,
              title: result.title,
              kind: content?.kind ?? null,
              pages: Array.isArray(content?.pages) ? content.pages.length : null,
              chapters: Array.isArray(content?.data?.chapters) ? content.data.chapters.length : null,
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: error instanceof Error ? error.message : "unknown_error",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
