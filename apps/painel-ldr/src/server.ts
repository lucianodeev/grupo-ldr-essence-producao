import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { isUnifiedPreviewHost } from "./lib/unified-preview";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const CANONICAL_ECOSYSTEM_ORIGIN = "https://www.ldrrhestrategia.com";

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function publicRequestUrl(request: Request): URL {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (forwardedProto === "https" || forwardedProto === "http") {
    url.protocol = `${forwardedProto}:`;
  } else if (/\.onrender\.com$/i.test(url.hostname)) {
    // Render terminates TLS before the Node service. Without the forwarded
    // header some runtimes expose the internal request as http://.
    url.protocol = "https:";
  }
  return url;
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
  const url = publicRequestUrl(request);
  const host = url.hostname.toLowerCase();
  const isAcademy = host === "ldracademy.online" || host === "www.ldracademy.online";
  const isServicePortal = host === "portal.ldrrhestrategia.com";
  const isSupportPortal = host === "suporte.ldrrhestrategia.com";
  const isClinicPortal = host === "clinicasocial.ldrrhestrategia.com";
  const isInstitutionalHost = host === "ldrrhestrategia.com" || host === "www.ldrrhestrategia.com";
  const isLegacyLdrPanelHost = host === "painel.ldrrhestrategia.com";
  const isLegacyLearnHost = host === "learn.lucianoconecta.online";
  const isLegacyPanelHost = host === "painel.lucianoconecta.online";
  const isLegacyLucianoHost = host === "lucianoconecta.online" || host === "www.lucianoconecta.online";
  const isFilmHost = host === "film.lucianoconecta.online";

  // Preview/staging hosts intentionally keep the full ecosystem on one origin.
  // This makes deep links testable before any official-domain cutover.
  if (isUnifiedPreviewHost(host)) {
    if (url.pathname === "/index.html") {
      url.pathname = "/";
      return temporaryRedirect(url.toString());
    }
    if (url.pathname === "/profissional/cadastro" || url.pathname === "/profissional/cadastro/") {
      url.pathname = "/profissional/login";
      url.searchParams.set("mode", "cadastro");
      return temporaryRedirect(url.toString());
    }
    if (url.pathname === "/painel-profissional" || url.pathname === "/painel-profissional/") {
      url.pathname = "/profissional-painel";
      return temporaryRedirect(url.toString());
    }
    if (url.pathname === "/biblioteca") {
      url.pathname = "/cliente/biblioteca";
      return temporaryRedirect(url.toString());
    }
    if (url.pathname.startsWith("/biblioteca/")) {
      url.pathname = `/cliente${url.pathname}`;
      return temporaryRedirect(url.toString());
    }
    return null;
  }

  const ecosystemTarget = (pathname: string) => {
    const target = new URL(CANONICAL_ECOSYSTEM_ORIGIN);
    target.pathname = pathname;
    target.search = url.search;
    target.hash = url.hash;
    return target;
  };

  // ldracademy.online and the former LDR hosts are compatibility aliases only.
  // The canonical public origin is the Render ecosystem host.
  if (isAcademy) {
    let pathname = url.pathname;
    if (pathname === "/index.html") pathname = "/";
    if (pathname === "/biblioteca") pathname = "/cliente/biblioteca";
    if (pathname.startsWith("/biblioteca/")) pathname = `/cliente${pathname}`;
    if (pathname === "/profissional/cadastro" || pathname === "/profissional/cadastro/") {
      pathname = "/profissional/login";
      const target = ecosystemTarget(pathname);
      target.searchParams.set("mode", "cadastro");
      return temporaryRedirect(target.toString());
    }
    if (pathname === "/painel-profissional" || pathname === "/painel-profissional/") pathname = "/profissional-painel";
    return temporaryRedirect(ecosystemTarget(pathname).toString());
  }

  // Old LDR hosts are compatibility aliases only. Once their DNS reaches this
  // deployment, they redirect into a child page of ldracademy.online.
  if (isInstitutionalHost) {
    if (host === "www.ldrrhestrategia.com") {
      if (url.pathname === "/index.html") { url.pathname = "/"; return temporaryRedirect(url.toString()); }
      return null;
    }
    const target = ecosystemTarget(url.pathname === "/index.html" ? "/" : url.pathname);
    return temporaryRedirect(target.toString());
  }

  if (isClinicPortal) {
    const pathname =
      url.pathname === "/" || url.pathname === "/index.html"
        ? "/clinica-social"
        : url.pathname.startsWith("/clinica-social")
          ? url.pathname
          : `/clinica-social${url.pathname.startsWith("/") ? url.pathname : `/${url.pathname}`}`;
    return temporaryRedirect(ecosystemTarget(pathname).toString());
  }

  if (isSupportPortal) {
    const pathname = url.pathname === "/" || url.pathname === "/index.html" ? "/falar-com-ecossistema" : url.pathname;
    return temporaryRedirect(ecosystemTarget(pathname).toString());
  }

  if (isLegacyLdrPanelHost) {
    const target = ecosystemTarget(
      url.searchParams.has("code") ? "/api/auth/callback" :
      (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/acesso" ? "/admin" : url.pathname)
    );
    if (url.searchParams.has("code")) target.searchParams.set("admin", "1");
    return temporaryRedirect(target.toString());
  }

  if (isServicePortal) {
    let pathname = url.pathname;
    const target = ecosystemTarget(pathname);
    if (pathname === "/" || pathname === "/index.html") {
      target.pathname = "/cliente/login";
      target.searchParams.set("portal", "services");
      target.searchParams.set("v", "3");
    } else if (pathname === "/profissional/cadastro" || pathname === "/profissional/cadastro/") {
      target.pathname = "/profissional/login";
      target.searchParams.set("mode", "cadastro");
    }
    return temporaryRedirect(target.toString());
  }

  // Legacy Luciano Conecta hosts are aliases only. Keep their content/routes,
  // but expose them through the official LDR Academy domain.
  if (isFilmHost) {
    const target = new URL(CANONICAL_ECOSYSTEM_ORIGIN);
    target.pathname = url.pathname === "/" || url.pathname === "/index.html" ? "/film" : url.pathname;
    target.search = url.search;
    target.hash = url.hash;
    return temporaryRedirect(target.toString());
  }

  if (isLegacyLucianoHost) {
    const target = new URL(CANONICAL_ECOSYSTEM_ORIGIN);
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
    // Previously shared signup links must open the actual professional entry.
    if (url.pathname === "/profissional/cadastro" || url.pathname === "/profissional/cadastro/") {
      url.pathname = "/profissional/login";
      url.searchParams.set("mode", "cadastro");
      return temporaryRedirect(url.toString());
    }

    if (
      url.pathname === "/cliente/biblioteca" ||
      url.pathname.startsWith("/cliente/biblioteca/") ||
      url.pathname === "/biblioteca" ||
      url.pathname.startsWith("/biblioteca/") ||
      url.pathname === "/cliente/rede-academica" ||
      url.pathname.startsWith("/cliente/rede-academica/")
    ) {
      const target = new URL(url.toString());
      target.hostname = "www.ldrrhestrategia.com";
      return temporaryRedirect(target.toString());
    }

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
    const target = new URL(CANONICAL_ECOSYSTEM_ORIGIN);
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

  // Keep each validated product on its single official hostname.
  if (isAcademy && (url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname === "/login")) {
    const target = new URL(url.toString());
    target.hostname = "portal.ldrrhestrategia.com";
    return temporaryRedirect(target.toString());
  }

  if (isAcademy && url.pathname === "/falar-com-ecossistema") {
    const target = new URL(url.toString());
    target.hostname = "suporte.ldrrhestrategia.com";
    return temporaryRedirect(target.toString());
  }

  if (isAcademy && (url.pathname === "/clinica-social" || url.pathname === "/clinica-social/")) {
    const target = new URL("https://clinicasocial.ldrrhestrategia.com/");
    target.search = url.search;
    target.hash = url.hash;
    return temporaryRedirect(target.toString());
  }

  if (isSupportPortal && (url.pathname === "/" || url.pathname === "/index.html")) {
    url.pathname = "/falar-com-ecossistema";
    return temporaryRedirect(url.toString());
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
    url.hostname = "www.ldrrhestrategia.com";
    url.pathname = "/cliente/biblioteca";
    return temporaryRedirect(url.toString());
  }

  if (url.pathname.startsWith("/biblioteca/")) {
    url.hostname = "www.ldrrhestrategia.com";
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
