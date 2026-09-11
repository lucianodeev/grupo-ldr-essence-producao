from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "apps" / "painel-ldr" / "src"

server = r'''import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveClient } from "@/lib/client-portal.server";

const db = supabaseAdmin as any;
const PRICE_BRL = 3990;
const PRICE_EUR = 990;
const PRODUCT_NAME = "Biblioteca LDR — Assinatura Mensal";
const INCLUDED_PRODUCTS = [
  ["ebook_coragem_comecar", "A Coragem de Começar"],
  ["livro_menino_mamao", "O Menino que Vendia Mamão"],
  ["do_mamao_ao_negocio", "Do Mamão ao Negócio"],
  ["formacao_psicanalise", "Formação Online em Psicanálise"],
  ["formacao_mentoria_profissional_carreira", "Formação em Mentoria Profissional e de Carreira"],
  ["formacao_lideranca_gestao_pessoas", "Formação em Liderança e Gestão de Pessoas"],
] as const;

type Market = "BR" | "INTL";
type StripeObject = {
  id?: string;
  payment_status?: string;
  status?: string;
  customer?: string | { id?: string } | null;
  subscription?: string | { id?: string } | null;
  parent?: { subscription_details?: { subscription?: string | { id?: string } | null } } | null;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
};

function fail(message: string): never { throw new Error(message); }
function stripeId(value: string | { id?: string } | null | undefined) { return typeof value === "string" ? value : value?.id ?? null; }
function isoFromUnix(value?: number | null) { return value && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null; }
function appOrigin() { const request = getRequest(); return process.env.CLIENT_PANEL_URL?.replace(/\/$/, "") || (request ? new URL(request.url).origin : "https://painel.ldrrhestrategia.com"); }
async function customerFor(userId: string, email: string | null) { const ctx = await resolveClient(userId, email); if (ctx.status !== "ok") fail("Acesso do cliente não disponível."); return ctx.customer; }

async function stripeGet(path: string) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  try { const response = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${secret}` } }); return response.ok ? await response.json() as any : null; } catch { return null; }
}

function accessActive(status?: string | null) { return status === "active" || status === "trialing"; }

async function currentRow(customerId: string) {
  const { data, error } = await db.from("library_subscriptions").select("id,customer_id,market,currency,monthly_amount_cents,stripe_customer_id,stripe_subscription_id,stripe_checkout_session_id,status,current_period_start,current_period_end,cancel_at_period_end,created_at,updated_at").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) fail("Não foi possível carregar a assinatura da Biblioteca LDR.");
  return data ?? null;
}

async function hasLifetimeDoMamao(customerId: string) {
  const { data } = await db.from("orders").select("catalog_key,metadata,payment_status").eq("customer_id", customerId).eq("payment_status", "pago").in("catalog_key", ["do_mamao_ao_negocio", "do-mamao-ao-negocio", "combo_empreendedor"]);
  return (data ?? []).some((order: any) => (order.metadata as any)?.source !== "library_subscription");
}

async function ensureDoMamaoEnrollment(customerId: string, active: boolean) {
  const { data: training } = await db.from("training_programs").select("id").eq("slug", "do-mamao-ao-negocio").maybeSingle();
  if (!training?.id) return;
  const { data: existing } = await db.from("training_enrollments").select("id,active").eq("training_id", training.id).eq("customer_id", customerId).order("enrolled_at", { ascending: false }).limit(1).maybeSingle();
  if (existing?.id) { await db.from("training_enrollments").update({ active }).eq("id", existing.id); return; }
  if (active) await db.from("training_enrollments").insert({ training_id: training.id, customer_id: customerId, active: true, product_key: "do-mamao-ao-negocio" });
}

async function activateIncludedAccess(customerId: string, subscriptionId: string, market: Market) {
  const keys = INCLUDED_PRODUCTS.map(([key]) => key);
  const { data: existing } = await db.from("orders").select("id,catalog_key,metadata,payment_status,status").eq("customer_id", customerId).in("catalog_key", keys);
  for (const [key, title] of INCLUDED_PRODUCTS) {
    const row = (existing ?? []).find((order: any) => order.catalog_key === key && (order.metadata as any)?.source === "library_subscription" && (order.metadata as any)?.library_subscription_id === subscriptionId);
    const patch = { payment_status: "pago", status: "concluido", metadata: { product_key: key, source: "library_subscription", library_subscription_id: subscriptionId, market, subscription_access: true } };
    if (row?.id) await db.from("orders").update(patch).eq("id", row.id);
    else await db.from("orders").insert({ order_number: "", customer_id: customerId, service_type: "produto_digital", title, description: "Acesso incluído na assinatura mensal Biblioteca LDR", quantity: 1, amount_cents: 0, currency: market === "BR" ? "BRL" : "EUR", payment_status: "pago", status: "concluido", priority: "media", catalog_key: key, metadata: patch.metadata });
  }
  await ensureDoMamaoEnrollment(customerId, true);
}

async function revokeIncludedAccess(customerId: string, subscriptionId: string) {
  const keys = INCLUDED_PRODUCTS.map(([key]) => key);
  const { data: orders } = await db.from("orders").select("id,catalog_key,metadata").eq("customer_id", customerId).in("catalog_key", keys);
  for (const order of orders ?? []) {
    const meta = (order.metadata ?? {}) as Record<string, unknown>;
    if (meta.source === "library_subscription" && meta.library_subscription_id === subscriptionId) {
      await db.from("orders").update({ payment_status: "falhou", status: "cancelado", metadata: { ...meta, subscription_access: false, revoked_at: new Date().toISOString() } }).eq("id", order.id);
    }
  }
  if (!(await hasLifetimeDoMamao(customerId))) await ensureDoMamaoEnrollment(customerId, false);
}

async function syncRowFromStripe(row: any) {
  let stripeSubscriptionId = row.stripe_subscription_id ?? null;
  let stripeCustomerId = row.stripe_customer_id ?? null;
  if (!stripeSubscriptionId && row.stripe_checkout_session_id) {
    const session = await stripeGet(`checkout/sessions/${encodeURIComponent(row.stripe_checkout_session_id)}`);
    stripeSubscriptionId = stripeId(session?.subscription) ?? stripeSubscriptionId;
    stripeCustomerId = stripeId(session?.customer) ?? stripeCustomerId;
  }
  if (!stripeSubscriptionId) return row;
  const sub = await stripeGet(`subscriptions/${encodeURIComponent(stripeSubscriptionId)}`);
  if (!sub) return row;
  const status = String(sub.status ?? row.status ?? "incomplete");
  const patch = { stripe_subscription_id: stripeSubscriptionId, stripe_customer_id: stripeId(sub.customer) ?? stripeCustomerId, status, current_period_start: isoFromUnix(sub.current_period_start), current_period_end: isoFromUnix(sub.current_period_end), cancel_at_period_end: Boolean(sub.cancel_at_period_end), updated_at: new Date().toISOString() };
  await db.from("library_subscriptions").update(patch).eq("id", row.id);
  if (accessActive(status)) await activateIncludedAccess(row.customer_id, row.id, row.market as Market); else await revokeIncludedAccess(row.customer_id, row.id);
  return { ...row, ...patch };
}

export async function getLibrarySubscriptionContext(userId: string, email: string | null) {
  const customer = await customerFor(userId, email);
  const row = await currentRow(customer.id);
  const subscription = row ? await syncRowFromStripe(row) : null;
  return { customer, subscription, active: accessActive(subscription?.status), priceBrlCents: PRICE_BRL, priceEurCents: PRICE_EUR };
}

export async function hasActiveLibrarySubscription(customerId: string) {
  const row = await currentRow(customerId);
  if (!row) return false;
  const synced = await syncRowFromStripe(row);
  return accessActive(synced?.status);
}

export async function createLibrarySubscriptionCheckout(userId: string, email: string | null, market: Market) {
  const customer = await customerFor(userId, email);
  const existing = await currentRow(customer.id);
  if (existing) {
    const synced = await syncRowFromStripe(existing);
    if (accessActive(synced?.status) || ["past_due", "unpaid", "paused", "incomplete"].includes(String(synced?.status))) fail("Você já possui uma assinatura da Biblioteca LDR. Gerencie a assinatura atual antes de criar outra.");
  }
  const currency = market === "BR" ? "BRL" : "EUR";
  const amount = market === "BR" ? PRICE_BRL : PRICE_EUR;
  const { data: row, error } = await db.from("library_subscriptions").insert({ customer_id: customer.id, market, currency, monthly_amount_cents: amount, status: "pending" }).select("id").single();
  if (error || !row) fail("Não foi possível preparar a assinatura.");
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) { await db.from("library_subscriptions").delete().eq("id", row.id); fail("Pagamento temporariamente indisponível."); }
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.append("payment_method_types[]", "card");
  params.set("line_items[0][price_data][currency]", currency.toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(amount));
  params.set("line_items[0][price_data][recurring][interval]", "month");
  params.set("line_items[0][price_data][product_data][name]", PRODUCT_NAME);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${appOrigin()}/cliente/biblioteca?subscription=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${appOrigin()}/cliente/biblioteca?subscription=cancel`);
  params.set("client_reference_id", userId);
  params.set("billing_address_collection", "auto");
  params.set("metadata[checkout_kind]", "library_subscription");
  params.set("metadata[library_subscription_id]", row.id);
  params.set("metadata[customer_id]", customer.id);
  params.set("metadata[market]", market);
  params.set("subscription_data[metadata][checkout_kind]", "library_subscription");
  params.set("subscription_data[metadata][library_subscription_id]", row.id);
  params.set("subscription_data[metadata][customer_id]", customer.id);
  params.set("subscription_data[metadata][market]", market);
  if (customer.email) params.set("customer_email", customer.email);
  let response: Response;
  try { response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params }); }
  catch { await db.from("library_subscriptions").delete().eq("id", row.id); fail("Não foi possível abrir o checkout."); }
  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) { await db.from("library_subscriptions").delete().eq("id", row.id); fail(session.error?.message || "Não foi possível abrir o checkout."); }
  await db.from("library_subscriptions").update({ stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() }).eq("id", row.id);
  return { url: session.url };
}

export async function setLibrarySubscriptionCancellation(userId: string, email: string | null, cancelAtPeriodEnd: boolean) {
  const customer = await customerFor(userId, email);
  const row = await currentRow(customer.id);
  if (!row?.stripe_subscription_id) fail("Assinatura ativa não encontrada.");
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) fail("Gestão da assinatura indisponível no momento.");
  const params = new URLSearchParams(); params.set("cancel_at_period_end", cancelAtPeriodEnd ? "true" : "false");
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(row.stripe_subscription_id)}`, { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params });
  const sub = await response.json() as any;
  if (!response.ok) fail(sub?.error?.message || "Não foi possível atualizar a assinatura.");
  const patch = { status: String(sub.status ?? row.status), current_period_start: isoFromUnix(sub.current_period_start), current_period_end: isoFromUnix(sub.current_period_end), cancel_at_period_end: Boolean(sub.cancel_at_period_end), updated_at: new Date().toISOString() };
  await db.from("library_subscriptions").update(patch).eq("id", row.id);
  return { ok: true as const, subscription: { ...row, ...patch } };
}

export async function handleLibrarySubscriptionStripeEvent(metadata: Record<string, string>, object: StripeObject, eventType: string) {
  const rowId = metadata["library_subscription_id"];
  const subId = eventType.startsWith("customer.subscription") ? object.id ?? null : stripeId(object.subscription) ?? stripeId(object.parent?.subscription_details?.subscription);
  if (!rowId && !subId) return false;
  const dbq = db.from("library_subscriptions").select("id,customer_id,market,status,stripe_subscription_id");
  const { data: row } = rowId ? await dbq.eq("id", rowId).maybeSingle() : await dbq.eq("stripe_subscription_id", subId).maybeSingle();
  if (!row) return false;
  let status = String(object.status ?? row.status ?? "pending");
  if (eventType === "checkout.session.completed") status = object.payment_status === "paid" || object.payment_status === "no_payment_required" ? "active" : "pending";
  if (eventType === "checkout.session.expired" || eventType === "customer.subscription.deleted") status = "canceled";
  if (eventType === "invoice.payment_succeeded") status = "active";
  if (eventType === "invoice.payment_failed") status = "past_due";
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (eventType === "checkout.session.completed" || eventType === "checkout.session.expired") patch.stripe_checkout_session_id = object.id ?? null;
  if (subId) patch.stripe_subscription_id = subId;
  const customer = stripeId(object.customer); if (customer) patch.stripe_customer_id = customer;
  const start = isoFromUnix(object.current_period_start); if (start) patch.current_period_start = start;
  const end = isoFromUnix(object.current_period_end); if (end) patch.current_period_end = end;
  if (typeof object.cancel_at_period_end === "boolean") patch.cancel_at_period_end = object.cancel_at_period_end;
  await db.from("library_subscriptions").update(patch).eq("id", row.id);
  if (accessActive(status)) await activateIncludedAccess(row.customer_id, row.id, row.market as Market); else await revokeIncludedAccess(row.customer_id, row.id);
  return true;
}
'''

