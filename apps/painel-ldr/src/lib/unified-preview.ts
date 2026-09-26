const PREVIEW_SUFFIXES = [".chatgpt.site", ".workers.dev", ".pages.dev", ".onrender.com"] as const;

const INTERNAL_HOSTS = new Set([
  "ldracademy.online",
  "www.ldracademy.online",
  "ldrrhestrategia.com",
  "www.ldrrhestrategia.com",
  "portal.ldrrhestrategia.com",
  "painel.ldrrhestrategia.com",
  "suporte.ldrrhestrategia.com",
  "clinicasocial.ldrrhestrategia.com",
  "learn.lucianoconecta.online",
  "painel.lucianoconecta.online",
  "lucianoconecta.online",
  "www.lucianoconecta.online",
  "film.lucianoconecta.online",
]);

export function isUnifiedPreviewHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || PREVIEW_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export const CANONICAL_ECOSYSTEM_HOST = "ldrrhestrategia.com";

export function isUnifiedEcosystemHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return host === CANONICAL_ECOSYSTEM_HOST || host === "ldrrhestrategia.com" || isUnifiedPreviewHost(host);
}

function withQuery(pathname: string, url: URL, extra?: Record<string, string>): string {
  const params = new URLSearchParams(url.search);
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (!params.has(key)) params.set(key, value);
  }
  const search = params.toString();
  return `${pathname}${search ? `?${search}` : ""}${url.hash}`;
}

export function unifiedPreviewTarget(
  href: string,
  currentOrigin: string,
  currentHostname: string,
): string | null {
  if (!isUnifiedEcosystemHost(currentHostname)) return null;

  const raw = href.trim();
  if (!raw || /^(?:#|mailto:|tel:|sms:|javascript:)/i.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw, currentOrigin);
  } catch {
    return null;
  }

  if (url.origin === currentOrigin) return null;

  const host = url.hostname.toLowerCase();
  if (!INTERNAL_HOSTS.has(host)) return null;

  let pathname = url.pathname || "/";

  if (host === "clinicasocial.ldrrhestrategia.com") {
    if (pathname === "/" || pathname === "/index.html") pathname = "/clinica-social";
    else if (!pathname.startsWith("/clinica-social")) pathname = `/clinica-social${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    return withQuery(pathname, url);
  }

  if (host === "suporte.ldrrhestrategia.com") {
    if (pathname === "/" || pathname === "/index.html") pathname = "/falar-com-ecossistema";
    return withQuery(pathname, url);
  }

  if (host === "painel.ldrrhestrategia.com") {
    if (pathname === "/" || pathname === "/index.html" || pathname === "/acesso") pathname = "/admin";
    return withQuery(pathname, url);
  }

  if (host === "portal.ldrrhestrategia.com") {
    if (pathname === "/" || pathname === "/index.html") {
      pathname = "/cliente/login";
      return withQuery(pathname, url, { portal: "services", v: "3" });
    }
    if (pathname === "/profissional/cadastro" || pathname === "/profissional/cadastro/") {
      pathname = "/profissional/login";
      return withQuery(pathname, url, { mode: "cadastro" });
    }
    return withQuery(pathname, url);
  }

  if (host === "film.lucianoconecta.online") {
    if (pathname === "/" || pathname === "/index.html") pathname = "/film";
    return withQuery(pathname, url);
  }

  if (host === "learn.lucianoconecta.online" || host === "painel.lucianoconecta.online") {
    if (pathname === "/biblioteca") pathname = "/cliente/biblioteca";
    else if (pathname.startsWith("/biblioteca/")) pathname = `/cliente${pathname}`;
    return withQuery(pathname, url);
  }

  if (host === "lucianoconecta.online" || host === "www.lucianoconecta.online") {
    if (pathname === "/index.html") pathname = "/";
    return withQuery(pathname, url);
  }

  if (host === "ldrrhestrategia.com" || host === "www.ldrrhestrategia.com") {
    if (pathname === "/" || pathname === "/index.html") pathname = "/ldr-rh-estrategia";
    return withQuery(pathname, url);
  }

  if (host === "www.ldracademy.online" || host === "ldracademy.online") {
    if (pathname === "/biblioteca") pathname = "/cliente/biblioteca";
    else if (pathname.startsWith("/biblioteca/")) pathname = `/cliente${pathname}`;
    return withQuery(pathname, url);
  }

  return withQuery(pathname, url);
}
