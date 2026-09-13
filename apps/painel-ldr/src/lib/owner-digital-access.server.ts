export const OWNER_DIGITAL_ACCESS_EMAIL = "llucianouam@gmail.com";
export const OWNER_DIGITAL_ACCESS_USER_ID = "7a8892f1-b129-4f98-9512-537cd5055e7b";

const OWNER_DIGITAL_ACCESS_EMAILS = new Set([
  OWNER_DIGITAL_ACCESS_EMAIL,
  "contacto@ldrrhestrategia.com",
]);

const OWNER_DIGITAL_ACCESS_USER_IDS = new Set([
  OWNER_DIGITAL_ACCESS_USER_ID,
  "1d2b427e-e802-47c8-aa18-4a4af62ec938",
]);

/**
 * Administrative entitlement for the LDR owner accounts. This grants access
 * without creating orders, payments or Stripe events. Keep this whitelist
 * explicit so normal client accounts continue to require a paid entitlement.
 */
export function hasOwnerDigitalAccess(
  email: string | null | undefined,
  userId?: string | null,
) {
  const normalizedEmail = email?.trim().toLowerCase() ?? null;
  return Boolean(
    (userId && OWNER_DIGITAL_ACCESS_USER_IDS.has(userId)) ||
      (normalizedEmail && OWNER_DIGITAL_ACCESS_EMAILS.has(normalizedEmail)),
  );
}