functions = r'''import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function emailOf(claims: Record<string, unknown>): string | null { const value = claims["email"]; return typeof value === "string" ? value : null; }
function requestMarket(): "BR" | "INTL" { try { const request = getRequest(); const country = request?.headers.get("x-vercel-ip-country") ?? request?.headers.get("cf-ipcountry") ?? request?.headers.get("x-country-code"); return country?.trim().toUpperCase() === "BR" ? "BR" : "INTL"; } catch { return "INTL"; } }

export const clientLibrarySubscription = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { getLibrarySubscriptionContext } = await import("@/lib/library-subscription.server");
  const result = await getLibrarySubscriptionContext(context.userId, emailOf(context.claims));
  return { ...result, market: requestMarket() };
});

export const clientCreateLibrarySubscriptionCheckout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { market: "BR" | "INTL" }) => data).handler(async ({ context, data }) => {
  const { createLibrarySubscriptionCheckout } = await import("@/lib/library-subscription.server");
  return createLibrarySubscriptionCheckout(context.userId, emailOf(context.claims), data.market);
});

export const clientSetLibrarySubscriptionCancellation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: { cancelAtPeriodEnd: boolean }) => data).handler(async ({ context, data }) => {
  const { setLibrarySubscriptionCancellation } = await import("@/lib/library-subscription.server");
  return setLibrarySubscriptionCancellation(context.userId, emailOf(context.claims), data.cancelAtPeriodEnd);
});
'''

