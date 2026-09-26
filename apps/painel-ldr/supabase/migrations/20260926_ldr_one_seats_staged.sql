-- LDR ONE staged schema: additive, reversible and non-destructive.
-- Apply only after checking the production schema and taking a verified backup.
-- Existing LDR PASS rows remain unchanged.
ALTER TABLE public.ldr_pass_subscriptions
  ADD COLUMN IF NOT EXISTS ldr_one_seats integer;

ALTER TABLE public.ldr_pass_subscriptions
  ADD COLUMN IF NOT EXISTS ldr_one_offer text;

COMMENT ON COLUMN public.ldr_pass_subscriptions.ldr_one_seats IS
  'Business seat count for LDR ONE; NULL for individual and legacy subscriptions.';
COMMENT ON COLUMN public.ldr_pass_subscriptions.ldr_one_offer IS
  'LDR ONE offer identifier; NULL preserves legacy subscriptions.';

-- Enforce only on newly tagged LDR ONE records, without modifying legacy rows.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ldr_pass_ldr_one_offer_check') THEN
    ALTER TABLE public.ldr_pass_subscriptions
      ADD CONSTRAINT ldr_pass_ldr_one_offer_check
      CHECK (ldr_one_offer IS NULL OR ldr_one_offer IN ('individual', 'business'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ldr_pass_ldr_one_seats_check') THEN
    ALTER TABLE public.ldr_pass_subscriptions
      ADD CONSTRAINT ldr_pass_ldr_one_seats_check
      CHECK (ldr_one_offer IS NULL OR
        (ldr_one_offer = 'individual' AND (ldr_one_seats IS NULL OR ldr_one_seats = 1)) OR
        (ldr_one_offer = 'business' AND ldr_one_seats >= 5));
  END IF;
END $$;
