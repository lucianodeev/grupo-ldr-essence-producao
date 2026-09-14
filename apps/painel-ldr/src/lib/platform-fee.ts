export const DEFAULT_PLATFORM_FEE_PERCENT = 20;

export function calculatePlatformSplit(
  grossAmountCents: number,
  platformFeePercent = DEFAULT_PLATFORM_FEE_PERCENT,
) {
  const gross = Math.max(0, Math.trunc(grossAmountCents));
  const percent = Math.min(
    100,
    Math.max(0, Number(platformFeePercent)),
  );
  const platformFeeCents = Math.round((gross * percent) / 100);

  return {
    grossAmountCents: gross,
    platformFeePercent: percent,
    platformFeeCents,
    professionalNetCents: gross - platformFeeCents,
  };
}

export function calculateSettledPlatformSplit(
  grossAmountCents: number,
  refundAmountCents = 0,
  platformFeePercent = DEFAULT_PLATFORM_FEE_PERCENT,
) {
  const gross = Math.max(0, Math.trunc(grossAmountCents));
  const refund = Math.min(
    gross,
    Math.max(0, Math.trunc(refundAmountCents)),
  );

  return {
    refundAmountCents: refund,
    ...calculatePlatformSplit(gross - refund, platformFeePercent),
  };
}
