import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createClientDigitalCheckout, getClientDigitalLibrary, resolveClient, type DigitalMarket, type DigitalProductKey } from "@/lib/client-portal.server";

const FIXED_BRL_EBOOKS = {
  ebook_pratica_clinica_psicanalise: "A Prática Clínica da Psicanálise",
  ebook_psicanalise_no_mundo: "A Psicanálise no Mundo",
  ebook_estudos_caso_psicanalise: "Estudos de Caso",
} as const;

type FixedBrlEbookKey = keyof typeof FIXED_BRL_EBOOKS;

function isFixedBrlEbook(key: DigitalProductKey): key is FixedBrlEbookKey {
  return key in FIXED_BRL_EBOOKS;
}

function fail(message: string): never { throw new Error(message); }

export async function createDigitalCheckoutWithFixedBrlEbooks(
  userId: string,
  email: string | null,
  input: { productKey: DigitalProductKey; market: DigitalMarket },
) {
  const isPremiumCases = input.productKey === "ebook_estudos_caso_psicanalise";
  // Estudos de Caso possui preço promocional próprio nos dois mercados.
  // Os demais eBooks fixos continuam interceptados somente no BRL.
  if ((!isPremiumCases && input.market !== "BR") || !isFixedBrlEbook(input.productKey)) {
    return createClientDigitalCheckout(userId, email, input);
  }

  const client = await resolveClient(userId, email);
  if (client.status !== "ok") fail("Acesso negado.");
  const customer = client.customer;

  const library = await getClientDigitalLibrary(userId, email);
  if (library.products.find((p) => p.key === input.productKey)?.entitled) {
    fail("Este produto já está disponível na sua biblioteca.");
  }

  const amountCents = isPremiumCases ? (input.market === "BR" ? 7990 : 1490) : 2000;
  const currency = input.market === "BR" ? "BRL" : "EUR";
  const stripeCurrency = input.market === "BR" ? "brl" : "eur";
  const title = FIXED_BRL_EBOOKS[input.productKey];

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: "",
      customer_id: customer.id,
      contact_email: customer.email,
      contact_phone: customer.phone,
      service_type: "produto_digital",
      title,
      description: isPremiumCases ? "eBook Premium · compra digital pela Biblioteca / Plataforma" : "Compra digital pela Biblioteca / Plataforma",
      quantity: 1,
      amount_cents: amountCents,
      currency,
      payment_status: "pendente",
      status: "novo",
      priority: "media",
      catalog_key: input.productKey,
      metadata: { product_key: input.productKey, market: input.market, auth_user_id: userId, fixed_price: true, premium: isPremiumCases },
    } as never)
    .select("id, order_number")
    .single();

  if (orderError || !order) fail("Não foi possível iniciar o pedido.");

  const secret = process.env["STRIPE_SECRET_KEY"];
  if (!secret) {
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    fail("Pagamento temporariamente indisponível.");
  }

  const request = getRequest();
  const requestUrl = request ? new URL(request.url) : null;
  const appOrigin = process.env["CLIENT_PANEL_URL"]?.replace(/\/$/, "") || (requestUrl ? requestUrl.origin : "https://ldracademy.online");

  const params = new URLSearchParams();
  params.set("mode", "payment");
  // price_data evita reutilizar Price IDs antigos com valores divergentes.
  params.set("line_items[0][price_data][currency]", stripeCurrency);
  params.set("line_items[0][price_data][unit_amount]", String(amountCents));
  params.set("line_items[0][price_data][product_data][name]", title);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${appOrigin}/cliente/biblioteca?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${appOrigin}/cliente/biblioteca?payment=cancel`);
  params.set("client_reference_id", userId);
  params.set("metadata[order_id]", order.id);
  params.set("metadata[product_key]", input.productKey);
  params.set("metadata[user_id]", userId);
  params.set("metadata[market]", input.market);
  params.set("payment_intent_data[metadata][order_id]", order.id);
  params.set("payment_intent_data[metadata][product_key]", input.productKey);
  params.set("payment_intent_data[metadata][user_id]", userId);
  if (customer.email) params.set("customer_email", customer.email);

  let response: Response;
  try {
    response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
  } catch {
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    fail("Não foi possível abrir o checkout.");
  }

  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) {
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    fail(session.error?.message || "Não foi possível abrir o checkout.");
  }

  await supabaseAdmin.from("orders").update({
    stripe_checkout_session_id: session.id,
    metadata: { product_key: input.productKey, market: input.market, auth_user_id: userId, stripe_price_id: null, fixed_price: true, premium: isPremiumCases },
  } as never).eq("id", order.id);

  return { url: session.url, orderId: order.id, orderNumber: order.order_number };
}
