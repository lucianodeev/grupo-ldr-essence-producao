# Production release gate

Current state: NOT READY. Require: CI green on final SHA, atomic business seat allocation and reader wiring, complete test-mode Stripe evidence, migration reviewed and staged, backups/rollback plan, verified CLIENT_PANEL_URL and Stripe webhook configuration, security review of customer identity resolution, customer support/refund handling, smoke test on staging, explicit release authorization. Do not deploy or toggle LDR_ONE_LAUNCH_ENABLED before these gates pass.
