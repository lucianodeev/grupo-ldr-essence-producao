# LDR ONE seat allocation — verified read-only preflight

Verified against the connected Supabase project before deployment:

- `public.ldr_pass_subscriptions` already has all three checked columns: `ldr_one_seats`, `ldr_one_offer`, `current_period_end`.
- `public.ldr_one_seat_allocations` does not exist.
- Neither `ldr_one_allocate_seat` nor `ldr_one_revoke_seat` exists.
- The staged SQL file had literal escaped line breaks; corrected in commit `5ac7554`.
- The two GitHub CI workflows for commit `fcf1ee0` completed successfully.

Do not activate `LDR_ONE_BUSINESS_READER_ENABLED` until the reviewed SQL has been installed in a safe test environment, grants/RLS verified, and concurrency tests for fifth/sixth seat, revocation and unauthorized purchaser completed. No live database changes are part of this preflight.
