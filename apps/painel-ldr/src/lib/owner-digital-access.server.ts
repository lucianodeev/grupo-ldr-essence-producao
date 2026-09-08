export const OWNER_DIGITAL_ACCESS_EMAIL = "llucianouam@gmail.com";
export const OWNER_DIGITAL_ACCESS_USER_ID = "7a8892f1-b129-4f98-9512-537cd5055e7b";

/**
 * Administrative entitlement for the LDR owner. This grants access without
 * creating orders, payments or Stripe events.
 */
export function hasOwnerDigitalAccess(
  email: string | null | undefined,
  userId?: string | null,
) {
  return (
    userId === OWNER_DIGITAL_ACCESS_USER_ID ||
    email?.trim().toLowerCase() === OWNER_DIGITAL_ACCESS_EMAIL
  );
}
