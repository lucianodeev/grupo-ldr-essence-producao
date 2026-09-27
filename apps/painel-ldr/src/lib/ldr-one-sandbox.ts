// Isolated, read-only sandbox configuration. Never import this module into browser code.
// No checkout is created here; this validates server-side inputs before future integration.
export type OnePlan = "individual" | "business";
export type OneCycle = "monthly" | "annual";
export type OneSelection = { plan: OnePlan; cycle: OneCycle; seats: number };
const expected = {
  individual: { monthly: { cents: 3990, interval: "month", env: "LDR_ONE_TEST_PRICE_INDIVIDUAL_MONTHLY" }, annual: { cents: 39900, interval: "year", env: "LDR_ONE_TEST_PRICE_INDIVIDUAL_ANNUAL" } },
  business: { monthly: { cents: 1990, interval: "month", env: "LDR_ONE_TEST_PRICE_BUSINESS_MONTHLY" }, annual: { cents: 19900, interval: "year", env: "LDR_ONE_TEST_PRICE_BUSINESS_ANNUAL" } },
} as const;
export function validateOneSelection(input: OneSelection) {
  if (input.plan !== "individual" && input.plan !== "business") throw Error("Invalid plan");
  if (input.cycle !== "monthly" && input.cycle !== "annual") throw Error("Invalid cycle");
  if (!Number.isSafeInteger(input.seats) || input.seats < 1 || input.seats > 10000) throw Error("Invalid seat count");
  if (input.plan === "individual" && input.seats !== 1) throw Error("Individual requires exactly one seat");
  if (input.plan === "business" && input.seats < 5) throw Error("Business requires at least five seats");
  const item = expected[input.plan][input.cycle];
  return { ...item, quantity: input.seats, totalCents: item.cents * input.seats, currency: "eur" as const };
}
export function sandboxOneConfig(input: OneSelection, env: Record<string, string | undefined>) {
  if (env.LDR_ONE_SANDBOX_CHECKOUT_ENABLED !== "true") throw Error("Sandbox checkout disabled");
  const item = validateOneSelection(input);
  const key = env.LDR_ONE_STRIPE_TEST_SECRET_KEY ?? "";
  if (!/^sk_test_[A-Za-z0-9]+$/.test(key)) throw Error("Stripe test key required");
  const priceId = env[item.env] ?? "";
  if (!/^price_[A-Za-z0-9]+$/.test(priceId)) throw Error("Stripe test price required");
  return { priceId, quantity: item.quantity, expectedCents: item.cents, expectedInterval: item.interval, currency: item.currency };
}
