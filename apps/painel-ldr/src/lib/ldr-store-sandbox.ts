export function isLoopbackHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function storeSandboxEnabled(
  env: Record<string, string | undefined>,
  requestUrl: string | undefined,
) {
  return (
    env["LDR_STORE_SANDBOX_ENABLED"] === "true" &&
    /^sk_test_[a-zA-Z0-9_]+$/.test(env["STRIPE_SECRET_KEY"] ?? "") &&
    Boolean(env["SUPABASE_SERVICE_ROLE_KEY"]) &&
    isLoopbackHttpUrl(env["SUPABASE_URL"]) &&
    (!env["VITE_SUPABASE_URL"] || isLoopbackHttpUrl(env["VITE_SUPABASE_URL"])) &&
    isLoopbackHttpUrl(env["CLIENT_PANEL_URL"]) &&
    isLoopbackHttpUrl(requestUrl) &&
    new URL(env["CLIENT_PANEL_URL"]!).origin === new URL(requestUrl!).origin
  );
}
