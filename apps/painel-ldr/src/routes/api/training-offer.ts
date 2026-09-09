import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_ORIGINS = new Set([
  "https://ldrrhestrategia.com",
  "https://www.ldrrhestrategia.com",
  "https://kind-crest-9804.hosted.pageshare.ai",
  "https://painel.ldrrhestrategia.com",
]);

function cors(origin: string | null) {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store, max-age=0",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export const Route = createFileRoute("/api/training-offer")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: cors(request.headers.get("origin")) }),
      GET: async ({ request }) => {
        const { getPublicDoMamaoTrainingOffer } = await import("@/lib/training-commerce.server");
        const offer = await getPublicDoMamaoTrainingOffer();
        return new Response(JSON.stringify({ ok: true, ...offer }), {
          status: 200,
          headers: {
            ...cors(request.headers.get("origin")),
            "Content-Type": "application/json; charset=utf-8",
          },
        });
      },
    },
  },
});
