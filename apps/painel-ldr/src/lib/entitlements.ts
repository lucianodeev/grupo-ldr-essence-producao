export type EntitlementSource =
  | "free"
  | "owner_override"
  | "ownership"
  | "legacy_enrollment"
  | "library_subscription"
  | "editorial_subscription"
  | "pass"
  | "service_specific"
  | "none";

export type EntitlementAccessType =
  | "free"
  | "lifetime"
  | "recurring"
  | "temporary"
  | "privileged"
  | "none";

export type EntitlementDecision = {
  allowed: boolean;
  resourceKey: string;
  source: EntitlementSource;
  accessType: EntitlementAccessType;
  subscriptionId?: string;
  expiresAt?: string;
  legacy: boolean;
  reasons: string[];
};

export type LegacyEntitlementSignals = {
  resourceKey: string;
  free?: boolean;
  ownerOverride?: boolean;
  owned?: boolean;
  legacyEnrollment?: boolean;
  librarySubscription?: boolean;
  librarySubscriptionId?: string;
  libraryExpiresAt?: string;
  editorialSubscription?: boolean;
  editorialSubscriptionId?: string;
  editorialExpiresAt?: string;
  serviceSpecific?: boolean;
  pass?: boolean;
  passSubscriptionId?: string;
  passExpiresAt?: string;
  passEnabled?: boolean;
};

const deny = (resourceKey: string): EntitlementDecision => ({
  allowed: false,
  resourceKey,
  source: "none",
  accessType: "none",
  legacy: false,
  reasons: ["no_matching_entitlement"],
});

/**
 * Pure compatibility resolver for legacy access signals.
 *
 * Foundation constraints:
 * - read-only: no database, Stripe, enrollment, order or credit writes;
 * - PASS is additive and only resolves when its feature flag is explicitly enabled;
 * - precedence protects permanent/privileged access from being shadowed by
 *   revocable subscription access.
 */
export function resolveLegacyEntitlement(
  signals: LegacyEntitlementSignals,
): EntitlementDecision {
  const resourceKey = signals.resourceKey.trim();
  if (!resourceKey) return deny("");

  if (signals.ownerOverride) {
    return {
      allowed: true,
      resourceKey,
      source: "owner_override",
      accessType: "privileged",
      legacy: true,
      reasons: ["explicit_owner_override"],
    };
  }

  if (signals.free) {
    return {
      allowed: true,
      resourceKey,
      source: "free",
      accessType: "free",
      legacy: false,
      reasons: ["resource_is_free"],
    };
  }

  if (signals.owned) {
    return {
      allowed: true,
      resourceKey,
      source: "ownership",
      accessType: "lifetime",
      legacy: false,
      reasons: ["paid_or_owned_product"],
    };
  }

  if (signals.legacyEnrollment) {
    return {
      allowed: true,
      resourceKey,
      source: "legacy_enrollment",
      accessType: "lifetime",
      legacy: true,
      reasons: ["grandfathered_enrollment"],
    };
  }

  if (signals.passEnabled && signals.pass) {
    return {
      allowed: true,
      resourceKey,
      source: "pass",
      accessType: "recurring",
      subscriptionId: signals.passSubscriptionId,
      expiresAt: signals.passExpiresAt,
      legacy: false,
      reasons: ["active_ldr_pass"],
    };
  }

  if (signals.librarySubscription) {
    return {
      allowed: true,
      resourceKey,
      source: "library_subscription",
      accessType: "recurring",
      subscriptionId: signals.librarySubscriptionId,
      expiresAt: signals.libraryExpiresAt,
      legacy: true,
      reasons: ["active_library_subscription"],
    };
  }

  if (signals.editorialSubscription) {
    return {
      allowed: true,
      resourceKey,
      source: "editorial_subscription",
      accessType: "recurring",
      subscriptionId: signals.editorialSubscriptionId,
      expiresAt: signals.editorialExpiresAt,
      legacy: true,
      reasons: ["active_editorial_subscription"],
    };
  }

  if (signals.serviceSpecific) {
    return {
      allowed: true,
      resourceKey,
      source: "service_specific",
      accessType: "temporary",
      legacy: true,
      reasons: ["service_specific_access"],
    };
  }

  return deny(resourceKey);
}