(APP / "lib" / "library-subscription.server.ts").write_text(server, encoding="utf-8")
(APP / "lib" / "library-subscription.functions.ts").write_text(functions, encoding="utf-8")

# Stripe webhook: add a tiny adapter and dispatch without disturbing existing flows.
webhook_path = APP / "routes" / "api" / "stripe" / "webhook.ts"
w = webhook_path.read_text(encoding="utf-8")
if "setLibrarySubscription(" not in w:
    anchor = "async function balanceCredit(accountId: string, currency: string, gross: number, platformFee: number, net: number) {"
    adapter = '''async function setLibrarySubscription(metadata: Record<string, string>, object: StripeObject, eventType: string) {\n  const { handleLibrarySubscriptionStripeEvent } = await import(\"@/lib/library-subscription.server\");\n  return handleLibrarySubscriptionStripeEvent(metadata, object, eventType);\n}\n\n'''
    if anchor not in w: raise SystemExit("webhook adapter anchor not found")
    w = w.replace(anchor, adapter + anchor, 1)

if 'metadata["checkout_kind"] === "library_subscription"' not in w:
    anchor = "          // Rede de Profissionais LDR: assinatura mensal."
    dispatch = '''          // Biblioteca LDR: assinatura mensal de conteúdos digitais.\n          if (metadata[\"checkout_kind\"] === \"library_subscription\" && (event.type === \"checkout.session.completed\" || event.type === \"checkout.session.expired\")) {\n            await setLibrarySubscription(metadata, object, event.type);\n          } else if (\n            event.type === \"customer.subscription.created\" ||\n            event.type === \"customer.subscription.updated\" ||\n            event.type === \"customer.subscription.deleted\" ||\n            event.type === \"invoice.payment_succeeded\" ||\n            event.type === \"invoice.payment_failed\"\n          ) {\n            await setLibrarySubscription(metadata, object, event.type);\n          }\n\n'''
    if anchor not in w: raise SystemExit("webhook dispatch anchor not found")
    w = w.replace(anchor, dispatch + anchor, 1)
