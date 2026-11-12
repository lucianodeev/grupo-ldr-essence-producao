import { createFileRoute } from "@tanstack/react-router";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const headers = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  "Content-Type": "text/html; charset=utf-8",
};

async function handle(request: Request): Promise<Response> {
  if (process.env["GOOGLE_CALENDAR_VALIDATION_ENABLED"] !== "true" ||
      process.env["AGENDA_INTEGRATION_ENABLED"] === "true") {
    return new Response("Not available", { status: 404, headers });
  }
  const { authenticateCalendarOAuthAdmin } = await import("@/lib/google-calendar-oauth-admin.server");
  const admin = await authenticateCalendarOAuthAdmin(request);
  if (!admin.isAdministrator || !admin.sessionBinding) return new Response("Forbidden", { status: 403, headers });
  const secret = process.env["GOOGLE_OAUTH_STATE_SECRET"];
  if (!secret || !process.env["GOOGLE_CALENDAR_TEST_ID"] ||
      process.env["GOOGLE_CALENDAR_TEST_ID"] !== process.env["GOOGLE_CALENDAR_ID"]) {
    return new Response("Test calendar must be configured explicitly", { status: 503, headers });
  }
  const sign = (value: string) => createHmac("sha256", secret).update(`calendar-validation:${admin.sessionBinding}:${value}`).digest("base64url");
  if (request.method === "GET") {
    const nonce = randomBytes(24).toString("base64url");
    const value = `${nonce}.${Date.now() + 600000}`;
    const token = `${value}.${sign(value)}`;
    return new Response(`<!doctype html><html lang="pt"><meta charset="utf-8"><title>Teste real Google Calendar</title><h1>Teste real Google Calendar</h1><p>Cria um evento técnico privado de cinco minutos no calendário de testes configurado, verifica conflitos, duplicação e reagendamento, cancela o evento e confirma a limpeza. Sem convidados, clientes, pagamentos ou créditos. A agenda permanece desativada.</p><form method="post"><input type="hidden" name="token" value="${token}"><button type="submit">Executar teste real e limpar evento</button></form></html>`, { headers });
  }
  if (request.method !== "POST") return new Response(null, { status: 405, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin ||
      !request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) {
    return new Response("Forbidden", { status: 403, headers });
  }
  const body = await request.text();
  if (body.length > 4096) return new Response(null, { status: 413, headers });
  const [nonce, expiry, mac, extra] = (new URLSearchParams(body).get("token") || "").split(".");
  if (extra || !nonce || !/^[A-Za-z0-9_-]{32}$/.test(nonce) || !/^\d{13}$/.test(expiry || "") ||
      Number(expiry) <= Date.now() || Number(expiry) > Date.now() + 600000 || !mac) {
    return new Response("Invalid or expired validation request", { status: 400, headers });
  }
  const actual = Buffer.from(mac);
  const expected = Buffer.from(sign(`${nonce}.${expiry}`));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return new Response("Forbidden", { status: 403, headers });
  try {
    const { calendarOAuthNonceStore } = await import("@/lib/google-calendar-oauth-storage.server");
    if (!await calendarOAuthNonceStore.claim(nonce, 600)) return new Response("Validation request already consumed", { status: 409, headers });
    const { validateRealCalendar } = await import("@/lib/google-calendar-validation.server");
    const result = await validateRealCalendar();
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 502,
      headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return new Response("Validation failed; inspect test calendar cleanup before retrying", { status: 502, headers });
  }
}

export const Route = createFileRoute("/api/integrations/google-calendar/validate")({
  server: { handlers: { GET: ({ request }) => handle(request), POST: ({ request }) => handle(request) } },
});
