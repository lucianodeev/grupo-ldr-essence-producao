import { createFileRoute } from "@tanstack/react-router";
import { constants, gunzipSync } from "node:zlib";

import { getProtectedDigitalContent } from "@/lib/digital-content.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/diag-digital-reader")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const productKey = url.searchParams.get("product") ?? "ebook_estudos_caso_psicanalise";
        const recover = url.searchParams.get("recover") === "1";
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
            headers: { "content-type": "application/json", "cache-control": "no-store" },
          });
        }

        if (recover && productKey === "ebook_estudos_caso_psicanalise") {
          const { data, error } = await supabaseAdmin
            .from("digital_product_content")
            .select("content")
            .eq("product_key", productKey)
            .eq("locale", "pt")
            .eq("active", true)
            .maybeSingle();
          if (error || !data) {
            return new Response(JSON.stringify({ ok: false, stage: "load", error: error?.message ?? "missing" }), {
              status: 200,
              headers: { "content-type": "application/json", "cache-control": "no-store" },
            });
          }
          const raw = data.content as { encoding?: unknown; payload?: unknown } | null;
          if (!raw || raw.encoding !== "gzip-base64" || typeof raw.payload !== "string") {
            return new Response(JSON.stringify({ ok: false, stage: "shape" }), {
              status: 200,
              headers: { "content-type": "application/json", "cache-control": "no-store" },
            });
          }
          try {
            const bytes = Buffer.from(raw.payload, "base64");
            let strictError: string | null = null;
            try {
              gunzipSync(bytes);
            } catch (error) {
              strictError = error instanceof Error ? error.message : "strict_error";
            }
            const text = gunzipSync(bytes, { finishFlush: constants.Z_SYNC_FLUSH }).toString("utf8").replace(/^\uFEFF/, "");
            let parsed: any = null;
            let parseError: string | null = null;
            try {
              parsed = JSON.parse(text);
            } catch (error) {
              parseError = error instanceof Error ? error.message : "parse_error";
            }

            let trimmed: any = null;
            let trimError: string | null = null;
            let trimmedChars = 0;
            const lastBrace = text.lastIndexOf("}");
            if (!parsed && lastBrace >= 0) {
              const candidate = text.slice(0, lastBrace + 1);
              trimmedChars = text.length - candidate.length;
              try {
                trimmed = JSON.parse(candidate);
              } catch (error) {
                trimError = error instanceof Error ? error.message : "trim_parse_error";
              }
            }
            const recovered = parsed ?? trimmed;
            return new Response(JSON.stringify({
              ok: Boolean(recovered),
              stage: "recover",
              strictError,
              recoveredChars: text.length,
              parseError,
              trimmedChars,
              trimError,
              kind: recovered?.kind ?? null,
              pages: Array.isArray(recovered?.pages) ? recovered.pages.length : null,
              firstTitle: Array.isArray(recovered?.pages) ? recovered.pages[0]?.titulo ?? null : null,
              lastTitle: Array.isArray(recovered?.pages) ? recovered.pages.at(-1)?.titulo ?? null : null,
            }), {
              status: 200,
              headers: { "content-type": "application/json", "cache-control": "no-store" },
            });
          } catch (error) {
            return new Response(JSON.stringify({ ok: false, stage: "recover_throw", error: error instanceof Error ? error.message : "unknown" }), {
              status: 200,
              headers: { "content-type": "application/json", "cache-control": "no-store" },
            });
          }
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
            { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } },
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: error instanceof Error ? error.message : "unknown_error",
            }),
            { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } },
          );
        }
      },
    },
  },
});
