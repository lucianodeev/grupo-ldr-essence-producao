import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function academyCanonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const isAcademy = host === "ldracademy.online" || host === "www.ldracademy.online";
  const isLegacyLearnHost = host === "learn.lucianoconecta.online";
  const isLegacyPanelHost = host === "painel.ldrrhestrategia.com" || host === "painel.lucianoconecta.online";

  if (isLegacyLearnHost) {
    const target = new URL("https://ldracademy.online");
    target.search = url.search;
    target.hash = url.hash;

    if (url.pathname === "/" || url.pathname === "/cliente") {
      target.pathname = "/biblioteca";
    } else if (url.pathname === "/cliente/biblioteca" || url.pathname.startsWith("/cliente/biblioteca/")) {
      target.pathname = url.pathname.replace(/^\/cliente\/biblioteca/, "/biblioteca");
    } else {
      target.pathname = url.pathname;
    }

    return Response.redirect(target.toString(), 308);
  }

  if (isLegacyPanelHost) {
    const target = new URL("https://ldracademy.online");
    target.search = url.search;
    target.hash = url.hash;

    if (url.pathname === "/cliente") {
      target.pathname = "/biblioteca";
      return Response.redirect(target.toString(), 308);
    }

    if (url.pathname === "/cliente/biblioteca" || url.pathname.startsWith("/cliente/biblioteca/")) {
      target.pathname = url.pathname.replace(/^\/cliente\/biblioteca/, "/biblioteca");
      return Response.redirect(target.toString(), 308);
    }
  }

  if (isAcademy && (url.pathname === "/" || url.pathname === "/cliente")) {
    url.hostname = "ldracademy.online";
    url.pathname = "/biblioteca";
    return Response.redirect(url.toString(), 308);
  }

  if (isAcademy && (url.pathname === "/cliente/biblioteca" || url.pathname.startsWith("/cliente/biblioteca/"))) {
    url.hostname = "ldracademy.online";
    url.pathname = url.pathname.replace(/^\/cliente\/biblioteca/, "/biblioteca");
    return Response.redirect(url.toString(), 308);
  }

  return null;
}

function rewriteAcademyLibraryRequest(request: Request): Request {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const isAcademy = host === "ldracademy.online" || host === "www.ldracademy.online";

  if (!isAcademy) return request;

  if (url.pathname === "/biblioteca" || url.pathname.startsWith("/biblioteca/")) {
    url.pathname = `/cliente${url.pathname}`;
    return new Request(url.toString(), request);
  }

  return request;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const canonicalRedirect = academyCanonicalRedirect(request);
      if (canonicalRedirect) return canonicalRedirect;

      const handler = await getServerEntry();
      const routedRequest = rewriteAcademyLibraryRequest(request);
      const response = await handler.fetch(routedRequest, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
