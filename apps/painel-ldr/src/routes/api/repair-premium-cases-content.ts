import { createFileRoute } from "@tanstack/react-router";
import { gunzipSync } from "node:zlib";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PREMIUM_CASES_PAYLOAD_0 } from "@/lib/premium-cases-payload-0.server";
import { PREMIUM_CASES_PAYLOAD_1 } from "@/lib/premium-cases-payload-1.server";
import { PREMIUM_CASES_PAYLOAD_2 } from "@/lib/premium-cases-payload-2.server";
import { PREMIUM_CASES_PAYLOAD_3 } from "@/lib/premium-cases-payload-3.server";

const EXPECTED_LENGTH = 37680;
const EXPECTED_PAGES = 196;
const EXPECTED_RAW_SHA256 = "ae1d569c68194c3e7762ecae5272dcaa335f1fc8a10c0bb5ad8b6922d4069545";

export const Route = createFileRoute("/api/repair-premium-cases-content")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const payload = PREMIUM_CASES_PAYLOAD_0 + PREMIUM_CASES_PAYLOAD_1 + PREMIUM_CASES_PAYLOAD_2 + PREMIUM_CASES_PAYLOAD_3;
          if (payload.length !== EXPECTED_LENGTH) {
            return Response.json({ ok: false, stage: "payload_length", length: payload.length }, { status: 500 });
          }

          const raw = gunzipSync(Buffer.from(payload, "base64"));
          const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", raw)))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
          if (digest !== EXPECTED_RAW_SHA256) {
            return Response.json({ ok: false, stage: "checksum" }, { status: 500 });
          }

          const parsed = JSON.parse(raw.toString("utf8")) as { kind?: string; pages?: Array<{ titulo?: string; texto?: string }> };
          if (parsed.kind !== "ebook" || !Array.isArray(parsed.pages) || parsed.pages.length !== EXPECTED_PAGES) {
            return Response.json({ ok: false, stage: "validation", pages: parsed.pages?.length ?? null }, { status: 500 });
          }

          const searchable = raw.toString("utf8").toLowerCase();
          const forbidden = ["jean", "andré", "brasília", "escitalopram", "cargo público", "cortisol"];
          const found = forbidden.filter((term) => searchable.includes(term));
          if (found.length) {
            return Response.json({ ok: false, stage: "privacy_validation", found }, { status: 500 });
          }

          const { error } = await supabaseAdmin
            .from("digital_product_content")
            .update({
              title: "Estudos de Caso",
              content: { encoding: "gzip-base64", payload },
              version: 3,
              active: true,
            })
            .eq("product_key", "ebook_estudos_caso_psicanalise")
            .eq("locale", "pt");

          if (error) return Response.json({ ok: false, stage: "database" }, { status: 500 });

          return Response.json({
            ok: true,
            stage: "repaired",
            version: 3,
            payloadLength: payload.length,
            pages: parsed.pages.length,
            firstTitle: parsed.pages[0]?.titulo ?? null,
            lastTitle: parsed.pages.at(-1)?.titulo ?? null,
          }, { headers: { "cache-control": "no-store" } });
        } catch {
          return Response.json({ ok: false, stage: "exception" }, { status: 500 });
        }
      },
    },
  },
});
