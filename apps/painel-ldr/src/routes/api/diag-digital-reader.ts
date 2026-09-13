import { createFileRoute } from "@tanstack/react-router";
import { constants, gzipSync, gunzipSync } from "node:zlib";

import { getProtectedDigitalContent } from "@/lib/digital-content.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/diag-digital-reader")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const productKey = url.searchParams.get("product") ?? "ebook_estudos_caso_psicanalise";
        const recover = url.searchParams.get("recover") === "1";
        const repair = url.searchParams.get("repair") === "1";
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

        if ((recover || repair) && productKey === "ebook_estudos_caso_psicanalise") {
          const { data, error } = await supabaseAdmin
            .from("digital_product_content")
            .select("content, version")
            .eq("product_key", productKey)
            .eq("locale", "pt")
            .eq("active", true)
            .maybeSingle();
          if (error || !data) {
            return new Response(JSON.stringify({ ok: false, stage: "load" }), {
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
            let strictParsed: any = null;
            try {
              strictParsed = JSON.parse(gunzipSync(bytes).toString("utf8").replace(/^\uFEFF/, ""));
            } catch {
              // The known broken row is recovered below.
            }

            let recovered = strictParsed;
            let trimmedChars = 0;
            if (!recovered) {
              const text = gunzipSync(bytes, { finishFlush: constants.Z_SYNC_FLUSH }).toString("utf8").replace(/^\uFEFF/, "");
              const lastBrace = text.lastIndexOf("}");
              if (lastBrace < 0) throw new Error("missing_json_end");
              const candidate = text.slice(0, lastBrace + 1);
              trimmedChars = text.length - candidate.length;
              recovered = JSON.parse(candidate);
            }

            const valid =
              recovered?.kind === "ebook" &&
              Array.isArray(recovered?.pages) &&
              recovered.pages.length === 23 &&
              recovered.pages[0]?.titulo === "Introdução" &&
              recovered.pages.at(-1)?.titulo === "Bibliografia geral";
            if (!valid) {
              return new Response(JSON.stringify({ ok: false, stage: "validation_failed" }), {
                status: 200,
                headers: { "content-type": "application/json", "cache-control": "no-store" },
              });
            }

            if (repair && !strictParsed) {
              const cleanJson = JSON.stringify(recovered);
              const payload = gzipSync(Buffer.from(cleanJson, "utf8")).toString("base64");
              const nextVersion = Math.max(Number(data.version ?? 1) + 1, 2);
              const { error: updateError } = await supabaseAdmin
                .from("digital_product_content")
                .update({
                  content: { encoding: "gzip-base64", payload },
                  version: nextVersion,
                })
                .eq("product_key", productKey)
                .eq("locale", "pt")
                .eq("active", true);
              if (updateError) {
                return new Response(JSON.stringify({ ok: false, stage: "update_failed" }), {
                  status: 200,
                  headers: { "content-type": "application/json", "cache-control": "no-store" },
                });
              }
              return new Response(JSON.stringify({ ok: true, stage: "repaired", pages: 23, trimmedChars, version: nextVersion }), {
                status: 200,
                headers: { "content-type": "application/json", "cache-control": "no-store" },
              });
            }

            return new Response(JSON.stringify({
              ok: true,
              stage: strictParsed ? "already_clean" : "recover",
              pages: 23,
              trimmedChars,
              firstTitle: "Introdução",
              lastTitle: "Bibliografia geral",
            }), {
              status: 200,
              headers: { "content-type": "application/json", "cache-control": "no-store" },
            });
          } catch {
            return new Response(JSON.stringify({ ok: false, stage: "recover_throw" }), {
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
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: "reader_failed" }),
            { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } },
          );
        }
      },
    },
  },
});
