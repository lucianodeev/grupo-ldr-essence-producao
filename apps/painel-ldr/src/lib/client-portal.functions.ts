import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseRescheduleRequest, parseScheduleRequest } from "@/lib/client-agenda.schemas";

function emailOf(claims: Record<string, unknown>): string | null {
  const value = claims["email"];
  return typeof value === "string" ? value : null;
}

async function clientSelfEdge<T>(
  accessToken: string | null | undefined,
  operation: "context" | "overview" | "digital_library" | "update_profile" | "agenda",
  data?: Record<string, unknown>,
): Promise<T> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key || !accessToken) throw new Error("Sessão do cliente inválida. Entre novamente.");
  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/client-self`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: key,
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ operation, data: data ?? {} }),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const code = typeof body["error"] === "string" ? body["error"] : "client_operation_failed";
    if (code === "unauthorized") throw new Error("Sessão do cliente expirada. Entre novamente.");
    if (code === "client_unavailable") throw new Error("Acesso do cliente não disponível.");
    if (code === "invalid_name") throw new Error("Informe seu nome completo.");
    throw new Error("Não foi possível carregar sua área agora.");
  }
  return body as T;
}

async function clientEdge<T>(
  accessToken: string | null | undefined,
  slug: "client-portal-self" | "client-library-self",
  operation: string,
  data?: Record<string, unknown>,
): Promise<T> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key || !accessToken) throw new Error("Sessão do cliente inválida. Entre novamente.");
  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/${slug}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: key,
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ operation, data: data ?? {} }),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const code = typeof body["error"] === "string" ? body["error"] : "client_operation_failed";
    if (code === "client_unavailable") throw new Error("Acesso do cliente não disponível.");
    if (code === "invalid_name") throw new Error("Informe seu nome completo.");
    throw new Error("Não foi possível carregar esta área do cliente.");
  }
  return body as T;
}

function requestMarket(): "BR" | "INTL" {
  try {
    const request = getRequest();
    const country =
      request?.headers.get("x-vercel-ip-country") ??
      request?.headers.get("cf-ipcountry") ??
      request?.headers.get("x-country-code");
    return country?.trim().toUpperCase() === "BR" ? "BR" : "INTL";
  } catch {
    return "INTL";
  }
}

export const getClientContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      return clientSelfEdge<any>(context.accessToken, "context");
    }
    const { resolveClient } = await import("@/lib/client-portal.server");
    return resolveClient(context.userId, emailOf(context.claims));
  });

export const activateClientAccess = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const { requestClientActivation } = await import("@/lib/client-portal.server");
    return requestClientActivation(data.email);
  });

export const clientOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      return clientSelfEdge<any>(context.accessToken, "overview");
    }
    const { getClientOverview } = await import("@/lib/client-portal.server");
    return getClientOverview(context.userId, emailOf(context.claims));
  });

export const clientOrderDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string }) => data)
  .handler(async ({ context, data }) => {
    const { getClientOrderDetail } = await import("@/lib/client-portal.server");
    return getClientOrderDetail(context.userId, emailOf(context.claims), data.orderId);
  });

export const clientCancelOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string }) => data)
  .handler(async ({ context, data }) => {
    const { cancelClientOrder } = await import("@/lib/client-portal.server");
    return cancelClientOrder(context.userId, emailOf(context.claims), data.orderId);
  });

export const clientMentorship = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getClientMentorship } = await import("@/lib/client-portal.server");
    return getClientMentorship(context.userId, emailOf(context.claims));
  });

export const clientDeliveries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getClientDeliveries } = await import("@/lib/client-portal.server");
    return getClientDeliveries(context.userId, emailOf(context.claims));
  });

export const clientApproveDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { deliveryId: string }) => data)
  .handler(async ({ context, data }) => {
    const { approveDelivery } = await import("@/lib/client-portal.server");
    return approveDelivery(context.userId, emailOf(context.claims), data.deliveryId);
  });

export const clientRequestAdjustment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { deliveryId: string; comment: string }) => data)
  .handler(async ({ context, data }) => {
    const { requestDeliveryAdjustment } = await import("@/lib/client-portal.server");
    return requestDeliveryAdjustment(context.userId, emailOf(context.claims), data);
  });

export const clientUpdateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { fullName: string; phone: string | null }) => data)
  .handler(async ({ context, data }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      return clientSelfEdge<{ ok: true }>(context.accessToken, "update_profile", data as Record<string, unknown>);
    }
    const { updateClientProfile } = await import("@/lib/client-portal.server");
    return updateClientProfile(context.userId, emailOf(context.claims), data);
  });

export const clientContractCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getClientContractCatalog } = await import("@/lib/client-portal.server");
    return getClientContractCatalog(context.userId, emailOf(context.claims));
  });

export const clientAgenda = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) return clientSelfEdge<any>(context.accessToken, "agenda");
    const { getClientAgenda } = await import("@/lib/client-portal.server");
    return getClientAgenda(context.userId, emailOf(context.claims));
  });

export const clientRequestAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseScheduleRequest)
  .handler(async ({ context, data }) => {
    const { requestClientAppointment } = await import("@/lib/client-portal.server");
    return requestClientAppointment(context.userId, emailOf(context.claims), data);
  });

export const clientRescheduleAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseRescheduleRequest)
  .handler(async ({ context, data }) => {
    const { rescheduleClientAppointment } = await import("@/lib/client-portal.server");
    return rescheduleClientAppointment(context.userId, emailOf(context.claims), data);
  });

export const clientDigitalLibrary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
      const library = await clientSelfEdge<any>(context.accessToken, "digital_library");
      return { ...library, market: requestMarket() };
    }
    const { getClientDigitalLibrary } = await import("@/lib/client-portal.server");
    const library = await getClientDigitalLibrary(context.userId, emailOf(context.claims));
    return { ...library, market: requestMarket() };
  });

export const clientCreateDigitalCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { productKey: string; market: "BR" | "INTL" }) => data)
  .handler(async ({ context, data }) => {
    const { createDigitalCheckoutWithFixedBrlEbooks } = await import("@/lib/fixed-brl-ebook-checkout.server");
    return createDigitalCheckoutWithFixedBrlEbooks(context.userId, emailOf(context.claims), data);
  });

export const clientCreateEntrepreneurComboCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data:{market:"BR"|"INTL"})=>data).handler(async({context,data})=>{const {createClientEntrepreneurComboCheckout}=await import("@/lib/client-portal.server");return createClientEntrepreneurComboCheckout(context.userId,emailOf(context.claims),data.market);});
