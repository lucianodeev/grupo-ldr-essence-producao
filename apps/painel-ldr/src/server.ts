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

function temporaryRedirect(url: string): Response {
  return new Response("Redirecting...\n", {
    status: 307,
    headers: {
      location: url,
      "cache-control": "no-store, max-age=0",
      pragma: "no-cache",
      expires: "0",
      vary: "Host",
    },
  });
}

function academyCanonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const isAcademy = host === "ldracademy.online" || host === "www.ldracademy.online";
  const isServicePortal = host === "portal.ldrrhestrategia.com";
  const isLegacyLdrPanelHost = host === "painel.ldrrhestrategia.com";
  const isLegacyLearnHost = host === "learn.lucianoconecta.online";
  const isLegacyPanelHost = host === "painel.lucianoconecta.online";
  const isLegacyLucianoHost = host === "lucianoconecta.online" || host === "www.lucianoconecta.online";
  const isFilmHost = host === "film.lucianoconecta.online";

  // Canonical Academy hostname. www is accepted only as an alias and always
  // resolves to the official apex domain.
  if (host === "www.ldracademy.online") {
    const target = new URL(url.toString());
    target.hostname = "ldracademy.online";
    return temporaryRedirect(target.toString());
  }

  // painel.ldrrhestrategia.com is the canonical Master administration entry.
  // Keep deep routes intact; the root must open the protected Master dashboard,
  // which will request Master authentication when no valid session exists.
  if (
    isLegacyLdrPanelHost &&
    (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/acesso")
  ) {
    url.pathname = "/admin";
    return temporaryRedirect(url.toString());
  }

  // Legacy Luciano Conecta hosts are aliases only. Keep their content/routes,
  // but expose them through the official LDR Academy domain.
  if (isFilmHost) {
    const target = new URL("https://ldracademy.online");
    target.pathname = url.pathname === "/" || url.pathname === "/index.html" ? "/film" : url.pathname;
    target.search = url.search;
    target.hash = url.hash;
    return temporaryRedirect(target.toString());
  }

  if (isLegacyLucianoHost) {
    const target = new URL("https://ldracademy.online");
    target.pathname = url.pathname === "/index.html" ? "/" : url.pathname;
    target.search = url.search;
    target.hash = url.hash;
    return temporaryRedirect(target.toString());
  }

  // The services portal shares the same deployment as the Academy, but it must
  // always carry an explicit services context before SSR. This prevents the
  // Academy storefront/client learning state from being rendered on this host,
  // including on stale browser/CDN navigations.
  if (isServicePortal) {
    if (url.pathname === "/") {
      url.pathname = "/cliente/login";
      url.searchParams.set("portal", "services");
      url.searchParams.set("v", "3");
      return temporaryRedirect(url.toString());
    }

    if (url.pathname === "/cliente/login" && url.searchParams.get("portal") !== "services") {
      url.searchParams.set("portal", "services");
      url.searchParams.set("v", "3");
      return temporaryRedirect(url.toString());
    }

    if (url.pathname === "/cliente" && url.searchParams.get("portal") !== "services") {
      url.searchParams.set("portal", "services");
      url.searchParams.set("v", "3");
      return temporaryRedirect(url.toString());
    }
  }

  if (isLegacyLearnHost || isLegacyPanelHost) {
    const target = new URL("https://ldracademy.online");
    target.search = url.search;
    target.hash = url.hash;

    if (url.pathname === "/") {
      target.pathname = "/";
    } else if (
      url.pathname === "/cliente" ||
      url.pathname === "/biblioteca" ||
      url.pathname === "/cliente/biblioteca"
    ) {
      target.pathname = "/cliente/biblioteca";
    } else if (url.pathname.startsWith("/biblioteca/")) {
      target.pathname = `/cliente${url.pathname}`;
    } else {
      target.pathname = url.pathname;
    }

    return temporaryRedirect(target.toString());
  }

  // Keep service/booking/professional portals out of the Academy host without
  // changing the underlying routes or authentication flows.
  if (isAcademy) {
    const servicePrefixes = [
      "/clinica-social",
      "/profissionais",
      "/profissional/",
      "/profissional-painel",
      "/profissional-onboarding",
      "/para-profissionais",
      "/painel-profissional",
      "/agendamento",
      "/agenda",
    ];
    const isServiceRoute = servicePrefixes.some((prefix) =>
      url.pathname === prefix || url.pathname.startsWith(prefix.endsWith("/") ? prefix : prefix + "/")
    );
    if (isServiceRoute) {
      const target = new URL(url.toString());
      target.hostname = "portal.ldrrhestrategia.com";
      return temporaryRedirect(target.toString());
    }
  }

  if (!isAcademy) return null;

  // The academy root is the public sales page. Keep the library on the real
  // authenticated client route so the public storefront and private library
  // remain separate and hydration uses the same route on server and browser.
  if (url.pathname === "/cliente" || url.pathname === "/biblioteca") {
    url.hostname = "ldracademy.online";
    url.pathname = "/cliente/biblioteca";
    return temporaryRedirect(url.toString());
  }

  if (url.pathname.startsWith("/biblioteca/")) {
    url.hostname = "ldracademy.online";
    url.pathname = `/cliente${url.pathname}`;
    return temporaryRedirect(url.toString());
  }

  return null;
}

function withFreshDocumentHeaders(request: Request, response: Response): Response {
  const accept = request.headers.get("accept") ?? "";
  const contentType = response.headers.get("content-type") ?? "";
  const isDocument = accept.includes("text/html") || contentType.includes("text/html");

  if (!isDocument) return response;

  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store, max-age=0, must-revalidate");
  headers.set("pragma", "no-cache");
  headers.set("expires", "0");
  headers.set("vary", "Host");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
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
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withFreshDocumentHeaders(request, normalized);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store, max-age=0, must-revalidate",
          vary: "Host",
        },
      });
    }
  },
};