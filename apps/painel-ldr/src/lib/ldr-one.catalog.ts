/** LDR ONE staged Stripe catalog. Products and prices are INACTIVE until the entitlement, migration and webhook tests pass. */
export const LDR_ONE_LAUNCH_ENABLED = false as const;
export const LDR_ONE_EUR = {
  individual: {
    monthly: { priceId: "price_1UJvSMKlx2LyNGeB044O4Mqx", amountCents: 3990 },
    annual: { priceId: "price_1UJvSPKlx2LyNGeBMXMNbCBG", amountCents: 39900 },
  },
  business: {
    monthly: { priceId: "price_1UJvSRKlx2LyNGeBlV9R8H3Z", amountCentsPerSeat: 1990 },
    annual: { priceId: "price_1UJvSTKlx2LyNGeB8uW52tuL", amountCentsPerSeat: 19900 },
    minimumSeats: 5,
  },
} as const;

/** Do not use this catalog for Checkout until LDR_ONE_LAUNCH_ENABLED is intentionally changed after validation. */
