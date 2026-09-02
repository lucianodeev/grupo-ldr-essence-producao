import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";
import { getDoMamaoAoNegocioHtml } from "@/content/do-mamao-ao-negocio.server";

const PRODUCT_KEY = "do_mamao_ao_negocio";
const TRAINING_SLUG = "do-mamao-ao-negocio";
const TRAINING_TITLE = "Do Mamão ao Negócio — Treinamento de Empreendedorismo";
const PRICE_BRL = 59_999;
const PRICE_EUR = 10_056;
const PRICE_BRL_ID = "price_1UBBM4Klx2LyNGeBrBXrP5HP";
const PRICE_EUR_ID = "price_1UBBMMKlx2LyNGeB4jx4mYBl";

type Market = "BR" | "INTL";
type StateRecord = Record<string, unknown>;

function fail(message: string): never { throw new Error(message); }
const db = supabaseAdmin as any;

async function customerFor(userId: string, email: string | null) {
  const ctx = await resolveClient(userId, email);
  if (ctx.status !== "ok") fail("Acesso do cliente não disponível.");
  return ctx.customer;
}

function productMatches(order: any) {
  const metadata = (order?.metadata ?? {}) as Record<string, unknown>;
  const key = typeof metadata.product_key === "string" ? metadata.product_key : "";
  return order?.catalog_key === PRODUCT_KEY || key === PRODUCT_KEY || key === TRAINING_SLUG;
}

async function paidOrder(customerId: string) {
  const { data, error } = await db.from("orders")
    .select("id,catalog_key,payment_status,amount_cents,currency,stripe_checkout_session_id,metadata,created_at")
    .eq("customer_id", customerId).eq("payment_status", "pago")
    .order("created_at", { ascending: false });
  if (error) fail("Não foi possível verificar a compra do treinamento.");
  return (data ?? []).find(productMatches) ?? null;
}

async function trainingRow() {
  const { data, error } = await db.from("training_programs")
    .select("id,slug,title,description,status").eq("slug", TRAINING_SLUG).maybeSingle();
  if (error || !data || data.status !== "published") fail("Treinamento indisponível.");
  return data;
}

async function enrollment(customerId: string, trainingId: string) {
  const { data, error } = await db.from("training_enrollments")
    .select("id,training_id,customer_id,active,enrolled_at,cohort_id,progress_percent,completed_at,certificate_available_at,training_cohorts(cohort_number,capacity,status)")
    .eq("training_id", trainingId).eq("customer_id", customerId).eq("active", true).maybeSingle();
  if (error) fail("Não foi possível verificar sua matrícula.");
  return data ?? null;
}

async function provisionFromPaidOrder(customerId: string, order: any) {
  const metadata = (order.metadata ?? {}) as Record<string, unknown>;
  const { error } = await db.rpc("assign_do_mamao_training_enrollment", {
    _customer_id: customerId,
    _checkout_session_id: order.stripe_checkout_session_id ?? null,
    _payment_intent_id: typeof metadata.stripe_payment_intent_id === "string" ? metadata.stripe_payment_intent_id : null,
    _price_id: typeof metadata.stripe_price_id === "string" ? metadata.stripe_price_id : null,
    _currency: order.currency ?? null,
    _amount_minor: order.amount_cents ?? null,
  });
  if (error) fail("Pagamento confirmado, mas não foi possível concluir sua matrícula automaticamente.");
}

export async function getDoMamaoTrainingOffer(userId: string, email: string | null) {
  const customer = await customerFor(userId, email);
  const training = await trainingRow();
  let currentEnrollment = await enrollment(customer.id, training.id);
  const order = await paidOrder(customer.id);
  if (!currentEnrollment && order) {
    await provisionFromPaidOrder(customer.id, order);
    currentEnrollment = await enrollment(customer.id, training.id);
  }
  return {
    productKey: PRODUCT_KEY,
    title: training.title || TRAINING_TITLE,
    description: training.description || "Treinamento empreendedor de 3 meses e 300 horas com Sistema S8, atividades, quizzes, projeto, fórum e encontros ao vivo.",
    priceBrlCents: PRICE_BRL,
    priceEurCents: PRICE_EUR,
    entitled: Boolean(currentEnrollment),
    progressPercent: Number(currentEnrollment?.progress_percent ?? 0),
    cohortNumber: currentEnrollment?.training_cohorts?.cohort_number ?? null,
  };
}

