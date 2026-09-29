export type LdrOneTier = "free" | "one" | "business";

export type LdrOneCapability =
  | "academic_network.basic"
  | "academic_network.premium"
  | "opportunities.basic"
  | "opportunities.advanced"
  | "career.basic"
  | "career.premium"
  | "academy.free"
  | "academy.premium"
  | "human_room.basic"
  | "human_room.premium"
  | "professionals.discovery"
  | "company.jobs.basic"
  | "company.jobs.featured"
  | "company.talent_pool"
  | "company.analytics"
  | "credits.enabled";

export type LdrOneCapabilityDefinition = {
  capability: LdrOneCapability;
  minimumTier: LdrOneTier;
  additiveOnly: true;
  billingRequired: boolean;
};

export const LDR_ONE_CAPABILITIES: readonly LdrOneCapabilityDefinition[] = [
  { capability: "academic_network.basic", minimumTier: "free", additiveOnly: true, billingRequired: false },
  { capability: "academic_network.premium", minimumTier: "one", additiveOnly: true, billingRequired: true },
  { capability: "opportunities.basic", minimumTier: "free", additiveOnly: true, billingRequired: false },
  { capability: "opportunities.advanced", minimumTier: "one", additiveOnly: true, billingRequired: true },
  { capability: "career.basic", minimumTier: "free", additiveOnly: true, billingRequired: false },
  { capability: "career.premium", minimumTier: "one", additiveOnly: true, billingRequired: true },
  { capability: "academy.free", minimumTier: "free", additiveOnly: true, billingRequired: false },
  { capability: "academy.premium", minimumTier: "one", additiveOnly: true, billingRequired: true },
  { capability: "human_room.basic", minimumTier: "free", additiveOnly: true, billingRequired: false },
  { capability: "human_room.premium", minimumTier: "one", additiveOnly: true, billingRequired: true },
  { capability: "professionals.discovery", minimumTier: "free", additiveOnly: true, billingRequired: false },
  { capability: "company.jobs.basic", minimumTier: "free", additiveOnly: true, billingRequired: false },
  { capability: "company.jobs.featured", minimumTier: "business", additiveOnly: true, billingRequired: true },
  { capability: "company.talent_pool", minimumTier: "business", additiveOnly: true, billingRequired: true },
  { capability: "company.analytics", minimumTier: "business", additiveOnly: true, billingRequired: true },
  { capability: "credits.enabled", minimumTier: "one", additiveOnly: true, billingRequired: true },
] as const;

const rank: Record<LdrOneTier, number> = { free: 0, one: 1, business: 2 };

export function hasLdrOneCapability(tier: LdrOneTier, capability: LdrOneCapability): boolean {
  const definition = LDR_ONE_CAPABILITIES.find((item) => item.capability === capability);
  if (!definition) return false;
  return rank[tier] >= rank[definition.minimumTier];
}

export function freeCapabilities(): LdrOneCapability[] {
  return LDR_ONE_CAPABILITIES.filter((item) => item.minimumTier === "free").map((item) => item.capability);
}
