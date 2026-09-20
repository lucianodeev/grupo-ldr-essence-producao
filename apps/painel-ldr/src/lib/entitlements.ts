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

export type EntitlementResourceClass =
  | "free_preserved"
  | "owned_preserved"
  | "digital_pass_candidate"
  | "library_legacy_separate"
  | "editorial_separate"
  | "human_service_separate"
  | "b2b_separate"
  | "high_touch_separate";

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
  passEligible?: boolean;
  resourceClass?: EntitlementResourceClass;
};

const deny = (resourceKey: string, reason = "no_matching_entitlement"): EntitlementDecision => ({
  allowed: false,
  resourceKey,
  source: "none",
  accessType: "none",
  legacy: false,
  reasons: [reason],
});

const DIGITAL_PASS_PREFIXES = [
  "ebook_",
  "livro_",
  "curso_digital_",
  "formacao_digital_",
  "biblioteca_digital_",
] as const;

const SEPARATE_AREA_PREFIXES = [
  "biblioteca_legacy_",
  "editorial_",
  "revista_",
  "clinica_",
  "sessao_",
  "consulta_",
  "massagem_",
  "empresa_",
  "b2b_",
  "live_",
  "mentoria_ao_vivo_",
] as const;

export function classifyEntitlementResource(resourceKey: string): EntitlementResourceClass {
  const key = resourceKey.trim().toLowerCase();
  if (!key) return "high_touch_separate";
  if (key.startsWith("free_") || key.startsWith("gratuito_")) return "free_preserved";
  if (key.startsWith("owned_") || key.startsWith("lifetime_")) return "owned_preserved";
  if (key.startsWith("editorial_") || key.startsWith("revista_")) return "editorial_separate";
  if (key.startsWith("clinica_") || key.startsWith("sessao_") || key.startsWith("consulta_") || key.startsWith("massagem_")) return "human_service_separate";
  if (key.startsWith("empresa_") || key.startsWith("b2b_")) return "b2b_separate";
  if (key.startsWith("live_") || key.startsWith("mentoria_ao_vivo_")) return "high_touch_separate";
  if (key.startsWith("biblioteca_legacy_")) return "library_legacy_separate";
  if (DIGITAL_PASS_PREFIXES.some((prefix) => key.startsWith(prefix))) return "digital_pass_candidate";
  if (SEPARATE_AREA_PREFIXES.some((prefix) => key.startsWith(prefix))) return "high_touch_separate";
  return "high_touch_separate";
}

export function isPassEligibleResource(signals: LegacyEntitlementSignals): boolean {
  if (signals.passEligible === true) return true;
  if (signals.passEligible === false) return false;
  const resourceClass = signals.resourceClass ?? classifyEntitlementResource(signals.resourceKey);
  return resourceClass === "digital_pass_candidate";
}

/**
 * Pure compatibility resolver for legacy access signals.
 *
 * Foundation constraints:
 * - read-only: no database, Stripe, enrollment, order or credit writes;
 * - PASS is additive and only resolves when its feature flag is explicitly enabled;
 * - PASS only unlocks explicitly eligible digital areas and does not absorb
 *   Biblioteca/editorial, human services, B2B, live/high-touch services or
 *   pre-existing lifetime ownership;
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
    if (!isPassEligibleResource(signals)) return deny(resourceKey, "pass_not_eligible_for_resource");
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