function stripePrice(market: Market) {
  const envName = market === "BR" ? "STRIPE_TRAINING_PRICE_BRL" : "STRIPE_TRAINING_PRICE_EUR";
  const fallback = market === "BR" ? PRICE_BRL_ID : PRICE_EUR_ID;
  const value = process.env[envName] || fallback;
  if (!value.startsWith("price_")) fail(`${envName} não configurada.`);
  return value;
}

export async function createDoMamaoTrainingCheckout(userId: string, email: string | null, market: Market) {
  const customer = await customerFor(userId, email);
  const offer = await getDoMamaoTrainingOffer(userId, email);
  if (offer.entitled) fail("Este treinamento já está disponível para sua conta.");

  const amountCents = market === "BR" ? PRICE_BRL : PRICE_EUR;
  const currency = market === "BR" ? "BRL" : "EUR";
  const priceId = stripePrice(market);
  const { data: order, error: orderError } = await db.from("orders").insert({
    order_number: "",
    customer_id: customer.id,
    contact_email: customer.email,
    contact_phone: customer.phone,
    service_type: "treinamento",
    title: TRAINING_TITLE,
    description: "Treinamento de 3 meses / 300 horas pela Biblioteca / Plataforma",
    quantity: 1,
    amount_cents: amountCents,
    currency,
    payment_status: "pendente",
    status: "novo",
    priority: "media",
    catalog_key: PRODUCT_KEY,
    metadata: { product_key: PRODUCT_KEY, training_slug: TRAINING_SLUG, market, auth_user_id: userId, stripe_price_id: priceId },
  }).select("id,order_number").single();
  if (orderError || !order) fail("Não foi possível iniciar o pedido do treinamento.");

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) { await db.from("orders").delete().eq("id", order.id); fail("Pagamento temporariamente indisponível."); }
  const request = getRequest();
  const requestUrl = request ? new URL(request.url) : null;
  const appOrigin = process.env.CLIENT_PANEL_URL?.replace(/\/$/, "") || requestUrl?.origin || "https://painel.ldrrhestrategia.com";
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${appOrigin}/cliente/biblioteca?payment=success&product=training&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${appOrigin}/cliente/biblioteca?payment=cancel&product=training`);
  params.set("client_reference_id", userId);
  params.set("metadata[order_id]", order.id);
  params.set("metadata[product_key]", PRODUCT_KEY);
  params.set("metadata[training_slug]", TRAINING_SLUG);
  params.set("metadata[user_id]", userId);
  params.set("metadata[market]", market);
  params.set("payment_intent_data[metadata][order_id]", order.id);
  params.set("payment_intent_data[metadata][product_key]", PRODUCT_KEY);
  if (customer.email) params.set("customer_email", customer.email);

  let response: Response;
  try {
    response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params });
  } catch {
    await db.from("orders").delete().eq("id", order.id);
    fail("Não foi possível abrir o checkout.");
  }
  const session = await response.json() as { id?: string; url?: string; payment_intent?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) {
    await db.from("orders").delete().eq("id", order.id);
    fail("Não foi possível abrir o checkout.");
  }
  await db.from("orders").update({ stripe_checkout_session_id: session.id, metadata: { product_key: PRODUCT_KEY, training_slug: TRAINING_SLUG, market, auth_user_id: userId, stripe_price_id: priceId } }).eq("id", order.id);
  return { url: session.url };
}

function safeJsonForInline(value: unknown) {
  return JSON.stringify(value ?? {}).replace(/</g, "\\u003c").replace(/-->/g, "--\\u003e");
}

export async function getDoMamaoTrainingExperience(userId: string, email: string | null) {
  const customer = await customerFor(userId, email);
  const training = await trainingRow();
  let currentEnrollment = await enrollment(customer.id, training.id);
  if (!currentEnrollment) {
    const order = await paidOrder(customer.id);
    if (order) { await provisionFromPaidOrder(customer.id, order); currentEnrollment = await enrollment(customer.id, training.id); }
  }
  if (!currentEnrollment) fail("Compre o treinamento para liberar este conteúdo.");
  const { data: cloud } = await db.from("training_state").select("state,progress_percent,current_panel,started_at,completed_at,certificate_available_at").eq("training_id", training.id).eq("customer_id", customer.id).maybeSingle();
  const seed = cloud?.state && typeof cloud.state === "object" ? cloud.state : {};
  let html = getDoMamaoAoNegocioHtml();
  const seedScript = `<script>try{localStorage.setItem('ldr_training_v3_library_ready',JSON.stringify(${safeJsonForInline(seed)}));}catch(e){}</script>`;
  html = html.includes("</head>") ? html.replace("</head>", `${seedScript}</head>`) : `${seedScript}${html}`;
  return {
    html,
    trainingId: training.id,
    title: training.title,
    progressPercent: Number(cloud?.progress_percent ?? currentEnrollment.progress_percent ?? 0),
    cohortNumber: currentEnrollment.training_cohorts?.cohort_number ?? null,
    enrolledAt: currentEnrollment.enrolled_at,
    completedAt: cloud?.completed_at ?? currentEnrollment.completed_at ?? null,
    certificateAvailableAt: cloud?.certificate_available_at ?? currentEnrollment.certificate_available_at ?? null,
  };
}

function countTrainingProgress(state: StateRecord) {
  const answers = (state.answers && typeof state.answers === "object" ? state.answers : {}) as Record<string, unknown>;
  const quiz = (state.quiz && typeof state.quiz === "object" ? state.quiz : {}) as Record<string, unknown>;
  const reflections = (state.reflections && typeof state.reflections === "object" ? state.reflections : {}) as Record<string, unknown>;
  let written = 0;
  for (const value of Object.values(reflections)) if (typeof value === "string" && value.trim().length >= 40) written++;
  const done = Math.min(60, Object.keys(answers).length) + Math.min(36, Object.keys(quiz).length) + Math.min(30, written);
  return Math.max(0, Math.min(100, Math.round(done / 126 * 100)));
}

export async function saveDoMamaoTrainingState(userId: string, email: string | null, state: StateRecord) {
  const customer = await customerFor(userId, email);
  const training = await trainingRow();
  const currentEnrollment = await enrollment(customer.id, training.id);
  if (!currentEnrollment) fail("Matrícula não encontrada.");
  const serialized = JSON.stringify(state ?? {});
  if (serialized.length > 700_000) fail("Dados do treinamento excederam o limite de sincronização.");
  const progress = countTrainingProgress(state ?? {});
  const started = new Date(currentEnrollment.enrolled_at).getTime();
  const eligibleDay = started + 30 * 24 * 60 * 60 * 1000;
  let completedAt = currentEnrollment.completed_at as string | null;
  let certificateAvailableAt = currentEnrollment.certificate_available_at as string | null;
  if (!completedAt && progress >= 100 && Date.now() >= eligibleDay) {
    completedAt = new Date().toISOString();
    certificateAvailableAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  }
  const currentPanel = typeof state.lastPanel === "string" ? state.lastPanel.slice(0, 80) : "inicio";
  const { error } = await db.from("training_state").upsert({ training_id: training.id, customer_id: customer.id, state, progress_percent: progress, current_panel: currentPanel, completed_at: completedAt, certificate_available_at: certificateAvailableAt, updated_at: new Date().toISOString() }, { onConflict: "training_id,customer_id" });
  if (error) fail("Não foi possível sincronizar seu progresso.");
  await db.from("training_enrollments").update({ progress_percent: progress, completed_at: completedAt, certificate_available_at: certificateAvailableAt }).eq("id", currentEnrollment.id);
  await db.from("library_progress").upsert({ customer_id: customer.id, product_key: TRAINING_SLUG, progress_percent: progress, current_location: currentPanel, updated_at: new Date().toISOString() }, { onConflict: "customer_id,product_key" });
  return { ok: true as const, progressPercent: progress, completedAt, certificateAvailableAt };
}
