from pathlib import Path
import re

p=Path('apps/painel-ldr/src/lib/professional-network.server.ts')
s=p.read_text(encoding='utf-8')
s=s.replace('const db = supabaseAdmin as unknown as { from: (table: string) => any };','const db = supabaseAdmin as unknown as { from: (table: string) => any; rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: any; error: { message?: string } | null }> };',1)
start=s.find('export async function createProfessionalSubscriptionCheckout')
if start<0: raise SystemExit('professional subscription function not found')
nextpos=s.find('\nexport async function ',start+20)
if nextpos<0: raise SystemExit('next function not found')
new=r'''export async function createProfessionalSubscriptionCheckout(userId: string, email: string | null, planId: string, sellerReferral: string | null = null) {
  const account = await ensureAccount(userId, email);
  const mail = normEmail(email);
  if (!mail) fail("Sua conta precisa ter um e-mail válido.");
  const { data: existingSubscription } = await db.from("professional_subscriptions")
    .select("id,status,current_period_end,cancel_at_period_end")
    .eq("professional_account_id", account.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingSubscription) {
    const end = existingSubscription.current_period_end ? new Date(existingSubscription.current_period_end).getTime() : 0;
    if (!end || end > Date.now()) {
      fail(existingSubscription.cancel_at_period_end
        ? "Você já possui uma assinatura ativa até o fim do ciclo pago. Reative a renovação em Minha Assinatura se quiser continuar no próximo mês."
        : "Você já possui uma assinatura mensal ativa. Gerencie sua assinatura atual em Minha Assinatura.");
    }
  }
  const { data: plan } = await db.from("subscription_plans").select("id,market,plan_code,name,currency,amount_cents,interval,active").eq("id", planId).eq("active", true).maybeSingle();
  if (!plan) fail("Plano indisponível.");
  const referral = sellerReferral?.trim() || null;
  if (referral) {
    const { error } = await db.rpc("ldr_seller_referral_validate_service", {
      p_ref: referral,
      p_portal_kind: "professional",
      p_plan_code: String(plan.plan_code),
      p_market: String(plan.market),
      p_email: mail,
    });
    if (error) fail(error.message || "Não foi possível validar o link do vendedor.");
  }
  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) fail("Assinatura indisponível no momento.");
  const { data: pending, error: pendingError } = await db.from("professional_subscriptions").insert({ professional_account_id: account.id, plan_id: plan.id, status: "pending" }).select("id").single();
  if (pendingError || !pending) fail("Não foi possível preparar sua assinatura.");
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.append("payment_method_types[]", "card");
  params.set("line_items[0][price_data][currency]", String(plan.currency).toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(plan.amount_cents));
  params.set("line_items[0][price_data][recurring][interval]", String(plan.interval));
  params.set("line_items[0][price_data][product_data][name]", String(plan.name));
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", referral ? `${origin()}/profissional-painel?subscription=success&seller_ref=${encodeURIComponent(referral)}` : `${origin()}/profissional-painel?subscription=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", referral ? `${origin()}/profissional-onboarding?subscription=cancel&seller_ref=${encodeURIComponent(referral)}` : `${origin()}/profissional-painel?subscription=cancel`);
  params.set("client_reference_id", userId);
  params.set("customer_email", mail);
  params.set("metadata[checkout_kind]", "professional_subscription");
  params.set("metadata[professional_account_id]", account.id);
  params.set("metadata[professional_subscription_id]", pending.id);
  params.set("metadata[plan_id]", plan.id);
  params.set("subscription_data[metadata][checkout_kind]", "professional_subscription");
  params.set("subscription_data[metadata][professional_account_id]", account.id);
  params.set("subscription_data[metadata][professional_subscription_id]", pending.id);
  params.set("subscription_data[metadata][plan_id]", plan.id);
  if (referral) {
    params.set("metadata[source]", "seller_portal_referral");
    params.set("metadata[ldr_seller_referral_id]", referral);
    params.set("metadata[seller_commission_scope]", "initial_checkout");
    params.set("subscription_data[metadata][source]", "seller_portal_referral");
    params.set("subscription_data[metadata][ldr_seller_referral_id]", referral);
    params.set("subscription_data[metadata][seller_commission_scope]", "initial_checkout");
  }
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `pro-sub-${pending.id}` },
    body: params,
  });
  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) {
    await db.from("professional_subscriptions").delete().eq("id", pending.id).eq("professional_account_id", account.id);
    fail(session.error?.message || "Não foi possível abrir o pagamento.");
  }
  if (referral) {
    const { error: bindError } = await db.rpc("ldr_seller_referral_bind_checkout_service", {
      p_ref: referral,
      p_checkout_session_id: session.id,
      p_amount_cents: Number(plan.amount_cents),
      p_currency: String(plan.currency),
    });
    if (bindError) {
      await db.from("professional_subscriptions").delete().eq("id", pending.id).eq("professional_account_id", account.id);
      fail(bindError.message || "Não foi possível vincular a venda ao vendedor.");
    }
  }
  await db.from("professional_subscriptions").update({ stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() }).eq("id", pending.id);
  await db.from("audit_logs").insert({ actor_id: userId, actor_email: mail, action: "professional_network.subscription_checkout_created", target: pending.id, details: { plan_id: plan.id, seller_referral: referral } });
  return { url: session.url, subscriptionId: pending.id };
}
'''
s=s[:start]+new+s[nextpos:]
p.write_text(s,encoding='utf-8')
print('professional referral checkout patched')
