import { getRequest } from "@tanstack/react-start/server";
import { psychoanalysisEbookByKey } from "@/lib/psychoanalysis-ebooks.catalog";
import { storeSandboxEnabled } from "@/lib/ldr-store-sandbox";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createClientDigitalCheckout, getClientDigitalLibrary, resolveClient, type DigitalMarket, type DigitalProductKey } from "@/lib/client-portal.server";

function fail(message: string): never { throw new Error(message); }

const PREMIUM_EBOOKS = new Set<string>([
  "ebook_estudos_caso_psicanalise",
  "ebook_psicologia_psicanalise_terapias",
  "ebook_corpo_trabalho_escuta",
  "ebook_ia_novos_milionarios",
  "ebook_imigracao_efeitos_psicologicos",
  "ebook_falar_com_quem_feriu",
  "ebook_da_pobreza_ao_primeiro_contrato",
]);

export async function createDigitalCheckoutWithFixedBrlEbooks(
  userId: string,
  email: string | null,
  input: { productKey: string; market: DigitalMarket },
  options?: { sandbox: true },
) {
  const sandbox = options?.sandbox === true;
  if (sandbox && !storeSandboxEnabled(process.env, getRequest().url)) fail("Checkout de teste indisponível.");
  const ebook = psychoanalysisEbookByKey(input.productKey);
  if (!ebook) {
    if (sandbox) fail("Produto indisponível.");
    return createClientDigitalCheckout(userId, email, input as { productKey: DigitalProductKey; market: DigitalMarket });
  }

  const client = await resolveClient(userId, email);
  if (client.status !== "ok") fail("Acesso negado.");
  const customer = client.customer;

  const library = await getClientDigitalLibrary(userId, email);
  if (library.products.find((p) => p.key === input.productKey)?.entitled) {
    fail("Este produto já está disponível na sua biblioteca.");
  }

  const amountCents = input.market === "BR" ? ebook.priceBrlCents : ebook.priceEurCents;
  const currency = input.market === "BR" ? "BRL" : "EUR";
  const stripeCurrency = input.market === "BR" ? "brl" : "eur";
  const title = ebook.title;
  const premium = PREMIUM_EBOOKS.has(input.productKey);
  const transaction = sandbox ? { checkout_kind: "ldr_store_sandbox", customer_id: customer.id, catalog_key: ebook.key } : null;
  const metadata = { product_key: ebook.key, market: input.market, auth_user_id: userId, fixed_price: true, premium, ...transaction };

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: "",
      customer_id: customer.id,
      contact_email: customer.email,
      contact_phone: customer.phone,
      service_type: "produto_digital",
      title,
      description: premium ? "eBook especial · compra digital avulsa fora da assinatura" : "Compra digital pela Biblioteca / Plataforma",
      quantity: 1,
      amount_cents: amountCents,
      currency,
      payment_status: "pendente",
      status: "novo",
      priority: "media",
      catalog_key: input.productKey,
      metadata,
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
  for (const [name, value] of Object.entries(transaction ?? {})) {
    params.set(`metadata[${name}]`, value);
    params.set(`payment_intent_data[metadata][${name}]`, value);
  }
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

  const session = await response.json() as { id?: string; url?: string; livemode?: boolean; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) {
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    fail(session.error?.message || "Não foi possível abrir o checkout.");
  }

  if (sandbox && (session.livemode !== false || !/^cs_test_[a-zA-Z0-9]+$/.test(session.id) ||
    !/^https:\/\/checkout\.stripe\.com\//.test(session.url))) {
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    fail("Não foi possível confirmar a sessão de teste.");
  }

  const { error: saveError } = await supabaseAdmin.from("orders").update({
    stripe_checkout_session_id: session.id,
    metadata: { ...metadata, stripe_price_id: null },
  } as never).eq("id", order.id);

  if (sandbox && saveError) fail("Não foi possível registar a sessão de teste.");

  return { url: session.url, orderId: order.id, orderNumber: order.order_number };
}
