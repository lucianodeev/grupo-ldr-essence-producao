export const OWNER_DIGITAL_ACCESS_EMAIL = "llucianouam@gmail.com";

/**
 * Administrative entitlement for the LDR owner. This grants access without
 * creating orders, payments or Stripe events.
 */
export function hasOwnerDigitalAccess(email: string | null | undefined) {
  return email?.trim().toLowerCase() === OWNER_DIGITAL_ACCESS_EMAIL;
}