webhook_path.write_text(w, encoding="utf-8")

# Client library UI: keep existing purchases; add subscription as a second access path.
lib_path = APP / "routes" / "_clientarea.cliente.biblioteca.tsx"
s = lib_path.read_text(encoding="utf-8")
imp_anchor = 'import { clientCreateDigitalCheckout, clientDigitalLibrary } from "@/lib/client-portal.functions";'
imp = imp_anchor + '\nimport { clientCreateLibrarySubscriptionCheckout, clientLibrarySubscription, clientSetLibrarySubscriptionCancellation } from "@/lib/library-subscription.functions";'
if "clientLibrarySubscription" not in s:
    if imp_anchor not in s: raise SystemExit("library import anchor not found")
    s = s.replace(imp_anchor, imp, 1)

if "SUB_TXT" not in s:
    anchor = 'function money(c:number,cur:"BRL"|"EUR",locale:Locale){'
    trans = '''const SUB_TXT={\npt:{eyebrow:\"ACESSO TOTAL\",title:\"Assine a Biblioteca LDR\",desc:\"Uma única assinatura para acessar todos os conteúdos digitais pagos da biblioteca enquanto estiver ativa. Compras avulsas continuam com acesso vitalício.\",included:\"Cursos, formações, treinamentos, eBooks e livros digitais incluídos\",subscribe:\"ASSINAR AGORA\",active:\"Assinatura ativa\",cancel:\"Cancelar ao fim do período\",keep:\"Manter assinatura\",ending:\"Cancelamento agendado\"},\nen:{eyebrow:\"ALL ACCESS\",title:\"Subscribe to Biblioteca LDR\",desc:\"One subscription gives access to all paid digital library content while active. One-time purchases keep lifetime access.\",included:\"Courses, training, eBooks and digital books included\",subscribe:\"SUBSCRIBE NOW\",active:\"Active subscription\",cancel:\"Cancel at period end\",keep:\"Keep subscription\",ending:\"Cancellation scheduled\"},\nfr:{eyebrow:\"ACCÈS TOTAL\",title:\"Abonnez-vous à Biblioteca LDR\",desc:\"Un seul abonnement donne accès à tous les contenus numériques payants tant qu'il reste actif. Les achats à l'unité restent accessibles à vie.\",included:\"Cours, formations, eBooks et livres numériques inclus\",subscribe:\"S'ABONNER\",active:\"Abonnement actif\",cancel:\"Annuler à la fin de la période\",keep:\"Maintenir l'abonnement\",ending:\"Annulation programmée\"},\nes:{eyebrow:\"ACCESO TOTAL\",title:\"Suscríbete a Biblioteca LDR\",desc:\"Una sola suscripción da acceso a todos los contenidos digitales de pago mientras esté activa. Las compras individuales mantienen acceso de por vida.\",included:\"Cursos, formaciones, eBooks y libros digitales incluidos\",subscribe:\"SUSCRIBIRME\",active:\"Suscripción activa\",cancel:\"Cancelar al final del período\",keep:\"Mantener suscripción\",ending:\"Cancelación programada\"}\n} as const;\n'''
    if anchor not in s: raise SystemExit("translation anchor not found")
    s = s.replace(anchor, trans + anchor, 1)

