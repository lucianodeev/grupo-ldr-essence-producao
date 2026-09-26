import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Staged server-only allocation service. Do not expose a route until the reviewed
 * allocation migration has been applied and employee consent/invitation is wired.
 * The authenticated subscription purchaser must own the customer record.
 */
export async function assignLdrOneBusinessSeat(input: {
  purchaserAuthUserId: string;
  subscriptionId: string;
  employeeAuthUserId: string;
}): Promise<string> {
  if (!input.purchaserAuthUserId || !input.subscriptionId || !input.employeeAuthUserId)
    throw new Error("Identificação da assinatura e dos usuários obrigatória.");
  const db = supabaseAdmin as any;
  const { data: customer, error: customerError } = await db.from("customers")
    .select("id,portal_active")
    .eq("auth_user_id", input.purchaserAuthUserId)
    .eq("portal_active", true)
    .maybeSingle();
  if (customerError || !customer) throw new Error("Cliente autenticado não encontrado.");
  const { data: subscription, error: subscriptionError } = await db.from("ldr_pass_subscriptions")
    .select("id,customer_id,ldr_one_offer,ldr_one_seats,status,stripe_subscription_id,current_period_end")
    .eq("id", input.subscriptionId)
    .eq("customer_id", customer.id)
    .eq("ldr_one_offer", "business")
    .maybeSingle();
  if (subscriptionError || !subscription) throw new Error("Assinatura empresarial não pertence a este cliente.");
  const { hasCurrentIndividualLdrOneSubscription } = await import("@/lib/entitlements");
  if (!hasCurrentIndividualLdrOneSubscription(subscription, Date.now()))
    throw new Error("Assinatura empresarial sem pagamento vigente.");
  if (!Number.isSafeInteger(subscription.ldr_one_seats) || subscription.ldr_one_seats < 5)
    throw new Error("Quantidade de vagas empresariais inválida.");
  // Employee must already exist; do not allocate to arbitrary unverified addresses.
  const { data: employee, error: employeeError } = await db.auth.admin.getUserById(input.employeeAuthUserId);
  if (employeeError || !employee?.user || !employee.user.email_confirmed_at) throw new Error("Colaborador com e-mail confirmado não encontrado.");
  // RPC takes a parent-row lock so concurrent allocations cannot exceed capacity.
  const { data, error } = await db.rpc("ldr_one_allocate_seat", {
    p_subscription_id: subscription.id,
    p_auth_user_id: input.employeeAuthUserId,
  });
  if (error || typeof data !== "string") throw new Error("Não foi possível atribuir a vaga contratada.");
  return data;
}

/** Only the authenticated purchaser can revoke a seat from their own business subscription. */
export async function revokeLdrOneBusinessSeat(input: {
  purchaserAuthUserId: string;
  subscriptionId: string;
  employeeAuthUserId: string;
}): Promise<boolean> {
  if (!input.purchaserAuthUserId || !input.subscriptionId || !input.employeeAuthUserId)
    throw new Error("Identificação da assinatura e dos usuários obrigatória.");
  const db = supabaseAdmin as any;
  const { data: customer, error: customerError } = await db.from("customers")
    .select("id").eq("auth_user_id", input.purchaserAuthUserId)
    .eq("portal_active", true).maybeSingle();
  if (customerError || !customer) throw new Error("Cliente autenticado não encontrado.");
  const { data: subscription, error: subscriptionError } = await db.from("ldr_pass_subscriptions")
    .select("id").eq("id", input.subscriptionId).eq("customer_id", customer.id)
    .eq("ldr_one_offer", "business").maybeSingle();
  if (subscriptionError || !subscription) throw new Error("Assinatura empresarial não pertence a este cliente.");
  const { data, error } = await db.rpc("ldr_one_revoke_seat", {
    p_subscription_id: subscription.id,
    p_auth_user_id: input.employeeAuthUserId,
  });
  if (error || typeof data !== "boolean") throw new Error("Não foi possível revogar a vaga.");
  return data;
}
