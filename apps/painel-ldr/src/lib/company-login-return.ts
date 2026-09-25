export const COMPANY_RETURN_COOKIE = "ldr_company_return_to";
export const COMPANY_RETURN_KEY = "ldr_carreira_company_next";
const allowed = new Set([
  "/empresa",
  "/assinatura-empresa",
  "/carreira/empresa",
  "/carreira/empresa/publicar",
  "/carreira/empresa/candidaturas",
  "/carreira/empresa/guia-triagem-responsavel",
]);
export function companyReturnPath(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  )
    return null;
  try {
    const url = new URL(value, "https://ldr-ecossistema-validacao.onrender.com");
    if (url.origin !== "https://ldr-ecossistema-validacao.onrender.com" || !allowed.has(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
export function companyLoginHref(value: unknown): string {
  const next = companyReturnPath(value);
  return next ? `/empresa/login?next=${encodeURIComponent(next)}` : "/empresa/login";
}
