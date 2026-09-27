import { sandboxOneConfig, type OneSelection } from "./ldr-one-sandbox.ts";

export type OneSandboxCheckoutContext = {
  userId: string;
  customerId: string;
  stripeCustomerId?: string | null;
  customerEmail?: string | null;
  origin: string;
  subscriptionRecordId: string;
};
export function buildOneSandboxCheckout(
  selection: OneSelection,
  context: OneSandboxCheckoutContext,
  env: Record<string, string | undefined>,
) {
  const price = sandboxOneConfig(selection, env);
  if (!context.userId || !context.customerId || !context.subscriptionRecordId) throw Error("Authenticated account and pending subscription required");
  const origin = new URL(context.origin);
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) throw Error("HTTPS application origin required");
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", price.priceId);
  params.set("line_items[0][quantity]", String(price.quantity));
  params.set("success_url", origin.origin + "/cliente/ldr-one?subscription=success&session_id={CHECKOUT_SESSION_ID}");
  params.set("cancel_url", origin.origin + "/ldr-pass?subscription=cancel");
  params.set("client_reference_id", context.userId);
  const metadata = {
    checkout_kind: "ldr_one_subscription",
    ldr_one_subscription_id: context.subscriptionRecordId,
    customer_id: context.customerId,
    plan: selection.plan,
    billing_cycle: selection.cycle,
    seats: String(selection.seats),
    sandbox: "true",
  };
  for (const [key, value] of Object.entries(metadata)) {
    params.set("metadata[" + key + "]", value);
    params.set("subscription_data[metadata][" + key + "]", value);
  }
  // Stripe forbids sending customer and customer_email together. The internal
  // customerId in metadata is never treated as a Stripe customer identifier.
  if (context.stripeCustomerId) {
    if (!/^cus_[A-Za-z0-9]+$/.test(context.stripeCustomerId)) throw Error("Invalid Stripe test customer ID");
    params.set("customer", context.stripeCustomerId);
  } else if (context.customerEmail) {
    params.set("customer_email", context.customerEmail);
  }
  return { params, price };
}
// Deliberately no Stripe POST or access grant here. Checkout creation must be wired
// to authenticated server-only route and isolated persistence before enabling.