fn_anchor = 'const fn=useServerFn(clientDigitalLibrary),checkoutFn=useServerFn(clientCreateDigitalCheckout),'
if "subscriptionFn=useServerFn" not in s:
    repl = 'const subscriptionFn=useServerFn(clientLibrarySubscription),subscriptionCheckoutFn=useServerFn(clientCreateLibrarySubscriptionCheckout),subscriptionCancelFn=useServerFn(clientSetLibrarySubscriptionCancellation),fn=useServerFn(clientDigitalLibrary),checkoutFn=useServerFn(clientCreateDigitalCheckout),'
    if fn_anchor not in s: raise SystemExit("library function anchor not found")
    s = s.replace(fn_anchor, repl, 1)

query_anchor = 'const {data,isLoading}=useQuery({queryKey:["client-digital-library"],queryFn:()=>fn({})});'
if 'queryKey:["library-subscription"]' not in s:
    repl = query_anchor + 'const {data:subscriptionData,refetch:refetchSubscription}=useQuery({queryKey:["library-subscription"],queryFn:()=>subscriptionFn({})});'
    if query_anchor not in s: raise SystemExit("library query anchor not found")
    s = s.replace(query_anchor, repl, 1)

mutation_anchor = 'const checkout=useMutation({mutationFn:(x:{productKey:"ebook_coragem_comecar"|"livro_menino_mamao";market:"BR"|"INTL"})=>checkoutFn({data:x}),onSuccess:r=>location.href=r.url});'
if 'const subscriptionCheckout=' not in s:
    repl = 'const subscriptionCheckout=useMutation({mutationFn:(m:"BR"|"INTL")=>subscriptionCheckoutFn({data:{market:m}}),onSuccess:r=>location.href=r.url});const subscriptionCancel=useMutation({mutationFn:(cancelAtPeriodEnd:boolean)=>subscriptionCancelFn({data:{cancelAtPeriodEnd}}),onSuccess:()=>refetchSubscription()});' + mutation_anchor
    if mutation_anchor not in s: raise SystemExit("library mutation anchor not found")
    s = s.replace(mutation_anchor, repl, 1)

