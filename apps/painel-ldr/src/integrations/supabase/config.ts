const API_PATH_SUFFIX = /\/(?:auth|graphql|rest|storage)\/v1\/?$/;

export function normalizeSupabaseUrl(value: string): string {
  const url = new URL(value);
  url.pathname = url.pathname.replace(API_PATH_SUFFIX, "/");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}
