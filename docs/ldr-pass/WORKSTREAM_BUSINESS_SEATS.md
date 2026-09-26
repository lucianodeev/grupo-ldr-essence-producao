# LDR ONE Business — staged implementation

Do not enable production before the database migration, authenticated allocation API and employee reader integration are implemented and tested.

Proposed table `ldr_one_seat_allocations`: subscription_id FK to ldr_pass_subscriptions, auth_user_id FK to auth.users, assigned_at, revoked_at. Enforce at most one active assignment per user per subscription and atomic capacity checks against ldr_one_seats. Allocation API must verify company administrator ownership, prevent cross-company assignment and use a database transaction/RPC for concurrent writes. Server reader must validate a persisted allocation with the pure business-seat policy; never infer allocation from organization membership alone.

Required cases: 5-seat minimum, sixth allocation denied for 5 seats, duplicate assignment idempotent, concurrent fifth/sixth requests, reassignment after revocation, cancellation, downgrade and expired subscriptions.