# Inject subscription card between hero and library shelves.
if "subscriptionData?.active" not in s:
    ui_anchor = '</section><section className="rounded-[28px] border bg-background/90 p-4 shadow-sm sm:p-6"><h2 className="font-serif text-2xl">{t.title}</h2>'
    ui = '''</section><section className="rounded-[28px] border border-[#d6ad63]/40 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.24em] text-[#a77b2e]">{SUB_TXT[locale].eyebrow}</p><h2 className="mt-1 font-serif text-2xl text-[#0b2341]">{SUB_TXT[locale].title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{SUB_TXT[locale].desc}</p><p className="mt-3 text-xs font-bold text-[#0b2341]">✓ {SUB_TXT[locale].included}</p></div><div className="w-full shrink-0 rounded-2xl bg-[#071426] p-4 text-white sm:w-[280px]"><p className="text-xs text-white/70">{subscriptionData?.active?SUB_TXT[locale].active:SUB_TXT[locale].title}</p><p className="mt-1 text-2xl font-black text-[#f2cf83]">{market==="BR"?money(subscriptionData?.priceBrlCents??3990,"BRL",locale):money(subscriptionData?.priceEurCents??990,"EUR",locale)}<span className="text-xs font-medium text-white/65"> / mês</span></p>{subscriptionData?.active?<div className="mt-3"><p className="text-xs text-white/75">{subscriptionData?.subscription?.cancel_at_period_end?SUB_TXT[locale].ending:"Renovação automática"}</p><button disabled={subscriptionCancel.isPending} onClick={()=>subscriptionCancel.mutate(!subscriptionData?.subscription?.cancel_at_period_end)} className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-xs font-black text-[#071426]">{subscriptionData?.subscription?.cancel_at_period_end?SUB_TXT[locale].keep:SUB_TXT[locale].cancel}</button></div>:<button disabled={subscriptionCheckout.isPending} onClick={()=>subscriptionCheckout.mutate(market)} className="mt-3 w-full rounded-xl bg-[#d6ad63] px-4 py-3 text-sm font-black text-[#281605]">{SUB_TXT[locale].subscribe}</button>}</div></div></section><section className="rounded-[28px] border bg-background/90 p-4 shadow-sm sm:p-6"><h2 className="font-serif text-2xl">{t.title}</h2>'''
    if ui_anchor not in s: raise SystemExit("library UI anchor not found")
    s = s.replace(ui_anchor, ui, 1)

lib_path.write_text(s, encoding="utf-8")
print("Library subscription patch applied")
