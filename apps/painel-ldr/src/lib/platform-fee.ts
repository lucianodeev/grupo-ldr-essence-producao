export const DEFAULT_PLATFORM_FEE_PERCENT = 20;

export function calculatePlatformSplit(grossAmountCents: number, platformFeePercent = DEFAULT_PLATFORM_FEE_PERCENT) {
  const gross = Math.max(0, Math.round(Number(grossAmountCents) || 0));
  const percent = Number(platformFeePercent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new Error("Invalid platform fee percent");
  const platformFeeCents = Math.round((gross * percent) / 100);
  return { grossAmountCents: gross, platformFeePercent: percent, platformFeeCents, professionalNetCents: gross - platformFeeCents };
}

export function calculateSettledPlatformSplit(grossAmountCents: number, refundAmountCents = 0, platformFeePercent = DEFAULT_PLATFORM_FEE_PERCENT) {
  const gross = Math.max(0, Math.round(Number(grossAmountCents) || 0));
  const refund = Math.min(gross, Math.max(0, Math.round(Number(refundAmountCents) || 0)));
  return { refundAmountCents: refund, ...calculatePlatformSplit(gross - refund, platformFeePercent) };
}
