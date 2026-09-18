export const ACADEMIC_RETURN_COOKIE = "ldr_academic_return_to";
export const ACADEMY_ORIGIN = "https://ldracademy.online";

// The return target is navigation state only. It never grants access.
export function academicReturnPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || /[\\\r\n]/.test(value)) return null;
  try {
    const url = new URL(value, ACADEMY_ORIGIN);
    if (url.origin !== ACADEMY_ORIGIN) return null;
    const libraryReturn = url.pathname === "/cliente/biblioteca" || /^\/cliente\/(?:ebooks|biblioteca)\/ebook_(?:falar_com_quem_feriu|da_pobreza_ao_primeiro_contrato)$/.test(url.pathname);
    if (!libraryReturn && url.pathname !== "/cliente/rede-academica" && !url.pathname.startsWith("/cliente/rede-academica/")) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function academicLoginHref(value: unknown): string {
  const next = academicReturnPath(value);
  return next ? `/cliente/login?next=${encodeURIComponent(next)}` : "/cliente/login";
}
